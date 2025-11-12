'use client'

import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type StoreListSearchProps = {
    onInputChange: (value: string) => void
    ref?: Ref<HTMLInputElement>
}

const StoreListSearch = (props: StoreListSearchProps) => {
    const { onInputChange, ref } = props

    return (
        <DebouceInput
            ref={ref}
            placeholder='Search store...'
            suffix={<TbSearch className='text-lg' />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default StoreListSearch
