'use client'

import { useState, useMemo  } from 'react'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/shared/PasswordInput'
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
import { useCreateUser } from '@/hooks/features/user-management/userManagementApi'
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
    email: z.string().min(1, { message: 'Email required' }).email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    dialCode: z.string().min(1, { message: 'Please select your country code' }),
    phone: z
        .string()
        .min(1, { message: 'Please input your mobile number' }),
    is_active: z.boolean(),
    is_admin: z.boolean(),
})

const UserEdit = () => {
    const router = useRouter()

    const { mutate, isPending } = useCreateUser()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<UserFormSchema>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            is_active: true,
            is_admin: false,
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
        router.push('/dashboard/administration/user-management')
    }

    const handleDiscard = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    const onSubmit = async (values: UserFormSchema) => {
        const fullPhone = `${values.dialCode}${values.phone}`.replace(/\s+/g, '')

        const payload: UserFormSchema = {
            ...values,
            phone: fullPhone,
        }

        await mutate(payload, {
            onSuccess: (response) => {
                toast.push(
                    <Notification type='success'>{response.message}</Notification>,
                    { placement: 'top-center' },
                )
                router.push('/dashboard/administration/user-management')
            }, 
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to create user')
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
                                <h4 className='mb-6'>User details</h4>
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
                                                        components={{
                                                            Option: CustomSelectOption,
                                                            Control: CustomControl,
                                                        }}
                                                        placeholder=''
                                                        value={dialCodeList.filter(
                                                            (option) => option.dialCode === field.value,
                                                        )}
                                                        onChange={(option) =>
                                                            field.onChange(option?.dialCode)
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
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onBlur={field.onBlur}
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </div>
                                    <FormItem label='Password' invalid={Boolean(errors.password)} errorMessage={errors.password?.message}>
                                        <Controller 
                                            name='password'
                                            control={control}
                                            render={({ field }) => (
                                                <PasswordInput 
                                                    autoComplete='off'
                                                    placeholder='Enter password'
                                                    {...field}
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

export default UserEdit


