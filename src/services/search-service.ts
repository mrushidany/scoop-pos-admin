import type { 
  User, 
  Vendor, 
  Product, 
  Transaction, 
  Order, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse 
} from '@/stores/types'
import { userApiService, vendorApiService, inventoryApiService, transactionApiService, orderApiService } from './mock/api-service'

// Search configuration for different modules
export interface SearchConfig {
  searchableFields: string[]
  filterableFields: Record<string, string[]>
  sortableFields: string[]
  defaultSort: { field: string; order: 'asc' | 'desc' }
}

// Module search configurations
export const searchConfigs: Record<string, SearchConfig> = {
  users: {
    searchableFields: ['firstName', 'lastName', 'email', 'role.name'],
    filterableFields: {
      status: ['active', 'inactive', 'suspended'],
      role: ['admin', 'manager', 'operator', 'viewer'],
    },
    sortableFields: ['firstName', 'lastName', 'email', 'createdAt', 'lastLogin'],
    defaultSort: { field: 'createdAt', order: 'desc' },
  },
  vendors: {
    searchableFields: ['businessName', 'contactEmail', 'businessType', 'contactPerson'],
    filterableFields: {
      status: ['active', 'inactive', 'suspended', 'pending'],
      verificationStatus: ['pending', 'verified', 'rejected'],
      businessType: ['restaurant', 'retail', 'service', 'wholesale'],
    },
    sortableFields: ['businessName', 'contactEmail', 'createdAt', 'lastActivity'],
    defaultSort: { field: 'createdAt', order: 'desc' },
  },
  products: {
    searchableFields: ['name', 'description', 'category', 'sku', 'vendor.businessName'],
    filterableFields: {
      category: ['electronics', 'clothing', 'food', 'books', 'home'],
      status: ['active', 'inactive', 'discontinued'],
      stockStatus: ['in_stock', 'low_stock', 'out_of_stock'],
    },
    sortableFields: ['name', 'price', 'quantity', 'createdAt', 'lastUpdated'],
    defaultSort: { field: 'createdAt', order: 'desc' },
  },
  transactions: {
    searchableFields: ['id', 'vendor.businessName', 'paymentMethod', 'reference'],
    filterableFields: {
      status: ['pending', 'completed', 'failed', 'cancelled'],
      paymentMethod: ['card', 'cash', 'bank_transfer', 'digital_wallet'],
      type: ['sale', 'refund', 'adjustment'],
    },
    sortableFields: ['amount', 'createdAt', 'vendor.businessName'],
    defaultSort: { field: 'createdAt', order: 'desc' },
  },
  orders: {
    searchableFields: ['id', 'customer.name', 'customer.email', 'vendor.businessName'],
    filterableFields: {
      status: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      paymentStatus: ['pending', 'paid', 'failed', 'refunded'],
      deliveryMethod: ['pickup', 'delivery', 'dine_in'],
    },
    sortableFields: ['total', 'createdAt', 'customer.name'],
    defaultSort: { field: 'createdAt', order: 'desc' },
  },
}

// Advanced search parameters
export interface AdvancedSearchParams extends PaginationParams {
  module: keyof typeof searchConfigs
  filters?: Record<string, string | string[]>
  dateRange?: {
    start: string
    end: string
    field: string
  }
  numericRange?: {
    min: number
    max: number
    field: string
  }
  tags?: string[]
}

// Search result with metadata
export interface SearchResultWithMeta<T> {
  data: PaginatedResponse<T>
  searchMeta: {
    query: string
    totalResults: number
    searchTime: number
    suggestions?: string[]
    facets?: Record<string, Array<{ value: string; count: number }>>
  }
}

// Global search result
export interface GlobalSearchResult {
  users: User[]
  vendors: Vendor[]
  products: Product[]
  transactions: Transaction[]
  orders: Order[]
  totalResults: number
  searchTime: number
}

class SearchService {
  // Perform advanced search within a specific module
  async searchModule<T>(
    params: AdvancedSearchParams
  ): Promise<ApiResponse<SearchResultWithMeta<T>>> {
    const startTime = Date.now()
    const { module, ...searchParams } = params
    
    try {
      let result: ApiResponse<PaginatedResponse<T>>
      
      switch (module) {
        case 'users':
          result = await userApiService.getUsers(searchParams) as ApiResponse<PaginatedResponse<T>>
          break
        case 'vendors':
          result = await vendorApiService.getVendors(searchParams) as ApiResponse<PaginatedResponse<T>>
          break
        case 'products':
          result = await inventoryApiService.getProducts(searchParams) as ApiResponse<PaginatedResponse<T>>
          break
        case 'transactions':
          result = await transactionApiService.getTransactions(searchParams) as ApiResponse<PaginatedResponse<T>>
          break
        case 'orders':
          result = await orderApiService.getOrders(searchParams) as ApiResponse<PaginatedResponse<T>>
          break
        default:
          throw new Error(`Unsupported module: ${module}`)
      }
      
      if (!result.success) {
        return {
          success: false,
          data: null as unknown as SearchResultWithMeta<T>,
          error: result.error,
        }
      }
      
      const searchTime = Date.now() - startTime
      
      if (!result.data) {
        return {
          success: false,
          error: 'No data returned from search',
        }
      }
      
      const searchMeta = {
        query: searchParams.search || '',
        totalResults: result.data.total,
        searchTime,
        suggestions: this.generateSearchSuggestions(searchParams.search || '', module),
        facets: this.generateFacets(result.data.data, module),
      }
      
      return {
        success: true,
        data: {
          data: result.data,
          searchMeta,
        },
      }
    } catch (error) {
      return {
        success: false,
        data: null as unknown as SearchResultWithMeta<T>,
        error: error instanceof Error ? error.message : 'Search failed',
      }
    }
  }
  
