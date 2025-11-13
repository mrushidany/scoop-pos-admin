'use client'

import Button from '@/components/ui/Button'
import { TbUserPlus } from 'react-icons/tb'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
} from '@tanstack/react-table'
import type { Users } from '../../../types'
import Input from '@/components/ui/Input'
import { Controller } from 'react-hook-form'
import Select from '@/components/ui/Select'
import { FormItem } from '@/components/ui/Form'
import { Form } from '@/components/ui/Form'
import { AssignUserToStoreFormSchema } from '../../../types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { useRetrieveListOfUsers } from '@/hooks/features/user-management/userManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAssignUserToStore } from '@/hooks/features/stores-management/storeManagementApi'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'

type SelectOption = {
    label: string
    value: number
}

const validationSchema: ZodType<AssignUserToStoreFormSchema> = z.object({
    user_id: z.number().min(1, 'User is required'),
    role: z.string().optional(),
})

type UsersSectionProps = {
    data?: Users[]
    storeId?: string
    refetch?: () => Promise<unknown>
}

const { Tr, Td, Th, TBody, THead } = Table

const columnHelper = createColumnHelper<Users>()

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.name}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('email', {
        header: 'Email',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.email}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.phone}</span>
                </div>
            )
        },
    }),
    columnHelper.accessor('role', {
        header: 'Role',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className='flex items-center gap-2'>
                    <span className='font-semibold'>{row.phone}</span>
                </div>
            )
        },
    }),

]

const UsersSection = ({ data, storeId, refetch }: UsersSectionProps) => {
    const { data: users } = useRetrieveListOfUsers()

    const { mutate , isPending } = useAssignUserToStore(storeId || '')

    const [dialogOpen, setDialogOpen] = useState(false)

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = () => {
        setDialogOpen(true)
    }

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<AssignUserToStoreFormSchema>({
        defaultValues: {
            user_id: 0,
            role: '',    
        },
        resolver: zodResolver(validationSchema),
        mode: 'onTouched'
    })
    
    const usersList: Array<SelectOption> = users?.data?.map((user) => ({
        label: user.name,
        value: user.id,
    })) || []

    const onSubmit = async (values: AssignUserToStoreFormSchema) => {
        await mutate(values, {  
            onSuccess: (response) => {
                toast.push(
                    <Notification type='success'>{response.message}</Notification>,
                    { placement: 'top-center' },
                )
                refetch && refetch()
                setDialogOpen(false)
            }, 
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to assign user to store') 
                toast.push(
                    <Notification type='danger'>{message}</Notification>,
                    { placement: 'top-center' },
                )
            }
        })
    }
     
    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <div className='flex flex-row justify-between items-center mb-4'>
                <h6>Store user details</h6>
                <div>
                    <Button 
                        variant='solid' 
                        icon={<TbUserPlus className='text-xl' />}
                        onClick={handleDialogOpen} 
                    >
                        Assign user to store
                    </Button>
                </div>
            </div>
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table
                        .getRowModel()
                        .rows.slice(0, 10)
                        .map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        )
                                    })}
                                </Tr>
                            )
                        })   
                    }
                </TBody>
            </Table>
            <Dialog
                isOpen={dialogOpen}
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
            >
                <h5 className='mb-4'>Assign user to store</h5>
                <Form className='flex w-full h-full' containerClassName='flex flex-col w-full justify-between' onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid md:grid-cols-2 gap-4'>
                        <FormItem  
                            invalid={
                                Boolean(errors.user_id) || Boolean(errors.user_id)
                            }
                            className='w-full'
                        >
                            <label className='form-label mb-2'>Store user</label>
                            <Controller
                                name='user_id'
                                control={control}
                                render={({ field }) => (
                                    <Select<SelectOption> 
                                        options={usersList} 
                                        {...field}
                                        className='w-full'
                                        placeholder=''
                                        value={usersList.filter(
                                            (option) => option.value === field.value,
                                        )}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label='Role' invalid={Boolean(errors.role)} errorMessage={errors.role?.message}>
                            <Controller 
                                name='role'
                                control={control}
                                render={({ field }) => (
                                    <Input 
                                        type='text'
                                        autoComplete='off'
                                        placeholder='Enter role (optional)'
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                    <div className='w-full flex justify-end'>
                        <Button
                            variant='solid'
                            type='submit'
                            loading={isPending}
                            disabled={isPending}
                        >
                            Assign
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default UsersSection

