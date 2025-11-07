import { TELECOM_OPERATORS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_TITLE
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const telecomOperatorsNavigationConfig: NavigationTree[] = [
    {
        key: 'telecomOperators',
        path: '',
        title: 'Telecom Operators',
        translateKey: 'nav.telecomOperators.telecomOperators',
        icon: 'telecomOperators',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'telecomOperators.telecomOperators',
                path: `${TELECOM_OPERATORS_PREFIX_PATH}`, 
                title: 'Telecom Operators',
                translateKey: 'nav.telecomOperators.telecomOperators',
                icon: 'telecomOperators',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.telecomOperators.telecomOperatorsDesc',
                        label: 'Telecom Operators',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default telecomOperatorsNavigationConfig
