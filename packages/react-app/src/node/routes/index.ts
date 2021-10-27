import { Plugin } from 'vite';
import { readFile } from 'fs-extra';
import { isEqual } from 'lodash';
import {
  PagesService,
  ResolvedPagesConfig,
  resolvePageMeta,
  resolvePagesConfig,
} from './PagesService';
import { generateRoutes, generateRoutesCode } from './generateRoutes';
import {
  PLUGIN_NAME,
  ROUTES_REQUEST_IDS,
  ROUTES_MODULE_ID,
  ENTRY_MODULE_ID,
  ENTRY_FILE,
} from '../constants';
import { Route, RoutesOptions } from '../types';

export function createRoutesPlugin(
  options: RoutesOptions & { useWindicss: boolean }
): Plugin[] {
  let pagesConfig: ResolvedPagesConfig;
  let pagesService: PagesService;
  let generatedRoutes: Route[] | null = null;

  return [
    // TODO: support multi entry
    // entries = getEntries(config.root, config.build.rollupOptions.input);
    {
      name: `${PLUGIN_NAME}:entry`,
      config() {
        return {
          optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom'],
          },
        };
      },
      transformIndexHtml(html) {
        // Do not add entry file repeatedly
        if (!html.includes(ENTRY_MODULE_ID)) {
          return [
            {
              tag: 'div',
              attrs: { id: 'app' },
              injectTo: 'body-prepend',
            },
            {
              tag: 'script',
              attrs: {
                type: 'module',
                src: ENTRY_MODULE_ID,
              },
              injectTo: 'body-prepend',
            },
          ];
        }
      },
      resolveId(source) {
        if (source === ENTRY_MODULE_ID) {
          return ENTRY_MODULE_ID;
        }
      },
      async load(id) {
        if (id === ENTRY_MODULE_ID) {
          const content = await readFile(ENTRY_FILE, 'utf-8');
          return `${
            options.useWindicss ? `import 'virtual:windi.css';\n` : ''
          }${content}`;
        }
      },
    },
    {
      name: `${PLUGIN_NAME}:routes`,
      configResolved(config) {
        pagesConfig = resolvePagesConfig(
          options.pages,
          options.ignored,
          config.root,
          config.base
        );
      },
      configureServer(server) {
        pagesService = new PagesService({
          pagesConfig,
          extendPage: options.extendPage,
          onPagesChanged() {
            generatedRoutes = null;

            const routesModule =
              server.moduleGraph.getModuleById(ROUTES_MODULE_ID);

            if (routesModule) {
              server.moduleGraph.invalidateModule(routesModule);
            }

            server.ws.send({ type: 'full-reload' });
          },
        });
      },
      buildStart() {
        pagesService.start();
      },
      async closeBundle() {
        await pagesService.close();
      },
      resolveId(id) {
        return ROUTES_REQUEST_IDS.some(x => id.startsWith(x))
          ? ROUTES_MODULE_ID
          : null;
      },
      async load(id) {
        if (id !== ROUTES_MODULE_ID) {
          return;
        }

        await pagesService.start();
        let pages = await pagesService.getPages();
        pages = (await options.onPagesGenerated?.(pages)) || pages;

        if (!generatedRoutes) {
          generatedRoutes = generateRoutes(pages);
          generatedRoutes =
            (await options.onRoutesGenerated?.(generatedRoutes)) ||
            generatedRoutes;
        }

        let routesCode = generateRoutesCode(
          generatedRoutes,
          options.componentImportMode
        );
        routesCode =
          (await options.onRoutesCodeGenerated?.(routesCode)) || routesCode;

        return routesCode;
      },
      async handleHotUpdate(ctx) {
        const pages = await pagesService.getPages();
        const page = pages[ctx.file];

        // If meta changed, add module for hot update
        if (page) {
          const newMeta = await resolvePageMeta(ctx.file, await ctx.read());

          if (!isEqual(page.meta, newMeta)) {
            page.meta = newMeta;
            return ctx.modules.concat();
          }
        }
      },
    },
  ];
}
