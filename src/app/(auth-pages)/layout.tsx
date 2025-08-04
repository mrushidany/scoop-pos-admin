import { ReactNode } from 'react'
import Split from '@/components/layouts/AuthLayout/Split'

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className='flex flex-auto flex-col h-[100vh]'>
            <Split>{children}</Split>
        </div>
    )
}

export default Layout
