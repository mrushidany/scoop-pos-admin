import { DEVICE_MANAGEMENT_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_TITLE
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const deviceManagementNavigationConfig: NavigationTree[] = [
    {
        key: 'deviceManagement',
        path: '',
        title: 'Device Management',
        translateKey: 'nav.deviceManagement.deviceManagement',
        icon: 'devices',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'deviceManagement.deviceManagement',
                path: `${DEVICE_MANAGEMENT_PREFIX_PATH}`,
                title: 'Device Management',
                translateKey: 'nav.deviceManagement.deviceManagement',
                icon: 'devices',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.deviceManagement.deviceManagementDesc',
                        label: 'Device Management',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default deviceManagementNavigationConfig
