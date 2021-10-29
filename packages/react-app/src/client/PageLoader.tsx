import React from 'react';
import { Outlet } from 'react-router-dom';

export interface PageLoaderProps {
  component: React.ComponentType<any>;
  isLayout: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  component: Component,
  isLayout,
}) => {
  return <Component>{isLayout ? <Outlet /> : undefined}</Component>;
};
