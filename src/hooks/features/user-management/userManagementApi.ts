import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'

interface ListOfUsersResponse {
    data: [
        {
            id: number
            name: string
            email: string
            phone: string
            created_at: string
            updated_at: string
            is_admin: boolean
            is_active: boolean
        }
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

// Data Fetching

export function useRetrieveListOfUsers() {
    const { access_token } = useAuthStore()
    return useQuery<ListOfUsersResponse>(
        ['retrieve-list-of-users'],
        API_ENDPOINTS.RETRIEVE_LIST_OF_USERS,
        {
            enabled: !!access_token,
        }
    )
}
