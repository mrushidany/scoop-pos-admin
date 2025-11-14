import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'
import axiosInstance from '@/lib/client'
import type { TelecomOperator, TelecomOperatorDetails } from '@/app/(protected-pages)/dashboard/telecom-operators/types'

interface ListOfOperatorsResponse {
    operators: {
        data: TelecomOperator[]
        current_page: number
        first_page_url: string
        from: number
        last_page_url: string | null
        next_page_url: string | null
        path: string
        per_page: number
        prev_page_url: string | null
        to: number
        total: number
        links: [
            {
                url: string | null 
                label: string | null
                page: number | null
                active: boolean
            }
        ]
    }
    
}

interface TelecomOperatorCreateVariables {
    name: string
    is_active: boolean
    number_series: string[]
}

interface TelecomOperatorCreateResponse {
    success?: boolean
    message?: string
    operator?: {
        id: number,
        name: string,
        is_active: boolean,
        number_series: string[],
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
    }
}

interface DeleteTelecomOperatorResponse {
    success: boolean
    message: string
}

// Data Fetching

export function useRetrieveListOfTelecomOperators() {
    const { access_token } = useAuthStore()
    return useQuery<ListOfOperatorsResponse>(
        ['retrieve-list-of-telecom-operators'],
        API_ENDPOINTS.ADMIN_TELECOM_OPERATORS,
        {
            enabled: !!access_token,
        }
    )
}

export function useRetrieveTelecomOperatorDetails(operatorId: number) {
    const { access_token } = useAuthStore()
    return useQuery<TelecomOperatorDetails>(
        ['retrieve-telecom-operator-details', operatorId],
        `${API_ENDPOINTS.ADMIN_TELECOM_OPERATORS}/${operatorId}`,
        {
            enabled: !!access_token,
        }
    )

}

// Data Mutation

export function useCreateTelecomOperator() {
    const { access_token } = useAuthStore()
    return useMutation<TelecomOperatorCreateResponse, TelecomOperatorCreateVariables>(
        API_ENDPOINTS.ADMIN_TELECOM_OPERATORS,
        createApiOptions(access_token ?? '', 'POST')
    )
}

export function useUpdateTelecomOperatorDetails(operatorId: number) {
    const { access_token } = useAuthStore()
    return useMutation<TelecomOperatorCreateResponse, TelecomOperatorCreateVariables>(
        `${API_ENDPOINTS.ADMIN_TELECOM_OPERATORS}/${operatorId}`,
        createApiOptions(access_token ?? '', 'PUT')
    )
}

export function useDeleteOperator() {
    const { access_token } = useAuthStore()
    return useMutation<DeleteTelecomOperatorResponse, number>(
        API_ENDPOINTS.ADMIN_TELECOM_OPERATORS,
            {
                method: 'DELETE',
                apiOptions: {
                    headers: {
                        Authorization: `Bearer ${access_token ?? ''}`,
                    },
                },
                mutationFn: async (operatorId: number) => {
                    const response = await axiosInstance<DeleteTelecomOperatorResponse>(
                        `${API_ENDPOINTS.ADMIN_TELECOM_OPERATORS}/${operatorId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${access_token ?? ''}`,
                            },
                        }
                    )
                    return response.data
                },
            }
    )
}

