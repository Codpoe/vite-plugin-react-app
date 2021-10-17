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

declare module 'virtual:icons/*' {
  import React, { SVGProps } from 'react';
  const component: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  export default component;
}

declare module '~icons/*' {
  import React, { SVGProps } from 'react';
  const component: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  export default component;
}
