'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import { useRetrieveListOfLicensePricing } from '@/hooks/features/license-pricing-management/licensePricingManagementApi'
import LicensePricingListTableTools from './_components/LicensePricingListTableTools'
import LicensePricingListTable from './_components/LicensePricingListTable'

export default function LicensePricingPage() {
  const { data, isLoading } = useRetrieveListOfLicensePricing()

  return (
    <>
      <Container>
        <AdaptiveCard>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
              <h3>License Pricing</h3>
            </div>
            <LicensePricingListTableTools />
            <LicensePricingListTable 
              licensePricing={data?.data || []} 
              initialLoading={isLoading}
              licensePricingListTotal={data?.total || 0} 
              pageIndex={data?.current_page || 1}
              pageSize={data?.per_page || 10}
            />
          </div>
        </AdaptiveCard>
      </Container> 
    </>
  )
}
