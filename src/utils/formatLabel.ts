export default function formatLabel(value: string) {
    if (typeof value !== 'string') {
        return ''
    }
    const formatted = value.replace(/_/g, ' ')
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}