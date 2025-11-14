'use client'

import { useMemo, useState } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TbPencil, TbEye, TbTrash } from 'react-icons/tb'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { TelecomOperator } from '../types'
import { useRetrieveListOfTelecomOperators, useDeleteOperator } from '@/hooks/features/telecom-operators-management/telecomOperatorsManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Tag from '@/components/ui/Tag'

const statusColor: Record<string, string> = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

type OperatorListTableProps = {
    operators: TelecomOperator[]
    initialLoading: boolean
    OperatorListTotal: number
    pageIndex?: number
    pageSize?: number
}

const NameColumn = ({ row }: { row: TelecomOperator }) => {
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

const OperatorListTable = ({
    operators,
    OperatorListTotal,
    initialLoading,
    pageIndex = 1,
    pageSize = 10,
}: OperatorListTableProps) => {
    const router = useRouter()

    const { refetch } = useRetrieveListOfTelecomOperators()
    const { mutate: deleteOperator, isPending } = useDeleteOperator()
    
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOperator, setSelectedOperator] = useState<TelecomOperator | null>(null)

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = (operator: TelecomOperator) => {
        setSelectedOperator(operator)
        setDialogOpen(true)
    }

    const handleEdit = (operator: TelecomOperator) => {
        router.push(`/dashboard/telecom-operators/edit/${operator.id}`)
    }

    const handleViewDetails = (operator: TelecomOperator) => {
        router.push(`/dashboard/telecom-operators/details/${operator.id}`)
    }
    
    const handleDelete = async (operator: TelecomOperator) => {
        await deleteOperator(operator.id, {    
            onSuccess: (response) => {
                toast.push(
                    <Notification title={'Successfully Deleted'} type='success'>
                       {response.message}
                    </Notification>,
                )
                setDialogOpen(false)
                refetch()
            },
            onError: (error) => {
                const message = getApiErrorMessage(error, 'Failed to delete user')
                toast.push(
                    <Notification type='danger'>{message}</Notification>,
                    { placement: 'top-center' },
                )
            }
        })
    }

    const columns: ColumnDef<TelecomOperator>[] = useMemo(
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
                header: 'Status',
                accessorKey: 'is_active',
                cell: (props) => {
                    return <Tag className={statusColor[props.row.original.is_active ? 'active' : 'blocked']}>
                                <span className='capitalize'>{props.row.original.is_active ? 'Active' : 'In Active'}</span>
                            </Tag>  
                },
            },
            {
                header: 'Number series',
                accessorKey: 'number_series',
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
                        onDelete={() => handleDialogOpen(props.row.original)}
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
                data={operators}
                loading={initialLoading}
                pagingData={{
                    total: OperatorListTotal,
                    pageIndex,
                    pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                
            />
            <ConfirmDialog
                isOpen={dialogOpen}
                type='danger'
                title='Delete operator'
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
                onCancel={handleDialogClose}
                onConfirm={() => selectedOperator && handleDelete(selectedOperator)}
                confirmButtonProps={{ loading: isPending, disabled: isPending }}
            >
                <p>
                    Are you sure you want to delete <span className='font-bold'>{selectedOperator?.name}</span>? All
                    record related to this store will be deleted as well.   
                    This action cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default OperatorListTable
