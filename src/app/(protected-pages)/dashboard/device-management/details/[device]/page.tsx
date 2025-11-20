'use client'

import { use } from 'react'
import NoUserFound from '@/assets/svg/NoUserFound'
import { getApiErrorMessage } from '@/utils/apiError'
import Loading from '@/components/shared/Loading'
import isEmpty from 'lodash/isEmpty'
import { useRetrieveDeviceDetails } from '@/hooks/features/device-management/deviceManagementApi'
import DeviceDetails from '../../_components/DeviceDetails'

export default function Page({ params }: { params: Promise<{ device: number }> }) {
  const resolvedParams = use(params)
  const { device } = resolvedParams

  const { data, isLoading, error } = useRetrieveDeviceDetails(device)

  if (error || isEmpty(data)) {
    return (
      <div className='h-full flex flex-col items-center justify-center'>
        <NoUserFound height={280} width={280} />
        <h2 className='mt-4'>{Boolean(error) ? 'Error loading device!' : 'No device found!'}</h2>
        {Boolean(error) && (
          <p className='text-red-500 mt-2'>{getApiErrorMessage(error)}</p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <Loading type='default' loading={isLoading} />
  }

  const raw = data?.data
  const deviceData = Array.isArray(raw) ? raw[0] : raw

  return <DeviceDetails data={deviceData} />
}