import { createContext, useContext } from "react";
import { type RouterContextType } from "./types";

export const RouterContext = createContext<RouterContextType | null>(null);

/**
 * Accede al contexto del router (path, search, navigate…).
 * @returns RouterContextType con navegación y paths.
 */
export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

/**
 * Devuelve los params de la ruta activa (en window.__routerParams).
 * @returns Diccionario de parámetros.
 */
export function useParams() {
  return window.__routerParams || {};
}
