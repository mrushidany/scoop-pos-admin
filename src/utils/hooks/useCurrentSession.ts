import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

const useCurrentSession = () => {
    const { user, access_token, refresh_token, isAuthenticated, initialize } = useAuthStore()

    // Hydrate auth state from cookies/localStorage on first use
    useEffect(() => {
        initialize()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        session: {
            user,
            access_token,
            refresh_token,
            isAuthenticated
        }
    }
}

export default useCurrentSession
