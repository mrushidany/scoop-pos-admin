'use client'

import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { Ref } from 'react'

type DeviceListSearchProps = {
  onInputChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
}

const DeviceListSearch = ({ onInputChange, ref }: DeviceListSearchProps) => {
  return (
    <DebouceInput
      ref={ref}
      placeholder='Search devices...'
      suffix={<TbSearch className='text-lg' />}
      onChange={(e) => onInputChange(e.target.value)}
    />
  )
}

export default DeviceListSearch