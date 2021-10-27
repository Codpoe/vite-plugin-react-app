import path from 'path';
import EventEmitter from 'events';
import chokidar, { FSWatcher } from 'chokidar';
import { readFile } from 'fs-extra';
import { extract, parse } from 'jest-docblock';
import { normalizePath } from 'vite';
import { slash } from '../utils';
import { Page } from '../types';
import { RoutesOptions } from '..';
import { PagesObj, PagesConfig } from '../types';

export type ResolvedPagesConfig = Record<string, Required<PagesObj>>;

function checkIsPagesObj(pages: PagesConfig): pages is PagesObj {
  return typeof pages === 'object' && 'dir' in pages;
}

export function resolvePagesConfig(
  pages: PagesConfig = 'src/pages',
  defaultIgnored: any = [],
  root = slash(process.cwd()),
  base = '/'
): ResolvedPagesConfig {
  if (typeof pages === 'string' || checkIsPagesObj(pages)) {
    pages = {
      [base]: pages,
    };
  }

  return Object.entries(pages).reduce((res, [baseRoutePath, config]) => {
    // ensure start slash
    if (!baseRoutePath.startsWith('/')) {
      baseRoutePath = '/' + baseRoutePath;
    }

    // remove trail slash
    if (baseRoutePath !== '/') {
      baseRoutePath = baseRoutePath.replace(/\/$/, '');
    }

    if (typeof config === 'string') {
      config = {
        dir: config,
      };
    }

    const ignored = config.ignored || defaultIgnored || [];

    res[baseRoutePath] = {
      dir: path.resolve(root, config.dir || 'src/pages'),
      glob:
        config.glob || '**/*{.page.js,.page.jsx,.page.ts,.page.tsx,.md,.mdx}',
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        ...(Array.isArray(ignored) ? ignored : [ignored]),
      ],
    };

    return res;
  }, {} as ResolvedPagesConfig);
}

/**
 * - parse doc block for normal page
 * - parse front matter for markdown page
 */
export async function resolvePageMeta(
  filePath: string,
  fileContent?: string
): Promise<Record<string, any>> {
  if (/\.(js|ts)x?$/.test(filePath)) {
    return parse(extract(fileContent ?? (await readFile(filePath, 'utf-8'))));
  }
  return {};
  // TODO: parse markdown frontmatter
}

function resolveRoutePath(baseRoutePath: string, relativeFilePath: string) {
  const ext = path.extname(relativeFilePath);

  const routePath = slash(relativeFilePath)
    .replace(new RegExp(`(\\.page|_layout)?${ext}$`), '') // remove ext and trail '.page', '_layout'
    .replace(/index$/, '') // remove 'index'
    .replace(/README$/i, '') // remove 'README'
    .replace(/\/$/, '') // remove trail slash
    .replace(/\[(.*?)\]/g, ':$1') // transform 'user/[id]' to 'user/:id'
    .replace(/404$/, '*'); // transform '/404' to '/*' so this route acts like a catch-all for URLs that we don't have explicit routes for

  return path.posix.join(baseRoutePath, routePath);
}

function isLayoutFile(filePath: string) {
  return path.basename(filePath).startsWith('_layout');
}

export interface PagesServiceConfig {
  pagesConfig: ResolvedPagesConfig;
  extendPage: RoutesOptions['extendPage'];
  onPagesChanged: () => void;
}

export class PagesService extends EventEmitter {
  private startPromise: Promise<void[]> | null = null;
  private watchers: FSWatcher[] = [];
  private pages: Record<string, Page> = {};

  constructor(private config: PagesServiceConfig) {
    super();
  }

  start() {
    if (this.startPromise) {
      return;
    }

    return (this.startPromise = Promise.all<void>(
      Object.entries(this.config.pagesConfig).map(
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
                  this.config.onPagesChanged();
                }
              })
              .on('unlink', filePath => {
                this.removePage(path.resolve(dir, filePath));
                this.emit('pages-change');
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
    const meta = await resolvePageMeta(absFilePath);

    let page: Page = {
      basePath: baseRoutePath,
      routePath,
      filePath: absFilePath,
      meta,
      isLayout,
    };

    page = (await this.config.extendPage?.(page)) || page;

    this.pages[normalizePath(absFilePath)] = page;
  }

  removePage(key: string) {
    delete this.pages[key];
  }
}
