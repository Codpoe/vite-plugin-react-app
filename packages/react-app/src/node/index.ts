import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import windicss from 'vite-plugin-windicss';
import icons from 'unplugin-icons/vite';
import { createRoutesPlugin } from './routes';
import { createMdxPlugin } from './mdx';
import { UserOptions } from './types';
import { createThemePlugin } from './theme';

export function reactApp(options: UserOptions = {}): PluginOption[] {
  return [
    // routes
    ...createRoutesPlugin({
      ...options.routes,
      useWindicss: options.windicss !== false,
    }),
    // mdx
    ...(options.mdx !== false ? createMdxPlugin(options.mdx) : []),
    // theme
    createThemePlugin(),
    // react
    ...(options.react !== false ? react(options.react) : []),
    // windicss
    ...(options.windicss !== false ? windicss(options.windicss) : []),
    // icons
    options.icons !== false &&
      icons({
        compiler: 'jsx',
        autoInstall: true,
        scale: 1,
        ...options.icons,
      }),
  ];
}

export default reactApp;

export { FileSystemIconLoader } from 'unplugin-icons/loaders';

export * from './types';
