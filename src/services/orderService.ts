import { BaseApiService, ApiResponse, PaginationParams, FilterParams } from './api'

export interface Order {
  id: string
  orderNumber: string
  type: 'in_store' | 'online' | 'phone' | 'delivery' | 'pickup'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'refunded'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  customerId?: string
  customerInfo: {
    name: string
    email?: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  shippingCost: number
  total: number
  currency: string
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed'
  paymentMethod?: string
  shippingMethod?: string
  trackingNumber?: string
  estimatedDelivery?: string
  actualDelivery?: string
  notes?: string
  internalNotes?: string
  tags: string[]
  source: 'pos' | 'website' | 'mobile_app' | 'phone' | 'marketplace'
  assignedTo?: string
  locationId?: string
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  completedAt?: string
  cancelledAt?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  variant?: {
    size?: string
    color?: string
    style?: string
  }
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  total: number
  notes?: string
  customizations?: Array<{
    name: string
    value: string
    price?: number
  }>
}

export interface CreateOrderRequest {
  type: Order['type']
  customerId?: string
  customerInfo: Order['customerInfo']
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    discount?: number
    notes?: string
    customizations?: OrderItem['customizations']
  }>
  shippingMethod?: string
  paymentMethod?: string
  notes?: string
  tags?: string[]
  priority?: Order['priority']
}

export interface UpdateOrderRequest {
  status?: Order['status']
  priority?: Order['priority']
  customerInfo?: Partial<Order['customerInfo']>
  items?: OrderItem[]
  shippingMethod?: string
  trackingNumber?: string
  estimatedDelivery?: string
  notes?: string
  internalNotes?: string
  tags?: string[]
  assignedTo?: string
}

export interface OrderFilters extends FilterParams {
  status?: string
  type?: string
  priority?: string
  paymentStatus?: string
  customerId?: string
  assignedTo?: string
  source?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  tags?: string
}

export interface OrderAnalytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  completionRate: number
  cancellationRate: number
  statusBreakdown: Array<{
    status: string
    count: number
    percentage: number
  }>
  typeBreakdown: Array<{
    type: string
    count: number
    revenue: number
    percentage: number
  }>
  dailyTrends: Array<{
    date: string
    orders: number
    revenue: number
    completedOrders: number
    cancelledOrders: number
  }>
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  customerMetrics: {
    newCustomers: number
    returningCustomers: number
    averageOrdersPerCustomer: number
  }
  fulfillmentMetrics: {
    averageProcessingTime: number
    averageDeliveryTime: number
    onTimeDeliveryRate: number
  }
}

class OrderService extends BaseApiService {
  private endpoint = '/orders'

  // Order CRUD operations
  async getOrders(
    params?: PaginationParams & OrderFilters
  ): Promise<ApiResponse<Order[]>> {
    return this.getAll<Order>(this.endpoint, params)
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.getById<Order>(this.endpoint, id)
  }

  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request(`${this.endpoint}`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }

  async updateOrder(
    id: string,
    updates: UpdateOrderRequest
  ): Promise<ApiResponse<Order>> {
    return this.request(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.endpoint, id)
  }

  // Order status management
  async updateOrderStatus(
    id: string,
    status: Order['status'],
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return this.patch<Order>(this.endpoint, id, {
      status,
      internalNotes: notes,
      ...(status === 'confirmed' && { confirmedAt: new Date().toISOString() }),
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      ...(status === 'cancelled' && { cancelledAt: new Date().toISOString() })
    })
  }

