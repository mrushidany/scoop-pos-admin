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
        key: 'administration.users.create',
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create user',
                description:
                    'Manage user details, track activity, and update preferences easily.',
                contained: true,
            },
            footer: false,
        },
        dynamicRoute: true,
    },
}

export default administrationRoute
