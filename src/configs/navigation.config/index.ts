import dashboardNavigationConfig from './dashboard.navigation.config'
import logisticsNavigationConfig from './logistics.navigation.config'
import financeNavigationConfig from './finance.navigation.config'
import insightsNavigationConfig from './insights.navigation.config'
import administrationNavigationConfig from './administration.navigation.config'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    ...dashboardNavigationConfig,
    ...financeNavigationConfig,
    ...logisticsNavigationConfig,
    ...insightsNavigationConfig,
    ...administrationNavigationConfig,
]

export default navigationConfig
