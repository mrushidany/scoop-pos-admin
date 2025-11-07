'use client'

import { useRetrieveListOfUsers } from '@/hooks/features/user-management/userManagementApi'

export default function UsersPage() {
  const { data } = useRetrieveListOfUsers()

  console.log('What is the data here : ', data)
  return (
    <div>
      
    </div>
  )
}
