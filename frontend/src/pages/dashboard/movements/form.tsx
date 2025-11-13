import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Paperclip } from "lucide-react"
import { Form, type FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { type Movement, CreateMovementFormSchema, UpdateMovementFormSchema, MovementCategory, MovementType } from "@web-project/types/movements"
import { z } from "zod/v4"

const categoryOptions = MovementCategory.options.map(cat => ({
  id: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1)
}))

const typeOptions = MovementType.options.map(type => ({
  id: type,
  label: type.charAt(0).toUpperCase() + type.slice(1)
}))

function getCreateMovementFormDef(): FormFieldDef<z.infer<typeof CreateMovementFormSchema>>[] {
  return [
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
      description: "URL del adjunto (opcional).",
      placeholder: "https://..."
    }
  ]
}

function getUpdateMovementFormDef(): FormFieldDef<z.infer<typeof UpdateMovementFormSchema>>[] {
  return [
    {
      name: "id",
      label: "ID",
      type: "hidden"
    },
    ...getCreateMovementFormDef()
  ] as unknown as FormFieldDef<z.infer<typeof UpdateMovementFormSchema>>[]
}


export function CreateMovementForm() {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getCreateMovementFormDef()}
      resolver={zodResolver(CreateMovementFormSchema)}
      defaultValues={{
        type: "egreso",
        category: "otros",
        amount: 0,
        description: "",
        date: new Date().toISOString().split('T')[0],
        tags: undefined,
        attachment: ""
      }}
      queryKey={['movements']}
      url="/api/movements"
      method="POST"
      submitButtonText="Crear movimiento"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function UpdateMovementForm({ movement }: { movement: Movement }) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getUpdateMovementFormDef()}
      resolver={zodResolver(UpdateMovementFormSchema)}
      defaultValues={{
        id: movement.id,
        type: movement.type,
        category: movement.category,
        amount: movement.amount,
        description: movement.description,
        date: movement.date,
        tags: movement.tags,
        attachment: movement.attachment || ""
      }}
      queryKey={['movements']}
      url="/api/movements"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function MovementsActions({ movement }: { movement: Movement }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = () => {
    // Aquí iría la lógica de eliminación cuando conectes el backend
    console.log("Eliminar movimiento:", movement.id)
    setDeleteOpen(false)
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
          {movement.attachment && (
            <DropdownMenuItem onClick={() => window.open(movement.attachment || "", '_blank')}>
              <Paperclip />
              Ver adjunto
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
