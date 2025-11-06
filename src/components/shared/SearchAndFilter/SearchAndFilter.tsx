'use client'

import { useState, useCallback } from 'react'
import { HiOutlineX } from 'react-icons/hi'
import { PiMagnifyingGlassDuotone, PiSlidersHorizontalDuotone } from 'react-icons/pi'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { searchService, type AdvancedSearchParams } from '@/services/search-service'
import debounce from 'lodash/debounce'
import classNames from '@/utils/classNames'

export interface SearchAndFilterProps {
  module: keyof typeof import('@/services/search-service').searchConfigs
  onSearch: (params: AdvancedSearchParams) => void
  initialParams?: Partial<AdvancedSearchParams>
  className?: string
  showAdvancedFilters?: boolean
  placeholder?: string
}

export interface FilterState {
  search: string
  filters: Record<string, string | string[]>
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
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const SearchAndFilter = ({
  module,
  onSearch,
  initialParams,
  className,
  showAdvancedFilters = true,
  placeholder = 'Search...',
}: SearchAndFilterProps) => {
  const config = searchService.getSearchConfig(module)
  const [showFilters, setShowFilters] = useState(false)
  const [filterState, setFilterState] = useState<FilterState>({
    search: initialParams?.search || '',
    filters: initialParams?.filters || {},
    dateRange: initialParams?.dateRange,
    numericRange: initialParams?.numericRange,
    sortBy: initialParams?.sortBy || config?.defaultSort.field,
    sortOrder: initialParams?.sortOrder || config?.defaultSort.order,
  })

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((params: AdvancedSearchParams) => {
      onSearch(params)
    }, 300),
    [onSearch]
  )

  // Handle search input change
  const handleSearchChange = (value: string) => {
    const newState = { ...filterState, search: value }
    setFilterState(newState)
    
    const searchParams: AdvancedSearchParams = {
      module,
      search: value,
      filters: newState.filters,
      dateRange: newState.dateRange,
      numericRange: newState.numericRange,
      sortBy: newState.sortBy,
      sortOrder: newState.sortOrder,
      page: 1,
      limit: 10,
    }
    
    debouncedSearch(searchParams)
  }

  // Handle filter change
  const handleFilterChange = (field: string, value: string | string[]) => {
    const newFilters = { ...filterState.filters }
    
    if (value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[field]
    } else {
      newFilters[field] = value
    }
    
    const newState = { ...filterState, filters: newFilters }
    setFilterState(newState)
    
    const searchParams: AdvancedSearchParams = {
      module,
      search: newState.search,
      filters: newFilters,
      dateRange: newState.dateRange,
      numericRange: newState.numericRange,
      sortBy: newState.sortBy,
      sortOrder: newState.sortOrder,
      page: 1,
      limit: 10,
    }
    
    onSearch(searchParams)
  }

  // Handle sort change
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    const newState = { ...filterState, sortBy: field, sortOrder: order }
    setFilterState(newState)
    
    const searchParams: AdvancedSearchParams = {
      module,
      search: newState.search,
      filters: newState.filters,
      dateRange: newState.dateRange,
      numericRange: newState.numericRange,
      sortBy: field,
      sortOrder: order,
      page: 1,
      limit: 10,
    }
    
