import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const licensePricingRoute: Routes = {
    '/dashboard/license-pricing': {
        key: 'licensePricing.licensePricing',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/dashboard/license-pricing/details/[license]': {
        key: 'licensePricing.licensePricing',
        authority: [],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/dashboard/license-pricing/edit/[license]': {
        key: 'licensePricing.licensePricing',
        authority: [],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default licensePricingRoute
