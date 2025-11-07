import { useMutation } from '@/hooks/useMutations'
import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { createApiOptions } from '@/hooks/useApiHooks'

interface ListOfUsersResponse {
    data: [
        {
            id: number,
            name: string,
            email: string,
            phone: string
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
