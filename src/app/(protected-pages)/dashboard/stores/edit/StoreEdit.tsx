'use client'

import { useState } from 'react'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { FormItem } from '@/components/ui/Form'
import Container from '@/components/shared/Container'
import { Controller } from 'react-hook-form'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { TbTrash } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import { Form } from '@/components/ui/Form'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { StoreFormSchema } from '../types'
import { getApiErrorMessage } from '@/utils/apiError'
import { useUpdateStoreDetails } from '@/hooks/features/stores-management/storeManagementApi'
import { useRetrieveListOfUsers } from '@/hooks/features/user-management/userManagementApi'

type SelectOption = {
    label: string
    value: boolean
}

const validationSchema: ZodType<StoreFormSchema> = z.object({
    name: z.string().min(1, 'Name is required'),
    store_type_string: z.string().min(1, 'Store type is required'),
    owner_id: z.number().min(1, 'Owner is required'),
})

type UserEditProps = {
    userId: number
    data: {
        id?: number
        name?: string
        email?: string
        phone?: string
        is_admin?: boolean
        is_active?: boolean
    }
}

const StoreEdit = ({ userId, data }: UserEditProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateStoreDetails(userId)

    const { data: owners } = useRetrieveListOfUsers()
    
    const ownerList: Array<SelectOption> = owners?.data?.map((owner) => ({
        label: owner.name,
        value: owner.id,
    })) || []

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<StoreFormSchema>({
        defaultValues: {
            name: data?.name ?? '',
            store_type_string: data?.store_type_string ?? '',
            owner_id: data?.owner_id ?? 0,
        },
        resolver: zodResolver(validationSchema),
        mode: 'onTouched'
    })

    const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(
            <Notification type='success'>Store discarded!</Notification>,
            { placement: 'top-center' },
        )
        router.push(`/dashboard/stores`)
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    const onSubmit = async (values: StoreFormSchema) => {
        await mutate(values, {
            onSuccess: (response) => {
                toast.push(
                    <Notification type='success'>{response.message}</Notification>,
                    { placement: 'top-center' },
                )
                router.push(`/dashboard/stores/details/${userId}`)
            }, 
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to update store details') 
                toast.push(
                    <Notification type='danger'>{message}</Notification>,
                    { placement: 'top-center' },
                )
            }
        })
    }

    return (
        <>
            <Form className='flex w-full h-full' containerClassName='flex flex-col w-full justify-between' onSubmit={handleSubmit(onSubmit)}>
                <Container>
                    <div className='flex flex-col md:flex-row gap-4'>
                        <div className='gap-4 flex flex-col flex-auto'>
                            <Card>
                                <h4 className='mb-6'>Edit store details</h4>
                                <div className='grid md:grid-cols-3 gap-4'>
                                    <FormItem label='Name' invalid={Boolean(errors.name)} errorMessage={errors.name?.message}>
                                        <Controller 
                                            name='name'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='text'
                                                    autoComplete='off'
                                                    placeholder='Enter name'
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem label='Store type' invalid={Boolean(errors.store_type_string)} errorMessage={errors.store_type_string?.message}>
                                        <Controller 
                                            name='store_type_string'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='text'
                                                    autoComplete='off'
                                                    placeholder='Enter store type'
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <div className='flex items-end gap-4 w-full'>
                                        <FormItem  
                                            invalid={
                                                Boolean(errors.owner_id) || Boolean(errors.owner_id)
                                            }
                                            className='w-full'
                                        >
                                            <label className='form-label mb-2'>Store owner</label>
                                            <Controller
                                                name='owner_id'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select<SelectOption> 
                                                        options={ownerList} 
                                                        {...field}
                                                        className='w-full'
                                                        placeholder=''
                                                        value={ownerList.filter(
                                                            (option) => option.value === field.value,
                                                        )}
                                                        onChange={(option) =>
                                                            field.onChange(option?.value)
                                                        }
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Container>
                <BottomStickyBar>
                    <Container>
                        <div className='flex items-center justify-between px-8'>
                            <span></span>
                            <div className='flex items-center'>
                                <Button 
                                    type='button' 
                                    className='ltr:mr-3 rtl:ml-3'
                                    customColorClass={() =>
                                        'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                    }
                                    icon={<TbTrash />}
                                    onClick={handleDiscard}
                                >
                                    Discard
                                </Button>
                                <Button
                                    variant='solid'
                                    type='submit'
                                    loading={isPending}
                                    disabled={isPending}
                                >
                                    Update
                                </Button>
                            </div>
                        </div>
                    </Container>
                </BottomStickyBar>
            </Form>
            <ConfirmDialog
                isOpen={discardConfirmationOpen}
                type='danger'
                title='Discard Changes'
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDiscard}
            >
                 <p>
                    Are you sure you want discard this? This action can`t
                    be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
        
    )
}

export default StoreEdit


