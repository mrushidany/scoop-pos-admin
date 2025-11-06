import { BaseApiService, ApiResponse, PaginationParams, FilterParams } from './api'

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  category: string
  brand?: string
  price: number
  cost: number
  stock: number
  minStock: number
  maxStock?: number
  unit: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  images?: string[]
  status: 'active' | 'inactive' | 'discontinued'
  supplier?: string
  location?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  lastRestocked?: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string
  cost?: number
  userId: string
  createdAt: string
}

export interface LowStockAlert {
  id: string
  productId: string
  productName: string
  currentStock: number
  minStock: number
  severity: 'low' | 'critical' | 'out_of_stock'
  createdAt: string
}

export interface InventoryFilters extends FilterParams {
  category?: string
  status?: string
  lowStock?: boolean
  supplier?: string
  priceMin?: number
  priceMax?: number
}

class InventoryService extends BaseApiService {
  private endpoint = '/inventory'

  // Product operations
  async getProducts(
    params?: PaginationParams & InventoryFilters
  ): Promise<ApiResponse<Product[]>> {
    return this.getAll<Product>(`${this.endpoint}/products`, params)
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.getById<Product>(`${this.endpoint}/products`, id)
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    return this.create<Product>(`${this.endpoint}/products`, product)
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.update<Product>(`${this.endpoint}/products`, id, product)
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.delete(`${this.endpoint}/products`, id)
  }

  // Stock operations
  async updateStock(
    productId: string,
    quantity: number,
    type: 'in' | 'out' | 'adjustment',
    reason: string,
    reference?: string
  ): Promise<ApiResponse<StockMovement>> {
    return this.create<StockMovement>(`${this.endpoint}/stock-movements`, {
      productId,
      quantity,
      type,
      reason,
      reference
    })
  }

  async getStockMovements(
    productId?: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<StockMovement[]>> {
    const endpoint = productId 
      ? `${this.endpoint}/products/${productId}/stock-movements`
      : `${this.endpoint}/stock-movements`
    return this.getAll<StockMovement>(endpoint, params)
  }

  // Low stock alerts
  async getLowStockAlerts(
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<LowStockAlert[]>> {
    return this.getAll<LowStockAlert>(`${this.endpoint}/low-stock-alerts`, params)
  }

  async dismissLowStockAlert(id: string): Promise<ApiResponse<void>> {
    return this.delete(`${this.endpoint}/low-stock-alerts`, id)
  }

  // Bulk operations
  async bulkUpdateStock(
    updates: Array<{
      productId: string
      quantity: number
      type: 'in' | 'out' | 'adjustment'
      reason: string
    }>
  ): Promise<ApiResponse<StockMovement[]>> {
    return this.request<StockMovement[]>(`${this.endpoint}/stock-movements/bulk`, {
      method: 'POST',
      body: JSON.stringify({ updates })
    })
  }

  async bulkUpdateProducts(
    updates: Array<{ id: string; data: Partial<Product> }>
  ): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(`${this.endpoint}/products/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ updates })
    })
  }

  // Analytics
  async getInventoryAnalytics(
    dateRange?: { start: string; end: string }
  ): Promise<ApiResponse<{
    totalProducts: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    topSellingProducts: Array<{ productId: string; productName: string; quantity: number }>
    categoryDistribution: Array<{ category: string; count: number; value: number }>
    stockMovementTrends: Array<{ date: string; in: number; out: number }>
  }>> {
    const queryString = dateRange ? this.buildQueryString(dateRange) : ''
    return this.request(`${this.endpoint}/analytics${queryString}`)
  }

  // Search and filters
  async searchProducts(
    query: string,
    filters?: InventoryFilters
  ): Promise<ApiResponse<Product[]>> {
    return this.getAll<Product>(`${this.endpoint}/products/search`, {
      search: query,
      ...filters
    })
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(`${this.endpoint}/categories`)
  }

  async getSuppliers(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(`${this.endpoint}/suppliers`)
  }

  // Import/Export
  async exportProducts(
    format: 'csv' | 'xlsx' = 'csv',
    filters?: InventoryFilters
  ): Promise<Blob> {
    const queryString = this.buildQueryString({ format, ...filters })
    const response = await fetch(`${this.baseUrl}${this.endpoint}/products/export${queryString}`)
    return response.blob()
  }

  async importProducts(file: File): Promise<ApiResponse<{
    imported: number
    failed: number
    errors: Array<{ row: number; error: string }>
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request(`${this.endpoint}/products/import`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    })
  }
}

// Create and export singleton instance
export const inventoryService = new InventoryService()