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
    }
}

export default deviceManagementRoute
