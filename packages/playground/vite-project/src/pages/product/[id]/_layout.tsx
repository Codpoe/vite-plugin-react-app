import { Suspense } from 'react';

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-indigo-500">Product Layout</h1>
      <Suspense fallback="product loading">{children}</Suspense>
    </div>
  );
}
