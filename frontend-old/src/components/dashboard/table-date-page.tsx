"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { ColumnDef } from "@tanstack/react-table"
import { useQueryFetch } from "@/hooks/user-query-fetch"
import { useState } from "react"
import { DatePickerRange } from "../ui/date-picker"
import { getCurrentFullMonthRange } from "@/lib/utils"

interface TableDatePageProps<TData, TValue> {
  endpoint: string
  queryKey: unknown[]
  staleTime?: number
  title: string
  children?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  exportTo?: boolean
}

export default function TableDatePage<TData, TValue>({ title, endpoint, queryKey, staleTime, children, columns, exportTo }: TableDatePageProps<TData, TValue>) {
  const [ dateRange, setDateRange ] = useState<string[]>(getCurrentFullMonthRange());

  const { data, refetch, isLoading } = useQueryFetch<TData[]>({
    queryKey: [ ...queryKey, dateRange ],
    url: endpoint,
    staleTime,
    params: {
      from: dateRange[0] !== "" ? new Date(dateRange[0]).toISOString() : "",
      to: dateRange[1] !== "" ? new Date(dateRange[1]).toISOString() : ""
    }
  })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title={title} />
      <section className="container mx-auto pt-4 px-4 space-y-4">
        <div className="flex justify-between">
          <div className="flex justify-start">
            <DatePickerRange
              value={dateRange}
              setValue={setDateRange}            
            />
          </div>
          <div className="flex justify-end">
            {children}
          </div>
        </div>
        <DataTable name={title} columns={columns} data={data || []} refresh={refetch} isLoading={isLoading} exportTo={exportTo} />
      </section>
    </div>
  )
}