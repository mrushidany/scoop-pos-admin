import { useQuery } from '@/hooks/useQuery'
import { API_ENDPOINTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@/hooks/useMutations'
import { createApiOptions } from '@/hooks/useApiHooks'
import { LicensePricingDetails } from '@/app/(protected-pages)/dashboard/license-pricing/types'

interface ListOfLicensePricingResponse {
    success: boolean
    data: LicensePricingDetails[]
    current_page: number
    first_page_url: string
    from: number
    last_page_url: string | null
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
    links: [
        {
            url: string | null 
            label: string | null
            page: number | null
            active: boolean
        }
    ]
}

interface LicensePricingCreateVariables {
    price: number,
    period_months: number,
    setup_fee: number,
    is_active: boolean,
    max_devices: number | null,
    max_users: number | null,
    included_features: string[],
    excluded_features: string[]
}

interface LicensePricingCreateResponse {
    success: boolean
    message: string
    data: LicensePricingDetails
}


// Data Fetching

export function useRetrieveListOfLicensePricing() {
    const { access_token } = useAuthStore()
    return useQuery<ListOfLicensePricingResponse>(
        ['retrieve-list-of-license-pricing'],
        API_ENDPOINTS.ADMIN_LICENSE_PRICING,
        {
            enabled: !!access_token,
        }
    )
}

export function useRetrieveLicensePricingDetails(pricingId: number) {
    const { access_token } = useAuthStore()
    return useQuery<LicensePricingDetails>(
        ['retrieve-license-pricing-details', pricingId],
        `${API_ENDPOINTS.ADMIN_LICENSE_PRICING}/${pricingId}`,
        {
            enabled: !!access_token,
        }
    )

}

// Data Mutation

export function useUpdateTelecomOperatorDetails(operatorId: number) {
    const { access_token } = useAuthStore()
    return useMutation<LicensePricingCreateResponse, LicensePricingCreateVariables>(
        `${API_ENDPOINTS.ADMIN_LICENSE_PRICING}/${operatorId}`,
        createApiOptions(access_token ?? '', 'PUT')
    )
}

