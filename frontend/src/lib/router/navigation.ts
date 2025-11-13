import { useMemo } from 'react';
import { useRouter } from './context.hook';

export function usePathname() {
  const { currentPath } = useRouter();
  return currentPath;
}

export function useSearchParams() {
  const { currentSearch } = useRouter();
  return useMemo(() => new URLSearchParams(currentSearch), [currentSearch]);
}
