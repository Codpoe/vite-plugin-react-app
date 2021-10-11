import { Page, Route, ResolvedOptions } from './types';

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

      // TODO: 404 page

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

export function generateRoutesCode(routes: Route[], options: ResolvedOptions) {
  const { componentImportMode } = options;
  const imports: string[] = [`import * as React from 'react';`];
  const lazyImports: string[] = [];
  let extraCode = '';
  let index = 0;

  const routesStr = JSON.stringify(routes, null, 2).replace(
    /"component":\s("(.*?)")/g,
    (str: string, replaceStr: string, component: string) => {
      if (componentImportMode === 'sync') {
        const name = `__route_${index++}`;
        const importStr = `import ${name} from '${component}';`;

        if (!imports.includes(importStr)) {
          imports.push(importStr);
        }

        return str.replace(replaceStr, name);
      }

      if (componentImportMode === 'lazy') {
        const name = `__route_${index++}`;
        const lazyImportStr = `const ${name} = React.lazy(() => import('${component}'));`;

        if (!lazyImports.includes(lazyImportStr)) {
          lazyImports.push(lazyImportStr);
        }

        return str.replace(replaceStr, name);
      }

      const res = componentImportMode(component);
      let newComponent: string;

      if (typeof res === 'object') {
        newComponent = res.component;
        extraCode = res.extraCode || '';
      } else {
        newComponent = res;
      }

      return str.replace(replaceStr, newComponent);
    }
  );

  return `${imports.join('\n')}

${lazyImports.join('\n')}

${extraCode}

export const routes = ${routesStr};
export default routes;
`;
}
