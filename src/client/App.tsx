import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from 'virtual:react-app/routes';
import { PageLoader } from './PageLoader';

function renderRoutes(list: typeof routes) {
  return list.map(item => (
    <Route
      key={item.path}
      path={item.path}
      element={<PageLoader component={item.component} />}
    >
      {item.children?.length ? renderRoutes(item.children) : undefined}
    </Route>
  ));
}

export const App: React.FC = () => {
  return <Routes>{renderRoutes(routes)}</Routes>;
};
