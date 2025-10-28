"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Fragment, useContext, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, Eye, EyeOff } from "lucide-react"
import { Form, FormFieldDef } from "@/components/dashboard/form"
import { FormDialogContext, FormDialogStandalone } from "@/components/form-dialog"
import { Account, CreateAccountSchema, UpdateAccountSchema, AccountType, Currency, AccountStatus } from "@/types/accounts"
import { z } from "zod/v4"

const accountTypeOptions = AccountType.options.map(type => ({
  id: type,
  label: type.charAt(0).toUpperCase() + type.slice(1)
}))

const currencyOptions = Currency.options.map(currency => ({
  id: currency,
  label: currency
}))

const statusOptions = AccountStatus.options.map(status => ({
  id: status,
  label: status.charAt(0).toUpperCase() + status.slice(1)
}))

function getCreateAccountFormDef(): FormFieldDef<z.infer<typeof CreateAccountSchema>>[] {
  return [
    {
      name: "name",
      label: "Nombre de la Cuenta",
      description: "Nombre descriptivo para identificar la cuenta.",
      placeholder: "Ej: Cuenta Principal, Caja de Ahorro Dólares"
    },
    {
      name: "institution",
      label: "Institución/Banco",
      description: "Nombre del banco o institución financiera.",
      placeholder: "Ej: Banco Nación, BBVA, PayPal"
    },
    {
      name: "accountType",
      label: "Tipo de Cuenta",
      description: "Tipo de cuenta bancaria.",
      variant: "select",
      placeholder: "Seleccione tipo",
      options: accountTypeOptions
    },
    {
      name: "accountNumber",
      label: "Número de Cuenta",
      description: "Número de cuenta (opcional, últimos 4 dígitos por seguridad).",
      placeholder: "Ej: ****1234"
    },
    {
      name: "currency",
      label: "Moneda",
      description: "Moneda en que está la cuenta.",
      variant: "select",
      placeholder: "Seleccione moneda",
      options: currencyOptions
    },
    {
      name: "balance",
      label: "Saldo Actual",
      description: "Saldo disponible en la cuenta.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "owner",
      label: "Titular",
      description: "Nombre del titular de la cuenta.",
      placeholder: "Ej: Juan Pérez, María García"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado de la cuenta.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas o descripción adicional (opcional).",
      placeholder: "Ej: Cuenta para gastos del hogar"
    }
  ]
}

function getUpdateAccountFormDef(): FormFieldDef<z.infer<typeof UpdateAccountSchema>>[] {
  return [
    {
      name: "id",
      label: "ID",
      type: "hidden"
    },
    {
      name: "name",
      label: "Nombre de la Cuenta",
      description: "Nombre descriptivo para identificar la cuenta.",
      placeholder: "Ej: Cuenta Principal, Caja de Ahorro Dólares"
    },
    {
      name: "institution",
      label: "Institución/Banco",
      description: "Nombre del banco o institución financiera.",
      placeholder: "Ej: Banco Nación, BBVA, PayPal"
    },
    {
      name: "accountType",
      label: "Tipo de Cuenta",
      description: "Tipo de cuenta bancaria.",
      variant: "select",
      placeholder: "Seleccione tipo",
      options: accountTypeOptions
    },
    {
      name: "accountNumber",
      label: "Número de Cuenta",
      description: "Número de cuenta (opcional, últimos 4 dígitos por seguridad).",
      placeholder: "Ej: ****1234"
    },
    {
      name: "currency",
      label: "Moneda",
      description: "Moneda en que está la cuenta.",
      variant: "select",
      placeholder: "Seleccione moneda",
      options: currencyOptions
    },
    {
      name: "balance",
      label: "Saldo Actual",
      description: "Saldo disponible en la cuenta.",
      placeholder: "0.00",
      type: "number"
    },
    {
      name: "owner",
      label: "Titular",
      description: "Nombre del titular de la cuenta.",
      placeholder: "Ej: Juan Pérez, María García"
    },
    {
      name: "status",
      label: "Estado",
      description: "Estado de la cuenta.",
      variant: "select",
      placeholder: "Seleccione estado",
      options: statusOptions
    },
    {
      name: "description",
      label: "Descripción",
      description: "Notas o descripción adicional (opcional).",
      placeholder: "Ej: Cuenta para gastos del hogar"
    }
  ]
}

export function CreateAccountForm() {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getCreateAccountFormDef()}
      resolver={zodResolver(CreateAccountSchema)}
      defaultValues={{
        name: "",
        institution: "",
        accountType: "ahorro",
        accountNumber: "",
        currency: "ARS",
        balance: 0,
        isNational: true,
        owner: "",
        status: "activa",
        description: ""
      }}
      queryKey={['accounts']}
      url="/api/accounts"
      method="POST"
      submitButtonText="Crear cuenta"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function UpdateAccountForm({ account }: { account: Account }) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <Form
      formDefinition={getUpdateAccountFormDef()}
      resolver={zodResolver(UpdateAccountSchema)}
      defaultValues={{
        id: account.id,
        name: account.name,
        institution: account.institution,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        currency: account.currency,
        balance: account.balance,
        isNational: account.isNational,
        owner: account.owner,
        status: account.status,
        description: account.description
      }}
      queryKey={['accounts']}
      url="/api/accounts"
      method="PUT"
      submitButtonText="Guardar cambios"
      onSuccess={() => setOpen(false)}
      twoColumns={true}
    />
  )
}

export function AccountsActions({ account }: { account: Account }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  const handleDelete = () => {
    // Aquí iría la lógica de eliminación cuando conectes el backend
    console.log("Eliminar cuenta:", account.id)
    setDeleteOpen(false)
  }

  return (
    <Fragment>
      <FormDialogStandalone
        open={editOpen}
        setOpen={setEditOpen}
        title="Modificar cuenta"
        description="Cambie los datos de la cuenta que desee modificar"
        className="sm:max-w-[700px]"
      >
        <UpdateAccountForm account={account} />
      </FormDialogStandalone>

      <FormDialogStandalone
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Eliminar cuenta"
        description="¿Está seguro que desea eliminar esta cuenta? Esta acción no se puede deshacer."
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
          <DropdownMenuItem onClick={() => setShowBalance(!showBalance)}>
            {showBalance ? <EyeOff /> : <Eye />}
            {showBalance ? "Ocultar" : "Mostrar"} saldo
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
