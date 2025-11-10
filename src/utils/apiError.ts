import axios from 'axios'

function extractMessageFromData(data: unknown): string | null {
    if (typeof data === 'string') return data

    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>

        const message = obj['message']
        if (typeof message === 'string') return message

        const error = obj['error']
        if (typeof error === 'string') return error

        const errors = obj['errors']
        if (errors && typeof errors === 'object') {
            const values = Object.values(errors as Record<string, unknown>)
            for (const v of values) {
                if (Array.isArray(v)) {
                    const first = v.find((x) => typeof x === 'string') as string | undefined
                    if (first) return first
                } else if (typeof v === 'string') {
                    return v
                }
            }
        }
    }

    return null
}

export function getApiErrorMessage(err: unknown, fallback = 'An error occurred'): string {
    if (axios.isAxiosError(err)) {
        const message = extractMessageFromData(err.response?.data)
        if (message) return message
        return typeof err.message === 'string' ? err.message : fallback
    }

    if (typeof err === 'object' && err !== null) {
        const maybeMessage = (err as { message?: unknown }).message
        if (typeof maybeMessage === 'string') return maybeMessage
    }

    return fallback
}

export function getApiErrorMessages(err: unknown): string[] {
    const messages: string[] = []

    if (axios.isAxiosError(err)) {
        const data = err.response?.data
        const single = extractMessageFromData(data)
        if (single) messages.push(single)

        if (data && typeof data === 'object') {
            const obj = data as Record<string, unknown>
            const errors = obj['errors']
            if (errors && typeof errors === 'object') {
                const values = Object.values(errors as Record<string, unknown>)
                for (const v of values) {
                    if (Array.isArray(v)) {
                        v.forEach((x) => {
                            if (typeof x === 'string') messages.push(x)
                        })
                    } else if (typeof v === 'string') {
                        messages.push(v)
                    }
                }
            }
        }

        if (messages.length === 0 && typeof err.message === 'string') {
            messages.push(err.message)
        }
        return messages
    }

    if (typeof err === 'object' && err !== null) {
        const maybeMessage = (err as { message?: unknown }).message
        if (typeof maybeMessage === 'string') messages.push(maybeMessage)
    }

    return messages
}