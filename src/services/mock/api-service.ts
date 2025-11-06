import type {
  User,
  UserRole,
  Permission,
  Vendor,
  Product,
  ProductCategory,
  Transaction,
  Order,
  DashboardMetrics,
  Notification,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/stores/types'

import {
  mockUsers,
  mockRoles,
  mockPermissions,
  mockVendors,
  mockProducts,
  mockCategories,
  mockTransactions,
  mockOrders,
  mockDashboardMetrics,
  mockNotifications,
  generateMockUser,
  generateMockVendor,
} from './mock-data'

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Generic paginate function
function paginate<T>(data: T[], params: PaginationParams): PaginatedResponse<T> {
  const { page, limit, search, sortBy, sortOrder } = params
  let filtered = [...data]

  // Apply search if provided
  if (search) {
    filtered = filtered.filter((item: any) => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    })
  }

  // Apply sorting if provided
  if (sortBy) {
    filtered.sort((a: any, b: any) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = filtered.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
  }
}

// User API Service
export const userApiService = {
  // Get paginated users
  getUsers: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    await delay()
    const result = paginate(mockUsers, params)
    return {
      success: true,
      data: result,
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    await delay()
    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      return {
        success: false,
        data: null as any,
        error: 'User not found',
      }
    }
    return {
      success: true,
      data: user,
    }
  },

  // Create user
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
    await delay()
    const newUser = generateMockUser(userData)
    mockUsers.unshift(newUser)
    return {
      success: true,
      data: newUser,
      message: 'User created successfully',
    }
  },

  // Update user
  updateUser: async (id: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    await delay()
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return {
        success: false,
        data: null as any,
        error: 'User not found',
      }
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    mockUsers[userIndex] = updatedUser
    
    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    await delay()
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return {
        success: false,
        data: undefined,
        error: 'User not found',
      }
    }
    
    mockUsers.splice(userIndex, 1)
    return {
      success: true,
      data: undefined,
      message: 'User deleted successfully',
    }
  },

  // Get roles
  getRoles: async (): Promise<ApiResponse<UserRole[]>> => {
    await delay()
    return {
      success: true,
      data: mockRoles,
    }
  },

  // Get permissions
  getPermissions: async (): Promise<ApiResponse<Permission[]>> => {
    await delay()
    return {
      success: true,
      data: mockPermissions,
    }
  },
}

