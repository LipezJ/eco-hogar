"use client";

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface TanstackProviderProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const persister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
})

export const TanstackProvider = ({ children }: TanstackProviderProps) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
      <ReactQueryDevtools/>
    </PersistQueryClientProvider>
  );
};