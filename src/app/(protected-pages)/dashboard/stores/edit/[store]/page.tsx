'use client'

import StoreEdit from '../StoreEdit'
import { use } from 'react'
import { useRetrieveStoreDetails } from '@/hooks/features/stores-management/storeManagementApi'
import NoUserFound from '@/assets/svg/NoUserFound'
import { getApiErrorMessage } from '@/utils/apiError'
import Loading from '@/components/shared/Loading'

export default function EditStorePage({ params }: { params: Promise<{store: string}> }) {
  const resolvedParams = use(params)
  const { store }  = resolvedParams

  const { data, isLoading, error } = useRetrieveStoreDetails(store)

  console.log('What is the store details here : ', data)

  if (isLoading) {
    return <Loading type='default' loading={isLoading} />
  }

  if (error || !data || !data.data) {
    return (
      <div className='h-full flex flex-col items-center justify-center'>
        <NoUserFound height={280} width={280} />
        <h2 className='mt-4'>{Boolean(error) ? 'Error loading store!' : 'No store found!'}</h2>
        {Boolean(error) && (
          <p className='text-red-500 mt-2'>
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    )
  }

  return (
    <StoreEdit storeId={store} data={data.data} />
  )
}
