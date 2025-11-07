'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import Loading from '@/components/shared/Loading'

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const { initialize } = useAuthStore()

    useEffect(() => {
        const initAuth = async () => {
            try {
                await initialize()
            } catch (error) {
                console.error('Auth initialization error:', error)
            } finally {
                setIsInitialized(true)
            }
        }

        initAuth()
    }, [initialize])

    // Show loading state while initializing
    if (!isInitialized) {
        return (
            <div className='flex items-center h-screen justify-center'>
                <Loading loading={true} />
            </div>
        )
    }

    return <>{children}</>
}
