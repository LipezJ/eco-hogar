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
import { DatePicker, DatePickerFullRange } from "@/components/ui/date-picker"
import { useMutateForm } from "@/hooks/use-mutate-form"
import type { Control, ControllerFieldState, ControllerRenderProps, DefaultValues, FieldValues, Path, Resolver, UseFormStateReturn } from "react-hook-form"

export interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  formDefinition: FormFieldDef<TFieldValues>[]
  defaultValues?: DefaultValues<TFieldValues>
  resolver: Resolver<TFieldValues>
  queryKey: readonly unknown[]
  queryKeysToInvalidate?: Array<unknown[]>
  url: string
  method?: string
  onSuccess: () => void
  submitButtonText: string
  twoColumns?: boolean
  onFieldChange?: (name: Path<TFieldValues>, value: unknown) => void
  transformValues?: (values: TFieldValues) => Promise<TFieldValues> | TFieldValues
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  formDefinition,
  resolver,
  defaultValues,
  queryKey,
  queryKeysToInvalidate,
  url,
  method = "POST",
  onSuccess,
  submitButtonText,
  twoColumns = false,
  onFieldChange,
  transformValues
}: FormProps<TFieldValues>) {
  const { form, isLoading, onSubmit } = useMutateForm<TFieldValues, TFieldValues>({
    queryKey,
    queryKeysToInvalidate,
    url,
    method,
    onSuccess,
    form: {
      resolver,
      defaultValues,
    }
  })

  const handleSubmit = async (values: TFieldValues) => {
    const transformed = transformValues ? await transformValues(values) : values
    onSubmit(transformed)
  }

  return (
    <FormUI {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {
          formDefinition
            .filter((fieldDef) => fieldDef.type === "hidden")
            .map((fieldDef) => (
              <FormField
                key={`${String(fieldDef.name)}-hidden`}
                control={form.control}
                field={fieldDef}
                onFieldChange={onFieldChange}
              />
            ))
        }
        <div className={twoColumns ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-start" : "grid items-start gap-6"}>
          {
            formDefinition
              .filter((fieldDef) => fieldDef.type !== "hidden")
              .map((fieldDef) => (
                <FormField key={fieldDef.name} control={form.control} field={fieldDef} onFieldChange={onFieldChange} />
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
  variant?: "value" | "select" | "date" | "full-date"
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
  onFieldChange?: (name: Path<TFieldValues>, value: unknown) => void
}

function FormField<TFieldValues extends FieldValues = FieldValues>(
  { control, field: { name, type, label, description, placeholder, variant, options, custom }, onFieldChange }: FormFieldProps<TFieldValues>
) {
  if (type === "hidden") {
    return (
      <FormFieldUI
        control={control}
        name={name}
        render={({ field }) => (
          <input type="hidden" {...field} />
        )}
      />
    )
  }
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
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  onFieldChange?.(name, value)
                }}
                defaultValue={field.value}
              >
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
  } else if (variant === "full-date") {
    return (
      <FormFieldUI
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <DatePickerFullRange value={field.value} setValue={field.onChange} />
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
        render={({ field }) => {
          // Para inputs numéricos, convertir el valor a número
          const fieldProps = type === "number"
            ? {
                ...field,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value)
                  field.onChange(value)
                }
              }
            : field

          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input {...fieldProps} type={type} className="w-full"/>
              </FormControl>
              <FormDescription>
                {description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    )
  }
}
