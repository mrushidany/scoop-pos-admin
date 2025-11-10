'use client'

import { useMemo } from 'react'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TbPencil, TbEye, TbTrash } from 'react-icons/tb'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { User } from '../types'

type UserListTableProps = {
    users: User[]
    initialLoading: boolean
    userListTotal: number
    pageIndex?: number
    pageSize?: number
}

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const NameColumn = ({ row }: { row: User }) => {
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
    onDelete,
}: {
    onEdit: () => void
    onViewDetail: () => void
    onDelete: () => void
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
            <Tooltip title='Delete'>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role='button'
                    onClick={onDelete}
                >
                    <TbTrash />
                </div>
            </Tooltip>
        </div>
    )
}

const UserListTable = ({
    users,
    userListTotal,
    initialLoading,
    pageIndex = 1,
    pageSize = 10,
}: UserListTableProps) => {
    const router = useRouter()

    const { onAppendQueryParams } = useAppendQueryParams()

    const handleEdit = (user: User) => {
        router.push(`/dashboard/administration/user-management/edit/${user.id}`)
    }

    const handleViewDetails = (user: User) => {
        router.push(`/dashboard/administration/user-management/details/${user.id}`)
    }
    
    const handleDelete = async (user: User) => {
        void user
    }

    const columns: ColumnDef<User>[] = useMemo(
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
                header: 'Email',
                accessorKey: 'email',
            },
            {
                header: 'phone',
                accessorKey: 'phone',
            },
            {
                header: 'User type',
                accessorKey: 'is_admin',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className='flex items-center'>
                            <Tag className={statusColor[row.is_admin ? 'active' : 'blocked']}>
                                <span className='capitalize'>{row.is_admin ? 'Admin' : 'User'}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: 'Activity',
                accessorKey: 'is_active',
                cell: (props) => {
                    return <Tag className={statusColor[props.row.original.is_active ? 'active' : 'blocked']}>
                                <span className='capitalize'>{props.row.original.is_active ? 'Active' : 'Blocked'}</span>
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
                        onDelete={() => handleDelete(props.row.original)}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const handlePaginationChange = (page: number) => {
        onAppendQueryParams({
            pageIndex: String(page),
        })
    }

    return (
        <DataTable
            columns={columns}
            data={users}
            loading={initialLoading}
            pagingData={{
                total: userListTotal,
                pageIndex,
                pageSize,
            }}
            onPaginationChange={handlePaginationChange}
            
        />
    )
}

export default UserListTable
