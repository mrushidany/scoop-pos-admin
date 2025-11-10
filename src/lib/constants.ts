export const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin`

export const API_ENDPOINTS = {
    LOGIN_SUPERADMIN: `${API_BASE_URL}/login`,
    REFRESH_TOKEN: `${API_BASE_URL}/refresh`,
    ADMIN_USERS: `${API_BASE_URL}/users`,
} as const