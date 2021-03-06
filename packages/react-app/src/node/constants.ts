export const PLUGIN_NAME = 'vite-plugin-react-app';

// js entry
export const ENTRY_MODULE_ID = '/@react-app/entry';
export const ENTRY_FILE = require.resolve(
  'vite-plugin-react-app/dist/client/entry.client.js'
);

// routes
export const ROUTES_MODULE_ID = '/@react-app/routes';

// pages
export const PAGES_MODULE_ID = '/@react-app/pages';

// pages meta
export const PAGES_META_MODULE_ID = '/@react-app/pages-meta';

// mdx demo
export const MDX_DEMO_RE = /<Demo\s+src=["'](.*?)["']/;
export const DEMO_MODULE_ID_PREFIX = '/@react-app/demo/';

// mdx tsInfo
export const MDX_TS_INFO_RE =
  /<TsInfo\s+src=["'](.*?)["']\s+name=["'](.*?)["']/;
export const TS_INFO_MODULE_ID_PREFIX = '/@react-app/ts-info/';

// theme
export const THEME_MODULE_ID = '/@react-app/theme';
