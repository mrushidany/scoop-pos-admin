'use client'

import Button from '@/components/ui/Button'
import { BiPlusCircle } from 'react-icons/bi'
import { useRouter } from 'next/navigation'

export default function StoreListActionTools() {
    const router = useRouter()
  return (
    <div>
      <Button 
        variant='solid' 
        icon={<BiPlusCircle className='text-xl' />} 
        onClick={() => router.push('/dashboard/stores/create')}
    >
        Create new store
      </Button>
    </div>
  )
}
