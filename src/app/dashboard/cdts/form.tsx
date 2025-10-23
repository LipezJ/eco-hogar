"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Calculator } from "lucide-react"
import { Form, FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { Cdt, CreateCdtSchema, UpdateCdtSchema, CdtStatus, calculateFinalAmount, calculateDueDate } from "@/types/cdts"
import { z } from "zod/v4"

const statusOptions = CdtStatus.options.map(status => ({
  id: status,
  label: status.charAt(0).toUpperCase() + status.slice(1)
}))

function getCreateCdtFormDef(): FormFieldDef<z.infer<typeof CreateCdtSchema>>[] {
  return [
    {
      name: "institution",
      label: "Institución Financiera",
      description: "Nombre del banco o entidad.",
      placeholder: "Ej: Banco Nación, Banco Galicia"
    },
    {
      name: "openingDate",
      label: "Fecha de Apertura",
      description: "Fecha en que se abrió el CDT.",
      variant: "date"
    },
    {
      name: "initialAmount",
      label: "Monto Inicial",
      description: "Capital invertido inicialmente.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "interestRate",
      label: "Tasa de Interés Anual (%)",
      description: "Tasa de interés anual efectiva.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "term",
      label: "Plazo (días)",
      description: "Duración del CDT en días.",
      placeholder: "365",
      type: "number"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado actual del CDT.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas adicionales (opcional).",
      placeholder: "Ej: Inversión a largo plazo"
    }
  ]
}

function getUpdateCdtFormDef(): FormFieldDef<z.infer<typeof UpdateCdtSchema>>[] {
  return [
    {
      name: "institution",
      label: "Institución Financiera",
      description: "Nombre del banco o entidad.",
      placeholder: "Ej: Banco Nación, Banco Galicia"
    },
    {
      name: "openingDate",
      label: "Fecha de Apertura",
      description: "Fecha en que se abrió el CDT.",
      variant: "date"
    },
    {
      name: "initialAmount",
      label: "Monto Inicial",
      description: "Capital invertido inicialmente.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "interestRate",
      label: "Tasa de Interés Anual (%)",
      description: "Tasa de interés anual efectiva.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "term",
      label: "Plazo (días)",
      description: "Duración del CDT en días.",
      placeholder: "365",
      type: "number"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado actual del CDT.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas adicionales (opcional).",
      placeholder: "Ej: Inversión a largo plazo"
    }
  ]
}

export function CreateCdtForm() {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getCreateCdtFormDef()}
      resolver={zodResolver(CreateCdtSchema)}
      defaultValues={{
        institution: "",
        openingDate: new Date().toISOString().split('T')[0],
        initialAmount: 0,
        interestRate: 0,
        term: 365,
        status: "activo",
        autoRenew: false,
        description: ""
      }}
      queryKey={['cdts']}
      url="/api/cdts"
      method="POST"
      submitButtonText="Crear CDT"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function UpdateCdtForm({ cdt }: { cdt: Cdt }) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getUpdateCdtFormDef()}
      resolver={zodResolver(UpdateCdtSchema)}
      defaultValues={{
        id: cdt.id,
        institution: cdt.institution,
        openingDate: cdt.openingDate,
        initialAmount: cdt.initialAmount,
        interestRate: cdt.interestRate,
        term: cdt.term,
        status: cdt.status,
        autoRenew: cdt.autoRenew,
        description: cdt.description
      }}
      queryKey={['cdts']}
      url="/api/cdts"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function CdtsActions({ cdt }: { cdt: Cdt }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)

  const handleDelete = () => {
    // Aquí iría la lógica de eliminación cuando conectes el backend
    console.log("Eliminar CDT:", cdt.id)
    setDeleteOpen(false)
  }

  const interestEarned = cdt.finalAmount - cdt.initialAmount
  const effectiveRate = ((cdt.finalAmount / cdt.initialAmount - 1) * 100).toFixed(2)

  return (
    <Fragment>
      <FormDialogStandalone
        open={editOpen}
        setOpen={setEditOpen}
        title="Modificar CDT"
        description="Cambie los datos del CDT que desee modificar"
        className="sm:max-w-[700px]"
      >
        <UpdateCdtForm cdt={cdt} />
      </FormDialogStandalone>

      <FormDialogStandalone
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Eliminar CDT"
        description="¿Está seguro que desea eliminar este CDT? Esta acción no se puede deshacer."
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
        open={calculatorOpen}
        setOpen={setCalculatorOpen}
        title="Detalles del CDT"
        description={`${cdt.institution} - ${cdt.term} días`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monto Inicial</p>
              <p className="text-2xl font-bold">${cdt.initialAmount.toLocaleString('es-ES')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monto Final</p>
              <p className="text-2xl font-bold text-green-600">${cdt.finalAmount.toLocaleString('es-ES')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Interés Ganado</p>
              <p className="text-xl font-semibold text-green-600">+${interestEarned.toLocaleString('es-ES')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rentabilidad</p>
              <p className="text-xl font-semibold">{effectiveRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tasa Anual</p>
              <p className="text-lg">{cdt.interestRate}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Plazo</p>
              <p className="text-lg">{cdt.term} días</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha Apertura</p>
              <p className="text-sm">{new Date(cdt.openingDate).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha Vencimiento</p>
              <p className="text-sm">{new Date(cdt.dueDate).toLocaleDateString('es-ES')}</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setCalculatorOpen(false)}>Cerrar</Button>
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
          <DropdownMenuItem onClick={() => setCalculatorOpen(true)}>
            <Calculator />
            Ver detalles
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
