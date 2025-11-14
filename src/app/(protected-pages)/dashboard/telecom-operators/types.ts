
export type TelecomOperator = {
    created_at: string,
    id: number,
    is_active: boolean,
    name: string,
    number_series: string[],
    updated_at: string,
}

export type TelecomOperatorDetails = {
    operator: TelecomOperator
}

export type TelecomOperatorSchema = {
    name: string
    is_active: boolean
    number_series: string[]
}