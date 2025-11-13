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
import { PiStorefrontDuotone } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { StoreDetails } from '../../../types'
import { useDeleteStore } from '@/hooks/features/stores-management/storeManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'

type StoreInfoFieldProps = {
    title?: string
    value?: string
    type?: string
}

type ProfileSectionProps = {
    data: StoreDetails
}

const StoreInfoField = ({ title, value }: StoreInfoFieldProps) => {
    return (
        <div>
            <span className='font-semibold'>{title}</span>
            <p className='heading-text font-bold'>{value}</p>
        </div>
    )
}

const avatarProps = {
    icon: <PiStorefrontDuotone />
}

const ProfileSection = ({ data }: ProfileSectionProps) => {
    const router = useRouter()
        
    const { mutate: deleteStore, isPending } = useDeleteStore()

    const [dialogOpen, setDialogOpen] = useState(false)

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = () => {
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!data.data?.id) return
        await deleteStore(data.data.id, {
            onSuccess: (response) => {
                toast.push(
                    <Notification title={'Successfully Deleted'} type='success'>
                       {response.message}
                    </Notification>,
                )
                setDialogOpen(false)
                router.push('/dashboard/stores')
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
        router.push(`/dashboard/stores/edit/${data.data?.id}`)
    }

    return (
        <Card className='w-full'>
            <div className='flex justify-end'>
                <Tooltip title='Edit user'>
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
                    <h4 className='font-bold'>{data.data?.name}</h4>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-10'>
                    <StoreInfoField title='Store type' value={data.data?.store_type_string} />
                    <StoreInfoField
                        title='License type'
                        value={data.data?.license_type}
                    />
                    
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
                    title='Delete store'
                    onClose={handleDialogClose}
                    onRequestClose={handleDialogClose}
                    onCancel={handleDialogClose}
                    onConfirm={handleDelete}
                    confirmButtonProps={{ loading: isPending, disabled: isPending }}
                >
                    <p>
                        Are you sure you want to delete <span className='font-bold'>{data.data?.name}</span>? All
                        record related to this user will be deleted as well.
                        This action cannot be undone.
                    </p>
                </ConfirmDialog>
            </div>
        </Card>
    )
}

export default ProfileSection
