/**
 * modify from vite-plugin-react-pages
 */
import type { Root } from 'mdast';
import { MDX_DEMO_RE } from '../constants';

export function demoMdxPlugin() {
  return function demoTransformer(tree: Root) {
    const addImports: string[] = [];

    tree.children.forEach((child: any) => {
      if ((child.type as string) === 'jsx') {
        const [, src] = (child.value as string).match(MDX_DEMO_RE) || [];

        if (src) {
          const imported = `__demo_${addImports.length}`;
          const importedComponent = `${imported}_component`;
          addImports.push(
            `import * as ${imported} from '${src}?demo';`,
            `import ${importedComponent} from '${src}';`
          );
          child.value = `<Demo src="${src}" {...${imported}}>{React.createElement(${importedComponent})}</Demo>`;
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
