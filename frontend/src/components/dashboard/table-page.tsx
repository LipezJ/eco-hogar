"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { ColumnDef } from "@tanstack/react-table"
import { useQueryFetch } from "@/hooks/user-query-fetch"

interface TablePageProps<TData, TValue> {
  endpoint: string
  queryKey: unknown[]
  staleTime?: number
  title: string
  children?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  exportTo?: boolean
}

export default function TablePage<TData, TValue>({ title, endpoint, queryKey, staleTime, children, columns, exportTo }: TablePageProps<TData, TValue>) {
  const { data, refetch, isLoading } = useQueryFetch<TData[]>({
    queryKey,
    url: endpoint,
    staleTime
  })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title={title} />
      <section className="container mx-auto pt-4 px-4 space-y-4">
        <div className="flex justify-end">
          {children}
        </div>
        <DataTable name={title} columns={columns} data={data || []} refresh={refetch} isLoading={isLoading} exportTo={exportTo} />
      </section>
    </div>
  )
}