    onSearch(searchParams)
  }

  // Handle date range change
  const handleDateRangeChange = (field: string, start: string, end: string) => {
    const dateRange = start && end ? { start, end, field } : undefined
    const newState = { ...filterState, dateRange }
    setFilterState(newState)
    
    const searchParams: AdvancedSearchParams = {
      module,
      search: newState.search,
      filters: newState.filters,
      dateRange,
      numericRange: newState.numericRange,
      sortBy: newState.sortBy,
      sortOrder: newState.sortOrder,
      page: 1,
      limit: 10,
    }
    
    onSearch(searchParams)
  }

  // Clear all filters
  const clearFilters = () => {
    const newState: FilterState = {
      search: '',
      filters: {},
      sortBy: config.defaultSort.field,
      sortOrder: config.defaultSort.order,
    }
    setFilterState(newState)
    
    const searchParams: AdvancedSearchParams = {
      module,
      search: '',
      filters: {},
      sortBy: config.defaultSort.field,
      sortOrder: config.defaultSort.order,
      page: 1,
      limit: 10,
    }
    
    onSearch(searchParams)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    count += Object.keys(filterState.filters).length
    if (filterState.dateRange) count++
    if (filterState.numericRange) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className={classNames('space-y-4', className)}>
      {/* Search Bar */}
      <div className='flex items-center gap-3'>
        <div className='flex-1 relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <PiMagnifyingGlassDuotone className='h-5 w-5 text-gray-400' />
          </div>
          <Input
            type='text'
            placeholder={placeholder}
            value={filterState.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>
        
        {showAdvancedFilters && (
          <Button
            variant='default'
            size='md'
            onClick={() => setShowFilters(!showFilters)}
            className='relative'
          >
            <PiSlidersHorizontalDuotone className='h-4 w-4 mr-2' />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                content={activeFilterCount.toString()}
                innerClass='bg-red-500 text-white text-xs'
                className='absolute -top-2 -right-2'
              />
            )}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-sm text-gray-500'>Active filters:</span>
          
          {Object.entries(filterState.filters).map(([field, value]) => (
            <div
              key={field}
              className='inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-200'
              onClick={() => handleFilterChange(field, '')}
            >
              {`${field}: ${Array.isArray(value) ? value.join(', ') : value}`}
              <HiOutlineX className='h-3 w-3 ml-1' />
            </div>
          ))}
          
          {filterState.dateRange && (
            <div
              className='inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded cursor-pointer hover:bg-green-200'
              onClick={() => handleDateRangeChange('', '', '')}
            >
              {`${filterState.dateRange.field}: ${filterState.dateRange.start} - ${filterState.dateRange.end}`}
              <HiOutlineX className='h-3 w-3 ml-1' />
            </div>
          )}
          
          <Button
            size='xs'
            variant='plain'
            onClick={clearFilters}
            className='text-gray-500 hover:text-gray-700'
          >
            <HiOutlineX className='h-3 w-3 mr-1' />
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && showAdvancedFilters && (
        <Card className='p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Filter Fields */}
            {Object?.entries(config?.filterableFields).map(([field, options]) => (
              <div key={field}>
                <label className='block text-sm font-medium text-gray-700 mb-1 capitalize'>
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <Select
                  placeholder={`Select ${field}`}
                  value={filterState.filters[field] as string || ''}
                  onChange={(value) => handleFilterChange(field, value || '')}
                >
                  <option value=''>All</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </Select>
              </div>
            ))}

            {/* Sort Options */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Sort By
              </label>
              <div className='flex gap-2'>
                <Select
                  value={filterState.sortBy}
                  onChange={(value) => handleSortChange(value || config.defaultSort.field, filterState.sortOrder)}
                  className='flex-1'
                >
                  {config.sortableFields.map((field) => (
                    <option key={field} value={field}>
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </Select>
                <Select
                  value={filterState.sortOrder}
                  onChange={(value) => handleSortChange(filterState.sortBy, value as 'asc' | 'desc')}
                  className='w-24'
                >
                  <option value='asc'>Asc</option>
                  <option value='desc'>Desc</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Date Range
            </label>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Select
                placeholder='Select date field'
                value={filterState.dateRange?.field || ''}
                onChange={(field) => {
                  if (field && filterState.dateRange) {
                    handleDateRangeChange(field, filterState.dateRange.start, filterState.dateRange.end)
                  }
                }}
              >
                <option value=''>Select field</option>
                <option value='createdAt'>Created Date</option>
                <option value='updatedAt'>Updated Date</option>
                {module === 'users' && <option value='lastLogin'>Last Login</option>}
                {module === 'vendors' && <option value='lastActivity'>Last Activity</option>}
              </Select>
              
              <DatePicker
                placeholder='Start date'
                value={filterState.dateRange?.start ? new Date(filterState.dateRange.start) : null}
                onChange={(date) => {
                  if (date && filterState.dateRange?.field) {
                    handleDateRangeChange(
                      filterState.dateRange.field,
                      date.toISOString().split('T')[0],
                      filterState.dateRange.end || ''
                    )
                  }
                }}
              />
              
              <DatePicker
                placeholder='End date'
                value={filterState.dateRange?.end ? new Date(filterState.dateRange.end) : null}
                onChange={(date) => {
                  if (date && filterState.dateRange?.field) {
                    handleDateRangeChange(
                      filterState.dateRange.field,
                      filterState.dateRange.start || '',
                      date.toISOString().split('T')[0]
                    )
                  }
                }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default SearchAndFilter