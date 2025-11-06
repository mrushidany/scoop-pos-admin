// Common types for all stores
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// User types
export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  avatar?: string
  phone?: string
  lastLoginAt?: string
  permissions: Permission[]
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

// Vendor types
export interface Vendor extends BaseEntity {
  businessName: string
  contactEmail: string
  contactPhone: string
  businessType: string
  status: VendorStatus
  verificationStatus: VerificationStatus
  address: Address
  businessLicense?: string
  taxId?: string
  commissionRate: number
  paymentSettings: PaymentSettings
  onboardingProgress: OnboardingProgress
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface PaymentSettings {
  bankAccount?: BankAccount
  paymentMethods: string[]
  settlementSchedule: 'daily' | 'weekly' | 'monthly'
}

export interface BankAccount {
  accountNumber: string
  routingNumber: string
  accountHolderName: string
  bankName: string
}

export interface OnboardingProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  isCompleted: boolean
}

export type VendorStatus = 'active' | 'inactive' | 'suspended' | 'pending'
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'under_review'

// Product/Inventory types
export interface Product extends BaseEntity {
  name: string
  description: string
  sku: string
  vendorId: string
  categoryId: string
  price: number
  costPrice: number
  quantity: number
  minStockLevel: number
  maxStockLevel: number
  status: ProductStatus
  images: string[]
  attributes: ProductAttribute[]
  variants: ProductVariant[]
}

export interface ProductCategory extends BaseEntity {
  name: string
  description: string
  parentId?: string
  isActive: boolean
}

export interface ProductAttribute {
  name: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'select'
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  attributes: ProductAttribute[]
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued'

// Transaction types
export interface Transaction extends BaseEntity {
  transactionId: string
  vendorId: string
  customerId?: string
  amount: number
  currency: string
  status: TransactionStatus
  paymentMethod: string
  paymentGateway: string
  description: string
  metadata: Record<string, any>
  refunds: Refund[]
}

export interface Refund extends BaseEntity {
  transactionId: string
  amount: number
  reason: string
  status: RefundStatus
  processedBy: string
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed'

// Order types
export interface Order extends BaseEntity {
  orderNumber: string
  vendorId: string
  customerId?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  shippingAddress: Address
  billingAddress: Address
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  notes?: string
}

export interface OrderItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  productName: string
  productSku: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
export type FulfillmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned'

// Analytics types
export interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  totalVendors: number
  totalProducts: number
  revenueGrowth: number
  orderGrowth: number
  vendorGrowth: number
  productGrowth: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

// Notification types
export interface Notification extends BaseEntity {
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  userId: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'