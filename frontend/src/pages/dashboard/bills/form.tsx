import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import type { Resolver } from "react-hook-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, CheckCircle } from "lucide-react"
import { Form, type FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { type Bill, CreateBillSchema, UpdateBillSchema, BillCycle, BillCategory, BillStatus } from "@web-project/types/bills"
import { z } from "zod/v4"
import { useDeleteResource } from "@/hooks/use-delete-resource"
import { API_ENDPOINTS } from "@/lib/api-config"
import { AttachmentUploader } from "@/components/attachment-uploader"
import { uploadFile } from "@/lib/upload"
import { useQueryClient } from "@tanstack/react-query"

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

const fileSchema = typeof File === "undefined" ? z.never() : z.instanceof(File)
const attachmentValueSchema = typeof File === "undefined"
  ? z.string()
  : z.union([fileSchema, z.string()])

const billAttachmentSchema = z.preprocess((val) => {
  if (typeof File !== "undefined" && val instanceof File) return val
  if (typeof val === "string" && val.trim().length > 0) return val
  return undefined
}, attachmentValueSchema).optional()

const CreateBillSchemaClient = CreateBillSchema.extend({
  attachment: billAttachmentSchema
})

const UpdateBillSchemaClient = UpdateBillSchema.extend({
  attachment: billAttachmentSchema
})

type CreateBillFormValues = z.input<typeof CreateBillSchemaClient>
type UpdateBillFormValues = z.input<typeof UpdateBillSchemaClient>

/**
 * Genera los campos del formulario de creación de recibo según estado.
 */
function getCreateBillFormDef(status?: string): FormFieldDef<CreateBillFormValues>[] {
  const baseFields: FormFieldDef<CreateBillFormValues>[] = [
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
      variant: "full-date"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado del recibo.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    }
  ]

  // Solo agregar campos de pago cuando el estado sea "pagado"
  if (status === "pagado") {
    baseFields.push(
      {
        name: "paymentDate",
        label: "Fecha de Pago",
        description: "Fecha en que se realizó el pago.",
        variant: "date"
      },
      {
        name: "attachment",
        label: "Comprobante",
        description: "Suba el comprobante o factura.",
        custom: ({ field }) => (
          <AttachmentUploader
            value={field.value as string | File | undefined}
            onChange={(val) => field.onChange(val)}
            placeholder="Formatos admitidos: imágenes o PDF."
          />
        )
      }
    )
  }

  baseFields.push(
    {
      name: "autoRenew",
      label: "Renovación Automática",
      description: "Si se debe generar automáticamente el próximo recibo.",
      custom: ({ field }: { field: { value: unknown; onChange: (value: unknown) => void } }) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRenew"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      )
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas adicionales (opcional).",
      placeholder: "Ej: Incluye internet + cable"
    }
  )

  return baseFields as FormFieldDef<CreateBillFormValues>[]
}

function getUpdateBillFormDef(status?: string): FormFieldDef<UpdateBillFormValues>[] {
  const baseFields: FormFieldDef<UpdateBillFormValues>[] = [
    {
      name: "id",
      label: "ID",
      type: "hidden"
    },
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
      variant: "full-date"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado del recibo.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    }
  ]

  // Solo agregar campos de pago cuando el estado sea "pagado"
  if (status === "pagado") {
    baseFields.push(
      {
        name: "paymentDate",
        label: "Fecha de Pago",
        description: "Fecha en que se realizó el pago.",
        variant: "date"
      },
      {
        name: "attachment",
        label: "Comprobante",
        description: "Suba el comprobante o factura.",
        custom: ({ field }) => (
          <AttachmentUploader
            value={field.value as string | File | undefined}
            onChange={(val) => field.onChange(val)}
            placeholder="Formatos admitidos: imágenes o PDF."
          />
        )
      }
    )
  }

  baseFields.push(
    {
      name: "autoRenew",
      label: "Renovación Automática",
      description: "Si se debe generar automáticamente el próximo recibo.",
      custom: ({ field }: { field: { value: unknown; onChange: (value: unknown) => void } }) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRenew-update"
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        </div>
      )
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas adicionales (opcional).",
      placeholder: "Ej: Incluye internet + cable"
    }
  )

  return baseFields as FormFieldDef<UpdateBillFormValues>[]
}

