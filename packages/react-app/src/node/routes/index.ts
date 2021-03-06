import { Plugin, ViteDevServer } from 'vite';
import { isEqual } from 'lodash';
import {
  PagesService,
  ResolvedPagesConfig,
  resolvePageMeta,
  resolvePagesConfig,
} from './PagesService';
import {
  generateRoutes,
  generateRoutesCode,
  generatePagesMeta,
} from './generate';
import {
  PLUGIN_NAME,
  ROUTES_MODULE_ID,
  ENTRY_MODULE_ID,
  ENTRY_FILE,
  PAGES_META_MODULE_ID,
} from '../constants';
import { Route, RoutesOptions } from '../types';
import { slash } from '../utils';

const slashedEntryFile = slash(ENTRY_FILE);

export function createRoutesPlugin(
  options: RoutesOptions & { useWindicss: boolean }
): Plugin[] {
  let viteServer: ViteDevServer;
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
          resolve: {
            alias: [
              {
                find: ENTRY_MODULE_ID,
                replacement: ENTRY_FILE,
              },
            ],
          },
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
      transform(code, id) {
        if (id === slashedEntryFile) {
          return `${
            options.useWindicss ? `import 'virtual:windi.css';\n` : ''
          }${code}`;
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
        viteServer = server;
      },
      buildStart() {
        const reloadRoutesModule = (isAdd: boolean) => {
          generatedRoutes = null;

          const routesModule =
            viteServer.moduleGraph.getModuleById(ROUTES_MODULE_ID);

          if (routesModule) {
            viteServer.moduleGraph.invalidateModule(routesModule);
          }

          // if add page, trigger the change event of routes manually
          if (isAdd) {
            viteServer.watcher.emit('change', ROUTES_MODULE_ID);
          }
        };

        pagesService = new PagesService({
          pagesConfig,
          extendPage: options.extendPage,
        });

        pagesService
          .on('add-page', () => reloadRoutesModule(true))
          .on('remove-page', () => reloadRoutesModule(false))
          .start();
      },
      async closeBundle() {
        await pagesService.close();
      },
      resolveId(id) {
        return [ROUTES_MODULE_ID, PAGES_META_MODULE_ID].some(x =>
          id.startsWith(x)
        )
          ? id
          : null;
      },
      async load(id, ssr) {
        if (id === ROUTES_MODULE_ID) {
          let pages = await pagesService.getPages();
          pages = (await options.onPagesGenerated?.(pages)) || pages;

          if (!generatedRoutes) {
            generatedRoutes = generateRoutes(pages);
            generatedRoutes =
              (await options.onRoutesGenerated?.(generatedRoutes)) ||
              generatedRoutes;
          }

          let routesCode = generateRoutesCode(generatedRoutes, ssr);
          routesCode =
            (await options.onRoutesCodeGenerated?.(routesCode)) || routesCode;

          return routesCode;
        }

        if (id === PAGES_META_MODULE_ID) {
          let pages = await pagesService.getPages();
          pages = (await options.onPagesGenerated?.(pages)) || pages;
          return generatePagesMeta(pages);
        }
      },
      async handleHotUpdate(ctx) {
        const pagesMetaModule =
          ctx.server.moduleGraph.getModuleById(PAGES_META_MODULE_ID);

        if (pagesMetaModule) {
          const pages = await pagesService.getPages();
          const page = pages[ctx.file];

          // If meta changed, add pagesModule for hot update
          if (page) {
            const newMeta = await resolvePageMeta(ctx.file, await ctx.read());

            if (!isEqual(page.meta, newMeta)) {
              page.meta = newMeta;
              return ctx.modules.concat(pagesMetaModule);
            }
          }
        }
      },
    },
  ];
}
