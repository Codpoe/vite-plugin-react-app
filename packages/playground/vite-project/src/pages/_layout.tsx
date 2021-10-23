import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';

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

export default function AppLayout() {
  return (
    <div>
      <h1>App Layout</h1>
      <MDXProvider components={{ Demo, TsInfo }}>
        <Suspense fallback="app loading">
          <Outlet />
        </Suspense>
      </MDXProvider>
    </div>
  );
}
