import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const administrationRoute: Routes = {
    '/dashboard/administration/user-management': {
        key: 'administration.users.userManagement',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/dashboard/administration/user-management/create': {
        key: 'administration.users.userManagement',
        authority: [ADMIN, USER],
        dynamicRoute: true,
        meta: {
            header: {
                title: 'Create user'
            },
            pageContainerType: 'contained',
        },
    },
    '/dashboard/administration/user-management/details/[user]': {
        key: 'administration.users.userManagement',
        authority: [ADMIN, USER],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default administrationRoute
