import path from 'path';
import { pathExistsSync } from 'fs-extra';
import { Plugin } from 'vite';
import { PLUGIN_NAME, THEME_MODULE_ID } from './constants';
import { slash } from './utils';

function resolveTheme(root: string) {
  for (const fileName of [
    '_theme.js',
    '_theme.jsx',
    '_theme.ts',
    '_theme.tsx',
  ]) {
    const filePath = path.resolve(root, fileName);
    if (pathExistsSync(filePath)) {
      return slash(filePath);
    }
  }
}

export function createThemePlugin(): Plugin {
  let viteRoot: string;

  return {
    name: `${PLUGIN_NAME}:theme`,
    configResolved(config) {
      viteRoot = config.root;
    },
    resolveId(source) {
      return source === THEME_MODULE_ID ? THEME_MODULE_ID : null;
    },
    load(id) {
      if (id === THEME_MODULE_ID) {
        const theme = resolveTheme(viteRoot);

        if (theme) {
          return `export { default } from '${theme}';`;
        } else {
          return `export default null;`;
        }
      }
    },
  };
}
