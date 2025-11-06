import { useState, useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { searchService, type AdvancedSearchParams } from '@/services/search-service'
import useDebouncedValue from '@/utils/hooks/useDebouncedValue'
import type { User, Vendor, Product, Transaction, Order } from '@/stores/types'

// Search state interface
export interface SearchState {
  query: string
  filters: Record<string, string | string[]>
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
  isSearching: boolean
  hasSearched: boolean
}

// Search result type mapping
type ModuleDataMap = {
  users: User
  vendors: Vendor
  products: Product
  transactions: Transaction
  orders: Order
}

// Hook for module-specific search
export function useModuleSearch<T extends keyof ModuleDataMap>(
  module: T,
  initialParams?: Partial<AdvancedSearchParams>
) {
  const queryClient = useQueryClient()
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialParams?.search || '',
    filters: initialParams?.filters || {},
    sortBy: initialParams?.sortBy || 'createdAt',
    sortOrder: initialParams?.sortOrder || 'desc',
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 10,
    isSearching: false,
    hasSearched: false,
  })

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebouncedValue(searchState.query, 300)

  // Build search parameters
  const searchParams: AdvancedSearchParams = {
    module,
    search: debouncedQuery,
    filters: searchState.filters,
    sortBy: searchState.sortBy,
    sortOrder: searchState.sortOrder,
    page: searchState.page,
    limit: searchState.limit,
  }

  // Query key for caching
  const queryKey = ['search', module, searchParams]

  // Search query
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => searchService.searchModule<ModuleDataMap[T]>(searchParams),
    enabled: searchState.hasSearched || debouncedQuery.length > 0,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })

  // Update search state
  const updateSearch = useCallback((updates: Partial<SearchState>) => {
    setSearchState(prev => ({
      ...prev,
      ...updates,
      hasSearched: true,
      isSearching: true,
    }))
  }, [])

  // Set search query
  const setQuery = useCallback((query: string) => {
    updateSearch({ query, page: 1 })
  }, [updateSearch])

  // Set filters
  const setFilters = useCallback((filters: Record<string, string | string[]>) => {
    updateSearch({ filters, page: 1 })
  }, [updateSearch])

  // Set sorting
  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    updateSearch({ sortBy, sortOrder, page: 1 })
  }, [updateSearch])

  // Set pagination
  const setPagination = useCallback((page: number, limit?: number) => {
    updateSearch({ page, ...(limit && { limit }) })
  }, [updateSearch])

  // Perform search with parameters
  const search = useCallback((params: AdvancedSearchParams) => {
    setSearchState({
      query: params.search || '',
      filters: params.filters || {},
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
      page: params.page || 1,
      limit: params.limit || 10,
      isSearching: true,
      hasSearched: true,
    })
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      filters: {},
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
      isSearching: false,
      hasSearched: false,
    })
    queryClient.removeQueries({ queryKey: ['search', module] })
  }, [module, queryClient])

  // Refresh search results
  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Effect to update searching state
  useEffect(() => {
    if (!isLoading && searchState.isSearching) {
      setSearchState(prev => ({ ...prev, isSearching: false }))
    }
  }, [isLoading, searchState.isSearching])

  return {
    // State
    searchState,
    searchResult: searchResult?.data,
    isLoading: isLoading || searchState.isSearching,
    error: error || searchResult?.error,
    hasResults: !!searchResult?.data?.data.data.length,
    
    // Actions
    search,
    setQuery,
    setFilters,
    setSorting,
    setPagination,
    clearSearch,
    refresh,
    updateSearch,
    
    // Computed
    totalResults: searchResult?.data?.searchMeta.totalResults || 0,
    searchTime: searchResult?.data?.searchMeta.searchTime || 0,
    suggestions: searchResult?.data?.searchMeta.suggestions || [],
    facets: searchResult?.data?.searchMeta.facets || {},
  }
}

// Hook for global search across all modules
export function useGlobalSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebouncedValue(query, 500)

  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: debouncedQuery.length > 2, // Only search with 3+ characters
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  })

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    setIsSearching(true)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setIsSearching(false)
  }, [])

  // Effect to update searching state
  useEffect(() => {
    if (!isLoading && isSearching) {
      setIsSearching(false)
    }
  }, [isLoading, isSearching])

  return {
    // State
    query,
    searchResult: searchResult?.data,
    isLoading: isLoading || isSearching,
    error: error || searchResult?.error,
    hasResults: !!searchResult?.data && searchResult.data.totalResults > 0,
    
    // Actions
    search,
    setQuery,
    clearSearch,
    refresh: refetch,
    
    // Computed
    totalResults: searchResult?.data?.totalResults || 0,
    searchTime: searchResult?.data?.searchTime || 0,
  }
}

// Hook for search suggestions and autocomplete
export function useSearchSuggestions(module: keyof ModuleDataMap, query: string) {
  const debouncedQuery = useDebouncedValue(query, 200)
  
  const suggestions = useQuery({
    queryKey: ['searchSuggestions', module, debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return []
      
      const config = searchService.getSearchConfig(module)
      const suggestions: string[] = []
      
      // Add field-specific suggestions
      config.searchableFields.forEach(field => {
        if (field.toLowerCase().includes(debouncedQuery.toLowerCase())) {
          suggestions.push(`Search in ${field}`)
        }
      })
      
      // Add filter suggestions
      Object.entries(config.filterableFields).forEach(([field, values]) => {
        values.forEach(value => {
          if (value.toLowerCase().includes(debouncedQuery.toLowerCase())) {
            suggestions.push(`Filter by ${field}: ${value}`)
          }
        })
      })
      
      return suggestions.slice(0, 8)
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 300000, // 5 minutes
  })

  return {
    suggestions: suggestions.data || [],
    isLoading: suggestions.isLoading,
  }
}

// Hook for search history
export function useSearchHistory(module: keyof ModuleDataMap) {
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`searchHistory_${module}`)
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const addToHistory = useCallback((query: string) => {
    if (!query.trim() || query.length < 2) return
    
    setHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`searchHistory_${module}`, JSON.stringify(newHistory))
      }
      return newHistory
    })
  }, [module])

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item !== query)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`searchHistory_${module}`, JSON.stringify(newHistory))
      }
      return newHistory
    })
  }, [module])

  const clearHistory = useCallback(() => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`searchHistory_${module}`)
    }
  }, [module])

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}