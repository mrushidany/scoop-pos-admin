import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import appConfig from '@/configs/app.config'
import { decrypt } from '@/lib/encryt-decrypt'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the path is a static path
    if (appConfig.staticPaths.some(path => pathname.startsWith(path)) || pathname.includes('.')) {
        return NextResponse.next()
    }

    const encryptedToken = request.cookies.get('auth_token')?.value
    const isPublicRoute = appConfig.publicRoutes.includes(pathname)
    const isProtectedRoute = appConfig.protectedRoutes.some(route => pathname.startsWith(route))

    // Verify token if it exists
    let isAuthenticated = false
    if (encryptedToken) {
        try {
            // Decrypt the token
            const token = decrypt(encryptedToken)
            // If decryption succeeds and token exists, consider the user authenticated
            isAuthenticated = !!token
        } catch (error) {
            console.error('Token verification failed:', error)
            isAuthenticated = false
        }
    }

    // If user is authenticated and tries to access public routes
    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL(appConfig.authenticatedEntryPath, request.url))
    }

    // If user is not authenticated and tries to access protected routes
    if (!isAuthenticated && isProtectedRoute) {
        // Store the current URL to redirect back after login
        const response = NextResponse.redirect(new URL(appConfig.unAuthenticatedEntryPath, request.url))
        response.cookies.set('redirect_after_login', pathname, {
            path: '/',
            maxAge: 300 // 5 minutes
        })
        return response
    }

    // Allow access to all other routes
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}
