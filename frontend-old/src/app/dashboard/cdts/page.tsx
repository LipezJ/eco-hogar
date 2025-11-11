"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog } from "@/components/form-dialog"
import { CreateCdtForm } from "./form"
import { Cdt, calculateFinalAmount, calculateDueDate } from "@/types/cdts"

// Datos de ejemplo para la UI
const mockCdts: Cdt[] = [
  {
    id: "1",
    institution: "Banco Nación",
    openingDate: "2025-01-15",
    initialAmount: 5000000,
    interestRate: 8.5,
    term: 365,
    dueDate: calculateDueDate("2025-01-15", 365),
    finalAmount: calculateFinalAmount(5000000, 8.5, 365),
    status: "activo",
    autoRenew: false,
    description: "Inversión a largo plazo",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    institution: "Banco Galicia",
    openingDate: "2025-06-01",
    initialAmount: 3000000,
    interestRate: 10.2,
    term: 180,
    dueDate: calculateDueDate("2025-06-01", 180),
    finalAmount: calculateFinalAmount(3000000, 10.2, 180),
    status: "activo",
    autoRenew: true,
    description: "CDT a 6 meses",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    institution: "Banco Santander",
    openingDate: "2025-03-10",
    initialAmount: 2000000,
    interestRate: 7.8,
    term: 90,
    dueDate: calculateDueDate("2025-03-10", 90),
    finalAmount: calculateFinalAmount(2000000, 7.8, 90),
    status: "activo",
    autoRenew: false,
    description: "CDT a corto plazo",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    institution: "BBVA",
    openingDate: "2024-11-01",
    initialAmount: 4500000,
    interestRate: 9.5,
    term: 365,
    dueDate: calculateDueDate("2024-11-01", 365),
    finalAmount: calculateFinalAmount(4500000, 9.5, 365),
    status: "activo",
    autoRenew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    institution: "Banco Macro",
    openingDate: "2024-05-15",
    initialAmount: 10000000,
    interestRate: 11.0,
    term: 365,
    dueDate: calculateDueDate("2024-05-15", 365),
    finalAmount: calculateFinalAmount(10000000, 11.0, 365),
    status: "vencido",
    autoRenew: false,
    description: "CDT vencido - renovar",
    createdAt: new Date().toISOString()
  }
]

export default function Cdts() {
  // const { data, refetch } = useQuery<Cdt[]>({
  //   queryKey: ['cdts'],
  //   queryFn: () => {
  //     return fetch('/api/cdts').then(res => res.json());
  //   },
  //   staleTime: 1000*60*60*24
  // })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="CDTs - Certificados de Depósito a Término" />
      <section className="container mx-auto pt-4 px-4 space-y-4">
        <div className="flex justify-end">
          <FormDialog
            title="Nuevo CDT"
            description="Complete los datos del nuevo Certificado de Depósito a Término"
            form={<CreateCdtForm />}
            className="sm:max-w-[700px]"
          >
            <Button>
              <Plus />
              Nuevo CDT
            </Button>
          </FormDialog>
        </div>
        <DataTable columns={columns} data={mockCdts} />
      </section>
    </div>
  )
}
