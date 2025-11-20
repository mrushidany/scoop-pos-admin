import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const deviceManagementRoute: Routes = {
    '/dashboard/device-management': {
        key: 'deviceManagement.deviceManagement',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/dashboard/device-management/details/[device]': {
        key: 'deviceManagement.deviceManagement',
        authority: [],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default deviceManagementRoute
