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
import { getApiErrorMessage } from '@/utils/apiError'
import { useUpdateLicensePricingDetails } from '@/hooks/features/license-pricing-management/licensePricingManagementApi'
import { LicensePricingDetail, LicensePricingFormSchema } from '../../../types'
import CreatableSelect from 'react-select/creatable'

type BooleanOption = {
    label: string
    value: boolean
}

type FeatureOption = {
    label: string
    value: string
}

const validationSchema: ZodType<LicensePricingFormSchema> = z.object({
    price: z.coerce.number().min(1, 'Price is required'),
    period_months: z.coerce.number().min(1, 'Period months is required'),
    setup_fee: z.coerce.number().optional(),
    is_active: z.boolean(),
    max_devices: z.coerce.number().nullable(),
    max_users: z.coerce.number().nullable(),
    included_features: z.array(z.string()).min(1, 'Included features is required'),
    excluded_features: z.array(z.string()).min(1, 'Excluded features is required'),
})

type LicenseEditProps = {
    licenseId: number
    data: LicensePricingDetail['data']  
}

const LicenseEdit = ({ licenseId, data }: LicenseEditProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateLicensePricingDetails(licenseId)
    
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<LicensePricingFormSchema>({
        defaultValues: {
            price: Number(data?.price) ?? 1,
            period_months: Number(data?.period_months) ?? 1,
            setup_fee: Number(data?.setup_fee) ?? 1,
            is_active: data?.is_active ?? true,
            max_devices: data?.max_devices ?? null,
            max_users: data?.max_users ?? null,
            included_features: data?.included_features ?? [],
            excluded_features: data?.excluded_features ?? [],
        },
        resolver: zodResolver(validationSchema),
        mode: 'onTouched'
    })

    const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(
            <Notification type='success'>Changes discarded!</Notification>,
            { placement: 'top-center' },
        )
        router.push(`/dashboard/license-pricing/details/${licenseId}`)
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    const onSubmit = async (values: LicensePricingFormSchema) => {
        await mutate(values, {
            onSuccess: (response) => {
                toast.push(
                    <Notification type='success'>{response.message}</Notification>,
                    { placement: 'top-center' },
                )
                router.push(`/dashboard/license-pricing/details/${licenseId}`)
            }, 
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to update license details') 
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
                                <h4 className='mb-6'>Edit license details</h4>
                                <div className='grid md:grid-cols-3 gap-4'>
                                    <FormItem label='Price' invalid={Boolean(errors.price)} errorMessage={errors.price?.message}>
                                        <Controller 
                                            name='price'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='number'
                                                    autoComplete='off'
                                                    placeholder='Enter price'
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem label='Period months' invalid={Boolean(errors.period_months)} errorMessage={errors.period_months?.message}>
                                        <Controller 
                                            name='period_months'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='number'
                                                    autoComplete='off'
                                                    placeholder='Enter period months'
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem label='Setup fee' invalid={Boolean(errors.setup_fee)} errorMessage={errors.setup_fee?.message}>
                                        <Controller 
                                            name='setup_fee'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='number'
                                                    autoComplete='off'
                                                    placeholder='Enter setup fee'
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem  className='w-full' label='Status' invalid={Boolean(errors.is_active)} errorMessage={errors.is_active?.message}>
                                        <Controller
                                            name='is_active'
                                            control={control}
                                            render={({ field }) => (
                                                <Select<BooleanOption> 
                                                    className='w-full'
                                                    placeholder=''
                                                    value={[{label:'Active', value:true},{label:'In Active', value:false}].find((option) => option.value === field.value) ?? null}
                                                    onChange={(option) => field.onChange(option?.value)}
                                                    options={[{label:'Active', value:true},{label:'In Active', value:false}]}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem label='Max devices' invalid={Boolean(errors.max_devices)} errorMessage={errors.max_devices?.message}>
                                        <Controller 
                                            name='max_devices'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='number'
                                                    autoComplete='off'
                                                    placeholder='Enter max devices'
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const n = (e.currentTarget as HTMLInputElement).valueAsNumber
                                                        field.onChange(Number.isNaN(n) ? null : n)
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem label='Max users' invalid={Boolean(errors.max_users)} errorMessage={errors.max_users?.message}>
                                        <Controller 
                                            name='max_users'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='number'
                                                    autoComplete='off'
                                                    placeholder='Enter max users'
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const n = (e.currentTarget as HTMLInputElement).valueAsNumber
                                                        field.onChange(Number.isNaN(n) ? null : n)
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </div>
                                <div className='grid md:grid-cols-2 gap-4'>
                                    <FormItem  className='w-full' label='Included features' invalid={Boolean(errors.included_features)} errorMessage={errors.included_features?.message}>
                                        <Controller
                                            name='included_features'
                                            control={control}
                                            render={({ field }) => (
                                                <Select<FeatureOption, true> 
                                                    componentAs={CreatableSelect}
                                                    isMulti
                                                    className='w-full'
                                                    placeholder='Type and press enter to add'
                                                    value={(field.value ?? []).map((v) => ({ label: v, value: v }))}
                                                    onChange={(options) => field.onChange((options ?? []).map((o) => o.value))}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem  className='w-full' label='Excluded features' invalid={Boolean(errors.excluded_features)} errorMessage={errors.excluded_features?.message}>
                                        <Controller
                                            name='excluded_features'
                                            control={control}
                                            render={({ field }) => (
                                                <Select<FeatureOption, true> 
                                                    componentAs={CreatableSelect}
                                                    isMulti
                                                    className='w-full'
                                                    placeholder='Type and press enter to add'
                                                    value={(field.value ?? []).map((v) => ({ label: v, value: v }))}
                                                    onChange={(options) => field.onChange((options ?? []).map((o) => o.value))}
                                                />
                                            )}
                                        />
                                    </FormItem>
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

export default LicenseEdit


