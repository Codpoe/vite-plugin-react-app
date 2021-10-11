import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function DetailLayout() {
  useEffect(() => {
    console.log('mounted');
  }, []);

  return (
    <div>
      <h1>Detail Layout</h1>
      <Suspense fallback="detail loading">
        <Outlet />
      </Suspense>
    </div>
  );
}
