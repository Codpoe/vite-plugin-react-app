declare module 'virtual:react-app/routes' {
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
