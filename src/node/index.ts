import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { resolveOptions } from './options';
import { PagesService } from './pages';
import { generateRoutes, generateRoutesCode } from './routes';
import {
  ROUTES_REQUEST_IDS,
  ROUTES_MODULE_ID,
  ENTRY_MODULE_ID,
} from './constants';
import { Route, UserOptions } from './types';

export const reactApp = (userOptions: UserOptions = {}): PluginOption[] => {
  let options = resolveOptions(userOptions);
  // let entries: string[];
  let pagesService: PagesService;
  let generatedRoutes: Route[] | null = null;

  return [
    ...react(options.react),
    {
      name: 'react-app:prepare',
      config() {
        return {
          resolve: {
            alias: [
              {
                find: ENTRY_MODULE_ID,
                replacement: require.resolve(
                  'vite-plugin-react-app/dist/client/entry.client.js'
                ),
              },
            ],
          },
        };
      },
      configResolved(config) {
        // resolve options again with `config.root` and `config.base`
        options = resolveOptions(userOptions, config.root, config.base);
        // TODO: support multi entry
        // entries = getEntries(config.root, config.build.rollupOptions.input);
      },
    },
    {
      name: 'react-app:html',
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
    },
    {
      name: 'react-app:pages',
      configureServer(server) {
        pagesService = new PagesService(
          options,
          server,
          ROUTES_MODULE_ID,
          () => {
            generatedRoutes = null;
          }
        );
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
        pages = (await options.onPagesGenerated(pages)) || pages;

        if (!generatedRoutes) {
          generatedRoutes = generateRoutes(pages);
          generatedRoutes =
            (await options.onRoutesGenerated(generatedRoutes)) ||
            generatedRoutes;
        }

        let routesCode = generateRoutesCode(generatedRoutes, options);
        routesCode =
          (await options.onRoutesCodeGenerated(routesCode)) || routesCode;

        return routesCode;
      },
    },
  ];
};

export default reactApp;

export * from './types';
