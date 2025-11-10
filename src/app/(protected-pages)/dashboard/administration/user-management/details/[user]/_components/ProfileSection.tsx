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
import { PiUserDuotone } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { UserDetails } from '../../../types'
import Tag from '@/components/ui/Tag'

type UserInfoFieldProps = {
    title?: string
    value?: string
    type?: string
}

type ProfileSectionProps = {
    data: UserDetails
}

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const UserInfoField = ({ title, value }: UserInfoFieldProps) => {
    return (
        <div>
            <span className='font-semibold'>{title}</span>
            <p className='heading-text font-bold'>{value}</p>
        </div>
    )
}

const UserInfoWithStatusField = ({ title, value, type }: UserInfoFieldProps) => { 
    const normalized = (value ?? '').toLowerCase()
    const isPositive = normalized === 'yes' || normalized === 'true' || normalized === 'active'
    const tagText = type === 'admin' ? (isPositive ? 'Admin' : 'User') : (isPositive ? 'Active' : 'Blocked')
    const tagColorKey = isPositive ? 'active' : 'blocked'

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
    icon: <PiUserDuotone />
}

const ProfileSection = ({ data }: ProfileSectionProps) => {
    console.log('What is the data here : ', data)
    const router = useRouter()

    const [dialogOpen, setDialogOpen] = useState(false)

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = () => {
        setDialogOpen(true)
    }

    const handleDelete = () => {
        setDialogOpen(false)
        router.push('/concepts/customers/customer-list')
        toast.push(
            <Notification title={'Successfully Deleted'} type='success'>
                Customer successfuly deleted
            </Notification>,
        )
    }

    const handleEdit = () => {
        router.push(`/concepts/customers/customer-edit/${data.data?.id}`)
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
                    <UserInfoField title='Email' value={data.data?.email} />
                    <UserInfoField
                        title='Phone'
                        value={data.data?.phone}
                    />
                    <UserInfoWithStatusField
                        title='User Type'
                        type='admin'
                        value={data.data?.is_admin ? 'Yes' : 'No'}
                    />
                    <UserInfoWithStatusField
                        title='Active'
                        type='active'
                        value={data.data?.is_active ? 'Yes' : 'No'} 
                    />
                </div>
                <div className='flex flex-col gap-4 mt-7'>
                    <Button
                        block
                        customColorClass={() =>
                            'text-error hover:border-error hover:ring-1 ring-error hover:text-error'
                        }
                        icon={<HiOutlineTrash />}
                        onClick={handleDialogOpen}
                    >
                        Delete
                    </Button>
                </div>
                <ConfirmDialog
                    isOpen={dialogOpen}
                    type='danger'
                    title='Delete customer'
                    onClose={handleDialogClose}
                    onRequestClose={handleDialogClose}
                    onCancel={handleDialogClose}
                    onConfirm={handleDelete}
                >
                    <p>
                        Are you sure you want to delete this customer? All
                        record related to this customer will be deleted as well.
                        This action cannot be undone.
                    </p>
                </ConfirmDialog>
            </div>
        </Card>
    )
}

export default ProfileSection