// Vendor API Service
export const vendorApiService = {
  // Get paginated vendors
  getVendors: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Vendor>>> => {
    await delay()
    const result = paginate(mockVendors, params)
    return {
      success: true,
      data: result,
    }
  },

  // Get vendor by ID
  getVendorById: async (id: string): Promise<ApiResponse<Vendor>> => {
    await delay()
    const vendor = mockVendors.find(v => v.id === id)
    if (!vendor) {
      return {
        success: false,
        data: null as any,
        error: 'Vendor not found',
      }
    }
    return {
      success: true,
      data: vendor,
    }
  },

  // Create vendor
  createVendor: async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Vendor>> => {
    await delay()
    const newVendor = generateMockVendor(vendorData)
    mockVendors.unshift(newVendor)
    return {
      success: true,
      data: newVendor,
      message: 'Vendor created successfully',
    }
  },

  // Update vendor
  updateVendor: async (id: string, updates: Partial<Vendor>): Promise<ApiResponse<Vendor>> => {
    await delay()
    const vendorIndex = mockVendors.findIndex(v => v.id === id)
    if (vendorIndex === -1) {
      return {
        success: false,
        data: null as any,
        error: 'Vendor not found',
      }
    }
    
    const updatedVendor = {
      ...mockVendors[vendorIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    mockVendors[vendorIndex] = updatedVendor
    
    return {
      success: true,
      data: updatedVendor,
      message: 'Vendor updated successfully',
    }
  },

  // Delete vendor
  deleteVendor: async (id: string): Promise<ApiResponse<void>> => {
    await delay()
    const vendorIndex = mockVendors.findIndex(v => v.id === id)
    if (vendorIndex === -1) {
      return {
        success: false,
        data: undefined,
        error: 'Vendor not found',
      }
    }
    
    mockVendors.splice(vendorIndex, 1)
    return {
      success: true,
      data: undefined,
      message: 'Vendor deleted successfully',
    }
  },

  // Approve vendor
  approveVendor: async (id: string): Promise<ApiResponse<Vendor>> => {
    return vendorApiService.updateVendor(id, {
      status: 'active',
      verificationStatus: 'verified',
    })
  },

  // Reject vendor
  rejectVendor: async (id: string, reason: string): Promise<ApiResponse<Vendor>> => {
    return vendorApiService.updateVendor(id, {
      status: 'inactive',
      verificationStatus: 'rejected',
    })
  },
}

// Product/Inventory API Service
export const inventoryApiService = {
  // Get paginated products
  getProducts: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    await delay()
    const result = paginate(mockProducts, params)
    return {
      success: true,
      data: result,
    }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    await delay()
    const product = mockProducts.find(p => p.id === id)
    if (!product) {
      return {
        success: false,
        data: null as any,
        error: 'Product not found',
      }
    }
    return {
      success: true,
      data: product,
    }
  },

  // Get categories
  getCategories: async (): Promise<ApiResponse<ProductCategory[]>> => {
    await delay()
    return {
      success: true,
      data: mockCategories,
    }
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<ApiResponse<Product[]>> => {
    await delay()
    const lowStockProducts = mockProducts.filter(p => p.quantity <= p.minStockLevel)
    return {
      success: true,
      data: lowStockProducts,
    }
  },

  // Update product stock
  updateProductStock: async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
    await delay()
    const productIndex = mockProducts.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return {
        success: false,
        data: null as any,
        error: 'Product not found',
      }
    }
    
    const updatedProduct = {
      ...mockProducts[productIndex],
      quantity,
      updatedAt: new Date().toISOString(),
    }
    mockProducts[productIndex] = updatedProduct
    
    return {
      success: true,
      data: updatedProduct,
      message: 'Product stock updated successfully',
    }
  },
}

// Transaction API Service
export const transactionApiService = {
  // Get paginated transactions
  getTransactions: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    await delay()
    const result = paginate(mockTransactions, params)
    return {
      success: true,
      data: result,
    }
  },

  // Get transaction by ID
  getTransactionById: async (id: string): Promise<ApiResponse<Transaction>> => {
    await delay()
    const transaction = mockTransactions.find(t => t.id === id)
    if (!transaction) {
      return {
        success: false,
        data: null as any,
        error: 'Transaction not found',
      }
    }
    return {
      success: true,
      data: transaction,
    }
  },

  // Get transactions by vendor
  getTransactionsByVendor: async (vendorId: string): Promise<ApiResponse<Transaction[]>> => {
    await delay()
    const vendorTransactions = mockTransactions.filter(t => t.vendorId === vendorId)
    return {
      success: true,
      data: vendorTransactions,
    }
  },

  refundTransaction: async (transactionId: string, amount?: number): Promise<ApiResponse<Transaction>> => {
    await delay()
    const transactionIndex = mockTransactions.findIndex(t => t.id === transactionId)
    
    if (transactionIndex === -1) {
      return {
        success: false,
        error: 'Transaction not found',
      }
    }

    const transaction = mockTransactions[transactionIndex]
    const refundAmount = amount || transaction.amount
    
    // Create refunded transaction
    const refundedTransaction = {
      ...transaction,
      status: 'refunded' as const,
      amount: refundAmount,
      updatedAt: new Date().toISOString(),
    }
    
    mockTransactions[transactionIndex] = refundedTransaction
    
    return {
      success: true,
      data: refundedTransaction,
      message: 'Transaction refunded successfully',
    }
  },

  processTransaction: async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Transaction>> => {
    await delay()
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockTransactions.unshift(newTransaction)
    
    return {
      success: true,
      data: newTransaction,
      message: 'Transaction processed successfully',
    }
  },
}

