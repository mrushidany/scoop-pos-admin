'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import { useRetrieveListOfDevices } from '@/hooks/features/device-management/deviceManagementApi'
import DeviceListTableTools from './_components/DeviceListTableTools'
import DeviceListTable from './_components/DeviceListTable'

export default function DeviceManagementPage() {
  const { data, isLoading, refetch } = useRetrieveListOfDevices()

  console.log('What is the data here my guy', data)

  return (
    <>
      <Container>
        <AdaptiveCard>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
              <h3>Devices Management</h3>
            </div>
            <DeviceListTableTools />
            <DeviceListTable 
              devices={data?.data?.data || []}
              initialLoading={isLoading}
              deviceListTotal={data?.data?.total || 0}
              pageIndex={1}
              pageSize={10}
              onRefetch={refetch}
            />
          </div>
        </AdaptiveCard>
      </Container>
    </>
  )
}
