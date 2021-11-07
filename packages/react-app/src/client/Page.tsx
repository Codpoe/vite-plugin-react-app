import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  Suspense as ReactSuspense,
} from 'react';
import { Route as ReactRoute, Routes, Outlet } from 'react-router-dom';
import routes from '/@react-app/routes';
import { Route } from '../../commonTypes';

export type SuspenseStatus = 'pending' | 'fallback' | 'resolve';

export interface SuspenseProps {
  /**
   * The fallback content to show when a Suspense child (like React.lazy) suspends
   */
  fallback?: NonNullable<React.ReactNode> | null;
  /**
   * Tells the <Suspense> component how long to wait before showing the fallback.
   *
   * By default, it won't update the DOM to show the fallback content.
   * Instead, it will continue to show the old DOM until the new components are ready.
   */
  timeout?: number;
  /**
   * The callback for status change
   */
  onStatusChange?: (status: SuspenseStatus) => void;
}

const Fallback: React.FC<SuspenseProps> = ({
  fallback,
  timeout,
  onStatusChange,
  children,
}) => {
  // if timeout === 0 or no children, show real fallback immediately
  const [showRealFallback, setShowRealFallback] = useState(
    timeout === 0 || !children
  );

  useMemo(() => {
    onStatusChange?.(showRealFallback ? 'fallback' : 'pending');
  }, [showRealFallback]);

  useEffect(() => {
    if (timeout && !showRealFallback) {
      const timer = setTimeout(() => {
        setShowRealFallback(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, []);

  return <>{showRealFallback ? fallback : children}</>;
};

const Wrapper: React.FC<{ onActive: () => void }> = ({
  onActive,
  children,
}) => {
  useEffect(() => {
    onActive();
  }, []);

  return <>{children}</>;
};

/**
 * A simple wrapper of React.Suspense
 */
export const Suspense: React.FC<SuspenseProps> = ({
  fallback,
  timeout,
  onStatusChange,
  children,
}) => {
  const activeChildrenRef = useRef<React.ReactNode>();

  return (
    <ReactSuspense
      fallback={
        <Fallback
          fallback={fallback}
          timeout={timeout}
          onStatusChange={onStatusChange}
        >
          {activeChildrenRef.current}
        </Fallback>
      }
    >
      <Wrapper
        onActive={() => {
          activeChildrenRef.current = children;
          onStatusChange?.('resolve');
        }}
      >
        {children}
      </Wrapper>
    </ReactSuspense>
  );
};

export interface PageProps extends SuspenseProps {}

function renderRoutes(routes: Route[]) {
  return routes.map(item => {
    const isLayout = Boolean(item.children?.length);

    return (
      <ReactRoute
        key={item.path}
        path={item.path}
        element={
          <item.component>{isLayout ? <Outlet /> : undefined}</item.component>
        }
      >
        {isLayout ? renderRoutes(item.children!) : undefined}
      </ReactRoute>
    );
  });
}

/**
 * Render page content
 */
export const Page: React.FC<PageProps> = props => {
  return (
    <Suspense {...props}>
      <Routes>{renderRoutes(routes)}</Routes>
    </Suspense>
  );
};
