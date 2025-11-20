export type DeviceDetails = {
    data: {
        current_page: number,
        data: {
            device_id: number,
            device_uid: string,
            name: string,
            platform: string,
            device_model: string,
            os_version: string,
            registered_at: string,
            last_seen_at: string,
            revoked_at: string | null,
            is_active: boolean,
            is_online: boolean,
            store: {
                store_id: string
                store_name: string
            }
        }[],
        first_page_url: string
        from: number
        last_page: number
        last_page_url: string
        links: {
            url: string | null,
            label: string,
            page: string | null
            active: boolean
        }[]
        next_page_url: string | null
        path: string
        per_page: number
        prev_page_url: string | null
        to: number
        total: number
    }
}

export type DeviceDetail = {
    device_id: number,
    device_uid: string,
    name: string,
    platform: string,
    device_model: string,
    os_version: string,
    registered_at: string,
    last_seen_at: string,
    revoked_at: string | null,
    is_active: boolean,
    is_online: boolean,
    store: {
        store_id: string
        store_name: string
    }
}