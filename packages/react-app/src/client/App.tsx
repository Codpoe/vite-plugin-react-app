import React, { useState, useEffect } from 'react';
import { Routes, Route as ReactRoute } from 'react-router-dom';
import routes from '/@react-app/routes';
import pages from '/@react-app/pages';
import { PageLoader } from './PageLoader';
import { ClientContext, ClientContextValue } from './context';

function renderRoutes(list: typeof routes) {
  return list.map(item => {
    const isLayout = Boolean(item.children?.length);

    return (
      <ReactRoute
        key={item.path}
        path={item.path}
        element={<PageLoader component={item.component} isLayout={isLayout} />}
      >
        {isLayout ? renderRoutes(item.children!) : undefined}
      </ReactRoute>
    );
  });
}

export const App: React.FC = () => {
  const [contextValue, setContextValue] = useState<ClientContextValue>({
    routes,
    pages,
  });

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept(
        ['/@react-app/routes', '/@react-app/pages'],
        ([routesModule, pagesModule]) => {
          setContextValue(prev => ({
            ...prev,
            routes: routesModule?.default ?? prev.routes,
            pages: pagesModule?.default ?? prev.pages,
          }));
        }
      );
    }
  }, []);

  return (
    <ClientContext.Provider value={contextValue}>
      <Routes>{renderRoutes(routes)}</Routes>
    </ClientContext.Provider>
  );
};
