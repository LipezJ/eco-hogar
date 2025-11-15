import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { type RouterContextType, type RouteParams } from './types';
import { RouterContext } from './context.hook';

interface LocationState {
  pathname: string;
  search: string;
}

const defaultLocation: LocationState = {
  pathname: '/',
  search: '',
};

function readWindowLocation(): LocationState {
  if (typeof window === 'undefined') {
    return defaultLocation;
  }

  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

function resolveTarget(path: string): string {
  if (typeof window === 'undefined') return path;

  try {
    const url = new URL(path, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path;
  }
}

function ensureHistoryPatched() {
  if (typeof window === 'undefined') return;
  if ((window as unknown as { __routerHistoryPatched?: boolean }).__routerHistoryPatched) return;

  const history = window.history;
  const dispatch = (eventName: string) => {
    window.dispatchEvent(new Event(eventName));
  };

  const wrap = (type: 'pushState' | 'replaceState') => {
    const original = history[type];
    function patched(this: History, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      dispatch(type === 'pushState' ? 'pushstate' : 'replacestate');
      return result;
    }
    history[type] = patched as typeof original;
  };

  wrap('pushState');
  wrap('replaceState');
  (window as unknown as { __routerHistoryPatched?: boolean }).__routerHistoryPatched = true;
}

interface RouterProviderProps {
  children: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  ensureHistoryPatched();

  const [location, setLocation] = useState<LocationState>(() => readWindowLocation());
  const [params] = useState<RouteParams>({});

  const updateLocationFromWindow = useCallback(() => {
    setLocation(readWindowLocation());
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    window.history.pushState({}, '', resolveTarget(path));
    updateLocationFromWindow();
  }, [updateLocationFromWindow]);

  const replace = useCallback((path: string) => {
    if (typeof window === 'undefined') return;
    window.history.replaceState({}, '', resolveTarget(path));
    updateLocationFromWindow();
  }, [updateLocationFromWindow]);

  useEffect(() => {
    const handleLocationChange = () => {
      updateLocationFromWindow();
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);
    window.addEventListener('replacestate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
      window.removeEventListener('replacestate', handleLocationChange);
    };
  }, [updateLocationFromWindow]);

  const value: RouterContextType = {
    currentPath: location.pathname,
    currentSearch: location.search,
    navigate,
    replace,
    params,
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}
