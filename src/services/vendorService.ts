import { BaseApiService, ApiResponse, PaginationParams, FilterParams } from './api'

export interface Vendor {
  id: string
  name: string
  companyName: string
  email: string
  phone: string
  website?: string
  taxId?: string
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'blacklisted'
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected'
  type: 'supplier' | 'manufacturer' | 'distributor' | 'service_provider' | 'other'
  category: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contactPerson: {
    name: string
    title?: string
    email: string
    phone: string
  }
  paymentTerms: {
    method: 'net_30' | 'net_60' | 'net_90' | 'cod' | 'prepaid' | 'custom'
    customTerms?: string
    creditLimit?: number
    currency: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    swiftCode?: string
  }
  documents: VendorDocument[]
  products: VendorProduct[]
  contracts: VendorContract[]
  performance: {
    rating: number
    totalOrders: number
    onTimeDeliveryRate: number
    qualityScore: number
    communicationScore: number
    lastOrderDate?: string
  }
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  verifiedAt?: string
  lastContactDate?: string
}

export interface VendorDocument {
  id: string
  type: 'business_license' | 'tax_certificate' | 'insurance' | 'certification' | 'contract' | 'other'
  name: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  expiryDate?: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  uploadedAt: string
  verifiedAt?: string
  verifiedBy?: string
}

export interface VendorProduct {
  id: string
  vendorSku: string
  name: string
  description?: string
  category: string
  unitPrice: number
  minimumOrderQuantity: number
  leadTime: number // in days
  availability: 'in_stock' | 'out_of_stock' | 'discontinued' | 'seasonal'
  specifications?: Record<string, string | number | boolean | undefined | null>
  images: string[]
  lastUpdated: string
}

export interface VendorContract {
  id: string
  type: 'supply_agreement' | 'service_contract' | 'nda' | 'exclusivity' | 'other'
  title: string
  description?: string
  startDate: string
  endDate: string
  value: number
  currency: string
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'
  terms: string[]
  documentUrl?: string
  signedAt?: string
  renewalDate?: string
}

export interface CreateVendorRequest {
  name: string
  companyName: string
  email: string
  phone: string
  website?: string
  taxId?: string
  type: Vendor['type']
  category: string
  address: Vendor['address']
  contactPerson: Vendor['contactPerson']
  paymentTerms: Vendor['paymentTerms']
  bankDetails?: Vendor['bankDetails']
  tags?: string[]
  notes?: string
}

export interface UpdateVendorRequest {
  name?: string
  companyName?: string
  email?: string
  phone?: string
  website?: string
  taxId?: string
  status?: Vendor['status']
  type?: Vendor['type']
  category?: string
  address?: Partial<Vendor['address']>
  contactPerson?: Partial<Vendor['contactPerson']>
  paymentTerms?: Partial<Vendor['paymentTerms']>
  bankDetails?: Partial<Vendor['bankDetails']>
  tags?: string[]
  notes?: string
}

export interface VendorFilters extends FilterParams {
  status?: string
  verificationStatus?: string
  type?: string
  category?: string
  country?: string
  state?: string
  city?: string
  ratingMin?: number
  ratingMax?: number
  hasContracts?: boolean
  contractStatus?: string
  lastContactFrom?: string
  lastContactTo?: string
}

export interface VendorAnalytics {
  totalVendors: number
  activeVendors: number
  verifiedVendors: number
  averageRating: number
  totalContracts: number
  activeContracts: number
  totalContractValue: number
  statusBreakdown: Array<{
    status: string
    count: number
    percentage: number
  }>
  typeBreakdown: Array<{
    type: string
    count: number
    percentage: number
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    percentage: number
  }>
  geographicDistribution: Array<{
    country: string
    state?: string
    count: number
  }>
  performanceMetrics: {
    averageOnTimeDelivery: number
    averageQualityScore: number
    averageCommunicationScore: number
    topPerformers: Array<{
      vendorId: string
      vendorName: string
      rating: number
      onTimeDeliveryRate: number
    }>
  }
  contractMetrics: {
    expiringContracts: number
    renewalOpportunities: number
    averageContractValue: number
    contractsByType: Array<{
      type: string
      count: number
      totalValue: number
    }>
  }
}

class VendorService extends BaseApiService {
  private endpoint = '/vendors'

  // Vendor CRUD operations
  async getVendors(
    params?: PaginationParams & VendorFilters
  ): Promise<ApiResponse<Vendor[]>> {
    return this.getAll<Vendor>(this.endpoint, params)
  }

