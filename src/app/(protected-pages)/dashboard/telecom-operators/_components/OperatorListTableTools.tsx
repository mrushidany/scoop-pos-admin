'use client'

import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import OperatorListSearch from './OperatorListSearch'

const OperatorListTableTools = () => { 
    const { onAppendQueryParams } = useAppendQueryParams()

    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    return (
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
            <OperatorListSearch onInputChange={handleInputChange} />
        </div>

    )
}

export default OperatorListTableTools