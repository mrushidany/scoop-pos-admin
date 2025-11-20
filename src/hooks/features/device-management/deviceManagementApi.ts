import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'

interface ListOfDevicesResponse {
    success: boolean
    data: [
        device_id: number,
        device_uid: string,
        name: string,
        platform: string,
        store: {
            store_id: string
            store_name: string
        }
    ]
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
        createApiOptions(access_token ?? '', 'PUT')
    )
}

