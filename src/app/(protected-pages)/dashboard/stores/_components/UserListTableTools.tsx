'use client'

import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import UserListSearch from './UserListSearch'

const UserListTableTools = () => {
    const { onAppendQueryParams } = useAppendQueryParams()

    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    return (
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
            <UserListSearch onInputChange={handleInputChange} />
        </div>

    )
}

export default UserListTableTools