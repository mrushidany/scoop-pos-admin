'use client'

import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type UserListSearchProps = {
    onInputChange: (value: string) => void
    ref?: Ref<HTMLInputElement>
}

const UserListSearch = (props: UserListSearchProps) => {
    const { onInputChange, ref } = props

    return (
        <DebouceInput
            ref={ref}
            placeholder='Search user...'
            suffix={<TbSearch className='text-lg' />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default UserListSearch
