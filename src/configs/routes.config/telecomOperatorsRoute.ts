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
    },
    
    '/dashboard/telecom-operators/create': {
        key: 'telecomOperators.telecomOperators',
        authority: [],
        dynamicRoute: true,
        meta: {
            header: {
                title: 'Create telecom operator'
            },
            pageContainerType: 'contained',
        },
    },
    '/dashboard/telecom-operators/details/[telecomOperator]': {
        key: 'telecomOperators.telecomOperators',
        authority: [],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
        },
    },
    '/dashboard/telecom-operators/edit/[telecomOperator]': {
        key: 'telecomOperators.telecomOperators',
        authority: [],
        dynamicRoute: true,
        meta: {
            pageContainerType: 'contained',
        },
    },
}

export default telecomOperatorsRoute
