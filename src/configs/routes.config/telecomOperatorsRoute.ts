import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const telecomOperatorsRoute: Routes = {
    '/dashboard/telecom-operators': {
        key: 'telecomOperators.telecomOperators',
        authority: [ADMIN, USER],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    }
}

export default telecomOperatorsRoute
