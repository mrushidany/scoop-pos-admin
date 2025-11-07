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
    }
}

export default licensePricingRoute
