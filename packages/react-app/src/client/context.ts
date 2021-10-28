import { createContext } from 'react';
import { Route, Page } from '../../commonTypes';

export interface ClientContextValue {
  /**
   * routes config
   */
  routes: Route[];
  /**
   * pages map
   */
  pages: Record<string, Page>;
}

export const ClientContext = createContext<ClientContextValue>({} as any);
