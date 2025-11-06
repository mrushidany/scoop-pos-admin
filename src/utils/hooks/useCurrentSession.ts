import { useAuthStore } from '@/store/auth'

const useCurrentSession = () => {
    const { user, access_token, refresh_token, isAuthenticated } = useAuthStore()

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
