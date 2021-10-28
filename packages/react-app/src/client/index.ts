import { useContext } from 'react';
import { ClientContext, ClientContextValue } from './context';

export { ClientContextValue };

/**
 * use the client context
 */
export function useClientContext() {
  return useContext(ClientContext);
}
