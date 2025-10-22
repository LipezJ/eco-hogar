import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTopLoader } from "nextjs-toploader"
import { useState } from "react"
import { FieldValues, useForm, UseFormProps } from "react-hook-form"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutateForm<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues>(
  { queryKey, queryKeysToInvalidate, url, method, onSuccess, onError, form: formProps }: UseMutateFormProps<TFieldValues, TContext, TTransformedValues>
) {
  const queryClient = useQueryClient()
  const loader = useTopLoader()
  const [ isLoading, setIsLoading ] = useState(false)
  
  const mutation = useMutation<Response, Error, unknown>({
    mutationFn: (data) => {
      loader.start()
      setIsLoading(true)
      return fetch(url, { method, body: JSON.stringify(data) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })

      queryKeysToInvalidate?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      loader.done()
      setIsLoading(false)
      if (onSuccess) onSuccess()
    },
    onError: (err) => {
      loader.done()
      setIsLoading(false)
      if (onError) onError(err)
    }
  })

  const form = useForm(formProps)

  const onSubmit = (data: TFieldValues) => {
    mutation.mutate(data)
  }

  return { form, onSubmit, isLoading }
}