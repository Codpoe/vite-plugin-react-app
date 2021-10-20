export const PLUGIN_NAME = 'vite-plugin-react-app';

// js entry
export const ENTRY_MODULE_ID = '/@react-app/entry';
export const ENTRY_FILE = require.resolve(
  'vite-plugin-react-app/dist/client/entry.client.js'
);

// routes
export const ROUTES_REQUEST_IDS = [
  'virtual:react-app/routes',
  '/@react-app/routes',
];
export const ROUTES_MODULE_ID = '/@react-app/routes';

// mdx demo
export const MDX_DEMO_RE = /<Demo\s+src=["'](.*?)["']/;
