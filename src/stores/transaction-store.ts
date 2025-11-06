import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Transaction, TransactionStatus, Refund } from './types'

interface TransactionState {
  // State
  transactions: Transaction[]
  refunds: Refund[]
  selectedTransaction: Transaction | null
  selectedRefund: Refund | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    search: string
    status: TransactionStatus | ''
    paymentMethod: string
    paymentGateway: string
    vendor: string
    customer: string
    dateRange: {
      start: string
      end: string
    }
    amountRange: {
      min: number
      max: number
    }
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  analytics: {
    totalTransactions: number
    totalVolume: number
    averageTransactionValue: number
    successfulTransactions: number
    failedTransactions: number
    pendingTransactions: number
    totalRefunds: number
    refundVolume: number
  }

  // Actions
  setTransactions: (transactions: Transaction[]) => void
  setRefunds: (refunds: Refund[]) => void
  setSelectedTransaction: (transaction: Transaction | null) => void
  setSelectedRefund: (refund: Refund | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (pagination: Partial<TransactionState['pagination']>) => void
  setFilters: (filters: Partial<TransactionState['filters']>) => void
  setAnalytics: (analytics: Partial<TransactionState['analytics']>) => void
  
  // Transaction CRUD operations
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  removeTransaction: (id: string) => void
  
  // Refund CRUD operations
  addRefund: (refund: Refund) => void
  updateRefund: (id: string, updates: Partial<Refund>) => void
  removeRefund: (id: string) => void
  
  // Transaction operations
  processTransaction: (id: string) => void
  cancelTransaction: (id: string, reason: string) => void
  refundTransaction: (transactionId: string, amount: number, reason: string) => void
  updateTransactionStatus: (id: string, status: TransactionStatus) => void
  
  // Refund operations
  approveRefund: (id: string) => void
  rejectRefund: (id: string, reason: string) => void
  processRefund: (id: string) => void
  
  // Utility functions
  getTransactionById: (id: string) => Transaction | undefined
  getRefundById: (id: string) => Refund | undefined
  getFilteredTransactions: () => Transaction[]
  getTransactionsByStatus: (status: TransactionStatus) => Transaction[]
  getTransactionsByVendor: (vendorId: string) => Transaction[]
  getTransactionsByCustomer: (customerId: string) => Transaction[]
  getTransactionsByDateRange: (start: string, end: string) => Transaction[]
  getRefundsByTransaction: (transactionId: string) => Refund[]
  getPendingTransactions: () => Transaction[]
  getRecentTransactions: (limit?: number) => Transaction[]
  calculateAnalytics: () => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters = {
  search: '',
  status: '' as TransactionStatus | '',
  paymentMethod: '',
  paymentGateway: '',
  vendor: '',
  customer: '',
  dateRange: {
    start: '',
    end: ''
  },
  amountRange: {
    min: 0,
    max: 0
  },
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
}

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

const initialAnalytics = {
  totalTransactions: 0,
  totalVolume: 0,
  averageTransactionValue: 0,
  successfulTransactions: 0,
  failedTransactions: 0,
  pendingTransactions: 0,
  totalRefunds: 0,
  refundVolume: 0,
}

export const useTransactionStore = create<TransactionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      transactions: [],
      refunds: [],
      selectedTransaction: null,
      selectedRefund: null,
      loading: false,
      error: null,
      pagination: initialPagination,
      filters: initialFilters,
      analytics: initialAnalytics,

      // Basic setters
      setTransactions: (transactions) => {
        set({ transactions })
        get().calculateAnalytics()
      },
      setRefunds: (refunds) => {
        set({ refunds })
        get().calculateAnalytics()
      },
      setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
      setSelectedRefund: (selectedRefund) => set({ selectedRefund }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => 
        set((state) => ({ 
          pagination: { ...state.pagination, ...pagination } 
        })),
      setFilters: (filters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
      setAnalytics: (analytics) => 
        set((state) => ({ 
          analytics: { ...state.analytics, ...analytics } 
        })),

      // Transaction CRUD operations
      addTransaction: (transaction) => {
        set((state) => ({ 
          transactions: [transaction, ...state.transactions] 
        }))
        get().calculateAnalytics()
      },
      
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) => 
            transaction.id === id ? { ...transaction, ...updates } : transaction
          ),
          selectedTransaction: state.selectedTransaction?.id === id 
            ? { ...state.selectedTransaction, ...updates } 
            : state.selectedTransaction,
        }))
        get().calculateAnalytics()
      },
      
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
          selectedTransaction: state.selectedTransaction?.id === id ? null : state.selectedTransaction,
        }))
        get().calculateAnalytics()
      },

      // Refund CRUD operations
      addRefund: (refund) => {
        set((state) => ({ 
          refunds: [refund, ...state.refunds] 
        }))
        get().calculateAnalytics()
      },
      
      updateRefund: (id, updates) => {
        set((state) => ({
          refunds: state.refunds.map((refund) => 
            refund.id === id ? { ...refund, ...updates } : refund
          ),
          selectedRefund: state.selectedRefund?.id === id 
            ? { ...state.selectedRefund, ...updates } 
            : state.selectedRefund,
        }))
        get().calculateAnalytics()
      },
      
      removeRefund: (id) => {
        set((state) => ({
          refunds: state.refunds.filter((refund) => refund.id !== id),
          selectedRefund: state.selectedRefund?.id === id ? null : state.selectedRefund,
        }))
        get().calculateAnalytics()
      },

      // Transaction operations
      processTransaction: (id) => {
        get().updateTransaction(id, { 
          status: 'completed',
          updatedAt: new Date().toISOString()
        })
      },
      
      cancelTransaction: (id, reason) => {
        get().updateTransaction(id, { 
          status: 'cancelled',
          metadata: { ...get().getTransactionById(id)?.metadata, cancelReason: reason },
          updatedAt: new Date().toISOString()
        })
      },
      
      refundTransaction: (transactionId, amount, reason) => {
        const transaction = get().getTransactionById(transactionId)
        if (transaction) {
          const refund: Refund = {
            id: `refund_${Date.now()}`,
            transactionId,
            amount,
            reason,
            status: 'pending',
            processedBy: 'admin', // This would come from current user
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          get().addRefund(refund)
          
          // Update transaction status
          const totalRefunded = get().getRefundsByTransaction(transactionId)
            .reduce((sum, r) => sum + r.amount, 0) + amount
          
          const newStatus = totalRefunded >= transaction.amount ? 'refunded' : transaction.status
          get().updateTransaction(transactionId, { status: newStatus })
        }
      },
      
      updateTransactionStatus: (id, status) => {
        get().updateTransaction(id, { 
          status,
          updatedAt: new Date().toISOString()
        })
      },

      // Refund operations
      approveRefund: (id) => {
        get().updateRefund(id, { 
          status: 'approved',
          updatedAt: new Date().toISOString()
        })
      },
      
      rejectRefund: (id, reason) => {
        get().updateRefund(id, { 
          status: 'rejected',
          reason,
          updatedAt: new Date().toISOString()
        })
      },
      
      processRefund: (id) => {
        get().updateRefund(id, { 
          status: 'processed',
          updatedAt: new Date().toISOString()
        })
      },

      // Utility functions
      getTransactionById: (id) => {
        const { transactions } = get()
        return transactions.find((transaction) => transaction.id === id)
      },
      
      getRefundById: (id) => {
        const { refunds } = get()
        return refunds.find((refund) => refund.id === id)
      },
      
      getFilteredTransactions: () => {
        const { transactions, filters } = get()
        let filtered = [...transactions]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter((transaction) =>
            transaction.transactionId.toLowerCase().includes(searchLower) ||
            transaction.description.toLowerCase().includes(searchLower)
          )
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter((transaction) => transaction.status === filters.status)
        }

        // Apply payment method filter
        if (filters.paymentMethod) {
          filtered = filtered.filter((transaction) => transaction.paymentMethod === filters.paymentMethod)
        }

        // Apply payment gateway filter
        if (filters.paymentGateway) {
          filtered = filtered.filter((transaction) => transaction.paymentGateway === filters.paymentGateway)
        }

        // Apply vendor filter
        if (filters.vendor) {
          filtered = filtered.filter((transaction) => transaction.vendorId === filters.vendor)
        }

        // Apply customer filter
        if (filters.customer) {
          filtered = filtered.filter((transaction) => transaction.customerId === filters.customer)
        }

        // Apply date range filter
        if (filters.dateRange.start && filters.dateRange.end) {
          const startDate = new Date(filters.dateRange.start)
          const endDate = new Date(filters.dateRange.end)
          filtered = filtered.filter((transaction) => {
            const transactionDate = new Date(transaction.createdAt)
            return transactionDate >= startDate && transactionDate <= endDate
          })
        }

        // Apply amount range filter
        if (filters.amountRange.min > 0 || filters.amountRange.max > 0) {
          filtered = filtered.filter((transaction) => {
            const amount = transaction.amount
            const minMatch = filters.amountRange.min === 0 || amount >= filters.amountRange.min
            const maxMatch = filters.amountRange.max === 0 || amount <= filters.amountRange.max
            return minMatch && maxMatch
          })
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof Transaction] as string | number
          const bValue = b[filters.sortBy as keyof Transaction] as string | number
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        return filtered
      },
      
      getTransactionsByStatus: (status) => {
        const { transactions } = get()
        return transactions.filter((transaction) => transaction.status === status)
      },
      
      getTransactionsByVendor: (vendorId) => {
        const { transactions } = get()
        return transactions.filter((transaction) => transaction.vendorId === vendorId)
      },
      
      getTransactionsByCustomer: (customerId) => {
        const { transactions } = get()
        return transactions.filter((transaction) => transaction.customerId === customerId)
      },
      
      getTransactionsByDateRange: (start, end) => {
        const { transactions } = get()
        const startDate = new Date(start)
        const endDate = new Date(end)
        return transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.createdAt)
          return transactionDate >= startDate && transactionDate <= endDate
        })
      },
      
      getRefundsByTransaction: (transactionId) => {
        const { refunds } = get()
        return refunds.filter((refund) => refund.transactionId === transactionId)
      },
      
      getPendingTransactions: () => {
        const { transactions } = get()
        return transactions.filter((transaction) => transaction.status === 'pending')
      },
      
      getRecentTransactions: (limit = 10) => {
        const { transactions } = get()
        return transactions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      },
      
      calculateAnalytics: () => {
        const { transactions, refunds } = get()
        
        const totalTransactions = transactions.length
        const totalVolume = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
        const averageTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0
        const successfulTransactions = transactions.filter(t => t.status === 'completed').length
        const failedTransactions = transactions.filter(t => t.status === 'failed').length
        const pendingTransactions = transactions.filter(t => t.status === 'pending').length
        const totalRefunds = refunds.length
        const refundVolume = refunds
          .filter(r => r.status === 'processed')
          .reduce((sum, refund) => sum + refund.amount, 0)
        
        set({
          analytics: {
            totalTransactions,
            totalVolume,
            averageTransactionValue,
            successfulTransactions,
            failedTransactions,
            pendingTransactions,
            totalRefunds,
            refundVolume
          }
        })
      },
      
      resetFilters: () => set({ filters: initialFilters }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'transaction-store',
    }
  )
)