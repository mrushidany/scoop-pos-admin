'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import { useRetrieveListOfUsers } from '@/hooks/features/user-management/userManagementApi'
import UserListActionTools from './_components/UserListActionTools'
import UserListTableTools from './_components/UserListTableTools'
import UserListTable from './_components/UserListTable'

export default function UsersPage() {
  const { data, isLoading } = useRetrieveListOfUsers()

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
            <UserListTable 
              users={data?.data || []} 
              initialLoading={isLoading}
              userListTotal={data?.total || 0} 
              pageIndex={data?.current_page || 1}
              pageSize={data?.per_page || 10}
            />
          </div>
        </AdaptiveCard>
      </Container>
    </>
  )
}
