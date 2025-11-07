import type { Routes } from '@/@types/routes'

const storeRoute: Routes = {
    '/dashboard/store': {
        key: 'store.store',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    }
}

export default storeRoute
