'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import { useRetrieveListOfStores } from '@/hooks/features/stores-management/storeManagementApi'
import StoreListActionTools from './_components/StoreListActionTools'
import StoreListTableTools from './_components/StoreListTableTools'
import StoreListTable from './_components/StoreListTable'

export default function StoresPage() {
  const { data, isLoading } = useRetrieveListOfStores()

  console.log('What are the stores data here : ', data)

  return (
    <>
      <Container>
        <AdaptiveCard>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
              <h3>Stores</h3>
              <StoreListActionTools />    
            </div>
            <StoreListTableTools />
            <StoreListTable 
              stores={data?.data || []} 
              initialLoading={isLoading}
              storeListTotal={data?.total || 0} 
              pageIndex={data?.current_page || 1}
              pageSize={data?.per_page || 10}
            />
          </div>
        </AdaptiveCard>
      </Container>
    </>
  )
}
