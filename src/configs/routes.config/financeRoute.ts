import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const financeRoute: Routes = {
    '/dashboard/finance/transactions': {
        key: 'finance.transactions',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/dashboard/finance/orders': {
        key: 'finance.orders',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    }
}

export default financeRoute
