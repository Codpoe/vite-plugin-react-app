/**
 * modify from vite-plugin-react-pages
 */
import type { Root } from 'mdast';
import { readFile } from 'fs-extra';
import { extract, parse, strip } from 'jest-docblock';
import { MDX_DEMO_RE } from '../constants';

export function demoMdxPlugin() {
  return function demoTransformer(tree: Root) {
    const addImports: string[] = [];

    tree.children.forEach((child: any) => {
      if ((child.type as string) === 'jsx') {
        const [, src] = (child.value as string).match(MDX_DEMO_RE) || [];

        if (src) {
          const imported = `__demo_${addImports.length}`;
          addImports.push(`import * as ${imported} from '${src}?demo';`);
          child.value = `<Demo src="${src}" {...${imported}}><${imported}.default /></Demo>`;
        }
      }
    });

    tree.children.unshift(
      ...addImports.map(importStr => {
        return {
          type: 'import',
          value: importStr,
        } as any;
      })
    );
  };
}

export async function loadDemo(demoPath: string): Promise<string> {
  demoPath = demoPath.replace(/\?demo$/, '');

  const code = await readFile(demoPath, 'utf-8');

  return `
export * from '${demoPath}';
export { default } from '${demoPath}';

export const code = ${JSON.stringify(strip(code))};
export const meta = ${JSON.stringify(parse(extract(code)))};
`;
}
