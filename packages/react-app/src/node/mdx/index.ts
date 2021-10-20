import { Plugin } from 'vite';
import viteMdx, { MdxOptions } from 'vite-plugin-mdx';
import { DEMO_MODULE_ID_PREFIX, PLUGIN_NAME } from '../constants';
import { demoMdxPlugin, loadDemo } from './demo';

export function createMdxPlugin(options?: MdxOptions): Plugin[] {
  const resolvedOptions: MdxOptions = {
    ...options,
    remarkPlugins: [...(options?.remarkPlugins || []), demoMdxPlugin],
  };

  const demoFiles = new Set<string>();

  return [
    {
      name: `${PLUGIN_NAME}:mdx`,
      // vite-plugin-mdx's enforce is `pre` and I need to do something before it,
      // so I also set to `pre`.
      enforce: 'pre',
      async resolveId(source, importer) {
        if (source.endsWith('?demo')) {
          const resolved = await this.resolve(
            source.replace(/\?demo$/, ''),
            importer
          );

          if (!resolved || resolved.external) {
            throw new Error(
              `[react-app] Can not resolve demo: '${source}'. importer: '${importer}'`
            );
          }

          const demoModuleId = `${DEMO_MODULE_ID_PREFIX}${resolved.id}`;
          demoFiles.add(resolved.id);

          return demoModuleId;
        }
      },
      load(id) {
        if (id.startsWith(DEMO_MODULE_ID_PREFIX)) {
          return loadDemo(id.slice(DEMO_MODULE_ID_PREFIX.length));
        }
      },
      transform(code, id) {
        // TODO: parse slides
        // vite-plugin-mdx looks for dependencies such as `@mdx-js/react` from the root, which may cause errors,
        // so I inject the dependency myself here.
        if (/\.mdx?$/.test(id)) {
          return `
import * as React from 'react';
import { mdx } from '@mdx-js/react';

${code}`;
        }
      },
      handleHotUpdate(ctx) {
        if (demoFiles.has(ctx.file)) {
          const modules = ctx.modules.slice();

          // update virtual demo module
          ctx.modules[0]?.importers.forEach(importer => {
            if (importer.id?.startsWith(DEMO_MODULE_ID_PREFIX)) {
              modules.push(importer);
            }
          });

          return modules;
        }
      },
    },
    // Set namedImports to empty object
    // because I had manually injected the dependencies before.
    ...viteMdx.withImports({})(resolvedOptions),
  ];
}
