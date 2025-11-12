import { createContext, useContext } from "react";
import { type RouterContextType } from "./types";

export const RouterContext = createContext<RouterContextType | null>(null);

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function useParams() {
  return window.__routerParams || {};
}