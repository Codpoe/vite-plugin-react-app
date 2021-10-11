import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { ViteDevServer } from 'vite';
import { slash } from './utils';
import { Page, ResolvedOptions } from './types';

function resolveRoutePath(baseRoutePath: string, relativeFilePath: string) {
  const ext = path.extname(relativeFilePath);

  const routePath = slash(relativeFilePath)
    .replace(new RegExp(`(\\.page|_layout)?${ext}$`), '') // remove ext and trail '.page', '_layout'
    .replace(/index$/, '') // remove 'index'
    .replace(/README$/i, '') // remove 'README'
    .replace(/\/$/, '') // remove trail slash
    .replace(/\[(.*?)\]/g, ':$1'); // transform 'user/[id]' to 'user/:id'

  return path.posix.join(baseRoutePath, routePath);
}

function isLayoutFile(filePath: string) {
  return path.basename(filePath).startsWith('_layout');
}

export class PagesService {
  private startPromise: Promise<void[]> | null = null;
  private watchers: FSWatcher[] = [];
  private pages: Record<string, Page> = {};

  constructor(
    private options: ResolvedOptions,
    private server: ViteDevServer,
    private moduleId: string,
    private onReload: () => void
  ) {}

  start() {
    if (this.startPromise) {
      return;
    }

    return (this.startPromise = Promise.all<void>(
      Object.entries(this.options.pages).map(
        ([baseRoutePath, { dir, glob, ignored }]) =>
          new Promise((resolve, reject) => {
            let isReady = false;

            glob = [
              '**/_layout{.js,.jsx,.ts,.tsx,.md,.mdx}',
              ...(Array.isArray(glob) ? glob : [glob]),
            ];

            const watcher = chokidar
              .watch(glob, {
                cwd: dir,
                ignored,
              })
              .on('add', async filePath => {
                await this.setPage(baseRoutePath, dir, filePath);

                if (isReady) {
                  this.reload();
                }
              })
              .on('unlink', filePath => {
                this.removePage(path.resolve(dir, filePath));
                this.reload();
              })
              .on('change', () => {
                // TODO: detect meta changed
              })
              .on('ready', () => {
                isReady = true;
                resolve();
              })
              .on('error', reject);

            this.watchers.push(watcher);
          })
      )
    ));
  }

  async close() {
    if (!this.startPromise) {
      throw new Error('PagesService is not started yet');
    }

    await Promise.all(this.watchers.map(w => w.close()));
    this.watchers = [];
    this.pages = {};
    this.startPromise = null;
  }

  reload() {
    this.onReload();

    const module = this.server.moduleGraph.getModuleById(this.moduleId);

    if (module) {
      this.server.moduleGraph.invalidateModule(module);
    }

    this.server.ws.send({ type: 'full-reload' });
  }

  async getPages() {
    if (!this.startPromise) {
      throw new Error('PagesService is not started yet');
    }

    await this.startPromise;
    return this.pages;
  }

  async setPage(baseRoutePath: string, dir: string, filePath: string) {
    const isLayout = isLayoutFile(filePath);
    const routePath = resolveRoutePath(baseRoutePath, filePath);
    const absFilePath = path.resolve(dir, filePath);

    let page: Page = {
      basePath: baseRoutePath,
      routePath,
      filePath: absFilePath,
      meta: {},
      isLayout,
    };

    page = (await this.options.extendPage(page)) || page;

    this.pages[absFilePath] = page;
  }

  removePage(key: string) {
    delete this.pages[key];
  }
}
