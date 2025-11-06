import { BaseApiService, ApiResponse, PaginationParams, FilterParams } from './api'

export interface Transaction {
  id: string
  type: 'sale' | 'refund' | 'void' | 'adjustment'
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  tax: number
  discount: number
  total: number
  currency: string
  paymentMethod: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'check' | 'store_credit'
  paymentDetails?: {
    cardType?: 'visa' | 'mastercard' | 'amex' | 'discover'
    last4?: string
    authCode?: string
    transactionId?: string
    gatewayResponse?: string
  }
  customerId?: string
  customerName?: string
  customerEmail?: string
  items: TransactionItem[]
  notes?: string
  receiptNumber: string
  cashierId: string
  cashierName: string
  terminalId?: string
  locationId?: string
  createdAt: string
  updatedAt: string
  processedAt?: string
  refundedAt?: string
  voidedAt?: string
}

export interface TransactionItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  total: number
}

export interface PaymentRequest {
  amount: number
  paymentMethod: string
  customerId?: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    discount?: number
  }>
  notes?: string
  terminalId?: string
}

export interface RefundRequest {
  transactionId: string
  amount?: number // Partial refund if specified
  reason: string
  items?: Array<{
    itemId: string
    quantity: number
  }>
}

export interface TransactionFilters extends FilterParams {
  type?: string
  status?: string
  paymentMethod?: string
  customerId?: string
  cashierId?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
}

export interface TransactionAnalytics {
  totalTransactions: number
  totalRevenue: number
  averageTransactionValue: number
  totalRefunds: number
  refundRate: number
  paymentMethodBreakdown: Array<{
    method: string
    count: number
    amount: number
    percentage: number
  }>
  hourlyTrends: Array<{
    hour: number
    transactions: number
    revenue: number
  }>
  dailyTrends: Array<{
    date: string
    transactions: number
    revenue: number
    refunds: number
  }>
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  cashierPerformance: Array<{
    cashierId: string
    cashierName: string
    transactions: number
    revenue: number
  }>
}

class TransactionService extends BaseApiService {
  private endpoint = '/transactions'

  // Transaction operations
  async getTransactions(
    params?: PaginationParams & TransactionFilters
  ): Promise<ApiResponse<Transaction[]>> {
    return this.getAll<Transaction>(this.endpoint, params)
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return this.getById<Transaction>(this.endpoint, id)
  }

  // Payment processing
  async processPayment(paymentRequest: PaymentRequest): Promise<ApiResponse<Transaction>> {
    return this.request(`${this.endpoint}/process`, {
      method: 'POST',
      body: JSON.stringify(paymentRequest)
    })
  }

  async processRefund(refundRequest: RefundRequest): Promise<ApiResponse<Transaction>> {
    return this.request(`${this.endpoint}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundRequest)
    })
  }

  async voidTransaction(
    transactionId: string,
    reason: string
  ): Promise<ApiResponse<Transaction>> {
    return this.patch<Transaction>(this.endpoint, transactionId, {
      status: 'cancelled',
      notes: reason,
      voidedAt: new Date().toISOString()
    })
  }

  // Receipt operations
  async getReceipt(transactionId: string): Promise<ApiResponse<{
    receiptData: {
      transaction: Transaction
      businessInfo: {
        name: string
        address: string
        phone: string
        email: string
        taxId?: string
      }
      receiptNumber: string
      timestamp: string
    }
  }>> {
    return this.request(`${this.endpoint}/${transactionId}/receipt`)
  }

  async printReceipt(
    transactionId: string,
    printerId?: string
  ): Promise<ApiResponse<{ printJobId: string }>> {
    return this.request(`${this.endpoint}/${transactionId}/print`, {
      method: 'POST',
      body: JSON.stringify({ printerId })
    })
  }

  async emailReceipt(
    transactionId: string,
    email: string
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${transactionId}/email`, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // Analytics and reporting
  async getAnalytics(
    dateRange?: { start: string; end: string },
    filters?: TransactionFilters
  ): Promise<ApiResponse<TransactionAnalytics>> {
    const params = { ...dateRange, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/analytics${queryString}`)
  }

  async getDailySummary(
    date: string
  ): Promise<ApiResponse<{
    date: string
    totalTransactions: number
    totalRevenue: number
    totalRefunds: number
    cashTransactions: number
    cardTransactions: number
    digitalWalletTransactions: number
    averageTransactionValue: number
    topSellingProducts: Array<{
      productId: string
      productName: string
      quantity: number
      revenue: number
    }>
  }>> {
    return this.request(`${this.endpoint}/daily-summary?date=${date}`)
  }

  // Search and filtering
  async searchTransactions(
    query: string,
    filters?: TransactionFilters
  ): Promise<ApiResponse<Transaction[]>> {
    return this.getAll<Transaction>(`${this.endpoint}/search`, {
      search: query,
      ...filters
    })
  }

  async getTransactionsByCustomer(
    customerId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Transaction[]>> {
    return this.getAll<Transaction>(`${this.endpoint}/customer/${customerId}`, params)
  }

  async getTransactionsByCashier(
    cashierId: string,
    params?: PaginationParams & FilterParams & { dateFrom?: string; dateTo?: string }
  ): Promise<ApiResponse<Transaction[]>> {
    return this.getAll<Transaction>(`${this.endpoint}/cashier/${cashierId}`, params)
  }

  // Batch operations
  async batchVoidTransactions(
    transactionIds: string[],
    reason: string
  ): Promise<ApiResponse<Transaction[]>> {
    return this.request(`${this.endpoint}/batch-void`, {
      method: 'POST',
      body: JSON.stringify({ transactionIds, reason })
    })
  }

  // Export functionality
  async exportTransactions(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    filters?: TransactionFilters & { dateFrom?: string; dateTo?: string }
  ): Promise<Blob> {
    const queryString = this.buildQueryString({ format, ...filters })
    const response = await fetch(`${this.baseUrl}${this.endpoint}/export${queryString}`)
    return response.blob()
  }

  // Payment method management
  async getPaymentMethods(): Promise<ApiResponse<Array<{
    id: string
    name: string
    type: string
    enabled: boolean
    processingFee?: number
    configuration?: Record<string, string | number | boolean | undefined | null>
  }>>> {
    return this.request(`${this.endpoint}/payment-methods`)
  }

  async updatePaymentMethod(
    methodId: string,
    updates: {
      enabled?: boolean
      processingFee?: number
      configuration?: Record<string, string | number | boolean | undefined | null>
    }
  ): Promise<ApiResponse<{
    enabled?: boolean
    processingFee?: number
    configuration?: Record<string, string | number | boolean | undefined | null>
  }>> {
    return this.patch(`${this.endpoint}/payment-methods`, methodId, updates)
  }

  // Terminal management
  async getTerminals(): Promise<ApiResponse<Array<{
    id: string
    name: string
    location: string
    status: 'online' | 'offline' | 'maintenance'
    lastSeen: string
  }>>> {
    return this.request(`${this.endpoint}/terminals`)
  }

  async getTerminalStatus(terminalId: string): Promise<ApiResponse<{
    id: string
    status: 'online' | 'offline' | 'maintenance'
    lastTransaction?: string
    dailyTotal: number
    transactionCount: number
  }>> {
    return this.request(`${this.endpoint}/terminals/${terminalId}/status`)
  }
}

// Create and export singleton instance
export const transactionService = new TransactionService()

// Types are already exported above