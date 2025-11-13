export const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin`
const AUTH = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth`

export const API_ENDPOINTS = {
    LOGIN_SUPERADMIN: `${API_BASE_URL}/login`,
    REFRESH_TOKEN: `${AUTH}/refresh`,
    ADMIN_USERS: `${API_BASE_URL}/users`,
    TOGGLE_USER_STATUS: (userId: number) => `${API_BASE_URL}/users/${userId}/toggle-status`,
    TOGGLE_ADMIN_STATUS: (adminId: number) => `${API_BASE_URL}/users/${adminId}/toggle-admin`,
    ADMIN_STORES: `${API_BASE_URL}/stores`,
} as const