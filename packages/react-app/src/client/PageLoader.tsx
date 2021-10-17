import * as React from 'react';

export interface PageLoaderProps {
  component: React.ComponentType<any>;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  component: Component,
}) => {
  return <Component />;
};