  async confirmOrder(id: string): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(id, 'confirmed')
  }

  async cancelOrder(id: string, reason: string): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(id, 'cancelled', reason)
  }

  async completeOrder(id: string): Promise<ApiResponse<Order>> {
    return this.updateOrderStatus(id, 'completed')
  }

  // Order fulfillment
  async assignOrder(
    id: string,
    assignedTo: string
  ): Promise<ApiResponse<Order>> {
    return this.patch<Order>(this.endpoint, id, { assignedTo })
  }

  async updateShipping(
    id: string,
    shippingData: {
      shippingMethod?: string
      trackingNumber?: string
      estimatedDelivery?: string
    }
  ): Promise<ApiResponse<Order>> {
    return this.patch<Order>(this.endpoint, id, shippingData)
  }

  async markAsDelivered(
    id: string,
    deliveryDate?: string
  ): Promise<ApiResponse<Order>> {
    return this.patch<Order>(this.endpoint, id, {
      status: 'completed',
      actualDelivery: deliveryDate || new Date().toISOString(),
      completedAt: new Date().toISOString()
    })
  }

  // Order items management
  async addOrderItem(
    orderId: string,
    item: Omit<OrderItem, 'id'>
  ): Promise<ApiResponse<Order>> {
    return this.request(`${this.endpoint}/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(item)
    })
  }

  async updateOrderItem(
    orderId: string,
    itemId: string,
    updates: Partial<OrderItem>
  ): Promise<ApiResponse<Order>> {
    return this.request(`${this.endpoint}/${orderId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async removeOrderItem(
    orderId: string,
    itemId: string
  ): Promise<ApiResponse<Order>> {
    return this.request(`${this.endpoint}/${orderId}/items/${itemId}`, {
      method: 'DELETE'
    })
  }

  // Search and filtering
  async searchOrders(
    query: string,
    filters?: OrderFilters
  ): Promise<ApiResponse<Order[]>> {
    const params = { search: query, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/search${queryString}`)
  }

  async getOrdersByCustomer(
    customerId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Order[]>> {
    return this.getAll<Order>(`${this.endpoint}/customer/${customerId}`, params)
  }

  async getOrdersByStatus(
    status: Order['status'],
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Order[]>> {
    return this.getAll<Order>(`${this.endpoint}/status/${status}`, params)
  }

  async getOrdersByAssignee(
    assigneeId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Order[]>> {
    return this.getAll<Order>(`${this.endpoint}/assigned/${assigneeId}`, params)
  }

  // Analytics and reporting
  async getAnalytics(
    dateRange?: { start: string; end: string },
    filters?: Omit<OrderFilters, 'tags'> & { tags?: string }
  ): Promise<ApiResponse<OrderAnalytics>> {
    const params = { ...dateRange, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/analytics${queryString}`)
  }

  async getDailySummary(
    date: string
  ): Promise<ApiResponse<{
    date: string
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    totalRevenue: number
    averageOrderValue: number
    topProducts: Array<{
      productId: string
      productName: string
      quantity: number
    }>
  }>> {
    return this.request(`${this.endpoint}/daily-summary?date=${date}`)
  }

  // Batch operations
  async batchUpdateStatus(
    orderIds: string[],
    status: Order['status'],
    notes?: string
  ): Promise<ApiResponse<Order[]>> {
    return this.request(`${this.endpoint}/batch-status`, {
      method: 'POST',
      body: JSON.stringify({ orderIds, status, notes })
    })
  }

  async batchAssign(
    orderIds: string[],
    assignedTo: string
  ): Promise<ApiResponse<Order[]>> {
    return this.request(`${this.endpoint}/batch-assign`, {
      method: 'POST',
      body: JSON.stringify({ orderIds, assignedTo })
    })
  }

  // Export functionality
  async exportOrders(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    filters?: Omit<OrderFilters, 'tags'> & { tags?: string; dateFrom?: string; dateTo?: string }
  ): Promise<Blob> {
    const queryString = this.buildQueryString({ format, ...filters })
    const response = await fetch(`${this.baseUrl}${this.endpoint}/export${queryString}`)
    return response.blob()
  }

  // Order templates
  async getOrderTemplates(): Promise<ApiResponse<Array<{
    id: string
    name: string
    description?: string
    items: OrderItem[]
    tags: string[]
    createdAt: string
  }>>> {
    return this.request(`${this.endpoint}/templates`)
  }

  async createOrderFromTemplate(
    templateId: string,
    customerInfo: Order['customerInfo'],
    customizations?: {
      items?: Partial<OrderItem>[]
      notes?: string
      priority?: Order['priority']
    }
  ): Promise<ApiResponse<Order>> {
    return this.request(`${this.endpoint}/templates/${templateId}/create`, {
      method: 'POST',
      body: JSON.stringify({ customerInfo, customizations })
    })
  }

  // Order notifications
  async sendOrderNotification(
    orderId: string,
    type: 'confirmation' | 'status_update' | 'shipping' | 'delivery',
    customMessage?: string
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${orderId}/notify`, {
      method: 'POST',
      body: JSON.stringify({ type, customMessage })
    })
  }

  // Order history and tracking
  async getOrderHistory(
    orderId: string
  ): Promise<ApiResponse<Array<{
    id: string
    action: string
    description: string
    performedBy: string
    timestamp: string
    metadata?: Record<string, string | number | boolean | undefined | null>
  }>>> {
    return this.request(`${this.endpoint}/${orderId}/history`)
  }

  async trackOrder(
    orderNumber: string
  ): Promise<ApiResponse<{
    order: Order
    timeline: Array<{
      status: string
      timestamp: string
      description: string
      location?: string
    }>
    estimatedDelivery?: string
    currentLocation?: string
  }>> {
    return this.request(`${this.endpoint}/track/${orderNumber}`)
  }
}

// Create and export singleton instance
export const orderService = new OrderService()