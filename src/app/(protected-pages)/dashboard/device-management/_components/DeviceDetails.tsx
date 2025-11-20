'use client'

import Card from '@/components/ui/Card'
import Tooltip from '@/components/ui/Tooltip'
import { PiDevicesLight } from 'react-icons/pi'
import { TbTrash } from 'react-icons/tb'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Input from '@/components/ui/Input'
import { useRevokeDevice } from '@/hooks/features/device-management/deviceManagementApi'
import Container from '@/components/shared/Container'
import BottomStickyBar from '@/components/template/BottomStickyBar'
import { getApiErrorMessage } from '@/utils/apiError'

type Device = {
  device_id: number
  device_uid: string
  name: string
  platform: string
  store?: { store_id: string; store_name: string }
}

const DeviceDetails = ({ data }: { data: Device }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')
  const { mutate, isPending } = useRevokeDevice(data.device_id)

  const handleDialogOpen = () => setDialogOpen(true)
  const handleDialogClose = () => {
    setDialogOpen(false)
    setRevokeReason('')
  }

  const handleRevoke = async () => {
    await mutate(
      { reason: revokeReason || 'Revoked by admin' },
      {
        onSuccess: () => {
          toast.push(
            <Notification type='success' title='Device revoked'>
              {data.name} has been revoked successfully.
            </Notification>,
            { placement: 'top-center' },
          )
          handleDialogClose()
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

  return (
    <div className='flex flex-col xl:flex-row gap-4'>
      <div className='min-w-[330px] 2xl:min-w-[400px]'>
        <Card className='w-full'>
          <div className='flex justify-end'>
            <Tooltip title='Revoke device'>
              <button
                className='close-button button-press-feedback text-red-600'
                type='button'
                onClick={handleDialogOpen}
              >
                <TbTrash />
              </button>
            </Tooltip>
          </div>
          <div className='flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto'>
            <div className='flex xl:flex-col items-center gap-4 mt-6'>
              <div className='flex items-center justify-center w-[90px] h-[90px] rounded-full bg-gray-100'>
                <PiDevicesLight className='text-3xl' />
              </div>
              <h4 className='font-bold'>{data.name}</h4>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-10'>
              <div>
                <span className='font-semibold'>UID</span>
                <p className='heading-text font-bold'>{data.device_uid}</p>
              </div>
              <div>
                <span className='font-semibold'>Platform</span>
                <p className='heading-text font-bold capitalize'>{data.platform}</p>
              </div>
              <div>
                <span className='font-semibold'>Store</span>
                <p className='heading-text font-bold'>{data.store?.store_name}</p>
              </div>
            </div>
          </div>
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
                <span className='font-bold'>{data.name}</span>? This action cannot be undone.
              </p>
              <Input
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder='Reason (optional)'
              />
            </div>
          </ConfirmDialog>
        </Card>
      </div>
      <Card className='w-full'>
        <BottomStickyBar>
          <Container>
            <div className='grid grid-cols-2 gap-4'>
              <div />
              <div className='flex justify-end'>
                <Button
                  customColorClass={() =>
                    'text-error hover:border-error hover:ring-1 ring-error hover:text-error'
                  }
                  icon={<TbTrash />}
                  disabled={isPending}
                  onClick={handleDialogOpen}
                >
                  Revoke
                </Button>
              </div>
            </div>
          </Container>
        </BottomStickyBar>
      </Card>
    </div>
  )
}

export default DeviceDetails