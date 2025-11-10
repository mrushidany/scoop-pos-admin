import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'
import type { User } from '@/app/(protected-pages)/dashboard/administration/user-management/types'

interface UserResponse {
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

interface ListOfUsersResponse {
    data: User[]   
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

// Data Fetching

export function useRetrieveListOfUsers() {
    const { access_token } = useAuthStore()
    return useQuery<ListOfUsersResponse>(
        ['retrieve-list-of-users'],
        API_ENDPOINTS.ADMIN_USERS,
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