async function prepareBillPayload<T extends { status?: string; attachment?: unknown; paymentDate?: string | null }>(values: T) {
  const nextValues = { ...values };
  if (nextValues.status !== "pagado") {
    nextValues.attachment = undefined;
    nextValues.paymentDate = undefined;
  } else {
    const attachmentValue = nextValues.attachment;
    if (typeof File !== "undefined" && attachmentValue instanceof File) {
      const { path } = await uploadFile(attachmentValue);
      nextValues.attachment = path as T["attachment"];
    } else if (typeof attachmentValue === 'string' && attachmentValue.trim().length === 0) {
      nextValues.attachment = undefined;
    }
  }
  return nextValues;
}

/** Formulario para crear un recibo, incluye manejo de adjuntos. */
export function CreateBillForm() {
  const { setOpen } = useContext(FormDialogContext)
  const [status, setStatus] = useState<string>("pendiente")

  return (
    <Form<CreateBillFormValues>
      formDefinition={getCreateBillFormDef(status)}
      resolver={zodResolver(CreateBillSchemaClient) as Resolver<CreateBillFormValues>}
      defaultValues={{
        provider: "",
        category: "otros",
        cycle: "mensual",
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: "pendiente",
        autoRenew: true,
        description: "",
        attachment: undefined
      }}
      queryKey={['bills']}
      queryKeysToInvalidate={[['budget']]}
      url="/api/bills"
      method="POST"
      submitButtonText="Crear recibo"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
      onFieldChange={(name, value) => {
        if (name === "status") {
          setStatus(value as string)
        }
      }}
      transformValues={prepareBillPayload}
    />
  )
}

/** Formulario para actualizar un recibo existente. */
export function UpdateBillForm({ bill }: { bill: Bill }) {
  const { setOpen } = useContext(FormDialogContext)
  const [status, setStatus] = useState<string>(bill.status)

  return (
    <Form<UpdateBillFormValues>
      formDefinition={getUpdateBillFormDef(status)}
      resolver={zodResolver(UpdateBillSchemaClient) as Resolver<UpdateBillFormValues>}
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
      queryKeysToInvalidate={[['budget']]}
      url="/api/bills"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
      onFieldChange={(name, value) => {
        if (name === "status") {
          setStatus(value as string)
        }
      }}
      transformValues={prepareBillPayload}
    />
  )
}

export function BillsActions({ bill }: { bill: Bill }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [markPaidAttachment, setMarkPaidAttachment] = useState<string | File | undefined>(undefined)
  const [markPaidLoading, setMarkPaidLoading] = useState(false)
  const [markPaidError, setMarkPaidError] = useState<string | null>(null)
  const { deleteResource, isDeleting, error: deleteError } = useDeleteResource({
    queryKeysToInvalidate: [['bills'], ['budget']]
  })
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      await deleteResource(`${API_ENDPOINTS.bills}/${bill.id}`)
      setDeleteOpen(false)
    } catch (error) {
      console.error('Error deleting bill:', error)
    }
  }

  const handleMarkAsPaid = async () => {
    setMarkPaidError(null)
    setMarkPaidLoading(true)
    try {
      const payload = await prepareBillPayload({
        id: bill.id,
        status: 'pagado',
        paymentDate: new Date().toISOString(),
        attachment: markPaidAttachment ?? undefined
      })

      const response = await fetch(API_ENDPOINTS.bills, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar el recibo')
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bills'] }),
        queryClient.invalidateQueries({ queryKey: ['budget'] })
      ])

      setMarkPaidAttachment(undefined)
      setMarkPaidOpen(false)
    } catch (error) {
      console.error('Error marking bill as paid:', error)
      setMarkPaidError('No se pudo confirmar el pago. Intente nuevamente.')
    } finally {
      setMarkPaidLoading(false)
    }
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
        {deleteError && (
          <p className="mb-3 text-sm text-destructive">{deleteError.message}</p>
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </FormDialogStandalone>

      <FormDialogStandalone
        open={markPaidOpen}
        setOpen={setMarkPaidOpen}
        title="Marcar como pagado"
        description={`¿Confirmar pago de ${bill.provider} por $${bill.amount.toLocaleString('es-ES')}?`}
      >
        <div className="space-y-3">
          <AttachmentUploader
            value={markPaidAttachment}
            onChange={(val) => setMarkPaidAttachment(val as string | File | undefined)}
            placeholder="Adjunte el comprobante de pago"
          />
          {markPaidError && (
            <p className="text-sm text-destructive">{markPaidError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => {
              setMarkPaidOpen(false)
              setMarkPaidAttachment(undefined)
              setMarkPaidError(null)
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              className="bg-green-600 hover:bg-green-700"
              disabled={markPaidLoading}
            >
              {markPaidLoading ? "Guardando..." : "Confirmar pago"}
            </Button>
          </div>
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

