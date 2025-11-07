import { useAuthStore } from '@/store/auth'

export function useApiHooks() {
    const { isAuthenticated, user } = useAuthStore()

    return {
        isAuthenticated,
        user
    }
}

export const createApiOptions = (
  token: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) => ({
  method,
  apiOptions: {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
})