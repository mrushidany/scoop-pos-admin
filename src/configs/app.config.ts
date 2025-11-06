export type AppConfig = {
     apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    activeNavTranslation: boolean
    publicRoutes: string[]
    staticPaths: string[]
    protectedRoutes: string[]
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboard/overview',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    activeNavTranslation: true,
    publicRoutes: ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'],
    staticPaths: ['/_next', '/api', '/static', '/img', '/images', '/assets', '/favicon.ico'],
    protectedRoutes: ['/dashboard']
}

export default appConfig
