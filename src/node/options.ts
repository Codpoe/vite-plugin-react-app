import { resolve } from 'path';
import {
  UserOptions,
  ResolvedOptions,
  UserPages,
  UserPagesObj,
  ResolvedPages,
} from './types';
import { slash } from './utils';

function checkIsPagesObj(pages: UserPages): pages is UserPagesObj {
  return typeof pages === 'object' && 'dir' in pages;
}

function resolvePages(
  pages: UserPages,
  root: string,
  base: string,
  defaultIgnored?: any
): ResolvedPages {
  if (typeof pages === 'string' || checkIsPagesObj(pages)) {
    pages = {
      [base]: pages,
    };
  }

  return Object.entries(pages).reduce((res, [baseRoutePath, config]) => {
    // ensure start slash
    if (!baseRoutePath.startsWith('/')) {
      baseRoutePath = '/' + baseRoutePath;
    }

    // remove trail slash
    if (baseRoutePath !== '/') {
      baseRoutePath = baseRoutePath.replace(/\/$/, '');
    }

    if (typeof config === 'string') {
      config = {
        dir: config,
      };
    }

    const ignored = config.ignored || defaultIgnored;

    res[baseRoutePath] = {
      dir: resolve(root, config.dir || 'src/pages'),
      glob:
        config.glob || '**/*{.page.js,.page.jsx,.page.ts,.page.tsx,.md,.mdx}',
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        ...(Array.isArray(ignored) ? ignored : [ignored]),
      ],
    };

    return res;
  }, {} as ResolvedPages);
}

export function resolveOptions(
  userOptions: UserOptions,
  root = slash(process.cwd()),
  base = '/'
): ResolvedOptions {
  const {
    id = '',
    src = 'src',
    pages = 'src/pages',
    ignored = [],
    componentImportMode = 'lazy',
    extendPage = page => page,
    onPagesGenerated = pages => pages,
    onRoutesGenerated = routes => routes,
    onRoutesCodeGenerated = code => code,
  } = userOptions;

  return {
    id,
    root,
    src: resolve(root, src),
    pages: resolvePages(pages, root, base, ignored),
    ignored,
    componentImportMode,
    extendPage,
    onPagesGenerated,
    onRoutesGenerated,
    onRoutesCodeGenerated,
    react: {},
    windicss: {},
  };
}