  async getVendor(id: string): Promise<ApiResponse<Vendor>> {
    return this.getById<Vendor>(this.endpoint, id)
  }

  async createVendor(vendorData: CreateVendorRequest): Promise<ApiResponse<Vendor>> {
    return this.request(`${this.endpoint}`, {
      method: 'POST',
      body: JSON.stringify(vendorData)
    })
  }

  async updateVendor(
    id: string,
    updates: UpdateVendorRequest
  ): Promise<ApiResponse<Vendor>> {
    return this.request(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteVendor(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.endpoint, id)
  }

  // Vendor status management
  async updateVendorStatus(
    id: string,
    status: Vendor['status'],
    reason?: string
  ): Promise<ApiResponse<Vendor>> {
    return this.request(`${this.endpoint}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    })
  }

  async activateVendor(id: string): Promise<ApiResponse<Vendor>> {
    return this.updateVendorStatus(id, 'active')
  }

  async deactivateVendor(id: string, reason?: string): Promise<ApiResponse<Vendor>> {
    return this.updateVendorStatus(id, 'inactive', reason)
  }

  async suspendVendor(id: string, reason: string): Promise<ApiResponse<Vendor>> {
    return this.updateVendorStatus(id, 'suspended', reason)
  }

  // Vendor verification
  async submitForVerification(id: string): Promise<ApiResponse<Vendor>> {
    return this.request(`${this.endpoint}/${id}/verify`, {
      method: 'POST'
    })
  }

  async verifyVendor(
    id: string,
    verificationData: {
      status: 'verified' | 'rejected'
      notes?: string
      verifiedBy: string
    }
  ): Promise<ApiResponse<Vendor>> {
    return this.request(`${this.endpoint}/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...verificationData,
        verifiedAt: new Date().toISOString()
      })
    })
  }

  // Document management
  async uploadDocument(
    vendorId: string,
    documentData: {
      type: VendorDocument['type']
      name: string
      file: File
      expiryDate?: string
    }
  ): Promise<ApiResponse<VendorDocument>> {
    const formData = new FormData()
    formData.append('type', documentData.type)
    formData.append('name', documentData.name)
    formData.append('file', documentData.file)
    if (documentData.expiryDate) {
      formData.append('expiryDate', documentData.expiryDate)
    }

    return this.request(`${this.endpoint}/${vendorId}/documents`, {
      method: 'POST',
      body: formData
    })
  }

  async getVendorDocuments(
    vendorId: string
  ): Promise<ApiResponse<VendorDocument[]>> {
    return this.request(`${this.endpoint}/${vendorId}/documents`)
  }

  async deleteDocument(
    vendorId: string,
    documentId: string
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${vendorId}/documents/${documentId}`, {
      method: 'DELETE'
    })
  }

  async approveDocument(
    vendorId: string,
    documentId: string,
    verifiedBy: string
  ): Promise<ApiResponse<VendorDocument>> {
    return this.request(`${this.endpoint}/${vendorId}/documents/${documentId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'approved',
        verifiedBy,
        verifiedAt: new Date().toISOString()
      })
    })
  }

  // Product management
  async getVendorProducts(
    vendorId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<VendorProduct[]>> {
    return this.getAll<VendorProduct>(`${this.endpoint}/${vendorId}/products`, params)
  }

  async addVendorProduct(
    vendorId: string,
    productData: Omit<VendorProduct, 'id' | 'lastUpdated'>
  ): Promise<ApiResponse<VendorProduct>> {
    return this.request(`${this.endpoint}/${vendorId}/products`, {
      method: 'POST',
      body: JSON.stringify(productData)
    })
  }

  async updateVendorProduct(
    vendorId: string,
    productId: string,
    updates: Partial<VendorProduct>
  ): Promise<ApiResponse<VendorProduct>> {
    return this.request(`${this.endpoint}/${vendorId}/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async removeVendorProduct(
    vendorId: string,
    productId: string
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${vendorId}/products/${productId}`, {
      method: 'DELETE'
    })
  }

  // Contract management
  async getVendorContracts(
    vendorId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<VendorContract[]>> {
    return this.getAll<VendorContract>(`${this.endpoint}/${vendorId}/contracts`, params)
  }

  async createContract(
    vendorId: string,
    contractData: Omit<VendorContract, 'id'>
  ): Promise<ApiResponse<VendorContract>> {
    return this.request(`${this.endpoint}/${vendorId}/contracts`, {
      method: 'POST',
      body: JSON.stringify(contractData)
    })
  }

  async updateContract(
    vendorId: string,
    contractId: string,
    updates: Partial<VendorContract>
  ): Promise<ApiResponse<VendorContract>> {
    return this.request(`${this.endpoint}/${vendorId}/contracts/${contractId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async renewContract(
    vendorId: string,
    contractId: string,
    renewalData: {
      endDate: string
      value?: number
      terms?: string[]
    }
  ): Promise<ApiResponse<VendorContract>> {
    return this.request(`${this.endpoint}/${vendorId}/contracts/${contractId}/renew`, {
      method: 'POST',
      body: JSON.stringify({
        ...renewalData,
        renewalDate: new Date().toISOString()
      })
    })
  }

  // Performance tracking
  async updatePerformanceRating(
    vendorId: string,
    rating: {
      overall: number
      onTimeDelivery: number
      quality: number
      communication: number
      notes?: string
    }
  ): Promise<ApiResponse<Vendor>> {
    return this.request(`${this.endpoint}/${vendorId}/performance`, {
      method: 'PATCH',
      body: JSON.stringify(rating)
    })
  }

  async getPerformanceHistory(
    vendorId: string,
    dateRange?: { start: string; end: string }
  ): Promise<ApiResponse<Array<{
    date: string
    rating: number
    onTimeDeliveryRate: number
    qualityScore: number
    communicationScore: number
    orderCount: number
    notes?: string
  }>>> {
    const queryString = dateRange ? this.buildQueryString(dateRange) : ''
    return this.request(`${this.endpoint}/${vendorId}/performance/history${queryString}`)
  }

  // Search and filtering
  async searchVendors(
    query: string,
    filters?: VendorFilters
  ): Promise<ApiResponse<Vendor[]>> {
    const params = { search: query, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/search${queryString}`)
  }

  async getVendorsByCategory(
    category: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Vendor[]>> {
    return this.getAll<Vendor>(`${this.endpoint}/category/${category}`, params)
  }

  async getVendorsByLocation(
    location: { country?: string; state?: string; city?: string },
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Vendor[]>> {
    const queryParams = { ...location, ...params }
    return this.getAll<Vendor>(`${this.endpoint}/location`, queryParams)
  }

  // Analytics and reporting
  async getAnalytics(
    dateRange?: { start: string; end: string },
    filters?: VendorFilters
  ): Promise<ApiResponse<VendorAnalytics>> {
    const params = { ...dateRange, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/analytics${queryString}`)
  }

  async getExpiringContracts(
    daysAhead: number = 30
  ): Promise<ApiResponse<Array<{
    vendor: Vendor
    contract: VendorContract
    daysUntilExpiry: number
  }>>> {
    return this.request(`${this.endpoint}/contracts/expiring?days=${daysAhead}`)
  }

  async getTopPerformers(
    limit: number = 10,
    metric: 'rating' | 'onTimeDelivery' | 'quality' | 'communication' = 'rating'
  ): Promise<ApiResponse<Array<{
    vendor: Vendor
    score: number
    rank: number
  }>>> {
    return this.request(`${this.endpoint}/top-performers?limit=${limit}&metric=${metric}`)
  }

  // Export functionality
  async exportVendors(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    filters?: VendorFilters
  ): Promise<Blob> {
    const queryString = this.buildQueryString({ format, ...filters })
    const response = await fetch(`${this.baseUrl}${this.endpoint}/export${queryString}`)
    return response.blob()
  }

  // Communication tracking
  async recordCommunication(
    vendorId: string,
    communicationData: {
      type: 'email' | 'phone' | 'meeting' | 'other'
      subject: string
      notes?: string
      followUpRequired?: boolean
      followUpDate?: string
    }
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${vendorId}/communications`, {
      method: 'POST',
      body: JSON.stringify({
        ...communicationData,
        timestamp: new Date().toISOString()
      })
    })
  }

  async getCommunicationHistory(
    vendorId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Array<{
    id: string
    type: string
    subject: string
    notes?: string
    timestamp: string
    followUpRequired: boolean
    followUpDate?: string
    completedAt?: string
  }>>> {
    return this.getAll(`${this.endpoint}/${vendorId}/communications`, params)
  }
}

// Create and export singleton instance
export const vendorService = new VendorService()