"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Paperclip, CheckCircle } from "lucide-react"
import { Form, FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { Bill, CreateBillSchema, UpdateBillSchema, BillCycle, BillCategory, BillStatus } from "@/types/bills"
import { z } from "zod/v4"

const categoryOptions = BillCategory.options.map(cat => ({
  id: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1)
}))

const cycleOptions = BillCycle.options.map(cycle => ({
  id: cycle,
  label: cycle.charAt(0).toUpperCase() + cycle.slice(1)
}))

const statusOptions = BillStatus.options.map(status => ({
  id: status,
  label: status.charAt(0).toUpperCase() + status.slice(1)
}))

function getCreateBillFormDef(): FormFieldDef<z.infer<typeof CreateBillSchema>>[] {
  return [
    {
      name: "provider",
      label: "Proveedor",
      description: "Nombre de la empresa o proveedor del servicio.",
      placeholder: "Ej: Edenor, Aysa, Telecom"
    },
    {
      name: "category",
      label: "Categoría",
      description: "Tipo de servicio.",
      variant: "select",
      placeholder: "Seleccione categoría",
      options: categoryOptions
    },
    {
      name: "cycle",
      label: "Ciclo de Facturación",
      description: "Frecuencia del servicio.",
      variant: "select",
      placeholder: "Seleccione ciclo",
      options: cycleOptions
    },
    {
      name: "amount",
      label: "Monto",
      description: "Monto a pagar.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "dueDate",
      label: "Fecha de Vencimiento",
      description: "Fecha límite de pago.",
      variant: "date"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado del recibo.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    },
    {
      name: "paymentDate",
      label: "Fecha de Pago",
      description: "Fecha en que se realizó el pago (opcional).",
      variant: "date"
    },
    {
      name: "attachment",
      label: "Comprobante",
      description: "URL del comprobante o factura (opcional).",
      placeholder: "https://..."
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas adicionales (opcional).",
      placeholder: "Ej: Incluye internet + cable"
    }
  ]
}

function getUpdateBillFormDef(): FormFieldDef<z.infer<typeof UpdateBillSchema>>[] {
  return getCreateBillFormDef()
}

export function CreateBillForm() {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getCreateBillFormDef()}
      resolver={zodResolver(CreateBillSchema)}
      defaultValues={{
        provider: "",
        category: "otros",
        cycle: "mensual",
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: "pendiente",
        autoRenew: true,
        description: ""
      }}
      queryKey={['bills']}
      url="/api/bills"
      method="POST"
      submitButtonText="Crear recibo"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function UpdateBillForm({ bill }: { bill: Bill }) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getUpdateBillFormDef()}
      resolver={zodResolver(UpdateBillSchema)}
      defaultValues={{
        id: bill.id,
        provider: bill.provider,
        category: bill.category,
        cycle: bill.cycle,
        amount: bill.amount,
        dueDate: bill.dueDate,
        status: bill.status,
        paymentDate: bill.paymentDate,
        attachment: bill.attachment,
        autoRenew: bill.autoRenew,
        description: bill.description
      }}
      queryKey={['bills']}
      url="/api/bills"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function BillsActions({ bill }: { bill: Bill }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)

  const handleDelete = () => {
    // Aquí iría la lógica de eliminación cuando conectes el backend
    console.log("Eliminar recibo:", bill.id)
    setDeleteOpen(false)
  }

  const handleMarkAsPaid = () => {
    // Aquí iría la lógica para marcar como pagado
    console.log("Marcar como pagado:", bill.id)
    setMarkPaidOpen(false)
  }

  return (
    <Fragment>
      <FormDialogStandalone
        open={editOpen}
        setOpen={setEditOpen}
        title="Modificar recibo"
        description="Cambie los datos del recibo que desee modificar"
        className="sm:max-w-[700px]"
      >
        <UpdateBillForm bill={bill} />
      </FormDialogStandalone>

      <FormDialogStandalone
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Eliminar recibo"
        description="¿Está seguro que desea eliminar este recibo? Esta acción no se puede deshacer."
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

      <FormDialogStandalone
        open={markPaidOpen}
        setOpen={setMarkPaidOpen}
        title="Marcar como pagado"
        description={`¿Confirmar pago de ${bill.provider} por $${bill.amount.toLocaleString('es-ES')}?`}
      >
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setMarkPaidOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleMarkAsPaid} className="bg-green-600 hover:bg-green-700">
            Confirmar Pago
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
          {bill.status === "pendiente" && (
            <DropdownMenuItem onClick={() => setMarkPaidOpen(true)} className="text-green-600">
              <CheckCircle />
              Marcar como pagado
            </DropdownMenuItem>
          )}
          {bill.attachment && (
            <DropdownMenuItem onClick={() => window.open(bill.attachment, '_blank')}>
              <Paperclip />
              Ver comprobante
            </DropdownMenuItem>
          )}
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
