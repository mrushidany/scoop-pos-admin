import dashboardNavigationConfig from './dashboard.navigation.config'
import logisticsNavigationConfig from './store.navigation.config'
// import financeNavigationConfig from './finance.navigation.config'
// import insightsNavigationConfig from './insights.navigation.config'
import administrationNavigationConfig from './administration.navigation.config'
import type { NavigationTree } from '@/@types/navigation'
import deviceManagementNavigationConfig from './devicemanagement.navigation.config'
import licensePricingNavigationConfig from './licensepricing.navigation.config'
import telecomOperatorsNavigationConfig from './telecomoperators.navigation.config'

const navigationConfig: NavigationTree[] = [
    ...dashboardNavigationConfig,
    ...administrationNavigationConfig,
    ...deviceManagementNavigationConfig,
    ...licensePricingNavigationConfig,
    ...telecomOperatorsNavigationConfig,
    ...logisticsNavigationConfig
    // ...financeNavigationConfig,
    // ...insightsNavigationConfig,
]

export default navigationConfig
