'use client'

import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import { HiPencil } from 'react-icons/hi'
import { PiCertificate } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { LicensePricingDetail } from '../../../types'
import Tag from '@/components/ui/Tag'

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

type LicenseInfoFieldProps = {
    title?: string
    value?: string | boolean
    type?: string
}

type ProfileSectionProps = {
    data: LicensePricingDetail
}

const LicenseInfoField = ({ title, value }: LicenseInfoFieldProps) => {
    return (
        <div>
            <span className='font-semibold'>{title}</span>
            <p className='heading-text font-bold'>{value}</p>
        </div>
    )
}


const LicenseInfoWithStatusField = ({ title, value }: LicenseInfoFieldProps) => { 
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
    icon: <PiCertificate />
}

const ProfileSection = ({ data }: ProfileSectionProps) => {
    const router = useRouter()
 
    const handleEdit = () => {
        router.push(`/dashboard/license-pricing/edit/${data.data?.id}`)
    }

    return (
        <Card className='w-full'>
            <div className='flex justify-end'>
                <Tooltip title='Edit license pricing'>
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
                    <LicenseInfoField title='Max Devices' value={data.data?.max_devices?.toString()} />
                    <LicenseInfoField title='Max Users' value={data.data?.max_users?.toString()} />
                    <LicenseInfoField title='Period Months' value={data.data?.period_months?.toString()} />
                    <LicenseInfoField title='Price' value={data.data?.price?.toLocaleString('en-US', { style: 'currency', currency: 'TZS' })} />
                    <LicenseInfoField title='Setup fee' value={data.data?.setup_fee?.toLocaleString('en-US', { style: 'currency', currency: 'TZS' })} />
                    <LicenseInfoWithStatusField title='Status' value={data.data?.is_active} />
                </div>
            </div>
        </Card>
    )
}

export default ProfileSection
