import { useSuspenseQuery, useQuery } from "@tanstack/react-query";

interface UseQueryFetchProps {
  url: string
  queryKey: unknown[]
  staleTime?: number
  params?: Record<string, string>
}

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
