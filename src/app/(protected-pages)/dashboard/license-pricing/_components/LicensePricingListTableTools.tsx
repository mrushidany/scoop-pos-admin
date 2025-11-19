'use client'

import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import LicensePricingListSearch from './LicensePricingListSearch'

const LicensePricingListTableTools = () => { 
    const { onAppendQueryParams } = useAppendQueryParams()

    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    return (
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
            <LicensePricingListSearch onInputChange={handleInputChange} />
        </div>

    )
}

export default LicensePricingListTableTools