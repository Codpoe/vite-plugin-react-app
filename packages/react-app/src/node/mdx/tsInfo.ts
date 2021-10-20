import type { Root } from 'mdast';

export function tsInfoMdxPlugin() {
  return function TsInfotransformer(tree: Root) {
    const addImports: string[] = [];

    tree.children.forEach((child: any) => {
      if ((child.type as string) === 'jsx') {
        const regexp = /<TsInfo\s+src=["'](.*?)["']\s+name=["'](.*?)["']/;
        const [, src, name] = (child.value as string).match(regexp) || [];

        if (src && name) {
          const imported = `_tsInfo${addImports.length}`;
          addImports.push(
            `import '${src}';`,
            `import * as ${imported} from '${src}?tsInfo=${name}'';`
          );
          child.value = `<TsInfo {...${imported}} />`;
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
