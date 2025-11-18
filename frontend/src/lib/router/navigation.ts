import { useMemo } from 'react';
import { useRouter } from './context.hook';

/**
 * Hook ligero que devuelve el pathname actual.
 * @returns pathname actual.
 */
export function usePathname() {
  const { currentPath } = useRouter();
  return currentPath;
}

/**
 * Hook para obtener URLSearchParams reactivo al cambio de search.
 * @returns instancia de URLSearchParams basada en currentSearch.
 */
export function useSearchParams() {
  const { currentSearch } = useRouter();
  return useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);
}
