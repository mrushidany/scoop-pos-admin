import { UseMutationOptions, UseMutationResult, useMutation as useReactMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import axiosInstance from '@/lib/client'
import { ApiOptions } from '@/lib/types'

interface UseCustomMutationOptions<TData, TVariables, TError, TContext> 
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  invalidateQueries?: QueryKey[]
  mutationFn?: (variables: TVariables) => Promise<TData>
  apiOptions?: Omit<ApiOptions, 'method' | 'data'>
}

export function useMutation<TData, TVariables = unknown, TError = Error, TContext = unknown>(
  endpoint: string,
  options: UseCustomMutationOptions<TData, TVariables, TError, TContext> = {}
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { 
    method = 'POST',
    invalidateQueries = [],
    onSuccess,
    mutationFn,
    apiOptions = {},
    ...mutationOptions 
  } = options
  
  const queryClient = useQueryClient()
  
  return useReactMutation<TData, TError, TVariables, TContext>({
    mutationFn: mutationFn || (async (variables: TVariables) => {
       const response = await axiosInstance<TData>(endpoint, {
        method,
        data: variables,
        ...apiOptions,
      })
      return response.data
    }),
    onSuccess: async (data, variables, context) => {
      // Invalidate relevant queries after mutation succeeds
      if (invalidateQueries.length > 0) {
        await Promise.all(
          invalidateQueries.map(queryKey => queryClient.invalidateQueries({ queryKey }))
        )
      }
      
      // Call the original onSuccess if provided
      if (onSuccess) {
        onSuccess(data, variables, context)
      }
    },
    ...mutationOptions,
  })
}

