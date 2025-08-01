import dashboardRoute from './dashboardRoute'
import conceptsRoute from './conceptsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import authDemoRoute from './authDemoRoute'
import guideRoute from './guideRoute'
// import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    ...dashboardRoute,
    ...uiComponentsRoute,
    ...authDemoRoute,
    ...conceptsRoute,
    ...guideRoute,
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
