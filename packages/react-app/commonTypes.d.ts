export interface Route {
  path: string;
  component: any;
  exact: boolean;
  children?: Route[];
}
