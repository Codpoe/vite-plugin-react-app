import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

render(
  <BrowserRouter>
    <React.Suspense fallback={false}>
      <App />
    </React.Suspense>
  </BrowserRouter>,
  document.getElementById('app')
);
