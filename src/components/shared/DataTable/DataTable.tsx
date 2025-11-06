import React, { useState, useMemo } from 'react'
import { Table, Pagination, Button, Badge } from '@/components/ui'
import SearchAndFilter from '@/components/shared/SearchAndFilter/SearchAndFilter'
import { useModuleSearch } from '@/hooks/use-search'
import { PiSortAscendingBold, PiSortDescendingBold, PiDownloadSimpleBold, PiEyeBold, PiPencilBold, PiTrashBold } from 'react-icons/pi'
import type { AdvancedSearchParams } from '@/services/search-service'
import type { User, Vendor, Product, Transaction, Order } from '@/stores/types'

// Column definition interface
export interface DataTableColumn<T = any> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
}

// Action button interface
export interface DataTableAction<T = any> {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (record: T) => void
  variant?: 'solid' | 'default' | 'plain'
  disabled?: (record: T) => boolean
  hidden?: (record: T) => boolean
}

// Module data type mapping
type ModuleDataMap = {
  users: User
  vendors: Vendor
  products: Product
  transactions: Transaction
  orders: Order
}

// DataTable props
export interface DataTableProps<T extends keyof ModuleDataMap> {
  module: T
  columns: DataTableColumn<ModuleDataMap[T]>[]
  actions?: DataTableAction<ModuleDataMap[T]>[]
  initialParams?: Partial<AdvancedSearchParams>
  title?: string
  description?: string
  showSearch?: boolean
  showFilters?: boolean
  showExport?: boolean
  showRefresh?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: ModuleDataMap[T][]) => void
  onExport?: (data: ModuleDataMap[T][], filters: Record<string, any>) => void
  className?: string
  emptyStateMessage?: string
  emptyStateDescription?: string
}

