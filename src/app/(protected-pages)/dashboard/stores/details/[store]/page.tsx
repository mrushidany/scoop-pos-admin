'use client'

import React, { use } from 'react'
import NoUserFound from '@/assets/svg/NoUserFound'
import { getApiErrorMessage } from '@/utils/apiError'
import Loading from '@/components/shared/Loading'
import isEmpty from 'lodash/isEmpty'
import StoreDetails from './_components/StoreDetails'
import { useRetrieveStoreDetails } from '@/hooks/features/stores-management/storeManagementApi'

export default function Page({ params }: { params: Promise<{store: string}> }) {
    const resolvedParams = use(params)
    const { store }  = resolvedParams

    const { data, isLoading, error } = useRetrieveStoreDetails(store)

    console.log('What is the data here : ', data)

    if(error || isEmpty(data)) {
        return (
            <div className='h-full flex flex-col items-center justify-center'>
                <NoUserFound height={280} width={280} />
                <h2 className='mt-4'>{Boolean(error) ? 'Error loading store!' : 'No store found!'}</h2>
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
    return <StoreDetails data={data} />
}
