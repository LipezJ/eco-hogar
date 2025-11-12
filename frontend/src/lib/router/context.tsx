import { useState, useEffect, type ReactNode } from 'react';
import { type RouterContextType, type RouteParams } from './types';
import { RouterContext } from './context.hook';

interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params] = useState<RouteParams>({});

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const value: RouterContextType = {
    currentPath,
    navigate,
    params,
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}
