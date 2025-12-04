'use client'

import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import UserListSearch from './UserListSearch'
import { Form } from '@/components/ui/Form'
import { FormItem } from '@/components/ui/Form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import Select from '@/components/ui/Select'

type FilterSchema = {
    search?: string
    is_admin?: boolean
    is_active?: boolean
}

type SelectOption = {
    label: string
    value: boolean
}

const options = [
    { value: true, label: 'Yes'},
    { value: false, label: 'No'},
]

const activeOptions = [
    { value: true, label: 'Active'},
    { value: false, label: 'Inactive'},
]

const validateSchema: ZodType<FilterSchema> = z.object({
    search: z.string().optional(),
    is_admin: z.boolean().optional(),
    is_active: z.boolean().optional(),
})  

const UserListTableTools = () => {
    const { onAppendQueryParams } = useAppendQueryParams()

    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    return (
        <Form>
            <div className='flex flex-col md:grid md:grid-cols-2 gap-2'>
                <div className='w-full'>
                    <UserListSearch onInputChange={handleInputChange} />
                </div>
                <div className='w-full flex flex-row gap-2'>
                    <Select 
                        instanceId='admin-status'
                        options={options}
                        placeholder='Admin'
                    />
                    <Select 
                        instanceId='active-status'
                        options={activeOptions}
                        placeholder='Status'
                    />
                </div>
            </div>
        </Form>
        

    )
}

export default UserListTableTools