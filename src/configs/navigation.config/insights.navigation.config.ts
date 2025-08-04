import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'
import { INSIGHTS_PREFIX_PATH } from '@/constants/route.constant'

const insightsNavigationConfig: NavigationTree[] = [
    {
        key: 'insights',
        path: '',
        title: 'Insights',
        translateKey: 'nav.insights.insights',
        icon: 'insights',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'insights.reports',
                path: `${INSIGHTS_PREFIX_PATH}/reports`,
                title: 'Reports',
                translateKey: 'nav.insights.reports',
                icon: 'reports',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.insights.reportsDesc',
                        label: 'Reporting and Analytics',
                    },
                },
                subMenu: [],
            }
        ],
    },
]

export default insightsNavigationConfig
