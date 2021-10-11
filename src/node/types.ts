import { Options as ViteReactOptions } from '@vitejs/plugin-react';
import { UserOptions as WindicssOptions } from 'vite-plugin-windicss';

export type ComponentImportMode =
  | 'sync'
  | 'lazy'
  | ((filePath: string) => string | { component: string; extraCode?: string });

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

export interface UserPagesObj {
  dir: string;
  /**
   * Glob patterns for tracking.
   * @default '**\/*{.page.js,.page.jsx,.page.ts,.page.tsx,.md,.mdx}'
   */
  glob?: string | string[];
  /**
   * Defines files/paths to be ignored.
   */
  ignored?: any;
}

export type UserPages =
  | string
  | UserPagesObj
  | Record<string, string | UserPagesObj>;

export type ResolvedPages = Record<string, Required<UserPagesObj>>;

export interface UserOptions {
  /**
   * Commonly used in multi-page application for differentiate plugin.
   *
   * For example, if the id is set to 'admin',
   * the application needs to get the routes from 'virtual:generated-routes/admin'
   */
  id?: string;
  /**
   * Source code directory for scanning application entries
   * @default 'src'
   */
  src?: string;
  /**
   * Relative path to the directory to search for page components.
   * @default 'src/pages'
   */
  pages?: UserPages;
  /**
   * Defines files/paths to be ignored when resolving pages.
   * @default  ['**\/node_modules\/**', '**\/.git\/**']
   */
  ignored?: any;
  /**
   * Import page components directly or as async components
   * @default 'lazy'
   */
  componentImportMode?: ComponentImportMode;
  /**
   * Extend page
   */
  extendPage?: (page: Page) => Page | void | Promise<Page | void>;
  /**
   * Custom generated pages
   */
  onPagesGenerated?: (
    pages: Record<string, Page>
  ) => Record<string, Page> | void | Promise<Record<string, Page> | void>;
  /**
   * Custom generated routes
   */
  onRoutesGenerated?: (
    routes: Route[]
  ) => Route[] | void | Promise<Route[] | void>;
  /**
   * Custom generated client code
   */
  onRoutesCodeGenerated?: (
    code: string
  ) => string | void | Promise<string | void>;
  /**
   * @vitejs/plugin-react options
   * https://github.com/vitejs/vite/tree/main/packages/plugin-react
   *
   * If set to false, it will disable vite react plugin
   */
  react?: ViteReactOptions | false;
  /**
   * vite-plugin-windicss options
   * https://github.com/windicss/vite-plugin-windicss
   *
   * If set to false, it will disable windicss plugin
   */
  windicss?: WindicssOptions | false;
}

export interface ResolvedOptions extends Required<UserOptions> {
  root: string;
  pages: ResolvedPages;
}
