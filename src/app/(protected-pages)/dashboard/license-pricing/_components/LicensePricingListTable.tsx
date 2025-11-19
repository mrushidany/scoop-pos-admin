'use client'

import { useMemo } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TbPencil, TbEye } from 'react-icons/tb'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { LicensePricingDetails } from '../types'
import Tag from '@/components/ui/Tag'

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

type LicensePricingListTableProps = {
    licensePricing: LicensePricingDetails[]
    initialLoading: boolean
    licensePricingListTotal: number
    pageIndex?: number
    pageSize?: number
}

const NameColumn = ({ row }: { row: LicensePricingDetails }) => {           
    return (
        <div className='flex items-center'>
            <Link
                className={`hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100`}
                href={`#`}
            >
                {row.name}
            </Link>
        </div>
    )
}

const ActionColumn = ({
    onEdit,
    onViewDetail,
    }: {
    onEdit: () => void
    onViewDetail: () => void
}) => {
    return (
        <div className='flex items-center gap-3'>
            <Tooltip title='Edit'>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role='button'
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <Tooltip title='View'>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role='button'
                    onClick={onViewDetail}
                >
                    <TbEye />
                </div>
            </Tooltip>
        </div>
    )
}

const LicensePricingListTable = ({
    licensePricing,
    licensePricingListTotal,
    initialLoading,
    pageIndex = 1,
    pageSize = 10,
}: LicensePricingListTableProps) => {   
    const router = useRouter()

    const handleEdit = (licensePricing: LicensePricingDetails) => {
        router.push(`/dashboard/license-pricing/edit/${licensePricing.id}`)
    }

    const handleViewDetails = (licensePricing: LicensePricingDetails) => {
        router.push(`/dashboard/license-pricing/details/${licensePricing.id}`)
    }
    
    const columns: ColumnDef<LicensePricingDetails>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <NameColumn row={row} />
                },
            },
            {
                header: 'License type',
                accessorKey: 'license_type',
            },
            {
                header: 'Price',
                accessorKey: 'price',
            },
            {
                header: 'Devices',
                accessorKey: 'max_devices',
            },
            {
                header: 'Users',
                accessorKey: 'max_users',
            },
            {
                header: 'Status',
                accessorKey: 'is_active',
                cell: (props) => {
                    return <Tag className={statusColor[props.row.original.is_active ? 'active' : 'blocked']}>
                                <span className='capitalize'>{props.row.original.is_active ? 'Active' : 'In Active'}</span>
                            </Tag>  
                },
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onViewDetail={() =>
                            handleViewDetails(props.row.original)
                        }
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handlePaginationChange = (page: number) => {
       void page
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={licensePricing}
                loading={initialLoading}
                pagingData={{
                    total: licensePricingListTotal,
                    pageIndex,
                    pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                
            />
        </>
    )
}

export default LicensePricingListTable
