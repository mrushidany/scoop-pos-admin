import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from './types'

interface OrderState {
  // State
  orders: Order[]
  selectedOrder: Order | null
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
    status: OrderStatus | ''
    paymentStatus: PaymentStatus | ''
    fulfillmentStatus: FulfillmentStatus | ''
    vendor: string
    customer: string
    dateRange: {
      start: string
      end: string
    }
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  analytics: {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    pendingOrders: number
    completedOrders: number
    cancelledOrders: number
  }

  // Actions
  setOrders: (orders: Order[]) => void
  setSelectedOrder: (order: Order | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (pagination: Partial<OrderState['pagination']>) => void
  setFilters: (filters: Partial<OrderState['filters']>) => void
  setAnalytics: (analytics: Partial<OrderState['analytics']>) => void
  
  // Order CRUD operations
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  removeOrder: (id: string) => void
  
  // Order operations
  confirmOrder: (id: string) => void
  cancelOrder: (id: string, reason: string) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updatePaymentStatus: (id: string, status: PaymentStatus) => void
  updateFulfillmentStatus: (id: string, status: FulfillmentStatus) => void
  processRefund: (id: string, amount: number, reason: string) => void
  
  // Utility functions
  getOrderById: (id: string) => Order | undefined
  getFilteredOrders: () => Order[]
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getOrdersByVendor: (vendorId: string) => Order[]
  getOrdersByCustomer: (customerId: string) => Order[]
  getOrdersByDateRange: (start: string, end: string) => Order[]
  getPendingOrders: () => Order[]
  getRecentOrders: (limit?: number) => Order[]
  calculateAnalytics: () => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters = {
  search: '',
  status: '' as OrderStatus | '',
  paymentStatus: '' as PaymentStatus | '',
  fulfillmentStatus: '' as FulfillmentStatus | '',
  vendor: '',
  customer: '',
  dateRange: {
    start: '',
    end: ''
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
  totalOrders: 0,
  totalRevenue: 0,
  averageOrderValue: 0,
  pendingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
}

export const useOrderStore = create<OrderState>()(
  devtools(
    (set, get) => ({
      // Initial state
      orders: [],
      selectedOrder: null,
      loading: false,
      error: null,
      pagination: initialPagination,
      filters: initialFilters,
      analytics: initialAnalytics,

      // Basic setters
      setOrders: (orders) => {
        set({ orders })
        get().calculateAnalytics()
      },
      setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
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

      // Order CRUD operations
      addOrder: (order) => {
        set((state) => ({ 
          orders: [order, ...state.orders] 
        }))
        get().calculateAnalytics()
      },
      
      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((order) => 
            order.id === id ? { ...order, ...updates } : order
          ),
          selectedOrder: state.selectedOrder?.id === id 
            ? { ...state.selectedOrder, ...updates } 
            : state.selectedOrder,
        }))
        get().calculateAnalytics()
      },
      
      removeOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
          selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
        }))
        get().calculateAnalytics()
      },

      // Order operations
      confirmOrder: (id) => {
        get().updateOrder(id, { 
          status: 'confirmed',
          updatedAt: new Date().toISOString()
        })
      },
      
      cancelOrder: (id, reason) => {
        get().updateOrder(id, { 
          status: 'cancelled',
          notes: reason,
          updatedAt: new Date().toISOString()
        })
      },
      
      updateOrderStatus: (id, status) => {
        get().updateOrder(id, { 
          status,
          updatedAt: new Date().toISOString()
        })
      },
      
      updatePaymentStatus: (id, paymentStatus) => {
        get().updateOrder(id, { 
          paymentStatus,
          updatedAt: new Date().toISOString()
        })
      },
      
      updateFulfillmentStatus: (id, fulfillmentStatus) => {
        get().updateOrder(id, { 
          fulfillmentStatus,
          updatedAt: new Date().toISOString()
        })
      },
      
      processRefund: (id, amount, reason) => {
        const order = get().getOrderById(id)
        if (order) {
          // Create refund record (this would typically involve API call)
          const refund = {
            id: `refund_${Date.now()}`,
            transactionId: order.id,
            amount,
            reason,
            status: 'pending' as const,
            processedBy: 'admin', // This would come from current user
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          // Update order payment status
          const newPaymentStatus = amount >= order.total ? 'refunded' : 'partially_refunded'
          get().updatePaymentStatus(id, newPaymentStatus)
        }
      },

      // Utility functions
      getOrderById: (id) => {
        const { orders } = get()
        return orders.find((order) => order.id === id)
      },
      
      getFilteredOrders: () => {
        const { orders, filters } = get()
        let filtered = [...orders]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter((order) =>
            order.orderNumber.toLowerCase().includes(searchLower) ||
            order.id.toLowerCase().includes(searchLower)
          )
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter((order) => order.status === filters.status)
        }

        // Apply payment status filter
        if (filters.paymentStatus) {
          filtered = filtered.filter((order) => order.paymentStatus === filters.paymentStatus)
        }

        // Apply fulfillment status filter
        if (filters.fulfillmentStatus) {
          filtered = filtered.filter((order) => order.fulfillmentStatus === filters.fulfillmentStatus)
        }

        // Apply vendor filter
        if (filters.vendor) {
          filtered = filtered.filter((order) => order.vendorId === filters.vendor)
        }

        // Apply customer filter
        if (filters.customer) {
          filtered = filtered.filter((order) => order.customerId === filters.customer)
        }

        // Apply date range filter
        if (filters.dateRange.start && filters.dateRange.end) {
          const startDate = new Date(filters.dateRange.start)
          const endDate = new Date(filters.dateRange.end)
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.createdAt)
            return orderDate >= startDate && orderDate <= endDate
          })
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof Order] as string | number
          const bValue = b[filters.sortBy as keyof Order] as string | number
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        return filtered
      },
      
      getOrdersByStatus: (status) => {
        const { orders } = get()
        return orders.filter((order) => order.status === status)
      },
      
      getOrdersByVendor: (vendorId) => {
        const { orders } = get()
        return orders.filter((order) => order.vendorId === vendorId)
      },
      
      getOrdersByCustomer: (customerId) => {
        const { orders } = get()
        return orders.filter((order) => order.customerId === customerId)
      },
      
      getOrdersByDateRange: (start, end) => {
        const { orders } = get()
        const startDate = new Date(start)
        const endDate = new Date(end)
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= startDate && orderDate <= endDate
        })
      },
      
      getPendingOrders: () => {
        const { orders } = get()
        return orders.filter((order) => order.status === 'pending')
      },
      
      getRecentOrders: (limit = 10) => {
        const { orders } = get()
        return orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      },
      
      calculateAnalytics: () => {
        const { orders } = get()
        
        const totalOrders = orders.length
        const totalRevenue = orders
          .filter(order => order.paymentStatus === 'paid')
          .reduce((sum, order) => sum + order.total, 0)
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        const pendingOrders = orders.filter(order => order.status === 'pending').length
        const completedOrders = orders.filter(order => order.status === 'delivered').length
        const cancelledOrders = orders.filter(order => order.status === 'cancelled').length
        
        set({
          analytics: {
            totalOrders,
            totalRevenue,
            averageOrderValue,
            pendingOrders,
            completedOrders,
            cancelledOrders
          }
        })
      },
      
      resetFilters: () => set({ filters: initialFilters }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'order-store',
    }
  )
)