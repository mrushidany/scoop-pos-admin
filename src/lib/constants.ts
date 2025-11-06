export const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}`

export const API_ENDPOINTS = {
    // Super Admin Authentication
    LOGIN_SUPERADMIN: `${API_BASE_URL}/admin/login`,
    // Token refresh endpoint (assumed path)
    REFRESH_TOKEN: `${API_BASE_URL}/admin/refresh`,
} as const