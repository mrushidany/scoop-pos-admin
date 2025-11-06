import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants'
import Cookies from 'js-cookie'
import { decrypt, encrypt } from '@/lib/encryt-decrypt'

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token))
    refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string) => void) {
    refreshSubscribers.push(cb)
}

function getAccessToken(): string | null {
    const enc = Cookies.get('pos_admin_auth_token')
    if (!enc) return null
    try { return decrypt(enc) } catch { return null }
}

function getRefreshToken(): string | null {
    const enc = Cookies.get('pos_admin_refresh_token')
    if (!enc) return null
    try { return decrypt(enc) } catch { return null }
}

function setSessionCookies(token: string, expiresIn?: number) {
    const encToken = encrypt(token)
    Cookies.set('pos_admin_auth_token', encToken, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    })
    if (expiresIn) {
        const expiresAt = Date.now() + expiresIn * 1000
        Cookies.set('pos_admin_session_exp', String(expiresAt), {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })
    }
}

axiosInstance.interceptors.request.use(
    (config) => {
        // Attach current access token if available
        const token = getAccessToken()
        if (token) {
            config.headers = config.headers || {}
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const { response, config } = error || {}
        const originalRequest: AxiosRequestConfig & { _retry?: boolean } = config || {}

        if (response?.status === 401 && !originalRequest._retry) {
            const refreshToken = getRefreshToken()
            if (!refreshToken) {
                return Promise.reject(error)
            }

            if (isRefreshing) {
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken: string) => {
                        originalRequest.headers = originalRequest.headers || {}
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                        originalRequest._retry = true
                        resolve(axiosInstance(originalRequest))
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true
            try {
                const resp = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, {
                    refresh_token: refreshToken,
                }, { headers: { 'Content-Type': 'application/json' } })

                const { access_token, expires_in } = resp.data || {}
                if (!access_token) {
                    throw new Error('No access token in refresh response')
                }

                setSessionCookies(access_token, expires_in)
                onRefreshed(access_token)
                isRefreshing = false

                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                isRefreshing = false
                Cookies.remove('pos_admin_auth_token', { path: '/' })
                Cookies.remove('pos_admin_session_exp', { path: '/' })
                // Keep refresh token; user may still be able to re-login manually
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance