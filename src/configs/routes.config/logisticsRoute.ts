import type { Routes } from '@/@types/routes'

const logisticsRoute: Routes = {
    '/dashboard/logistics/vendor': {
        key: 'logistics.vendor',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/dashboard/logistics/orders': {
        key: 'logistics.inventory',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
}

export default logisticsRoute