// Order API Service
export const orderApiService = {
  // Get paginated orders
  getOrders: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    await delay()
    const result = paginate(mockOrders, params)
    return {
      success: true,
      data: result,
    }
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    await delay()
    const order = mockOrders.find(o => o.id === id)
    if (!order) {
      return {
        success: false,
        data: null as any,
        error: 'Order not found',
      }
    }
    return {
      success: true,
      data: order,
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, status: Order['status']): Promise<ApiResponse<Order>> => {
    await delay()
    const orderIndex = mockOrders.findIndex(o => o.id === id)
    if (orderIndex === -1) {
      return {
        success: false,
        data: null as any,
        error: 'Order not found',
      }
    }
    
    const updatedOrder = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    }
    mockOrders[orderIndex] = updatedOrder
    
    return {
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    }
  },

  // Create order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Order>> => {
    await delay()
    
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockOrders.unshift(newOrder)
    
    return {
      success: true,
      data: newOrder,
      message: 'Order created successfully',
    }
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
    await delay()
    const orderIndex = mockOrders.findIndex(o => o.id === id)
    if (orderIndex === -1) {
      return {
        success: false,
        error: 'Order not found',
      }
    }
    
    const cancelledOrder = {
      ...mockOrders[orderIndex],
      status: 'cancelled' as const,
      updatedAt: new Date().toISOString(),
    }
    mockOrders[orderIndex] = cancelledOrder
    
    return {
      success: true,
      data: cancelledOrder,
      message: 'Order cancelled successfully',
    }
  },
}

// Analytics API Service
export const analyticsApiService = {
  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<ApiResponse<DashboardMetrics>> => {
    await delay()
    return {
      success: true,
      data: mockDashboardMetrics,
    }
  },

  // Get revenue chart data
  getRevenueChartData: async (period: 'week' | 'month' | 'year'): Promise<ApiResponse<any>> => {
    await delay()
    
    // Generate mock chart data based on period
    const generateChartData = (period: string) => {
      const labels = []
      const data = []
      
      if (period === 'week') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        labels.push(...days)
        data.push(...[1200, 1900, 3000, 5000, 2000, 3000, 4500])
      } else if (period === 'month') {
        for (let i = 1; i <= 30; i++) {
          labels.push(`Day ${i}`)
          data.push(Math.floor(Math.random() * 5000) + 1000)
        }
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        labels.push(...months)
        data.push(...[15000, 18000, 22000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000])
      }
      
      return {
        labels,
        datasets: [{
          label: 'Revenue',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
        }]
      }
    }
    
    return {
      success: true,
      data: generateChartData(period),
    }
  },
}

// Notification API Service
export const notificationApiService = {
  // Get notifications
  getNotifications: async (userId: string): Promise<ApiResponse<Notification[]>> => {
    await delay()
    const userNotifications = mockNotifications.filter(n => n.userId === userId)
    return {
      success: true,
      data: userNotifications,
    }
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    await delay()
    const notificationIndex = mockNotifications.findIndex(n => n.id === id)
    if (notificationIndex === -1) {
      return {
        success: false,
        data: null as any,
        error: 'Notification not found',
      }
    }
    
    const updatedNotification = {
      ...mockNotifications[notificationIndex],
      isRead: true,
      updatedAt: new Date().toISOString(),
    }
    mockNotifications[notificationIndex] = updatedNotification
    
    return {
      success: true,
      data: updatedNotification,
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string): Promise<ApiResponse<void>> => {
    await delay()
    mockNotifications.forEach(notification => {
      if (notification.userId === userId) {
        notification.isRead = true
        notification.updatedAt = new Date().toISOString()
      }
    })
    
    return {
      success: true,
      data: undefined,
      message: 'All notifications marked as read',
    }
  },
}