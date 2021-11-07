import { createContext } from 'react';

export interface ClientContextValue {}

export const ClientContext = createContext<ClientContextValue>({} as any);
