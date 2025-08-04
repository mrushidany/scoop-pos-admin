import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const insightsRoute: Routes = {
    '/insights/reports': {
        key: 'insights.reports',
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default insightsRoute
