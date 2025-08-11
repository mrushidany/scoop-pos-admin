import { ADMINISTRATION_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
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
                key: 'administration.users',
                path: `${ADMINISTRATION_PREFIX_PATH}/users`,
                title: 'Users',
                translateKey: 'nav.administration.users',
                icon: 'users',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.administration.usersDesc',
                        label: 'Users Management',
                    },
                },
                subMenu: [
                    {
                        key: 'administration.rolesPermissions',
                        path: `${ADMINISTRATION_PREFIX_PATH}/users/roles-permissions`,
                        title: 'Roles & Permissions',
                        translateKey: 'nav.administration.rolesPermissions',
                        icon: 'accountRoleAndPermission',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.administration.rolesPermissionsDesc',
                                label: 'Manage roles & permissions',
                            },
                        },
                        subMenu: [],
                    },
                ],
            },
        ],
    },
]

export default administrationNavigationConfig
