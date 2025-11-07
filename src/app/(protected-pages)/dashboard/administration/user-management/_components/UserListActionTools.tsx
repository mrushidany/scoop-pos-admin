'use client'

import Button from '@/components/ui/Button'
import { TbUserPlus } from 'react-icons/tb'

export default function UserListActionTools() {
  return (
    <div>
      <Button variant='solid' icon={<TbUserPlus className='text-xl' />}>
        Create new user
      </Button>
    </div>
  )
}
