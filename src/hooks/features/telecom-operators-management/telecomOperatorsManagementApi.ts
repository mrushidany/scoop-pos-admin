import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'
import axiosInstance from '@/lib/client'
import type { TelecomOperator } from '@/app/(protected-pages)/dashboard/telecom-operators/types'

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

interface StoreCreateVariables {
    name: string
    store_type_string: string
    owner_id: number
}

interface StoreResponse {
    success?: boolean
    message?: string
    data?: {
        id: string,
        name: string,
        slug: string,
        store_type_string: string,
        license_type: string,
        created_by: number,
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
    }
}

interface DeleteStoreResponse {
    success: boolean
    message: string
}

interface AssignUserToStoreVariables {
    role?: string
    user_id: number
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

export function useRetrieveStoreDetails(storeId: string) {
    const { access_token } = useAuthStore()
    return useQuery<StoreResponse>(
        ['retrieve-store-details', storeId],
        `${API_ENDPOINTS.ADMIN_STORES}/${storeId}`,
        {
            enabled: !!access_token,
        }
    )

}

// Data Mutation

export function useCreateStore() {
    const { access_token } = useAuthStore()
    return useMutation<StoreResponse, StoreCreateVariables>(
        API_ENDPOINTS.ADMIN_STORES,
        createApiOptions(access_token ?? '', 'POST')
    )
}

export function useUpdateStoreDetails(storeId: string) {
    const { access_token } = useAuthStore()
    return useMutation<StoreResponse, StoreCreateVariables>(
        `${API_ENDPOINTS.ADMIN_STORES}/${storeId}`,
        createApiOptions(access_token ?? '', 'PUT')
    )
}

export function useAssignUserToStore(storeId: string) {
    const { access_token } = useAuthStore()
    return useMutation<StoreResponse, AssignUserToStoreVariables>(
        API_ENDPOINTS.ASSIGN_USER_TO_STORE(storeId),
        createApiOptions(access_token ?? '', 'POST')
    )
}

export function useDeleteOperator() {
    const { access_token } = useAuthStore()
    return useMutation<DeleteStoreResponse, number>(
        API_ENDPOINTS.ADMIN_TELECOM_OPERATORS,
            {
                method: 'DELETE',
                apiOptions: {
                    headers: {
                        Authorization: `Bearer ${access_token ?? ''}`,
                    },
                },
                mutationFn: async (operatorId: number) => {
                    const response = await axiosInstance<DeleteStoreResponse>(
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

