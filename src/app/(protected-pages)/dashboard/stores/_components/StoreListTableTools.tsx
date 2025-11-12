'use client'

import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import StoreListSearch from './StoreListSearch'

const StoreListTableTools = () => { 
    const { onAppendQueryParams } = useAppendQueryParams()

    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    return (
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
            <StoreListSearch onInputChange={handleInputChange} />
        </div>

    )
}

export default StoreListTableTools