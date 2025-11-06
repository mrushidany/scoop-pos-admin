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
} from '@/stores/types'

// Mock permissions
export const mockPermissions: Permission[] = [
  {
    id: 'perm-1',
    name: 'users.read',
    resource: 'users',
    action: 'read',
    description: 'View users',
  },
  {
    id: 'perm-2',
    name: 'users.write',
    resource: 'users',
    action: 'write',
    description: 'Create and edit users',
  },
  {
    id: 'perm-3',
    name: 'users.delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete users',
  },
  {
    id: 'perm-4',
    name: 'vendors.read',
    resource: 'vendors',
    action: 'read',
    description: 'View vendors',
  },
  {
    id: 'perm-5',
    name: 'vendors.write',
    resource: 'vendors',
    action: 'write',
    description: 'Create and edit vendors',
  },
  {
    id: 'perm-6',
    name: 'vendors.approve',
    resource: 'vendors',
    action: 'approve',
    description: 'Approve vendor applications',
  },
  {
    id: 'perm-7',
    name: 'inventory.read',
    resource: 'inventory',
    action: 'read',
    description: 'View inventory',
  },
  {
    id: 'perm-8',
    name: 'inventory.write',
    resource: 'inventory',
    action: 'write',
    description: 'Manage inventory',
  },
  {
    id: 'perm-9',
    name: 'transactions.read',
    resource: 'transactions',
    action: 'read',
    description: 'View transactions',
  },
  {
    id: 'perm-10',
    name: 'orders.read',
    resource: 'orders',
    action: 'read',
    description: 'View orders',
  },
  {
    id: 'perm-11',
    name: 'orders.write',
    resource: 'orders',
    action: 'write',
    description: 'Manage orders',
  },
  {
    id: 'perm-12',
    name: 'analytics.read',
    resource: 'analytics',
    action: 'read',
    description: 'View analytics and reports',
  },
]

// Mock roles
export const mockRoles: UserRole[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full system access',
    permissions: mockPermissions,
  },
  {
    id: 'role-2',
    name: 'Admin',
    description: 'Administrative access',
    permissions: mockPermissions.filter(p => !p.name.includes('delete')),
  },
  {
    id: 'role-3',
    name: 'Manager',
    description: 'Management access',
    permissions: mockPermissions.filter(p => 
      ['vendors', 'inventory', 'orders', 'analytics'].some(resource => 
        p.resource === resource
      )
    ),
  },
  {
    id: 'role-4',
    name: 'Operator',
    description: 'Basic operational access',
    permissions: mockPermissions.filter(p => 
      p.action === 'read' || (p.resource === 'orders' && p.action === 'write')
    ),
  },
]

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@posadmin.com',
    firstName: 'John',
    lastName: 'Doe',
    role: mockRoles[0],
    status: 'active',
    avatar: '/img/avatars/thumb-1.jpg',
    phone: '+1-555-0123',
    lastLoginAt: '2024-01-15T10:30:00Z',
    permissions: mockRoles[0].permissions,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'user-2',
    email: 'manager@posadmin.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: mockRoles[2],
    status: 'active',
    avatar: '/img/avatars/thumb-2.jpg',
    phone: '+1-555-0124',
    lastLoginAt: '2024-01-15T09:15:00Z',
    permissions: mockRoles[2].permissions,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
  },
  {
    id: 'user-3',
    email: 'operator@posadmin.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: mockRoles[3],
    status: 'active',
    avatar: '/img/avatars/thumb-3.jpg',
    phone: '+1-555-0125',
    lastLoginAt: '2024-01-15T08:45:00Z',
    permissions: mockRoles[3].permissions,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-15T08:45:00Z',
  },
  {
    id: 'user-4',
    email: 'sarah.wilson@posadmin.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: mockRoles[1],
    status: 'pending',
    avatar: '/img/avatars/thumb-4.jpg',
    phone: '+1-555-0126',
    permissions: mockRoles[1].permissions,
    createdAt: '2024-01-14T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
  },
]

