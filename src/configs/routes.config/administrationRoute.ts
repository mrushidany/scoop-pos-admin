import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const administrationRoute: Routes = {
    '/administration/users': {
        key: 'administration.users',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    }, 
    '/administration/users/roles-permissions': {
        key: 'administration.users.rolesPermissions',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
}

export default administrationRoute
