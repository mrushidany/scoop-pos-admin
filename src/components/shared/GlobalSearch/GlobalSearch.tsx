import React, { useState, useRef, useEffect } from 'react'
import { Dialog } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useGlobalSearch, useSearchHistory } from '@/hooks/use-search'
import { PiMagnifyingGlassBold, PiXBold, PiClockBold, PiArrowRightBold } from 'react-icons/pi'
import { HiOutlineUser, HiOutlineOfficeBuilding, HiOutlineCube, HiOutlineCreditCard, HiOutlineClipboardList } from 'react-icons/hi'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (module: string, id: string) => void
}

const moduleIcons = {
  users: HiOutlineUser,
  vendors: HiOutlineOfficeBuilding,
  products: HiOutlineCube,
  transactions: HiOutlineCreditCard,
  orders: HiOutlineClipboardList,
}

const moduleLabels = {
  users: 'Users',
  vendors: 'Vendors',
  products: 'Products',
  transactions: 'Transactions',
  orders: 'Orders',
}

// Helper functions to extract display information from different entity types
const getResultTitle = (result: any, module: string): string => {
  switch (module) {
    case 'users':
      return result.name || `${result.firstName} ${result.lastName}` || result.email || 'Unknown User'
    case 'vendors':
      return result.name || result.businessName || 'Unknown Vendor'
    case 'products':
      return result.name || result.title || 'Unknown Product'
    case 'transactions':
      return `Transaction #${result.id}` || 'Unknown Transaction'
    case 'orders':
      return `Order #${result.id}` || 'Unknown Order'
    default:
      return result.name || result.title || 'Unknown Item'
  }
}

const getResultDescription = (result: any, module: string): string => {
  switch (module) {
    case 'users':
      return result.email || result.role || ''
    case 'vendors':
      return result.email || result.category || ''
    case 'products':
      return result.description || `$${result.price}` || ''
    case 'transactions':
      return `$${result.amount} - ${result.status}` || ''
    case 'orders':
      return `${result.status} - $${result.total}` || ''
    default:
      return ''
  }
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  
  const {
    query,
    searchResult,
    isLoading,
    hasResults,
    totalResults,
    searchTime,
    search,
    setQuery,
    clearSearch,
  } = useGlobalSearch()
  
  const { history, addToHistory } = useSearchHistory('global' as any)

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [searchResult])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResult) return

    const allResults = [
      ...searchResult.users.map(item => ({ ...item, module: 'users' })),
      ...searchResult.vendors.map(item => ({ ...item, module: 'vendors' })),
      ...searchResult.products.map(item => ({ ...item, module: 'products' })),
      ...searchResult.transactions.map(item => ({ ...item, module: 'transactions' })),
      ...searchResult.orders.map(item => ({ ...item, module: 'orders' }))
    ]
    const maxIndex = allResults.length - 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
          const selectedResult = allResults[selectedIndex]
          if (selectedResult && onNavigate) {
            onNavigate(selectedResult.module, selectedResult.id)
            addToHistory(query)
            onClose()
          }
        } else if (query.trim()) {
          addToHistory(query)
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 2) {
      search(value)
    }
  }

  // Handle result click
  const handleResultClick = (module: string, id: string) => {
    if (onNavigate) {
      onNavigate(module, id)
      addToHistory(query)
      onClose()
    }
  }

  // Handle history item click
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    search(historyQuery)
  }

  // Render search results
  const renderResults = () => {
    if (!searchResult || !hasResults) return null

    let resultIndex = 0
    
    return (
      <div className="space-y-4">
        {Object.entries({
          users: searchResult.users,
          vendors: searchResult.vendors,
          products: searchResult.products,
          transactions: searchResult.transactions,
          orders: searchResult.orders
        }).map(([module, results]) => {
          if (!results.length) return null
          
          const Icon = moduleIcons[module as keyof typeof moduleIcons]
          const label = moduleLabels[module as keyof typeof moduleLabels]
          
          return (
            <div key={module} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                <span className="text-xs text-gray-500">({results.length})</span>
              </div>
              
              <div className="space-y-1">
                {results.map((result) => {
                  const isSelected = resultIndex === selectedIndex
                  resultIndex++
                  
                  return (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleResultClick(module, result.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {getResultTitle(result, module)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {getResultDescription(result, module)}
                          </div>
                        </div>
                        <PiArrowRightBold className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render search history
  const renderHistory = () => {
    if (!history.length || query.length > 0) return null
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <PiClockBold className="h-4 w-4" />
          <span>Recent Searches</span>
        </div>
        
        <div className="space-y-1">
          {history.slice(0, 5).map((historyQuery, index) => (
            <div
              key={index}
              className="p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => handleHistoryClick(historyQuery)}
            >
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {historyQuery}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        {/* Search Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Search Everything
          </h2>
          <Button
            variant="plain"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <PiXBold className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PiMagnifyingGlassBold className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search users, vendors, products, transactions, orders..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Spinner size="sm" />
            </div>
          )}
          {query && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <PiXBold className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {query.length === 0 && renderHistory()}
          
          {query.length > 0 && query.length < 3 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PiMagnifyingGlassBold className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Type at least 3 characters to search</p>
            </div>
          )}
          
          {query.length >= 3 && isLoading && (
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          )}
          
          {query.length >= 3 && !isLoading && !hasResults && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PiMagnifyingGlassBold className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or check spelling</p>
            </div>
          )}
          
          {hasResults && renderResults()}
        </div>

        {/* Search Stats */}
        {hasResults && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                {totalResults} result{totalResults !== 1 ? 's' : ''} found
              </span>
              <span>
                Search completed in {searchTime}ms
              </span>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default GlobalSearch