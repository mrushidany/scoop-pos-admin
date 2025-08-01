import dashboardRoute from './dashboardRoute'
import financeRoute from './financeRoute'
import logisticsRoute from './logisticsRoute'
import authRoute from './authRoute'
import isightsRoute from './insightsRoute'
import administrationRoute from './administrationRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    ...dashboardRoute,
    ...financeRoute,
    ...logisticsRoute,
    ...isightsRoute,
    ...administrationRoute,
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
