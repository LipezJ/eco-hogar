"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"

export default function Inventory() {
  // const { data, refetch } = useQuery<z.infer<typeof InventorySchema>[]>({
  //   queryKey: ['inventory'],
  //   queryFn: () => {
  //     return fetch('/api/inventory').then(res => res.json());
  //   },
  //   staleTime: 1000*60*60*24
  // })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Movimientos" />
      <section className="container mx-auto pt-4 px-4 space-y-4">
        <DataTable columns={columns} data={[]} />
      </section>
    </div>
  )
}