export const API_BASE_URL = `${process.env.NEXT_BACKEND_API_URL}`

export const API_ENDPOINTS = {
    // Super Admin Authentication
    LOGIN_SUPERADMIN: `${API_BASE_URL}/login`,
} as const