'use client'

import { use } from 'react'
import NoUserFound from '@/assets/svg/NoUserFound'
import { getApiErrorMessage } from '@/utils/apiError'
import Loading from '@/components/shared/Loading'
import isEmpty from 'lodash/isEmpty'
import { useRetrieveLicensePricingDetails } from '@/hooks/features/license-pricing-management/licensePricingManagementApi'
import LicenseDetails from './_components/LicenseDetails'

export default function Page({ params }: { params: Promise<{license: number}> }) {
    const resolvedParams = use(params)
    const { license }  = resolvedParams

    const { data, isLoading, error } = useRetrieveLicensePricingDetails(license)

    console.log('What is the details here : ', data)

    if(error || isEmpty(data)) {
        return (
            <div className='h-full flex flex-col items-center justify-center'>
                <NoUserFound height={280} width={280} />
                <h2 className='mt-4'>{Boolean(error) ? 'Error loading license!' : 'No license found!'}</h2>
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

    return <LicenseDetails data={data} />

}