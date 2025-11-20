'use client'

import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import DeviceListSearch from './DeviceListSearch'

const DeviceListTableTools = () => {
  const { onAppendQueryParams } = useAppendQueryParams()

  const handleInputChange = (query: string) => {
    onAppendQueryParams({ query })
  }

  return (
    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
      <DeviceListSearch onInputChange={handleInputChange} />
    </div>
  )
}

export default DeviceListTableTools