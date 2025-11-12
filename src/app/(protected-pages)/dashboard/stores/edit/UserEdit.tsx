'use client'

import { useState, useMemo  } from 'react'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
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
import { UserFormSchema } from '../types'
import NumericInput from '@/components/shared/NumericInput'
import { countryList } from '@/constants/countries.constant'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'
import { useUpdateUserDetails } from '@/hooks/features/user-management/userManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

type SelectOption = {
    label: string
    value: boolean
}

const { Control } = components

const CustomSelectOption = (props: OptionProps<CountryOption>) => {
    return (
        <DefaultOption<CountryOption>
            {...props}
            customLabel={(data) => (
                <span className='flex items-center gap-2'>
                    <Avatar
                        shape='circle'
                        size={20}
                        src={`/img/countries/${data.value}.png`}
                    />
                    <span>{data.dialCode}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<CountryOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className='ltr:ml-4 rtl:mr-4'
                    shape='circle'
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </Control>
    )
}

const validationSchema: ZodType<UserFormSchema> = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z
        .string()
        .min(1, { message: 'Email required' })
        .email('Invalid email address'),
    dialCode: z.string().optional().or(z.string().length(0)),
    phone: z.string().optional().or(z.string().length(0)),
    is_active: z.boolean().optional(),
    is_admin: z.boolean().optional(),
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

const UserEdit = ({ userId, data }: UserEditProps) => {
    const router = useRouter()

    const { mutate, isPending } = useUpdateUserDetails(userId)

    // Normalize phone input and split into dial code and local number
    const splitPhone = (value?: string): { dialCode: string; number: string } => {
        const raw = (value ?? '').replace(/\s+/g, '')
        const strict = raw.match(/^(\+\d{1,4})(\d+)$/)
        if (strict) {
            return { dialCode: strict[1], number: strict[2] }
        }
        if (raw.startsWith('+')) {
            const fallback = raw.match(/^\+(\d{1,4})(.*)$/)
            if (fallback) {
                return {
                    dialCode: `+${fallback[1]}`,
                    number: (fallback[2] ?? '').replace(/\D/g, ''),
                }
            }
        }
        return { dialCode: '', number: raw.replace(/\D/g, '') }
    }

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<UserFormSchema>({
        defaultValues: {
            name: data?.name ?? '',
            email: data?.email ?? '',
            dialCode: splitPhone(data?.phone).dialCode,
            phone: splitPhone(data?.phone).number,
            is_active: data?.is_active ?? undefined,
            is_admin: data?.is_admin ?? undefined,
        },
        resolver: zodResolver(validationSchema),
        mode: 'onTouched'
    })

    const dialCodeList = useMemo(() => {
        const newCountryList: Array<CountryOption> = JSON.parse(
            JSON.stringify(countryList),
        )

        return newCountryList.map((country) => {
            country.label = country.dialCode
            return country
        })
    }, [])

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

    const isAdminList: Array<SelectOption> = [
        {
            label: 'Yes',
            value: true,
        },
        {
            label: 'No',
            value: false,
        },
    ]

    const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(
            <Notification type='success'>User discarded!</Notification>,
            { placement: 'top-center' },
        )
        router.push(`/dashboard/administration/user-management/details/${userId}`)
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    const onSubmit = async (values: UserFormSchema) => {
        const fullPhone = `${values.dialCode ?? ''}${values.phone ?? ''}`
            .replace(/\s+/g, '')
            .trim()

        const payload = {
            name: values.name,
            email: values.email,
            ...(values.password && values.password.trim().length > 0
                ? { password: values.password.trim() }
                : {}),
            ...(fullPhone.length > 0 ? { phone: fullPhone } : {}),
            ...(typeof values.is_admin === 'boolean'
                ? { is_admin: values.is_admin }
                : {}),
            ...(typeof values.is_active === 'boolean'
                ? { is_active: values.is_active }
                : {}),
        }

        await mutate(payload, {
            onSuccess: (response) => {
                toast.push(
                    <Notification type='success'>{response.message}</Notification>,
                    { placement: 'top-center' },
                )
                router.push(`/dashboard/administration/user-management/details/${userId}`)
            }, 
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to update user details')
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
                                <h4 className='mb-6'>Edit user details</h4>
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
                                    <FormItem label='Email' invalid={Boolean(errors.email)} errorMessage={errors.email?.message}>
                                        <Controller 
                                            name='email'
                                            control={control}
                                            render={({ field }) => (
                                                <Input 
                                                    type='email'
                                                    autoComplete='off'
                                                    placeholder='Enter email'
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <div className='flex items-end gap-4 w-full'>
                                        <FormItem
                                            invalid={
                                                Boolean(errors.phone) || Boolean(errors.dialCode)
                                            }
                                        >
                                            <label className='form-label mb-2'>Phone number</label>
                                            <Controller
                                                name='dialCode'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select<CountryOption>
                                                        instanceId='dial-code'
                                                        options={dialCodeList}
                                                        {...field}
                                                        className='w-[150px]'
                                                        getOptionValue={(opt) => opt.dialCode.replace(/\s+/g, '')}
                                                        getOptionLabel={(opt) => opt.dialCode}
                                                        components={{
                                                            Option: CustomSelectOption,
                                                            Control: CustomControl,
                                                        }}
                                                        placeholder=''
                                                        value={
                                                            dialCodeList.find(
                                                                (option) =>
                                                                    option.dialCode.replace(/\s+/g, '') ===
                                                                    String(field.value ?? '').replace(/\s+/g, ''),
                                                            ) || null
                                                        }
                                                        onChange={(option) =>
                                                            field.onChange(
                                                                option?.dialCode
                                                                    ? option.dialCode.replace(/\s+/g, '')
                                                                    : '',
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                        <FormItem
                                            className='w-full'
                                            invalid={
                                                Boolean(errors.phone) || Boolean(errors.dialCode)
                                            }
                                            errorMessage={errors.phone?.message}
                                        >
                                            <Controller
                                                name='phone'
                                                control={control}
                                            render={({ field }) => (
                                                <NumericInput
                                                    autoComplete='off'
                                                    placeholder='Phone Number'
                                                    value={field.value ?? ''}
                                                    allowLeadingZeros
                                                    valueIsNumericString
                                                    isAllowed={(values) => /^\d*$/.test(values.value)}
                                                    onValueChange={(values) =>
                                                        field.onChange(values.value)
                                                    }
                                                    onBlur={field.onBlur}
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    </div>
                                    <div className='flex items-end gap-4 w-full'>
                                        <FormItem  
                                            invalid={
                                                Boolean(errors.is_active) || Boolean(errors.is_active)
                                            }
                                            className='w-full'
                                        >
                                            <label className='form-label mb-2'>Is Active</label>
                                            <Controller
                                                name='is_active'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select<SelectOption> 
                                                        options={activeList}
                                                        {...field}
                                                        className='w-full'
                                                        placeholder=''
                                                        value={activeList.filter(
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
                                    <div className='flex items-end gap-4 w-full'>
                                        <FormItem  
                                            invalid={
                                                Boolean(errors.is_admin) || Boolean(errors.is_admin)
                                            }
                                            className='w-full'
                                        >
                                            <label className='form-label mb-2'>Is Admin</label>
                                            <Controller
                                                name='is_admin'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select<SelectOption> 
                                                        options={isAdminList}
                                                        {...field}
                                                        className='w-full'
                                                        placeholder=''
                                                        value={isAdminList.filter(
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

export default UserEdit