// Mock vendors
export const mockVendors: Vendor[] = [
  {
    id: 'vendor-1',
    businessName: 'Tech Solutions Inc.',
    contactEmail: 'contact@techsolutions.com',
    contactPhone: '+1-555-1001',
    businessType: 'Technology',
    status: 'active',
    verificationStatus: 'verified',
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
    },
    businessLicense: 'BL-2024-001',
    taxId: 'TAX-123456789',
    commissionRate: 5.5,
    paymentSettings: {
      bankAccount: {
        accountNumber: '****1234',
        routingNumber: '123456789',
        accountHolderName: 'Tech Solutions Inc.',
        bankName: 'First National Bank',
      },
      paymentMethods: ['credit_card', 'bank_transfer'],
      settlementSchedule: 'weekly',
    },
    onboardingProgress: {
      currentStep: 5,
      totalSteps: 5,
      completedSteps: ['basic_info', 'business_details', 'verification', 'payment_setup', 'review'],
      isCompleted: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'vendor-2',
    businessName: 'Fashion Forward LLC',
    contactEmail: 'info@fashionforward.com',
    contactPhone: '+1-555-1002',
    businessType: 'Retail',
    status: 'pending',
    verificationStatus: 'pending',
    address: {
      street: '456 Fashion Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    businessLicense: 'BL-2024-002',
    commissionRate: 6.0,
    paymentSettings: {
      paymentMethods: ['credit_card'],
      settlementSchedule: 'monthly',
    },
    onboardingProgress: {
      currentStep: 3,
      totalSteps: 5,
      completedSteps: ['basic_info', 'business_details', 'verification'],
      isCompleted: false,
    },
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z',
  },
  {
    id: 'vendor-3',
    businessName: 'Gourmet Foods Co.',
    contactEmail: 'orders@gourmetfoods.com',
    contactPhone: '+1-555-1003',
    businessType: 'Food & Beverage',
    status: 'active',
    verificationStatus: 'verified',
    address: {
      street: '789 Culinary Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    businessLicense: 'BL-2024-003',
    taxId: 'TAX-987654321',
    commissionRate: 4.5,
    paymentSettings: {
      bankAccount: {
        accountNumber: '****5678',
        routingNumber: '987654321',
        accountHolderName: 'Gourmet Foods Co.',
        bankName: 'Community Bank',
      },
      paymentMethods: ['credit_card', 'bank_transfer', 'digital_wallet'],
      settlementSchedule: 'daily',
    },
    onboardingProgress: {
      currentStep: 5,
      totalSteps: 5,
      completedSteps: ['basic_info', 'business_details', 'verification', 'payment_setup', 'review'],
      isCompleted: true,
    },
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
]

// Mock product categories
export const mockCategories: ProductCategory[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    description: 'Apparel and fashion items',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Food & Beverage',
    description: 'Food items and beverages',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// Mock products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    sku: 'WBH-001',
    vendorId: 'vendor-1',
    categoryId: 'cat-1',
    price: 199.99,
    costPrice: 120.00,
    quantity: 150,
    minStockLevel: 20,
    maxStockLevel: 500,
    status: 'active',
    images: ['/img/products/headphones-1.jpg', '/img/products/headphones-2.jpg'],
    attributes: [
      { name: 'Color', value: 'Black', type: 'select' },
      { name: 'Battery Life', value: '30 hours', type: 'text' },
      { name: 'Wireless', value: 'true', type: 'boolean' },
    ],
    variants: [
      {
        id: 'var-1',
        name: 'Black',
        sku: 'WBH-001-BLK',
        price: 199.99,
        quantity: 100,
        attributes: [{ name: 'Color', value: 'Black', type: 'select' }],
      },
      {
        id: 'var-2',
        name: 'White',
        sku: 'WBH-001-WHT',
        price: 199.99,
        quantity: 50,
        attributes: [{ name: 'Color', value: 'White', type: 'select' }],
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Premium Coffee Beans',
    description: 'Organic single-origin coffee beans',
    sku: 'PCB-001',
    vendorId: 'vendor-3',
    categoryId: 'cat-3',
    price: 24.99,
    costPrice: 15.00,
    quantity: 8,
    minStockLevel: 10,
    maxStockLevel: 200,
    status: 'active',
    images: ['/img/products/coffee-1.jpg'],
    attributes: [
      { name: 'Origin', value: 'Colombia', type: 'text' },
      { name: 'Roast Level', value: 'Medium', type: 'select' },
      { name: 'Organic', value: 'true', type: 'boolean' },
    ],
    variants: [],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
]

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    transactionId: 'TXN-2024-001',
    vendorId: 'vendor-1',
    customerId: 'cust-1',
    amount: 199.99,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'credit_card',
    paymentGateway: 'stripe',
    description: 'Purchase of Wireless Bluetooth Headphones',
    metadata: {
      orderId: 'order-1',
      productId: 'prod-1',
    },
    refunds: [],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'txn-2',
    transactionId: 'TXN-2024-002',
    vendorId: 'vendor-3',
    customerId: 'cust-2',
    amount: 49.98,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'digital_wallet',
    paymentGateway: 'paypal',
    description: 'Purchase of Premium Coffee Beans (2x)',
    metadata: {
      orderId: 'order-2',
      productId: 'prod-2',
    },
    refunds: [],
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
  },
]

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    vendorId: 'vendor-1',
    customerId: 'cust-1',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        variantId: 'var-1',
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99,
        productName: 'Wireless Bluetooth Headphones',
        productSku: 'WBH-001-BLK',
      },
    ],
    subtotal: 199.99,
    tax: 16.00,
    shipping: 9.99,
    total: 225.98,
    status: 'delivered',
    shippingAddress: {
      street: '123 Customer St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Customer St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered',
    notes: 'Customer requested expedited shipping',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
]

// Mock dashboard metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalRevenue: 125430.50,
  totalOrders: 1247,
  totalVendors: 156,
  totalProducts: 2341,
  revenueGrowth: 12.5,
  orderGrowth: 8.3,
  vendorGrowth: 15.2,
  productGrowth: 22.1,
}

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'New Vendor Application',
    message: 'Fashion Forward LLC has submitted a new vendor application',
    type: 'info',
    isRead: false,
    userId: 'user-1',
    actionUrl: '/logistics/vendor',
    metadata: { vendorId: 'vendor-2' },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'Low Stock Alert',
    message: 'Premium Coffee Beans is running low on stock (8 remaining)',
    type: 'warning',
    isRead: false,
    userId: 'user-2',
    actionUrl: '/logistics/inventory',
    metadata: { productId: 'prod-2' },
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  },
  {
    id: 'notif-3',
    title: 'Transaction Completed',
    message: 'Payment of $199.99 has been processed successfully',
    type: 'success',
    isRead: true,
    userId: 'user-1',
    actionUrl: '/finance/transactions',
    metadata: { transactionId: 'txn-1' },
    createdAt: '2024-01-15T08:45:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
]

// Utility function to generate random data
export const generateId = () => Math.random().toString(36).substr(2, 9)

export const generateMockUser = (overrides: Partial<User> = {}): User => ({
  id: generateId(),
  email: `user${generateId()}@example.com`,
  firstName: 'John',
  lastName: 'Doe',
  role: mockRoles[3],
  status: 'active',
  permissions: mockRoles[3].permissions,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const generateMockVendor = (overrides: Partial<Vendor> = {}): Vendor => ({
  id: generateId(),
  businessName: `Business ${generateId()}`,
  contactEmail: `contact${generateId()}@business.com`,
  contactPhone: '+1-555-0000',
  businessType: 'General',
  status: 'pending',
  verificationStatus: 'pending',
  address: {
    street: '123 Business St',
    city: 'Business City',
    state: 'BC',
    zipCode: '12345',
    country: 'USA',
  },
  commissionRate: 5.0,
  paymentSettings: {
    paymentMethods: ['credit_card'],
    settlementSchedule: 'weekly',
  },
  onboardingProgress: {
    currentStep: 1,
    totalSteps: 5,
    completedSteps: [],
    isCompleted: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})