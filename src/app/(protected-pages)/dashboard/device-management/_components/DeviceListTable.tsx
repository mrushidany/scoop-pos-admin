'use client'

import { useMemo, useState } from 'react'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@/components/shared/DataTable'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Input from '@/components/ui/Input'
import { TbEye, TbTrash } from 'react-icons/tb'
import { getApiErrorMessage } from '@/utils/apiError'
import { useRevokeDevice } from '@/hooks/features/device-management/deviceManagementApi'
import Tag from '@/components/ui/Tag'
import { DeviceDetails } from '../types'
import formatLabel from '@/utils/formatLabel'

const statusColor: Record<string, string> = {
  active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
  blocked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

type Device = {
  device_id: number
  device_uid: string
  name: string
  platform: string
  is_active: boolean
  is_online: boolean
  store: { store_id: string; store_name: string }
}

type DeviceListTableProps = {
  devices: DeviceDetails['data']['data']
  initialLoading: boolean
  deviceListTotal: number
  pageIndex?: number
  pageSize?: number
  onRefetch?: () => Promise<unknown> | void
}

const ActionColumn = ({
  onViewDetail,
  onRevoke,
}: {
  onViewDetail: () => void
  onRevoke: () => void
}) => {
  return (
    <div className='flex items-center gap-3'>
      <Tooltip title='View'>
        <div
          className='text-xl cursor-pointer select-none font-semibold'
          role='button'
          onClick={onViewDetail}
        >
          <TbEye />
        </div>
      </Tooltip>
      <Tooltip title='Revoke'>
        <div
          className='text-xl cursor-pointer select-none font-semibold text-red-600'
          role='button'
          onClick={onRevoke}
        >
          <TbTrash />
        </div>
      </Tooltip>
    </div>
  )
}

const DeviceListTable = ({
  devices,
  deviceListTotal,
  initialLoading,
  pageIndex = 1,
  pageSize = 10,
  onRefetch,
}: DeviceListTableProps) => {
  const router = useRouter()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [revokeReason, setRevokeReason] = useState('')

  const selectedId = selectedDevice?.device_id ?? 0
  const { mutate, isPending } = useRevokeDevice(selectedId)

  const handleViewDetails = (device: Device) => {
    router.push(`/dashboard/device-management/details/${device.device_id}`)
  }

  const handleRevokeOpen = (device: Device) => {
    setSelectedDevice(device)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setRevokeReason('')
  }

  const handleRevoke = async () => {
    if (!selectedDevice) return
    await mutate(
      { reason: revokeReason || 'Revoked by admin' },
      {
        onSuccess: () => {
          toast.push(
            <Notification type='success' title='Device revoked'>
              {selectedDevice.name} has been revoked successfully.
            </Notification>,
            { placement: 'top-center' },
          )
          handleDialogClose()
          onRefetch?.()
        },
        onError: (error) => {
          const message = getApiErrorMessage(error, 'Failed to revoke device')
          toast.push(<Notification type='danger'>{message}</Notification>, {
            placement: 'top-center',
          })
        },
      },
    )
  }

  const columns: ColumnDef<Device>[] = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Platform',
        accessorKey: 'platform',
        cell: (props) => {
            const platform = props.row.original.platform
            return (
                <span className='capitalize'>{formatLabel(platform)}</span>
            )
        },
      },
      {
        header: 'Store',
        accessorKey: 'store.store_name',
        cell: (props) => props.row.original.store?.store_name,
      },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: (props) => {
          const active = props.row.original.is_active
          return (
            <Tag className={statusColor[active ? 'active' : 'blocked']}>
              <span className='capitalize'>{active ? 'Active' : 'Blocked'}</span>
            </Tag>
          )
        },
      },
      {
        header: 'Online',
        accessorKey: 'is_online',
        cell: (props) => {
          const online = props.row.original.is_online
          return (
            <Tag className={statusColor[online ? 'active' : 'blocked']}>
              <span className='capitalize'>{formatLabel(online ? 'Online' : 'Offline')}</span>
            </Tag>
          )
        },
      },
      {
        header: '',
        id: 'action',
        cell: (props) => (
          <ActionColumn
            onViewDetail={() => handleViewDetails(props.row.original)}
            onRevoke={() => handleRevokeOpen(props.row.original)}
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
        data={devices}
        loading={initialLoading}
        pagingData={{
          total: deviceListTotal,
          pageIndex,
          pageSize,
        }}
        onPaginationChange={handlePaginationChange}
      />
      <ConfirmDialog
        isOpen={dialogOpen}
        type='danger'
        title='Revoke device'
        onClose={handleDialogClose}
        onRequestClose={handleDialogClose}
        onCancel={handleDialogClose}
        onConfirm={handleRevoke}
        confirmButtonProps={{ loading: isPending, disabled: isPending }}
      >
        <div className='flex flex-col gap-3'>
          <p>
            Are you sure you want to revoke{' '}
            <span className='font-bold'>{selectedDevice?.name}</span>?
          </p>
          <Input
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder='Reason (optional)'
          />
        </div>
      </ConfirmDialog>
    </>
  )
}

export default DeviceListTable