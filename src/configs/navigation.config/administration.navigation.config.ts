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
                key: 'administration.users.users',
                path: `${ADMINISTRATION_PREFIX_PATH}/users`,
                title: 'Users',
                translateKey: 'nav.administration.users.users',
                icon: 'users',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.administration.users.usersDesc',
                        label: 'Users Management',
                    },
                },
                subMenu: [
                    {
                        key: 'administration.users.rolesPermissions',
                        path: `${ADMINISTRATION_PREFIX_PATH}/users/roles-permissions`,
                        title: 'Roles & Permissions',
                        translateKey: 'nav.administration.users.rolesPermissions',
                        icon: 'accountRoleAndPermission',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        meta: {
                            description: {
                                translateKey: 'nav.administration.users.rolesPermissionsDesc',
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
