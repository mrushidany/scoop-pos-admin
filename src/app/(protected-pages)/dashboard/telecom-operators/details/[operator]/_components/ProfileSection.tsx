'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar/Avatar'
import Notification from '@/components/ui/Notification'
import Tooltip from '@/components/ui/Tooltip'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPencil, HiOutlineTrash } from 'react-icons/hi'
import { GiNetworkBars } from 'react-icons/gi'
import { useRouter } from 'next/navigation'
import { TelecomOperatorDetails } from '../../../types'
import { useDeleteOperator } from '@/hooks/features/telecom-operators-management/telecomOperatorsManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'
import Tag from '@/components/ui/Tag'

type TelecomOperatorInfoFieldProps = {
    title?: string
    value?: string | boolean
    type?: string
}

type ProfileSectionProps = {
    data: TelecomOperatorDetails
}

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const TelecomOperatorInfoField = ({ title, value }: TelecomOperatorInfoFieldProps) => {
    return (
        <div>
            <span className='font-semibold'>{title}</span>
            <p className='heading-text font-bold'>{value}</p>
        </div>
    )
}

const TelecomOperatorInfoWithStatusField = ({ title, value }: TelecomOperatorInfoFieldProps) => { 
    const tagText = value ? 'Active' : 'In Active'
    const tagColorKey = value ? 'active' : 'blocked'

    return (
        <div>
            <span className='font-semibold'>{title}</span>
            <div className='flex items-center'>
                <Tag className={statusColor[tagColorKey]}>
                    <span className='capitalize'>{tagText}</span>
                </Tag>
            </div>
        </div>
    )
}

const avatarProps = {
    icon: <GiNetworkBars />
}

const ProfileSection = ({ data }: ProfileSectionProps) => {
    console.log('What is the data here in the profile section : ', data)
    const router = useRouter()
        
    const { mutate: deleteOperator, isPending } = useDeleteOperator()

    const [dialogOpen, setDialogOpen] = useState(false)

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = () => {
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!data.operator?.id) return
        await deleteOperator(data.operator.id, {
            onSuccess: (response) => {
                toast.push(
                    <Notification title={'Successfully Deleted'} type='success'>
                       {response.message}
                    </Notification>,
                )
                setDialogOpen(false)
                router.push('/dashboard/telecom-operators')
            },
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to delete store')
                toast.push(
                    <Notification type='danger'>{message}</Notification>,
                    { placement: 'top-center' },
                )
            }
        })
    }

    const handleEdit = () => {
        router.push(`/dashboard/telecom-operators/edit/${data.operator?.id}`)
    }

    return (
        <Card className='w-full'>
            <div className='flex justify-end'>
                <Tooltip title='Edit telecom operator'>
                    <button
                        className='close-button button-press-feedback'
                        type='button'
                        onClick={handleEdit}
                    >
                        <HiPencil />
                    </button>
                </Tooltip>
            </div>
            <div className='flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto'>
                <div className='flex xl:flex-col items-center gap-4 mt-6'>
                    <Avatar size={90} shape='circle' {...avatarProps} />
                    <h4 className='font-bold'>{data.operator?.name}</h4>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-10'>
                    <TelecomOperatorInfoField title='Number series' value={String(data.operator?.number_series)} />
                    <TelecomOperatorInfoWithStatusField title='Status' value={data.operator?.is_active} />
                </div>
                <div className='flex flex-col gap-4 mt-7'>
                    <Button
                        block
                        customColorClass={() =>
                            'text-error hover:border-error hover:ring-1 ring-error hover:text-error'
                        }
                        icon={<HiOutlineTrash />}
                        disabled={isPending}
                        onClick={handleDialogOpen}
                    >
                        Delete
                    </Button>
                </div>
                <ConfirmDialog
                    isOpen={dialogOpen}
                    type='danger'
                    title='Delete operator'
                    onClose={handleDialogClose}
                    onRequestClose={handleDialogClose}
                    onCancel={handleDialogClose}
                    onConfirm={handleDelete}
                    confirmButtonProps={{ loading: isPending, disabled: isPending }}
                >
                    <p>
                        Are you sure you want to delete <span className='font-bold'>{data.operator?.name}</span>? All
                        record related to this user will be deleted as well.
                        This action cannot be undone.
                    </p>
                </ConfirmDialog>
            </div>
        </Card>
    )
}

export default ProfileSection
