'use client'

import { useMemo, useState } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TbPencil, TbEye, TbTrash } from 'react-icons/tb'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { Store } from '../types'
import { useDeleteStore, useRetrieveListOfStores } from '@/hooks/features/stores-management/storeManagementApi'
import { getApiErrorMessage } from '@/utils/apiError'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type StoreListTableProps = {
    stores: Store[]
    initialLoading: boolean
    storeListTotal: number
    pageIndex?: number
    pageSize?: number
}

const NameColumn = ({ row }: { row: Store }) => {
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

const StoreListTable = ({
    stores,
    storeListTotal,
    initialLoading,
    pageIndex = 1,
    pageSize = 10,
}: StoreListTableProps) => {
    const router = useRouter()

    const { refetch } = useRetrieveListOfStores()
    const { mutate: deleteStore, isPending } = useDeleteStore()
    
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedStore, setSelectedStore] = useState<Store | null>(null)

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = (store: Store) => {
        setSelectedStore(store)
        setDialogOpen(true)
    }

    const handleEdit = (store: Store) => {
        router.push(`/dashboard/stores/edit/${store.id}`)
    }

    const handleViewDetails = (store: Store) => {
        router.push(`/dashboard/stores/details/${store.id}`)
    }
    
    const handleDelete = async (store: Store) => {
        await deleteStore(store.id, {
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

    const columns: ColumnDef<Store>[] = useMemo(
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
                header: 'Store type',
                accessorKey: 'store_type_string',
            },
            {
                header: 'License type',
                accessorKey: 'license_type',
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
                data={stores}
                loading={initialLoading}
                pagingData={{
                    total: storeListTotal,
                    pageIndex,
                    pageSize,
                }}
                onPaginationChange={handlePaginationChange}
                
            />
            <ConfirmDialog
                isOpen={dialogOpen}
                type='danger'
                title='Delete user'
                onClose={handleDialogClose}
                onRequestClose={handleDialogClose}
                onCancel={handleDialogClose}
                onConfirm={() => selectedStore && handleDelete(selectedStore)}
                confirmButtonProps={{ loading: isPending, disabled: isPending }}
            >
                <p>
                    Are you sure you want to delete <span className='font-bold'>{selectedStore?.name}</span>? All
                    record related to this store will be deleted as well.   
                    This action cannot be undone.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default StoreListTable
