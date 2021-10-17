import { Plugin } from 'vite';
import {
  PagesService,
  ResolvedPagesConfig,
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
import { slash } from '../utils';
import { Route, RoutesOptions } from '../types';

const slashedEntryFile = slash(ENTRY_FILE);

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
      name: `${PLUGIN_NAME}:html`,
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
      transformIndexHtml() {
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
        pagesService = new PagesService({
          pagesConfig,
          server,
          moduleId: ROUTES_MODULE_ID,
          extendPage: options.extendPage,
          onReload() {
            generatedRoutes = null;
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
    },
  ];
}
