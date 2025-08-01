import { LOGISTICS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const logisticsNavigationConfig: NavigationTree[] = [
    {
        key: 'logistics',
        path: '',
        title: 'Logistics',
        translateKey: 'nav.logistics.logistics',
        icon: 'logistics',
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
                key: 'logistics.vendor',
                path: `${LOGISTICS_PREFIX_PATH}/vendor`,
                title: 'Vendors',
                translateKey: 'nav.logistics.vendor',
                icon: 'users',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.logistics.vendorDesc',
                        label: 'Vendor Management',
                    },
                },
                subMenu: [],
            },
            {
                key: 'logistics.inventory',
                path: `${LOGISTICS_PREFIX_PATH}/inventory`,
                title: 'Inventory',
                translateKey: 'nav.logistics.inventory',
                icon: 'warehouse',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.logistics.inventoryDesc',
                        label: 'Inventory Management',
                    },
                },
                subMenu: [],
            }
        ],
    },
]

export default logisticsNavigationConfig
