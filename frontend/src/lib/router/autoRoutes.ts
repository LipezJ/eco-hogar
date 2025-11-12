import { type Route } from './types';
import { filePathToRoute } from './utils';

// Usar Vite's import.meta.glob para obtener todos los archivos de páginas automáticamente
const pageModules = import.meta.glob('../pages/**/*.tsx', { eager: true });

export function generateAutoRoutes(): Route[] {
  const routes: Route[] = [];

  Object.entries(pageModules).forEach(([filePath, module]) => {
    // Extraer el path relativo desde pages/
    const relativePath = filePath.replace('../pages/', '');

    // Convertir el path del archivo a ruta
    const routePath = filePathToRoute(relativePath);

    // Obtener el componente por defecto
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
    // Las rutas con parámetros van al final
    const aHasParams = a.path.includes('[');
    const bHasParams = b.path.includes('[');

    if (aHasParams && !bHasParams) return 1;
    if (!aHasParams && bHasParams) return -1;

    // Las rutas más largas van primero
    return b.path.length - a.path.length;
  });
}