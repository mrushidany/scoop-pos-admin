'use client'

import NavigationContext from './NavigationContext'

import type { NavigationTree } from '@/@types/navigation'
import type { CommonProps } from '@/@types/common'
import { useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

interface NavigationProviderProps extends CommonProps {
    navigationTree: NavigationTree[]
}

const NavigationProvider = ({
    navigationTree,
    children,
}: NavigationProviderProps) => {
    const [queryClient] = useState(() => new QueryClient())
    return (
        <NavigationContext.Provider value={{ navigationTree }}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </NavigationContext.Provider>
    )
}

export default NavigationProvider
