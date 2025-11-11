import { useQuery } from "@tanstack/react-query";
import { useTopLoader } from "nextjs-toploader";
import { useEffect } from "react";

interface UseQueryFetchProps {
  url: string
  queryKey: unknown[]
  staleTime?: number
  params?: Record<string, string>
}

export function useQueryFetch<T>({ url, queryKey, staleTime, params }: UseQueryFetchProps) {
  const loader = useTopLoader()
  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`${url}?${params ? new URLSearchParams(params) : ""}`);
      return await res.json();
    },
    staleTime: staleTime ? staleTime : 1000*60*60*24
  })

  useEffect(() => {
    if (query.isRefetching || query.isPending) {
      loader.start()
    } else {
      loader.done()
    }
  }, [ query.isRefetching, query.isPending, loader ])

  return { ...query }
}