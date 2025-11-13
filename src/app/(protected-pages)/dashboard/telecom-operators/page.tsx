'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import OperatorListActionTools from './_components/OperatorListActionTools'
import OperatorListTableTools from './_components/OperatorListTableTools'
import OperatorListTable from './_components/OperatorListTable'
import { useRetrieveListOfTelecomOperators } from '@/hooks/features/telecom-operators-management/telecomOperatorsManagementApi'

export default function TelecomOperatorsPage() {
  const { data, isLoading } = useRetrieveListOfTelecomOperators()

  return (
    <>
      <Container>
        <AdaptiveCard>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
              <h3>Telecom Operators</h3>
              <OperatorListActionTools />    
            </div>
            <OperatorListTableTools />
            <OperatorListTable 
              operators={data?.operators?.data || []} 
              initialLoading={isLoading}
              OperatorListTotal={data?.operators?.total || 0}  
              pageIndex={data?.operators?.current_page || 1}
              pageSize={data?.operators?.per_page || 10}
            />
          </div>
        </AdaptiveCard>
      </Container>
    </>
  )
}
