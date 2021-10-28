export interface Route {
  path: string;
  component: any;
  exact: boolean;
  children?: Route[];
}

export interface Page {
  basePath: string;
  routePath: string;
  filePath: string;
  meta: Record<string, any>;
  isLayout?: boolean;
}
