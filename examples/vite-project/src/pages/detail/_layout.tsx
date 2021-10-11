import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function DetailLayout() {
  useEffect(() => {
    console.log('mounted');
  }, []);

  return (
    <div>
      <h1 className="text-indigo-500">Detail Layout</h1>
      <Suspense fallback="detail loading">
        <Outlet />
      </Suspense>
    </div>
  );
}
