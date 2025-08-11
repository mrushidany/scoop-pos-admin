import { AxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export type ApiOptions = Omit<AxiosRequestConfig, 'url' | 'baseURL'>