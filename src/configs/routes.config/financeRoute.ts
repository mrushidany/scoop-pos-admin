import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const financeRoute: Routes = {
    '/finance/transactions': {
        key: 'finance.transactions',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/finance/orders': {
        key: 'finance.orders',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    }
}

export default financeRoute
