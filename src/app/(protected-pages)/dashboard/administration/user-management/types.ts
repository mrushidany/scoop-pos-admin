export type User = {
    id: number
    name: string
    email: string
    phone: string
    created_at: string
    updated_at: string
    is_admin: boolean
    is_active: boolean
}

export type ListOfUsers = {
    data: User[]
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
    links: Array<{
        url: string | null 
        label: string | null
        page: number | null
        active: boolean
    }>
}

export type UserFormSchema =  {
    name: string
    email: string
    password: string
    phone: string
    dialCode: string
    is_active: boolean
    is_admin: boolean
    stores?: []
}

export type UserDetails =  {
    data: {
        name?: string
        email?: string
        phone?: string
        is_active?: boolean
        is_admin?: boolean
        stores?: [
            {
                created_at?: string
                created_by?: number
                deleted_at?: string | null
                device_timestamp: string | null
                license_type?: string
                name?: string
                slug?: string
                store_type_string?: string
                updated_at?: string
                version?: number
                id?: string
                pivot: {
                    store_id?: string
                    user_id?: number
                }
            }
        ]
        created_at?: string
        updated_at?: string
        id?: number
    }
}