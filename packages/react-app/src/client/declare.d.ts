declare module '/@react-app/routes*' {
  import * as React from 'react';

  interface Route {
    path: string;
    component: React.ComponentType<any>;
    exact: boolean;
    children?: Route[];
  }

  const routes: Route[];

  export default routes;
}

declare module '/@react-app/pages-meta*' {
  const pagesMeta: Record<string, Record<string, any>>;

  export default pagesMeta;
}

declare module '/@react-app/theme*' {
  import * as React from 'react';

  const Theme: React.ComponentType<any> | null;

  export default Theme;
}
