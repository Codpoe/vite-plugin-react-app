import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import windicss from 'vite-plugin-windicss';
import icons from 'unplugin-icons/vite';
import mdx from 'vite-plugin-mdx';
import { resolveOptions } from './options';
import { PagesService } from './pages';
import { generateRoutes, generateRoutesCode } from './routes';
import {
  PLUGIN_NAME,
  ROUTES_REQUEST_IDS,
  ROUTES_MODULE_ID,
  ENTRY_MODULE_ID,
  ENTRY_FILE,
} from './constants';
import { Route, UserOptions } from './types';
import { slash } from './utils';

const slashedEntryFile = slash(ENTRY_FILE);

export const reactApp = (userOptions: UserOptions = {}): PluginOption[] => {
  let options = resolveOptions(userOptions);
  // let entries: string[];
  let pagesService: PagesService;
  let generatedRoutes: Route[] | null = null;

  return [
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
        };
      },
      configResolved(config) {
        // resolve options again with `config.root` and `config.base`
        options = resolveOptions(userOptions, config.root, config.base);
        // TODO: support multi entry
        // entries = getEntries(config.root, config.build.rollupOptions.input);
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
            options.windicss ? `import 'virtual:windi.css';\n` : ''
          }${code}`;
        }
      },
    },
    {
      name: `${PLUGIN_NAME}:pages`,
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
    ...(options.react ? react(options.react) : []),
    ...(options.windicss ? windicss(options.windicss) : []),
    options.icons && icons(options.icons),
    ...(options.mdx ? mdx(options.mdx) : []),
  ];
};

export default reactApp;

export { FileSystemIconLoader } from 'unplugin-icons/loaders';

export * from './types';