  // Perform global search across all modules
  async globalSearch(query: string, limit = 5): Promise<ApiResponse<GlobalSearchResult>> {
    const startTime = Date.now()
    
    try {
      const searchPromises = [
        userApiService.getUsers({ search: query, limit, page: 1 }),
        vendorApiService.getVendors({ search: query, limit, page: 1 }),
        inventoryApiService.getProducts({ search: query, limit, page: 1 }),
        transactionApiService.getTransactions({ search: query, limit, page: 1 }),
        orderApiService.getOrders({ search: query, limit, page: 1 }),
      ]
      
      const results = await Promise.allSettled(searchPromises)
      
      const globalResult: GlobalSearchResult = {
        users: [],
        vendors: [],
        products: [],
        transactions: [],
        orders: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
      }
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          const data = result.value.data.data
          switch (index) {
            case 0:
              globalResult.users = data as User[]
              break
            case 1:
              globalResult.vendors = data as Vendor[]
              break
            case 2:
              globalResult.products = data as Product[]
              break
            case 3:
              globalResult.transactions = data as Transaction[]
              break
            case 4:
              globalResult.orders = data as Order[]
              break
          }
          globalResult.totalResults += data.length
        }
      })
      
      return {
        success: true,
        data: globalResult,
      }
    } catch (error) {
      return {
        success: false,
        data: null as unknown as GlobalSearchResult,
        error: error instanceof Error ? error.message : 'Global search failed',
      }
    }
  }
  
  // Generate search suggestions based on query and module
  private generateSearchSuggestions(query: string, module: keyof typeof searchConfigs): string[] {
    if (!query || query.length < 2) return []
    
    const config = searchConfigs[module]
    const suggestions: string[] = []
    
    // Add field-specific suggestions
    config.searchableFields.forEach(field => {
      if (field.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(`Search in ${field}`)
      }
    })
    
    // Add filter suggestions
    Object.entries(config.filterableFields).forEach(([field, values]) => {
      values.forEach(value => {
        if (value.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(`Filter by ${field}: ${value}`)
        }
      })
    })
    
    return suggestions.slice(0, 5)
  }
  
  // Generate facets for search results
  private generateFacets<T>(data: T[], module: keyof typeof searchConfigs): Record<string, Array<{ value: string; count: number }>> {
    const config = searchConfigs[module]
    const facets: Record<string, Array<{ value: string; count: number }>> = {}
    
    Object.keys(config.filterableFields).forEach(field => {
      const valueCounts: Record<string, number> = {}
      
      data.forEach(item => {
        const value = this.getNestedValue(item as Record<string, unknown>, field)
        if (value) {
          valueCounts[value] = (valueCounts[value] || 0) + 1
        }
      })
      
      facets[field] = Object.entries(valueCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
    })
    
    return facets
  }
  
  // Helper to get nested object values
  private getNestedValue(obj: Record<string, unknown>, path: string): string | null {
    const result = path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' && current !== null 
        ? (current as Record<string, unknown>)[key] 
        : null
    }, obj)
    return typeof result === 'string' ? result : null
  }
  
  // Get search configuration for a module
  getSearchConfig(module: keyof typeof searchConfigs): SearchConfig {
    return searchConfigs[module]
  }
  
  // Validate search parameters
  validateSearchParams(params: AdvancedSearchParams): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const config = searchConfigs[params.module]
    
    if (!config) {
      errors.push(`Invalid module: ${params.module}`)
      return { valid: false, errors }
    }
    
    // Validate sort field
    if (params.sortBy && !config.sortableFields.includes(params.sortBy)) {
      errors.push(`Invalid sort field: ${params.sortBy}`)
    }
    
    // Validate filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, value]) => {
        if (!config.filterableFields[field]) {
          errors.push(`Invalid filter field: ${field}`)
        } else {
          const allowedValues = config.filterableFields[field]
          const values = Array.isArray(value) ? value : [value]
          values.forEach(v => {
            if (!allowedValues.includes(v)) {
              errors.push(`Invalid filter value for ${field}: ${v}`)
            }
          })
        }
      })
    }
    
    return { valid: errors.length === 0, errors }
  }
}

export const searchService = new SearchService()
export default searchService