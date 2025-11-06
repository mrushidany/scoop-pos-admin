// Centralized API service for all modules

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  total?: number
  page?: number
  pageSize?: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined | null
}

// Base API class with common methods
export class BaseApiService {
  protected baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  protected buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  // Generic CRUD operations
  async getAll<T>(
    endpoint: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<T[]>> {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<T[]>(`${endpoint}${queryString}`)
  }

  async getById<T>(endpoint: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`)
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update<T>(
    endpoint: string,
    id: string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string, id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${endpoint}/${id}`, {
      method: 'DELETE',
    })
  }

  async patch<T>(
    endpoint: string,
    id: string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

// Create a singleton instance
export const apiService = new BaseApiService()

// Common types are already exported above