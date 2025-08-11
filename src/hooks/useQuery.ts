import { QueryKey, UseQueryOptions, UseQueryResult, useQuery as useReactQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/client'

export function useQuery<TData = unknown, TError = unknown>(
    key: QueryKey,
    url: string,
    options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
    return useReactQuery<TData, TError>({
        queryKey: key,
        queryFn: async () => {
            const response = await axiosInstance.get<TData>(url)
            return response.data
        },
        ...options
    })
}