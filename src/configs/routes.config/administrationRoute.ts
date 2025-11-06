import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const administrationRoute: Routes = {
    '/administration/user-management': {
        key: 'administration.users.userManagement',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    }
}

export default administrationRoute
