'use client'

import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type LicensePricingListSearchProps = {
    onInputChange: (value: string) => void
    ref?: Ref<HTMLInputElement>
}

const LicensePricingListSearch = (props: LicensePricingListSearchProps) => {
    const { onInputChange, ref } = props

    return (
        <DebouceInput
            ref={ref}
            placeholder='Search license pricing...' 
            suffix={<TbSearch className='text-lg' />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default LicensePricingListSearch
