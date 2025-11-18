import { type RouteParams } from './types';

/**
 * Matchea la ruta actual contra el path definido y extrae params dinámicos.
 * @param currentPath Ruta actual (pathname).
 * @param routePath Patrón de ruta con segmentos estáticos o [param].
 * @returns Objeto { matches, params } donde params contiene los dinámicos.
 */
export function matchRoute(currentPath: string, routePath: string): { matches: boolean; params: RouteParams } {
  const currentSegments = currentPath.split('/').filter(Boolean);
  const routeSegments = routePath.split('/').filter(Boolean);

  if (currentSegments.length !== routeSegments.length) {
    return { matches: false, params: {} };
  }

  const params: RouteParams = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSegment = routeSegments[i];
    const currentSegment = currentSegments[i];

    if (routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
      // Dynamic segment
      const paramName = routeSegment.slice(1, -1);
      params[paramName] = currentSegment;
    } else if (routeSegment !== currentSegment) {
      // Static segment doesn't match
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

/**
 * Convierte una ruta de archivo en pages/ a su ruta pública.
 * @param filePath ruta relativa dentro de pages.
 * @returns ruta pública normalizada (ej: pages/user/[id].tsx -> /user/[id]).
 */
export function filePathToRoute(filePath: string): string {
  const route = filePath
    .replace(/^pages\//, '') // Remove pages prefix
    .replace(/\.tsx$/, '')   // Remove file extension
    .replace(/\/index$/, ''); // Convert index files to directory route

  if (route === '' || route === 'index') {
    return '/';
  }

  return '/' + route;
}

/**
 * Normaliza una ruta: prefijo '/', sin slash final (excepto root).
 * @param path ruta de entrada.
 * @returns ruta normalizada con prefijo '/' y sin slash final.
 */
export function normalizeRoute(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}
