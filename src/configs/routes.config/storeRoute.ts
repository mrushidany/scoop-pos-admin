import type { Routes } from '@/@types/routes'

const storeRoute: Routes = {
    '/dashboard/stores': {
        key: 'store.store',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/dashboard/stores/create': {
        key: 'store.store',
        authority: [],
        dynamicRoute: true,
        meta: {
            header: {
                title: 'Create store'
            },
            pageContainerType: 'contained',
        },
    },
}

export default storeRoute
