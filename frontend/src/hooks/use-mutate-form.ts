import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { useTopLoader } from "nextjs-toploader"
import { useState } from "react"
import { type FieldValues, useForm, type UseFormProps } from "react-hook-form"
import { API_BASE_URL } from "@/lib/api-config"

/**
 * Configuración para `useMutateForm`.
 * queryKey principal y opcionales a invalidar, endpoint y callbacks.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface UseMutateFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> {
  queryKey: readonly unknown[]
  queryKeysToInvalidate?: Array<unknown[]>
  url: string
  method: string
  onSuccess?: () => void
  onError?: (error: Error) => void,
  form?: UseFormProps<TFieldValues, TContext, TTransformedValues>
}

/**
 * Hook auxiliar para mutaciones con formularios (react-hook-form + react-query).
 * - Maneja estado de `isLoading`.
 * - Invalida queryKey principal y adicionales.
 * - Envía JSON al endpoint con credenciales.
 * @param queryKey clave principal para invalidar tras mutar.
 * @param queryKeysToInvalidate otras claves a invalidar.
 * @param url endpoint relativo (se antepone API_BASE_URL).
 * @param method verbo HTTP (POST/PUT/DELETE...).
 * @param onSuccess callback opcional al completar.
 * @param onError callback opcional en error.
 * @param form props opcionales de react-hook-form.
 * @returns form methods, onSubmit handler y bandera isLoading.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutateForm<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues>(
  { queryKey, queryKeysToInvalidate, url, method, onSuccess, onError, form: formProps }: UseMutateFormProps<TFieldValues, TContext, TTransformedValues>
) {
  const queryClient = useQueryClient()
  // const loader = useTopLoader()
  const [ isLoading, setIsLoading ] = useState(false)
  
  const mutation = useMutation<Response, Error, unknown>({
    mutationFn: (data) => {
      // loader.start()
      setIsLoading(true)
      return fetch(
        `${API_BASE_URL}${url}`,
        { 
          method, 
          body: JSON.stringify(data),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
         }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })

      queryKeysToInvalidate?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      // loader.done()
      setIsLoading(false)
      if (onSuccess) onSuccess()
    },
    onError: (err) => {
      // loader.done()
      setIsLoading(false)
      if (onError) onError(err)
    }
  })

  // Form con shouldUnregister para evitar residuos al desmontar campos dinámicos
  const form = useForm({
    ...formProps,
    shouldUnregister: true
  })

  const onSubmit = (data: TFieldValues) => {
    mutation.mutate(data)
  }

  return { form, onSubmit, isLoading }
}
