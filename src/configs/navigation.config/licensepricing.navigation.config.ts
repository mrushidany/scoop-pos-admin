import { LICENSE_PRICING_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_TITLE
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const licensePricingNavigationConfig: NavigationTree[] = [
    {
        key: 'licensePricing',
        path: '',
        title: 'License Pricing',
        translateKey: 'nav.licensePricing.licensePricing',
        icon: 'license',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'licensePricing.licensePricing',
                path: `${LICENSE_PRICING_PREFIX_PATH}`, 
                title: 'License Pricing',
                translateKey: 'nav.licensePricing.licensePricing',
                icon: 'license',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.licensePricing.licensePricingDesc',
                        label: 'License Pricing',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default licensePricingNavigationConfig
