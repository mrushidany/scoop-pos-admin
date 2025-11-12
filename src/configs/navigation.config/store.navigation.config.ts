import { STORE_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const storeNavigationConfig: NavigationTree[] = [
    {
        key: 'store',
        path: '',
        title: 'Stores Management',
        translateKey: 'nav.store.storeManagement',
        icon: 'warehoure',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'tabs',
                columns: 2,
            },
        },
        subMenu: [
            {
                key: 'store.store',
                path: `${STORE_PREFIX_PATH}`,
                title: 'Stores',
                translateKey: 'nav.store.store',
                icon: 'warehouse',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.store.storeDesc',
                        label: 'Stores Management',
                    },
                },
                subMenu: [],
            }
        ],
    },
]

export default storeNavigationConfig
