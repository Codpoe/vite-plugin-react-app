import { Options as ViteReactOptions } from '@vitejs/plugin-react';
import { UserOptions as WindicssOptions } from 'vite-plugin-windicss';
import { Options as IconsOptions } from 'unplugin-icons';
import { ReactMdxOptions } from 'vite-plugin-react-mdx';
import { Route } from '../../commonTypes';

export type { Route } from '../../commonTypes';

export interface Page {
  basePath: string;
  routePath: string;
  filePath: string;
  meta: Record<string, any>;
  isLayout: boolean;
  is404: boolean;
}

export interface PagesObj {
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

export type PagesConfig = string | PagesObj | Record<string, string | PagesObj>;

export type ComponentImportMode =
  | 'sync'
  | 'lazy'
  | ((filePath: string) => string | { component: string; extraCode?: string });

export interface RoutesOptions {
  /**
   * Relative path to the directory to search for page components.
   * @default 'src/pages'
   */
  pages?: PagesConfig;
  /**
   * Defines files/paths to be ignored when resolving pages.
   */
  ignored?: any;
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
}

export interface UserOptions {
  routes?: RoutesOptions;
  /**
   * @vitejs/plugin-react options
   * https://github.com/vitejs/vite/tree/main/packages/plugin-react
   *
   * If set to false, it will disable vite react plugin.
   */
  react?: ViteReactOptions | false;
  /**
   * vite-plugin-windicss options
   * https://github.com/windicss/vite-plugin-windicss
   *
   * If set to false, it will disable windicss plugin.
   */
  windicss?: WindicssOptions | false;
  /**
   * unplugin-icons options
   * https://github.com/antfu/unplugin-icons
   *
   * If set to false, it will disable icons plugin.
   */
  icons?: IconsOptions | false;
  /**
   * vite-plugin-react-mdx options
   * https://github.com/codpoe/vite-plugin-react-mdx
   *
   * If set to false, it will disable mdx plugin.
   */
  mdx?: ReactMdxOptions | false;
}
