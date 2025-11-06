import { create } from 'zustand'
import { API_ENDPOINTS } from '@/lib/constants'
import axiosInstance from '@/lib/client'
import { AxiosError } from 'axios'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/lib/encryt-decrypt'
import sleep from '@/utils/sleep'

interface User {
    id: number
    name: string
    email: string
    is_admin: boolean
    is_active: boolean
}

interface AuthState {
    access_token?: string
    expires_in?: number
    refresh_token?: string
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    success: string | null
    user: User | null
    login: (email:string, password: string) => Promise<{ success: boolean }>
    logout: () => Promise<void>
    checkAuth: () => Promise<boolean>
    clearMessages: () => void
    initialize: () => Promise<void>
}

const setAuthCookies = (
    token: string | null,
    user: User | null,
    refreshToken?: string | null,
    expiresIn?: number | null,
) => {
    if (token) {
        const encryptedToken = encrypt(token)
        Cookies.set('pos_admin_auth_token', encryptedToken, {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })

        if (refreshToken) {
            const encryptedRefreshToken = encrypt(refreshToken)
            Cookies.set('pos_admin_refresh_token', encryptedRefreshToken, {
                expires: 7, // keep refresh token longer
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            })
        }

        if (expiresIn) {
            const expiresAt = Date.now() + expiresIn * 1000
            Cookies.set('pos_admin_session_exp', String(expiresAt), {
                expires: 1,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            })
        }

        // Minimal user meta for middleware auth checks
        if (user) {
            localStorage.setItem('pos_admin_data', JSON.stringify(user))
            try {
                const userMeta = encrypt(
                    JSON.stringify({ is_admin: user.is_admin, is_active: user.is_active })
                )
                Cookies.set('pos_admin_user_meta', userMeta, {
                    expires: 1,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/',
                })
            } catch (e) {
                console.error('Error setting user meta cookie', e)
            }
        }
    } else {
        Cookies.remove('pos_admin_auth_token', { path: '/' })
        Cookies.remove('pos_admin_refresh_token', { path: '/' })
        Cookies.remove('pos_admin_session_exp', { path: '/' })
        Cookies.remove('pos_admin_user_meta', { path: '/' })
        localStorage.removeItem('pos_admin_data')
    }
}

const getTokenFromCookies = (): string | null => {
    const encryptedToken = Cookies.get('pos_admin_auth_token')
    if (!encryptedToken) return null
    try {
        return decrypt(encryptedToken)
    } catch (error) {
        console.error('Error decrypting token:', error)
        return null
    }
}
const getSessionExpiryFromCookies = (): number | null => {
    const exp = Cookies.get('pos_admin_session_exp')
    if (!exp) return null
    const parsed = Number(exp)
    return Number.isFinite(parsed) ? parsed : null
}

const getUserFromStorage = (): User | null => {
    if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('pos_admin_data')
        if (userData) {
            try {
                return JSON.parse(userData)
            } catch (error) {
                console.error('Error parsing pos_admin data:', error)
                return null
            }
        }
    }
    return null
}

const getStoredToken = () => {
    if (typeof window !== 'undefined') {
        return getTokenFromCookies() || localStorage.getItem('pos_admin_auth_token')
    }
    return null
}

const setStoredToken = (token: string | null) => {
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('pos_admin_auth_token', token)
        } else {
            localStorage.removeItem('pos_admin_auth_token')
        }
    }
}

const setAxiosAuthHeader = (token: string | null) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete axiosInstance.defaults.headers.common['Authorization']
    }
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    access_token: undefined,
    expires_in: undefined,
    refresh_token: undefined,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    success: null,

    initialize: async () => {
        const token = getStoredToken()
        const user = getUserFromStorage()
        const expiresAt = getSessionExpiryFromCookies()
        
        if (!token) {
            set({ isAuthenticated: false, user: null, access_token: undefined })
            setAxiosAuthHeader(null)
            return
        }

        // If session expired, clear and exit
        if (expiresAt && Date.now() >= expiresAt) {
            set({ isAuthenticated: false, user: null, access_token: undefined })
            setAxiosAuthHeader(null)
            setAuthCookies(null, null)
            return
        }

        // If we have a token and user data, set the auth state
        set({
            isAuthenticated: true,
            user,
            access_token: token,
        })
        setAxiosAuthHeader(token)
    },

    login: async (email: string, password: string) => {
        try {
            set({ isLoading: true, error: null, success: null })

            const response = await axiosInstance.post(API_ENDPOINTS.LOGIN_SUPERADMIN, { email, password })

            const { access_token, user, expires_in, refresh_token } = response.data

            // Store token and user data
            setStoredToken(access_token)
            setAuthCookies(access_token, user, refresh_token, expires_in)
            setAxiosAuthHeader(access_token)

            // Set auth state
            set({
                user,
                access_token,
                expires_in,
                refresh_token,
                isAuthenticated: true,
                isLoading: false,
                success: 'Login successful'
            })

            // Force a small delay to ensure cookies are set
            await sleep(100)

            return { success: true }
        } catch (error) {
            console.error('Login error details:', {
                status: error instanceof AxiosError ? error.response?.status : undefined,
                statusText: error instanceof AxiosError ? error.response?.statusText : undefined,
                data: error instanceof AxiosError ? error.response?.data : undefined,
                message: error instanceof Error ? error.message : 'Unknown error'
            })
            
            if (error instanceof AxiosError && error.response?.status === 401) {
                const errorMessage = error.response?.data?.error || 'Invalid email or password'

                set({
                    error: errorMessage,
                    isLoading: false,
                    success: null,
                    isAuthenticated: false,
                    access_token: undefined
                })
            } else {
                const errorMessage = error instanceof AxiosError 
                    ? error.response?.data?.error || error.response?.data?.message || error.message 
                    : error instanceof Error 
                        ? error.message 
                        : 'Login failed'
                
                set({
                    error: errorMessage,
                    isLoading: false,
                    success: null,
                    isAuthenticated: false,
                    access_token: undefined
                })
            }
            return { success: false }
        }
    },

    logout: async () => {
        try {
            // Clear token and user data
            setStoredToken(null)
            setAuthCookies(null, null)
            setAxiosAuthHeader(null)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            set({
                user: null,
                access_token: undefined,
                isAuthenticated: false,
                error: null,
                success: null
            })
        }
    },

    checkAuth: async () => {
        const token = getStoredToken()
        const user = getUserFromStorage()
        const expiresAt = getSessionExpiryFromCookies()
        
        if (!token) {
            set({ isAuthenticated: false, user: null, access_token: undefined })
            setAxiosAuthHeader(null)
            return false
        }

        if (expiresAt && Date.now() >= expiresAt) {
            set({ isAuthenticated: false, user: null, access_token: undefined })
            setAxiosAuthHeader(null)
            setAuthCookies(null, null)
            return false
        }

        // If we have a token and user data, set the auth state
        set({
            isAuthenticated: true,
            user,
            access_token: token
        })
        setAxiosAuthHeader(token)
        return true
    },

    clearMessages: () => {
        set({ error: null, success: null })
    }
}))



