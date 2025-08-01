import { FINANCE_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const financeNavigationConfig: NavigationTree[] = [
    {
        key: 'finance',
        path: '',
        title: 'Finance & Operations',
        translateKey: 'nav.finance.finance',
        icon: 'finance',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        meta: {
            horizontalMenu: {
                layout: 'columns',
                columns: 4,
            },
        },
        subMenu: [
            {
                key: 'finance.transactions',
                path: `${FINANCE_PREFIX_PATH}/transactions`,
                title: 'Transactions',
                translateKey: 'nav.finance.transactions',
                icon: 'transactions',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.finance.transactionsDesc',
                        label: 'Transactions Management',
                    },
                },
                subMenu: [],
            },
            {
                key: 'finance.orders',
                path: `${FINANCE_PREFIX_PATH}/orders`,
                title: 'Orders',
                translateKey: 'nav.finance.orders',
                icon: 'orders',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.finance.ordersDesc',
                        label: 'Orders Management',
                    },
                },
                subMenu: [],
            }
        ],
    },
]

export default financeNavigationConfig
