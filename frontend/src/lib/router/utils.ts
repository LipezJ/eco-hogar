import { type RouteParams } from './types';

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

export function filePathToRoute(filePath: string): string {
  // Convert file path to route path
  // e.g., "pages/about/index.tsx" -> "/about"
  // e.g., "pages/user/[id].tsx" -> "/user/[id]"

  const route = filePath
    .replace(/^pages\//, '') // Remove pages prefix
    .replace(/\.tsx$/, '')   // Remove file extension
    .replace(/\/index$/, ''); // Convert index files to directory route

  // Handle root index
  if (route === '' || route === 'index') {
    return '/';
  }

  return '/' + route;
}

export function normalizeRoute(path: string): string {
  // Ensure route starts with / and doesn't end with / (except root)
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}