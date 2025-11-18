/**
 * Declarative wrapper sobre React Query para llamadas GET con cookie credentials.
 * Usa `useQuery` (o `useSuspenseQuery` en la variante de Suspense).
 */
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";

interface UseQueryFetchProps {
  /** Endpoint absoluto o relativo ya formateado (sin `API_BASE_URL` aquí). */
  url: string
  /** Clave de caché para React Query. */
  queryKey: unknown[]
  /** Tiempo de frescura en ms (defaults 24h). */
  staleTime?: number
  /** Query params sencillos, se serializan con URLSearchParams. */
  params?: Record<string, string>
}

/**
 * Fetch con caché estándar (no-Suspense).
 * @param url endpoint a consultar.
 * @param queryKey clave de caché.
 * @param staleTime ms de frescura (default 24h).
 * @param params query params opcionales.
 * @returns resultados y helpers de React Query.
 */
export function useQueryFetch<T>({ url, queryKey, staleTime, params }: UseQueryFetchProps) {
  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`${url}?${params ? new URLSearchParams(params) : ""}`, {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.statusText}`);
      }
      return await res.json();
    },
    staleTime: staleTime ? staleTime : 1000*60*60*24
  })

  return { ...query }
}

/**
 * Versión Suspense-friendly; lanza Promises hasta que haya datos.
 * @param url endpoint a consultar.
 * @param queryKey clave de caché.
 * @param staleTime ms de frescura (default 24h).
 * @param params query params opcionales.
 * @returns resultados y helpers de React Query.
 */
export function useSuspenseQueryFetch<T>({ url, queryKey, staleTime, params }: UseQueryFetchProps) {
  const query = useSuspenseQuery<T>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`${url}?${params ? new URLSearchParams(params) : ""}`, {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.statusText}`);
      }
      return await res.json();
    },
    staleTime: staleTime ? staleTime : 1000*60*60*24
  })

  return { ...query }
}
