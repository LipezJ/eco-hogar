import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import type { Resolver } from "react-hook-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2 } from "lucide-react"
import { Form, type FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { type Movement, CreateMovementFormSchema, UpdateMovementFormSchema, MovementCategory, MovementType } from "@web-project/types/movements"
import { z } from "zod/v4"
import { AttachmentUploader } from "@/components/attachment-uploader"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useDeleteResource } from "@/hooks/use-delete-resource"
import { uploadFile } from "@/lib/upload"

const movementCategoryLabels: Record<string, string> = {
  educacion: "Educación"
}

const formatCategoryLabel = (value: string) => movementCategoryLabels[value] ?? (value.charAt(0).toUpperCase() + value.slice(1))

const categoryOptions = MovementCategory.options.map(cat => ({
  id: cat,
  label: formatCategoryLabel(cat)
}))

const typeOptions = MovementType.options.map(type => ({
  id: type,
  label: type.charAt(0).toUpperCase() + type.slice(1)
}))

const fileSchema = typeof File === "undefined" ? z.never() : z.instanceof(File)
const attachmentValueSchema = typeof File === "undefined"
  ? z.string()
  : z.union([fileSchema, z.string()])

const attachmentFieldSchema = z.preprocess((val) => {
  if (typeof File !== "undefined" && val instanceof File) return val
  if (typeof val === "string" && val.trim().length > 0) return val
  return undefined
}, attachmentValueSchema).optional()

const CreateMovementFormSchemaClient = CreateMovementFormSchema.extend({
  attachment: attachmentFieldSchema
})

const UpdateMovementFormSchemaClient = UpdateMovementFormSchema.extend({
  attachment: attachmentFieldSchema
})

type CreateMovementFormValues = z.input<typeof CreateMovementFormSchemaClient>
type UpdateMovementFormValues = z.input<typeof UpdateMovementFormSchemaClient>

function getCreateMovementFormDef(): FormFieldDef<CreateMovementFormValues>[] {
  return ([
    {
      name: "type",
      label: "Tipo",
      description: "Seleccione si es un ingreso o egreso.",
      variant: "select",
      placeholder: "Tipo de movimiento",
      options: typeOptions
    },
    {
      name: "category",
      label: "Categoría",
      description: "Seleccione la categoría del movimiento.",
      variant: "select",
      placeholder: "Categoría",
      options: categoryOptions
    },
    {
      name: "amount",
      label: "Monto",
      description: "Ingrese el monto del movimiento.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "description",
      label: "Descripción",
      description: "Describa el motivo del movimiento.",
      placeholder: "Ej: Compra de alimentos"
    },
    {
      name: "date",
      label: "Fecha",
      description: "Fecha del movimiento.",
      variant: "full-date"
    },
    {
      name: "tags",
      label: "Etiquetas",
      description: "Etiquetas separadas por comas (opcional).",
      placeholder: "Ej: supermercado, mensual",
      custom: ({ field }) => (
        <input
          type="text"
          value={Array.isArray(field.value) ? field.value.join(', ') : String(field.value || '')}
          onChange={(e) => {
            // Mantener el valor como string mientras se escribe
            // El preprocesador de Zod lo convertirá a array al validar
            field.onChange(e.target.value)
          }}
          placeholder="Ej: supermercado, mensual"
          className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      )
    },
    {
      name: "attachment",
      label: "Adjunto",
      description: "Suba un comprobante o documento (opcional).",
      custom: ({ field }) => (
        <AttachmentUploader
          value={field.value as string | File | undefined}
          onChange={(val) => field.onChange(val)}
          placeholder="Formatos admitidos: imágenes o PDF."
        />
      )
    }
  ] as FormFieldDef<any>[]) as FormFieldDef<CreateMovementFormValues>[]
}

function getUpdateMovementFormDef(): FormFieldDef<UpdateMovementFormValues>[] {
  const createFields = getCreateMovementFormDef() as unknown as FormFieldDef<UpdateMovementFormValues>[];
  return ([
    {
      name: "id",
      label: "ID",
      type: "hidden"
    },
    ...createFields
  ]) as FormFieldDef<UpdateMovementFormValues>[];
}

async function prepareMovementPayload<T extends { attachment?: unknown }>(values: T) {
  if (typeof File !== "undefined" && values.attachment instanceof File) {
    const { path } = await uploadFile(values.attachment)
    return { ...values, attachment: path as T["attachment"] }
  }
  if (typeof values.attachment === 'string' && values.attachment.trim().length === 0) {
    return { ...values, attachment: undefined }
  }
  return values
}


export function CreateMovementForm() {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form<CreateMovementFormValues>
      formDefinition={getCreateMovementFormDef()}
      resolver={zodResolver(CreateMovementFormSchemaClient) as Resolver<CreateMovementFormValues>}
      defaultValues={{
        type: "egreso",
        category: "otros",
        amount: 0,
        description: "",
        date: new Date().toISOString().split('T')[0],
        tags: undefined,
        attachment: undefined
      }}
      queryKey={['movements']}
      queryKeysToInvalidate={[['budget']]}
      url="/api/movements"
      method="POST"
      submitButtonText="Crear movimiento"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
      transformValues={prepareMovementPayload}
    />
  )
}

export function UpdateMovementForm({ movement }: { movement: Movement }) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form<UpdateMovementFormValues>
      formDefinition={getUpdateMovementFormDef()}
      resolver={zodResolver(UpdateMovementFormSchemaClient) as Resolver<UpdateMovementFormValues>}
      defaultValues={{
        id: movement.id,
        type: movement.type,
        category: movement.category,
        amount: movement.amount,
        description: movement.description,
        date: movement.date,
        tags: movement.tags,
        attachment: movement.attachment ?? undefined
      }}
      queryKey={['movements']}
      queryKeysToInvalidate={[['budget']]}
      url="/api/movements"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
      transformValues={prepareMovementPayload}
    />
  )
}

export function MovementsActions({ movement }: { movement: Movement }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { deleteResource, isDeleting, error: deleteError } = useDeleteResource({
    queryKeysToInvalidate: [['movements'], ['budget']]
  })

  const handleDelete = async () => {
    try {
      await deleteResource(`${API_ENDPOINTS.movements}/${movement.id}`)
      setDeleteOpen(false)
    } catch (error) {
      console.error('Error deleting movement:', error)
    }
  }

  return (
    <Fragment>
      <FormDialogStandalone
        open={editOpen}
        setOpen={setEditOpen}
        title="Modificar movimiento"
        description="Cambie los datos del movimiento que desee modificar"
        className="sm:max-w-[700px]"
      >
        <UpdateMovementForm movement={movement} />
      </FormDialogStandalone>

      <FormDialogStandalone
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Eliminar movimiento"
        description="¿Está seguro que desea eliminar este movimiento? Esta acción no se puede deshacer."
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

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
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
