import dashboardRoute from './dashboardRoute'
import financeRoute from './financeRoute'
import logisticsRoute from './logisticsRoute'
import authRoute from './authRoute'
import insightsRoute from './insightsRoute'
import administrationRoute from './administrationRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    ...dashboardRoute,
    ...financeRoute,
    ...logisticsRoute,
    ...insightsRoute,
    ...administrationRoute,
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
