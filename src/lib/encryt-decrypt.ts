import CryptoJS from 'crypto-js'

export function encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, 'pos-admin').toString()
}

export function decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'pos-admin')
    return bytes.toString(CryptoJS.enc.Utf8)
}