import { Page, Route } from '../types';

interface ParentRoute extends Route {
  children: Route[];
}

export function generateRoutes(pages: Record<string, Page>): Route[] {
  const sortedPages = Object.values(pages).sort((a, b) => {
    if (a.routePath === b.routePath) {
      return a.isLayout ? -1 : 0;
    }
    return a.routePath.localeCompare(b.routePath);
  });

  const allRoutes: Route[] = [];
  const parentRouteStack: ParentRoute[] = [];

  sortedPages.forEach(page => {
    const route: Route = {
      path: page.routePath,
      component: page.filePath,
      exact: page.isLayout ? false : true,
      children: page.isLayout ? [] : undefined,
    };

    while (parentRouteStack.length) {
      const parentRoute = parentRouteStack[parentRouteStack.length - 1];

      if (
        parentRoute.path === '/' ||
        parentRoute.path === route.path ||
        route.path.startsWith(`${parentRoute.path}/`)
      ) {
        parentRoute.children.push(route);
        break;
      }

      parentRouteStack.pop();
    }

    if (!parentRouteStack.length) {
      allRoutes.push(route);
    }

    if (route.children) {
      parentRouteStack.push(route as ParentRoute);
    }
  });

  return allRoutes;
}

export function generateRoutesCode(routes: Route[], ssr?: boolean) {
  const imports: string[] = [`import * as React from 'react';`];
  const lazyImports: string[] = [];
  let index = 0;

  const routesStr = JSON.stringify(routes, null, 2).replace(
    /"component":\s("(.*?)")/g,
    (str: string, replaceStr: string, component: string) => {
      if (ssr) {
        const name = `__route_${index++}`;
        const importStr = `import ${name} from '${component}';`;

        if (!imports.includes(importStr)) {
          imports.push(importStr);
        }

        return str.replace(replaceStr, name);
      }

      const name = `__route_${index++}`;
      const lazyImportStr = `const ${name} = React.lazy(() => import('${component}'));`;

      if (!lazyImports.includes(lazyImportStr)) {
        lazyImports.push(lazyImportStr);
      }

      return str.replace(replaceStr, name);
    }
  );

  return `${imports.join('\n')}

${lazyImports.join('\n')}

export const routes = ${routesStr};
export default routes;
`;
}

export function generatePagesMeta(pages: Record<string, Page>) {
  const pagesMeta = Object.values(pages).reduce<
    Record<string, Record<string, any>>
  >((acc, cur) => {
    // skip layout file
    if (cur.isLayout) {
      return acc;
    }
    acc[cur.routePath] = cur.meta;
    return acc;
  }, {});

  return `
export const pagesMeta = ${JSON.stringify(pagesMeta, null, 2)};
export default pagesMeta;`;
}