export function DataTable<T extends keyof ModuleDataMap>({
  module,
  columns,
  actions = [],
  initialParams,
  title,
  description,
  showSearch = true,
  showFilters = true,
  showExport = false,
  showRefresh = true,
  selectable = false,
  onSelectionChange,
  onExport,
  className = '',
  emptyStateMessage,
  emptyStateDescription,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<ModuleDataMap[T][]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Use search hook for data fetching and filtering
  const {
    searchState,
    searchResult,
    isLoading,
    error,
    hasResults,
    totalResults,
    search,
    setQuery,
    setFilters,
    setSorting,
    setPagination,
    clearSearch,
    refresh,
  } = useModuleSearch(module, initialParams)

  // Table data
  const tableData = searchResult?.data?.data || []
  const pagination = searchResult?.data ? {
    total: searchResult.data.total,
    page: searchResult.data.page,
    limit: searchResult.data.limit,
    totalPages: searchResult.data.totalPages
  } : undefined

  // Handle search
  const handleSearch = (params: AdvancedSearchParams) => {
    search(params)
  }

  // Handle sorting
  const handleSort = (column: DataTableColumn<ModuleDataMap[T]>) => {
    if (!column.sortable || !column.dataIndex) return
    
    const currentSortBy = searchState.sortBy
    const currentSortOrder = searchState.sortOrder
    const newSortBy = String(column.dataIndex)
    
    let newSortOrder: 'asc' | 'desc' = 'asc'
    if (currentSortBy === newSortBy && currentSortOrder === 'asc') {
      newSortOrder = 'desc'
    }
    
    setSorting(newSortBy, newSortOrder)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(page)
  }

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(1, pageSize)
  }

  // Handle row selection
  const handleRowSelect = (record: ModuleDataMap[T], selected: boolean) => {
    const newSelectedRows = selected
      ? [...selectedRows, record]
      : selectedRows.filter(row => (row as any).id !== (record as any).id)
    
    setSelectedRows(newSelectedRows)
    onSelectionChange?.(newSelectedRows)
    
    // Update select all state
    setSelectAll(newSelectedRows.length === tableData.length && tableData.length > 0)
  }

  const handleSelectAll = (selected: boolean) => {
    const newSelectedRows = selected ? [...tableData] : []
    setSelectedRows(newSelectedRows)
    setSelectAll(selected)
    onSelectionChange?.(newSelectedRows)
  }

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport(tableData, {
        query: searchState.query,
        filters: searchState.filters,
        sortBy: searchState.sortBy,
        sortOrder: searchState.sortOrder,
      })
    }
  }

  // Render sort icon
  const renderSortIcon = (column: DataTableColumn<ModuleDataMap[T]>) => {
    if (!column.sortable || !column.dataIndex) return null
    
    const isCurrentSort = searchState.sortBy === String(column.dataIndex)
    const isAsc = searchState.sortOrder === 'asc'
    
    if (!isCurrentSort) {
      return <PiSortAscendingBold className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
    }
    
    return isAsc ? (
      <PiSortAscendingBold className="h-4 w-4 text-blue-600" />
    ) : (
      <PiSortDescendingBold className="h-4 w-4 text-blue-600" />
    )
  }

  // Render table header
  const renderTableHeader = () => {
    return (
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {selectable && (
            <th className="w-12 px-6 py-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                column.sortable ? 'cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-gray-700' : ''
              } ${column.className || ''}`}
              style={{ width: column.width }}
              onClick={() => handleSort(column)}
            >
              <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                <span>{column.title}</span>
                {renderSortIcon(column)}
              </div>
            </th>
          ))}
          {actions.length > 0 && (
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          )}
        </tr>
      </thead>
    )
  }

  // Render table row
  const renderTableRow = (record: ModuleDataMap[T], index: number) => {
    const isSelected = selectedRows.some(row => (row as any).id === (record as any).id)
    
    return (
      <tr
        key={(record as any).id || index}
        className={`${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
      >
        {selectable && (
          <td className="w-12 px-6 py-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleRowSelect(record, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </td>
        )}
        {columns.map((column) => {
          const value = column.dataIndex ? (record as any)[column.dataIndex] : undefined
          const content = column.render ? column.render(value, record, index) : value
          
          return (
            <td
              key={column.key}
              className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${column.className || ''}`}
              style={{ textAlign: column.align || 'left' }}
            >
              {content}
            </td>
          )
        })}
        {actions.length > 0 && (
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2">
              {actions.map((action) => {
                if (action.hidden?.(record)) return null
                
                const Icon = action.icon
                const isDisabled = action.disabled?.(record)
                
                return (
                  <Button
                    key={action.key}
                    variant={action.variant || 'default'}
                    size="sm"
                    onClick={() => action.onClick(record)}
                    disabled={isDisabled}
                    className="h-8 w-8 p-0"
                    title={action.label}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </Button>
                )
              })}
            </div>
          </td>
        )}
      </tr>
    )
  }

  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <PiEyeBold className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {emptyStateMessage || 'No data found'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {emptyStateDescription || 'Try adjusting your search or filter criteria'}
        </p>
        {searchState.hasSearched && (
          <Button
            variant="default"
            onClick={clearSearch}
            className="mt-4"
          >
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || description || showSearch || showFilters || showExport || showRefresh) && (
        <div className="space-y-4">
          {(title || description) && (
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          )}
          
          {/* Search and Filter */}
          {(showSearch || showFilters) && (
            <SearchAndFilter
              module={module}
              onSearch={handleSearch}
              initialParams={initialParams}
            />
          )}
          
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasResults && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {tableData.length} of {totalResults} results
                </div>
              )}
              {selectedRows.length > 0 && (
                <Badge content={`${selectedRows.length} selected`} />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {showExport && onExport && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExport}
                  disabled={!hasResults}
                >
                  <PiDownloadSimpleBold className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {showRefresh && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={refresh}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <PiEyeBold className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Error loading data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {typeof error === 'string' ? error : error?.message || 'Something went wrong'}
            </p>
            <Button variant="default" onClick={refresh}>
              Try again
            </Button>
          </div>
        ) : !hasResults ? (
          renderEmptyState()
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {renderTableHeader()}
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tableData.map((record, index) => renderTableRow(record, index))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={pagination.page}
                  pageSize={pagination.limit}
                  total={pagination.total}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DataTable