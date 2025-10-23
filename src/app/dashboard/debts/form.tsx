"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Calendar, DollarSign } from "lucide-react"
import { Form, FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { Debt, CreateDebtSchema, UpdateDebtSchema, DebtType } from "@/types/debts"
import { z } from "zod/v4"

const typeOptions = DebtType.options.map(type => ({
  id: type,
  label: type === "deuda" ? "Deuda (dinero que debo)" : "Préstamo (dinero que presté)"
}))

function getCreateDebtFormDef(): FormFieldDef<z.infer<typeof CreateDebtSchema>>[] {
  return [
    {
      name: "type",
      label: "Tipo",
      description: "Seleccione si es una deuda o un préstamo.",
      variant: "select",
      placeholder: "Tipo",
      options: typeOptions
    },
    {
      name: "origin",
      label: "Origen/Destino",
      description: "Banco, persona o entidad.",
      placeholder: "Ej: Banco Nacional, Juan Pérez"
    },
    {
      name: "amount",
      label: "Monto Total",
      description: "Monto total del préstamo o deuda.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "interestRate",
      label: "Tasa de Interés Anual (%)",
      description: "Tasa de interés anual en porcentaje.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "installments",
      label: "Número de Cuotas",
      description: "Cantidad de cuotas a pagar.",
      placeholder: "12",
      type: "number"
    },
    {
      name: "startDate",
      label: "Fecha de Inicio",
      description: "Fecha en que inicia el préstamo.",
      variant: "date"
    },
    {
      name: "paymentDay",
      label: "Día de Pago",
      description: "Día del mes para realizar los pagos (1-31).",
      placeholder: "15",
      type: "number"
    },
    {
      name: "description",
      label: "Descripción",
      description: "Descripción o notas adicionales (opcional).",
      placeholder: "Ej: Préstamo para compra de auto"
    }
  ]
}

function getUpdateDebtFormDef(): FormFieldDef<z.infer<typeof UpdateDebtSchema>>[] {
  return getCreateDebtFormDef()
}

export function CreateDebtForm() {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getCreateDebtFormDef()}
      resolver={zodResolver(CreateDebtSchema)}
      defaultValues={{
        type: "deuda",
        origin: "",
        amount: 0,
        interestRate: 0,
        installments: 12,
        startDate: new Date().toISOString().split('T')[0],
        paymentDay: 15,
        description: ""
      }}
      queryKey={['debts']}
      url="/api/debts"
      method="POST"
      submitButtonText="Crear deuda/préstamo"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function UpdateDebtForm({ debt }: { debt: Debt }) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getUpdateDebtFormDef()}
      resolver={zodResolver(UpdateDebtSchema)}
      defaultValues={{
        id: debt.id,
        type: debt.type,
        origin: debt.origin,
        amount: debt.amount,
        interestRate: debt.interestRate,
        installments: debt.installments,
        startDate: debt.startDate,
        paymentDay: debt.paymentDay,
        description: debt.description
      }}
      queryKey={['debts']}
      url="/api/debts"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function DebtsActions({ debt, onViewPayments }: { debt: Debt, onViewPayments: (debt: Debt) => void }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = () => {
    // Aquí iría la lógica de eliminación cuando conectes el backend
    console.log("Eliminar deuda:", debt.id)
    setDeleteOpen(false)
  }

  return (
    <Fragment>
      <FormDialogStandalone
        open={editOpen}
        setOpen={setEditOpen}
        title="Modificar deuda/préstamo"
        description="Cambie los datos que desee modificar"
        className="sm:max-w-[700px]"
      >
        <UpdateDebtForm debt={debt} />
      </FormDialogStandalone>

      <FormDialogStandalone
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Eliminar deuda/préstamo"
        description="¿Está seguro que desea eliminar esta deuda/préstamo? Esta acción no se puede deshacer."
      >
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </FormDialogStandalone>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewPayments(debt)}>
            <Calendar />
            Ver pagos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit/>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2/>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  )
}
