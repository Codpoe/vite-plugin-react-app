import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div>
      <h1>App Layout</h1>
      <Suspense fallback="app loading">
        <Outlet />
      </Suspense>
    </div>
  );
}
