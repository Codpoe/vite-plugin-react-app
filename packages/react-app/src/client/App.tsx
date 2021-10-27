import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from '/@react-app/routes';
import pages from '/@react-app/pages';
import { PageLoader } from './PageLoader';

console.log(pages);

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
