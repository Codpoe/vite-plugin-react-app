/**
 * @title layout213
 */
import { Suspense } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { usePagesMeta } from 'vite-plugin-react-app/client';
import { useLocation } from 'react-router-dom';

function Demo(props: any) {
  return (
    <>
      {props.children}
      <pre className="whitespace-pre-wrap">{props.code}</pre>
      <pre className="whitespace-pre-wrap">{JSON.stringify(props.meta)}</pre>
    </>
  );
}

function TsInfo(props: any) {
  return (
    <pre className="whitespace-pre-wrap">
      {JSON.stringify(props.info, null, 2)}
    </pre>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const pagesMeta = usePagesMeta()[pathname];

  console.log(pagesMeta);

  return (
    <div>
      <h1>App Layout -- {pagesMeta.title}</h1>
      <MDXProvider components={{ Demo, TsInfo }}>
        <Suspense fallback="app loading">{children}</Suspense>
      </MDXProvider>
    </div>
  );
}
