import { ADMINISTRATION_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_TITLE
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const administrationNavigationConfig: NavigationTree[] = [
    {
        key: 'administration',
        path: '',
        title: 'Administration',
        translateKey: 'nav.administration.administration',
        icon: 'guide',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'administration.users.userManagement',
                path: `${ADMINISTRATION_PREFIX_PATH}/user-management`,
                title: 'User Management',
                translateKey: 'nav.administration.users.userManagement',
                icon: 'users',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.administration.users.userManagementDesc',
                        label: 'User Management',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default administrationNavigationConfig
