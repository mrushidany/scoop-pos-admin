'use client'

import Button from '@/components/ui/Button'
import { TbUserPlus } from 'react-icons/tb'
import { useRouter } from 'next/navigation'

export default function UserListActionTools() {
    const router = useRouter()
  return (
    <div>
      <Button 
        variant='solid' 
        icon={<TbUserPlus className='text-xl' />} 
        onClick={() => router.push('/dashboard/administration/user-management/create')}
      >
        Create new user
      </Button>
    </div>
  )
}
