declare global {
  interface Window {
    __routerParams?: Record<string, unknown>;
    __routerHistoryPatched?: boolean;
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
  currentSearch: string;
  navigate: (path: string) => void;
  replace: (path: string) => void;
  params: RouteParams;
}
