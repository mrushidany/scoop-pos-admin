import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'
import axiosInstance from '@/lib/client'
import type { Users, Devices } from '@/app/(protected-pages)/dashboard/stores/types'

interface Response {
    data: {
        id?: number
        name?: string
        email?: string
        phone?: string
        created_at?: string
        updated_at?: string
        is_admin?: boolean
        is_active?: boolean
    }
}

interface ListOfStoresResponse {
    data: [
        id: string,
        name: string,
        slug: string,
        store_type_string: string,
        license_type: string,
        created_by: number,
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
        users: Users[],
        devices: Devices[]
    ]
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

interface UserCreateVariables {
    name: string
    email: string
    password?: string
    phone?: string
    is_admin?: boolean
    is_active?: boolean
}

interface UserCreateResponse {
    success: boolean
    message: string
    data: UserResponse
}

interface DeleteUserResponse {
    success: boolean
    message: string
}

// Data Fetching

export function useRetrieveListOfStores() {
    const { access_token } = useAuthStore()
    return useQuery<ListOfStoresResponse>(
        ['retrieve-list-of-stores'],
        API_ENDPOINTS.ADMIN_STORES,
        {
            enabled: !!access_token,
        }
    )
}

export function useRetrieveUserDetails(userId: number) {
    const { access_token } = useAuthStore()
    return useQuery<UserResponse>(
        ['retrieve-user-details', userId],
        `${API_ENDPOINTS.ADMIN_USERS}/${userId}`,
        {
            enabled: !!access_token,
        }
    )

}

// Data Mutation

export function useCreateUser() {
    const { access_token } = useAuthStore()
    return useMutation<UserCreateResponse, UserCreateVariables>(
        API_ENDPOINTS.ADMIN_USERS,
        createApiOptions(access_token ?? '', 'POST')
    )
}

export function useUpdateUserDetails(userId: number) {
    const { access_token } = useAuthStore()
    return useMutation<UserCreateResponse, UserCreateVariables>(
        `${API_ENDPOINTS.ADMIN_USERS}/${userId}`,
        createApiOptions(access_token ?? '', 'PUT')
    )
}

export function useDeleteStore() {
    const { access_token } = useAuthStore()
    return useMutation<DeleteUserResponse, number>(
        API_ENDPOINTS.ADMIN_USERS,
            {
                method: 'DELETE',
                apiOptions: {
                    headers: {
                        Authorization: `Bearer ${access_token ?? ''}`,
                    },
                },
                mutationFn: async (userId: number) => {
                    const response = await axiosInstance<DeleteUserResponse>(
                        `${API_ENDPOINTS.ADMIN_USERS}/${userId}`,
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

