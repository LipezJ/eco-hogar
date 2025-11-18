import React from 'react';
import { useRouter } from './context.hook';
import { type Route } from './types';
import { matchRoute } from './utils';

interface RouterProps {
  routes: Route[];
  fallback?: React.ComponentType;
}

/**
 * Router muy simple que recorre la lista de rutas y renderiza la primera coincidencia.
 * @param routes Conjunto de rutas declaradas.
 * @param fallback Componente opcional para 404.
 * @returns JSX del componente coincidente o fallback.
 */
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

/**
 * Renderiza el componente y sincroniza params en window.__routerParams.
 * @param component Componente a renderizar.
 * @param params Parámetros dinámicos de la ruta.
 * @returns JSX del componente.
 */
function RouteRenderer({ component: Component, params }: RouteRendererProps) {
  // Store params immediately and in useEffect
  window.__routerParams = params;

  React.useEffect(() => {
    window.__routerParams = params;
  }, [params]);

  return <Component />;
}
