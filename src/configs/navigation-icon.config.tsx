import {
    PiUsersDuotone,
    PiChartBarDuotone,
    PiWarehouseLight,
    PiShoppingCartSimpleDuotone
} from 'react-icons/pi'
import { MdOutlinePayments, MdAnalytics } from 'react-icons/md'

import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    transactions: <MdOutlinePayments />,
    users: <PiUsersDuotone />,
    warehouse: <PiWarehouseLight />,
    reports: <MdAnalytics />,
    dashboardOverview: <PiChartBarDuotone />,
    orders: <PiShoppingCartSimpleDuotone />

}

export default navigationIcon
