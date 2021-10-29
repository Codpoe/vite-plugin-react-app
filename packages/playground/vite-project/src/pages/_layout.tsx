/**
 * @title layout213
 */
import { Suspense, useEffect } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { useClientContext } from 'vite-plugin-react-app/client';

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
  const clientContext = useClientContext();
  useEffect(() => {
    console.log(clientContext);
  }, [clientContext]);
  return (
    <div>
      <h1>App Layout</h1>
      <MDXProvider components={{ Demo, TsInfo }}>
        <Suspense fallback="app loading">{children}</Suspense>
      </MDXProvider>
    </div>
  );
}
