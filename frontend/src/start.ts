import { createStart, createMiddleware } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'

const authMiddleware = createMiddleware().server(async ({ pathname, next }) => {
    const refreshToken = getCookie('refreshToken')
    const accessToken = getCookie('accessToken')
    const isAuthenticated = Boolean(refreshToken && accessToken)

    const isDashboardRoute =
        pathname === '/dashboard' || pathname.startsWith('/dashboard/')

    if (pathname === '/login' && isAuthenticated) {
        throw redirect({ to: '/dashboard' })
    }

    if (isDashboardRoute && !isAuthenticated) {
        throw redirect({ to: '/login' })
    }

    return next()
})

export const startInstance = createStart(() => ({
    requestMiddleware: [authMiddleware],

}))