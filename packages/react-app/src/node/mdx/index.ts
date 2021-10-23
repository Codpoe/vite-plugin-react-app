import { Plugin } from 'vite';
import viteMdx, { MdxOptions } from 'vite-plugin-mdx';
import {
  DEMO_MODULE_ID_PREFIX,
  PLUGIN_NAME,
  TS_INFO_MODULE_ID_PREFIX,
} from '../constants';
import { demoMdxPlugin, loadDemo } from './demo';
import { tsInfoMdxPlugin, loadTsInfo } from './tsInfo';

export function createMdxPlugin(options?: MdxOptions): Plugin[] {
  const resolvedOptions: MdxOptions = {
    ...options,
    remarkPlugins: [
      ...(options?.remarkPlugins || []),
      demoMdxPlugin,
      tsInfoMdxPlugin,
    ],
  };

  const demoFiles = new Set<string>();
  const tsInfoFileToModuleIdMap = new Map<string, string>();

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

          demoFiles.add(resolved.id);

          return `${DEMO_MODULE_ID_PREFIX}${resolved.id}`;
        }

        const [, requestPath, importName] =
          source.match(/(.*?)\?tsInfo=(.*)/) || [];

        if (requestPath && importName) {
          const resolved = await this.resolve(requestPath, importer);

          if (!resolved || resolved.external) {
            throw new Error(
              `[react-app] Can not resolve ts info: '${source}'. importer: '${importer}'`
            );
          }

          const tsInfoModuleId = `${TS_INFO_MODULE_ID_PREFIX}__${importName}__${resolved.id}`;

          tsInfoFileToModuleIdMap.set(resolved.id, tsInfoModuleId);

          return tsInfoModuleId;
        }
      },
      load(id) {
        if (id.startsWith(DEMO_MODULE_ID_PREFIX)) {
          return loadDemo(id.slice(DEMO_MODULE_ID_PREFIX.length));
        }

        if (id.startsWith(TS_INFO_MODULE_ID_PREFIX)) {
          const [, importName, filePath] =
            id.slice(TS_INFO_MODULE_ID_PREFIX.length).match(/__(.*?)__(.*)/) ||
            [];
          return loadTsInfo(filePath, importName);
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
        const modules = ctx.modules.slice();

        if (demoFiles.has(ctx.file)) {
          // update virtual demo module
          ctx.modules[0]?.importers.forEach(importer => {
            if (importer.id?.startsWith(DEMO_MODULE_ID_PREFIX)) {
              modules.push(importer);
            }
          });
        }

        if (tsInfoFileToModuleIdMap.has(ctx.file)) {
          const tsInfoModule = ctx.server.moduleGraph.getModuleById(
            tsInfoFileToModuleIdMap.get(ctx.file)!
          );

          if (tsInfoModule) {
            modules.push(tsInfoModule);
          }
        }

        return modules;
      },
    },
    // Set namedImports to empty object
    // because I had manually injected the dependencies before.
    ...viteMdx.withImports({})(resolvedOptions),
  ];
}
