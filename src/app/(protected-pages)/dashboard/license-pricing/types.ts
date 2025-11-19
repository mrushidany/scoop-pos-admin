export type LicensePricingDetails = {
    id: number
    name: string
    price: number
    period_months: number
    setup_fee: number
    is_active: boolean
    max_devices: number
    max_users: number | null
    included_features: string[]
    excluded_features: string[]
    created_at: string
    updated_at: string
}

export type LicensePricingDetail = {
    data: LicensePricingDetails
}