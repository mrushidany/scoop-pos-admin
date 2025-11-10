'use client'

import React, { use } from 'react'
import { useRetrieveUserDetails } from '@/hooks/features/user-management/userManagementApi'
import NoUserFound from '@/assets/svg/NoUserFound'
import { getApiErrorMessage } from '@/utils/apiError'
import Loading from '@/components/shared/Loading'

export default function Page({ params }: { params: Promise<{user: number}> }) {
    const resolvedParams = use(params)
    const { user }  = resolvedParams

    const { data, isLoading, error } = useRetrieveUserDetails(user)

    if(error || !data) {
        return (
            <div className='h-full flex flex-col items-center justify-center'>
                <NoUserFound height={280} width={280} />
                <h2 className='mt-4'>{Boolean(error) ? 'Error loading user!' : 'No user found!'}</h2>
                {Boolean(error) && (
                    <p className='text-red-500 mt-2'>
                        {getApiErrorMessage(error)}
                    </p>
                )}
            </div>

        )
    }

    if (isLoading) {
       return <Loading type='default' loading={isLoading} />
    }

    console.log('What are the user details here : ', data)

    return (
        <div>
            <h1>User Details</h1>
        </div>
    )
}
