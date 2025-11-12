import React from 'react';
import { useRouter } from './context.hook';
import { type Route } from './types';
import { matchRoute } from './utils';

interface RouterProps {
  routes: Route[];
  fallback?: React.ComponentType;
}

export function Router({ routes, fallback: Fallback }: RouterProps) {
  const { currentPath } = useRouter();

  for (const route of routes) {
    const { matches, params } = matchRoute(currentPath, route.path);

    if (matches) {
      return <RouteRenderer component={route.component} params={params} />;
    }
  }

  // No route matched
  if (Fallback) {
    return React.createElement(Fallback);
  }

  return <div>404 - Page not found</div>;
}

interface RouteRendererProps {
  component: React.ComponentType;
  params: Record<string, string>;
}

function RouteRenderer({ component: Component, params }: RouteRendererProps) {
  // Store params immediately and in useEffect
  window.__routerParams = params;

  React.useEffect(() => {
    window.__routerParams = params;
  }, [params]);

  return <Component />;
}