import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'

interface ListOfDevicesResponse {
    success: boolean
    data: {
        current_page: number,
        data: {
            device_id: number,
            device_uid: string,
            name: string,
            platform: string,
            device_model: string,
            os_version: string,
            registered_at: string,
            last_seen_at: string,
            revoked_at: string | null,
            is_active: boolean,
            is_online: boolean,
            store: {
                store_id: string
                store_name: string
            }
        }[],
        first_page_url: string
        from: number
        last_page: number
        last_page_url: string
        links: {
            url: string | null,
            label: string,
            page: string | null
            active: boolean
        }[]
        next_page_url: string | null
        path: string
        per_page: number
        prev_page_url: string | null
        to: number
        total: number
    }
}

interface RevokeDeviceVariables {
    reason: string
}

// Data Fetching

export function useRetrieveListOfDevices() {
    const { access_token } = useAuthStore()
    return useQuery<ListOfDevicesResponse>(
        ['retrieve-list-of-devices'],
        API_ENDPOINTS.ADMIN_DEVICE_MANAGEMENT,
        {
            enabled: !!access_token,
        }
    )
}

export function useRetrieveDeviceDetails(deviceId: number) {
    const { access_token } = useAuthStore()
    return useQuery<ListOfDevicesResponse>(
        ['retrieve-device-details', deviceId],
        `${API_ENDPOINTS.ADMIN_DEVICE_MANAGEMENT}/${deviceId}`,
        {
            enabled: !!access_token,
        }
    )

}

// Data Mutation

export function useRevokeDevice(deviceId: number) {
    const { access_token } = useAuthStore()
    return useMutation<ListOfDevicesResponse, RevokeDeviceVariables>(
        `${API_ENDPOINTS.ADMIN_DEVICE_MANAGEMENT}/${deviceId}/revoke`,
        createApiOptions(access_token ?? '', 'POST')
    )
}

