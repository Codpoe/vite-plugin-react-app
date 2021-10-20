import { Plugin } from 'vite';
import viteMdx, { MdxOptions } from 'vite-plugin-mdx';
import { PLUGIN_NAME } from '../constants';
import { demoMdxPlugin } from './demo';

export function createMdxPlugin(options?: MdxOptions): Plugin[] {
  const resolvedOptions: MdxOptions = {
    ...options,
    remarkPlugins: [...(options?.remarkPlugins || []), demoMdxPlugin],
  };

  return [
    {
      name: `${PLUGIN_NAME}:mdx`,
      // vite-plugin-mdx's enforce is `pre` and I need to do something before it,
      // so I also set to `pre`.
      enforce: 'pre',
      // TODO: resolve
      // resolveId() {},
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
    },
    // Set namedImports to empty object
    // because I had manually injected the dependencies before.
    ...viteMdx.withImports({})(resolvedOptions),
  ];
}
