'use client'

import OperatorEdit from '../OperatorEdit'
import { use } from 'react'
import NoUserFound from '@/assets/svg/NoUserFound'
import { getApiErrorMessage } from '@/utils/apiError'
import Loading from '@/components/shared/Loading'
import { useRetrieveTelecomOperatorDetails } from '@/hooks/features/telecom-operators-management/telecomOperatorsManagementApi'
import isEmpty from 'lodash/isEmpty'

export default function EditOperatorPage({ params }: { params: Promise<{operator: number}> }) {
  const resolvedParams = use(params)
  const { operator }  = resolvedParams

  const { data, isLoading, error } = useRetrieveTelecomOperatorDetails(operator)

  console.log('What is the data here : ', data)
  

  if (isLoading) {
    return <Loading type='default' loading={isLoading} />
  }

  if (error || isEmpty(data)) {
    return (
      <div className='h-full flex flex-col items-center justify-center'>
        <NoUserFound height={280} width={280} />
        <h2 className='mt-4'>{Boolean(error) ? 'Error loading telecom operator!' : 'No telecom operator found!'}</h2>
        {Boolean(error) && (
          <p className='text-red-500 mt-2'>
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    )
  }

  return (
    <OperatorEdit operatorId={operator} data={data} />
  )
}
