declare global {
  interface Window {
    __routerParams?: Record<string, unknown>;
  }
}

export interface Route {
  path: string;
  component: React.ComponentType;
  params?: Record<string, string>;
}

export interface RouteParams {
  [key: string]: string;
}

export interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: RouteParams;
}