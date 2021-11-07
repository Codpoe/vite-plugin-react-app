import { useEffect, useState } from 'react';
import importedPagesMeta from '/@react-app/pages-meta';

export function usePagesMeta() {
  const [pagesMeta, setPagesMeta] = useState(importedPagesMeta);

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('/@react-app/pages-meta', mod => {
        setPagesMeta(mod.default);
      });
    }
  }, []);

  return pagesMeta;
}
