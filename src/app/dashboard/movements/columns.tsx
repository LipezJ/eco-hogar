"use client"

import { ColumnDef } from "@tanstack/react-table"
import { z } from "zod/v4"
import { InventorySchema } from "@/db/schema"
import { TableBadge } from "@/components/id-badge"

export const columns: ColumnDef<z.infer<typeof InventorySchema>>[] = [
  {
    accessorKey: "warehouseName",
    header: "Bodega",
    meta: {
      filterVariant: "select",
      className: "w-3/9",
    },
    cell(props) {
      return <TableBadge label={props.row.original.warehouseName} href={`/dashboard/inventory?warehouse=${props.row.original.warehouseName}`} />
    },
  },
  {
    accessorKey: "productName",
    header: "Producto",
    meta: {
      filterVariant: "text",
      className: "w-4/9",
    },
    cell(props) {
      return <TableBadge label={props.row.original.productName} variant="text" href={`/dashboard/inventory?productName=${props.row.original.productName}`} />
    },
  },
  {
    accessorKey: "stock",
    header: "Cantidad",
    meta: {
      className: "w-2/9",
    }
  },
]