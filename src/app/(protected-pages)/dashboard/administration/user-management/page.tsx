'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import { useRetrieveListOfUsers } from '@/hooks/features/user-management/userManagementApi'
import UserListActionTools from './_components/UserListActionTools'
import UserListTableTools from './_components/UserListTableTools'

export default function UsersPage() {
  const { data } = useRetrieveListOfUsers()

  console.log('What is the data here : ', data)
  return (
    <>
      <Container>
        <AdaptiveCard>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
              <h3>Users</h3>
              <UserListActionTools />
            </div>
            <UserListTableTools />
          </div>
        </AdaptiveCard>
      </Container>
    </>
  )
}
