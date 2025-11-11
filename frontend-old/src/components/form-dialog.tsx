"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface FormDialogProps {
  title: string
  description: string
  form: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const FormDialogContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => {}
});

export function FormDialog({ title, form, description, children, className }: FormDialogProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <FormDialogContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className={cn(["sm:max-w-[425px]", className])}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    </FormDialogContext.Provider>
  )
}

interface FormDialogStandaloneProps {
  title: string
  description: string
  children: React.ReactNode,
  className?: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function FormDialogStandalone({ title, description, children, open, setOpen, className }: FormDialogStandaloneProps) {
  return (
    <FormDialogContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn(["sm:max-w-[425px]", className])}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </FormDialogContext.Provider>
  )
}