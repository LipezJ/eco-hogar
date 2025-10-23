"use client"

import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/site-header"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FormDialog, FormDialogStandalone } from "@/components/form-dialog"
import { CreateDebtForm } from "./form"
import { Debt } from "@/types/debts"
import { useState } from "react"
import { PaymentsView } from "./payments"

// Datos de ejemplo para la UI
const mockDebts: Debt[] = [
  {
    id: "1",
    type: "deuda",
    origin: "Banco Nacional",
    amount: 5000000,
    interestRate: 12.5,
    installments: 24,
    startDate: "2025-01-01",
    paymentDay: 15,
    description: "Préstamo personal para compra de vehículo",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    type: "prestamo",
    origin: "Juan Pérez",
    amount: 1000000,
    interestRate: 5,
    installments: 12,
    startDate: "2025-06-01",
    paymentDay: 10,
    description: "Préstamo a amigo",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    type: "deuda",
    origin: "Tarjeta de Crédito VISA",
    amount: 800000,
    interestRate: 18,
    installments: 6,
    startDate: "2025-09-01",
    paymentDay: 20,
    description: "Compras a cuotas",
    createdAt: new Date().toISOString()
  }
]

export default function Debts() {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [paymentsOpen, setPaymentsOpen] = useState(false)

  const handleViewPayments = (debt: Debt) => {
    setSelectedDebt(debt)
    setPaymentsOpen(true)
  }

  const columns = createColumns(handleViewPayments)

  // const { data, refetch } = useQuery<Debt[]>({
  //   queryKey: ['debts'],
  //   queryFn: () => {
  //     return fetch('/api/debts').then(res => res.json());
  //   },
  //   staleTime: 1000*60*60*24
  // })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader title="Deudas y Préstamos" />
      <section className="container mx-auto pt-4 px-4 space-y-4">
        <div className="flex justify-end">
          <FormDialog
            title="Nueva deuda/préstamo"
            description="Complete los datos de la nueva deuda o préstamo"
            form={<CreateDebtForm />}
            className="sm:max-w-[700px]"
          >
            <Button>
              <Plus />
              Nueva deuda/préstamo
            </Button>
          </FormDialog>
        </div>
        <DataTable columns={columns} data={mockDebts} />
      </section>

      {/* Modal de Pagos */}
      <FormDialogStandalone
        open={paymentsOpen}
        setOpen={setPaymentsOpen}
        title={selectedDebt ? `Pagos - ${selectedDebt.origin}` : "Pagos"}
        description={selectedDebt ? `${selectedDebt.type === "deuda" ? "Deuda" : "Préstamo"} de $${selectedDebt.amount.toLocaleString('es-ES')}` : ""}
        className="sm:max-w-[900px]"
      >
        {selectedDebt && (
          <PaymentsView
            debt={selectedDebt}
            onClose={() => setPaymentsOpen(false)}
          />
        )}
      </FormDialogStandalone>
    </div>
  )
}
