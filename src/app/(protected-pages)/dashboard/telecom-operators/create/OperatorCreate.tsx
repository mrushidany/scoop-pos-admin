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
import CreatableSelect from 'react-select/creatable'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ZodType } from 'zod'
import { TelecomOperatorSchema } from '../types'
import { useCreateTelecomOperator } from '@/hooks/features/telecom-operators-management/telecomOperatorsManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'

type SelectOption = {
    label: string
    value: number | boolean
}

type SeriesOption = {
    label: string
    value: string
}

const validationSchema: ZodType<TelecomOperatorSchema> = z.object({
    name: z.string().min(1, 'Name is required'),
    is_active: z.boolean(),
    number_series: z.array(z.string().min(1, 'Number series is required')),
})

const OperatorCreate = () => {
    const router = useRouter()

    const activeList: Array<SelectOption> = [
        {
            label: 'Active',
            value: true,
        },
        {
            label: 'Inactive',
            value: false,
        },
    ]

    const { mutate, isPending } = useCreateTelecomOperator()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<TelecomOperatorSchema>({
        defaultValues: {
            name: '',
            is_active: true,
            number_series: [],
        },
        resolver: zodResolver(validationSchema),
        mode: 'onTouched'
    })

    const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(
            <Notification type='success'>Telecom operator discarded!</Notification>,
            { placement: 'top-center' },
        )
        router.push('/dashboard/telecom-operators')
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    const onSubmit = async (values: TelecomOperatorSchema) => {
        await mutate(values, {  
            onSuccess: (response) => {
                toast.push(
                    <Notification type='success'>{response.message}</Notification>,
                    { placement: 'top-center' },
                )
                router.push('/dashboard/telecom-operators')
            }, 
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to create telecom operator') 
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
                                <h4 className='mb-6'>Telecom operator details</h4>
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
                                    <FormItem label='Number series' invalid={Boolean(errors.number_series)} errorMessage={errors.number_series?.message}>
                                        <Controller 
                                            name='number_series'
                                            control={control}
                                            render={({ field }) => (
                                                <Select<SeriesOption, true> 
                                                    componentAs={CreatableSelect}
                                                    isMulti
                                                    options={(field.value || []).map((v) => ({ label: v, value: v }))}
                                                    className='w-full'
                                                    placeholder='Enter number series and press Enter'
                                                    value={(field.value || []).map((v) => ({ label: v, value: v }))}
                                                    onChange={(options) =>
                                                        field.onChange((options || []).map((opt) => opt.value))
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <div className='flex items-end gap-4 w-full'>
                                        <FormItem  
                                            invalid={
                                                Boolean(errors.is_active) || Boolean(errors.is_active)
                                            }
                                            className='w-full'
                                        >
                                            <label className='form-label mb-2'>Status</label>
                                            <Controller
                                                name='is_active'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select<SelectOption> 
                                                        options={activeList} 
                                                        {...field}
                                                        className='w-full'
                                                        placeholder=''
                                                        value={activeList.find(
                                                            (option) => option.value === field.value,
                                                        ) ?? null}
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
                                    Create
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

export default OperatorCreate


