import { type Route } from './types';
import { filePathToRoute } from './utils';

// Usar Vite's import.meta.glob para obtener todos los archivos de páginas automáticamente
const pageModules = import.meta.glob('../../pages/**/*.tsx', { eager: true });

/**
 * Genera el árbol de rutas a partir de los archivos de pages/ (entorno Vite).
 */
export function generateRoutes(): Route[] {
  const routes: Route[] = [];

  Object.entries(pageModules).forEach(([filePath, module]) => {
    const relativePath = filePath.replace('../../pages/', '');
    const routePath = filePathToRoute(relativePath);
    const component = (module as { default: React.ComponentType<unknown> }).default;

    if (component) {
      routes.push({
        path: routePath,
        component,
      });
    }
  });

  // Ordenar rutas para que las más específicas aparezcan primero
  return routes.sort((a, b) => {
    const aHasParams = a.path.includes('[');
    const bHasParams = b.path.includes('[');

    if (aHasParams && !bHasParams) return 1;
    if (!aHasParams && bHasParams) return -1;

    return b.path.length - a.path.length;
  });
}
