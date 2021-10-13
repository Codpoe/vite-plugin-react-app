import { resolve } from 'path';
import { MdxOptions } from 'vite-plugin-mdx';
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
  defaultIgnored: any = []
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

function resolveMdx(mdx?: UserOptions['mdx']): NonNullable<UserOptions['mdx']> {
  if (mdx === false) {
    return false;
  }

  const mergeDefault = (options?: MdxOptions): MdxOptions => ({
    ...options,
    remarkPlugins: [...(options?.remarkPlugins || [])],
    rehypePlugins: [...(options?.rehypePlugins || [])],
  });

  if (typeof mdx === 'function') {
    return (filename: string) => mergeDefault(mdx(filename));
  }

  return mergeDefault(mdx);
}

export function resolveOptions(
  userOptions: UserOptions,
  root = slash(process.cwd()),
  base = '/'
): ResolvedOptions {
  const {
    src = 'src',
    pages = 'src/pages',
    ignored = [],
    componentImportMode = 'lazy',
    extendPage = page => page,
    onPagesGenerated = pages => pages,
    onRoutesGenerated = routes => routes,
    onRoutesCodeGenerated = code => code,
    react = {},
    windicss = {},
  } = userOptions;

  return {
    root,
    src: resolve(root, src),
    pages: resolvePages(pages, root, base, ignored),
    ignored,
    componentImportMode,
    extendPage,
    onPagesGenerated,
    onRoutesGenerated,
    onRoutesCodeGenerated,
    react,
    windicss,
    icons:
      userOptions.icons === false
        ? false
        : {
            compiler: 'jsx',
            autoInstall: true,
            scale: 1,
            ...userOptions.icons,
          },
    mdx: resolveMdx(userOptions.mdx),
  };
}
