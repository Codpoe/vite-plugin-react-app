import React from 'react';
import Theme from '/@react-app/theme';
import { Page } from './Page';

export const App: React.FC = () => {
  return <>{Theme ? <Theme /> : <Page />}</>;
};
