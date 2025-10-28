"use client"

import { Button } from "@/components/ui/button"
import {
  Form as FormUI,
  FormControl,
  FormDescription,
  FormField as FormFieldUI,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useMutateForm } from "@/hooks/use-mutate-form"
import { Control, ControllerFieldState, ControllerRenderProps, DefaultValues, FieldValues, Path, Resolver, UseFormStateReturn } from "react-hook-form"

export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  formDefinition: FormFieldDef<TFieldValues>[]
  defaultValues?: DefaultValues<TFieldValues>
  resolver: Resolver<TFieldValues>
  queryKey: readonly unknown[]
  url: string
  method?: string
  onSuccess: () => void
  submitButtonText: string
  twoColumns?: boolean
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  formDefinition,
  resolver,
  defaultValues,
  queryKey,
  url,
  method = "POST",
  onSuccess,
  submitButtonText,
  twoColumns = false
}: FormProps<TFieldValues>) {
  const { form, isLoading, onSubmit } = useMutateForm<TFieldValues, TFieldValues>({
    queryKey,
    url,
    method,
    onSuccess,
    form: {
      resolver,
      defaultValues,
    }
  })

  return (
    <FormUI {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={twoColumns ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-start" : "grid items-start gap-6"}>
          {
            formDefinition.map((fieldDef, index) => (
              <FormField key={index} control={form.control} field={fieldDef} />
            ))
          }
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>{submitButtonText}</Button>
        </div>
      </form>
    </FormUI>
  )
}

export interface FormFieldDefSelectOption {
  id: string,
  label: string
}

export interface FormFieldDef<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>
  type?: string
  label: string
  description?: string
  placeholder?: string
  variant?: "value" | "select" | "date"
  options?: FormFieldDefSelectOption[]
  custom?: ({ field, fieldState, formState, }: {
      field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn<TFieldValues>;
    }) => React.ReactElement
}

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  field: FormFieldDef<TFieldValues>
}

function FormField<TFieldValues extends FieldValues = FieldValues>(
  { control, field: { name, type, label, description, placeholder, variant, options, custom } }: FormFieldProps<TFieldValues>
) {
  if (custom) {
    return (
      <FormFieldUI
        control={control}
        name={name}
        render={(props) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {custom(props)}
            </FormControl>
            <FormDescription>
              {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  } else if (variant === "select") {
    return (
      <FormFieldUI
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              <SelectContent>
                {options?.map((option) =>
                  <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
            </FormControl>
            <FormDescription>
              {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  } else if (variant === "date") {
    return (
      <FormFieldUI
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <DatePicker value={field.value} setValue={field.onChange} />
            </FormControl>
            <FormDescription>
              {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  } else {
    return (
      <FormFieldUI
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input {...field} type={type} className="w-full"/>
            </FormControl>
            <FormDescription>
              {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }
}