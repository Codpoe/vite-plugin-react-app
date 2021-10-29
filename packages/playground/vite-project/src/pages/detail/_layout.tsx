import { Suspense, useEffect } from 'react';

export default function DetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('mounted');
  }, []);

  return (
    <div>
      <h1 className="text-indigo-500">Detail Layout</h1>
      <Suspense fallback="detail loading">{children}</Suspense>
    </div>
  );
}
