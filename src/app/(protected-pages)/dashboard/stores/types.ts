export type Store = {
    id: string,
    name: string,
    slug: string,
    store_type_string: string,
    license_type: string,
    created_by: number,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
}

export type Users = {
    id: number
    name: string
    email: string
    phone:string
    role?: string
}

export type Devices = {
    id: string
    name: string
    platform: string
    device_model: string
    os_version: string
    public_key: string
    is_active: boolean
    metadata: {
      screen_resolution: string
    }
    store_id: string
    enrolled_at: string
    registered_at: string
    last_seen_at: string
    created_at: string
    updated_at: string
}

export type ListOfStores = {
    data: Store[]
}

export type StoreFormSchema = {
    name: string,
    store_type_string: string,
    owner_id: number,
}

export type AssignUserToStoreFormSchema = {
    role?: string
    user_id: number
}

export type StoreDetails = {
    success: boolean
    message: string
    data: {
        id: string,
        name: string,
        slug: string,
        store_type_string: string,
        license_type: string,
        created_by: number,
        created_at: string,
        updated_at: string,
        deleted_at: string | null,
        users: Users[],
        devices: Devices[]
    }
}