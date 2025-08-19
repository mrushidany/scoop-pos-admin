# Microservices Architecture Design

## Overview

This document outlines the microservices architecture for the POS Super Admin Dashboard, defining service boundaries, communication patterns, data management strategies, and deployment considerations for a scalable, maintainable, and resilient system.

## Architecture Principles

### 1. Core Design Principles
- **Single Responsibility**: Each service owns a specific business capability
- **Autonomous Teams**: Services can be developed and deployed independently
- **Decentralized Data Management**: Each service manages its own data
- **Failure Isolation**: Service failures don't cascade to other services
- **Technology Diversity**: Services can use different technologies as appropriate
- **Business-Aligned**: Service boundaries align with business domains

### 2. Service Design Guidelines
```typescript
// Service interface contract
interface ServiceContract {
  name: string
  version: string
  description: string
  endpoints: ServiceEndpoint[]
  dependencies: ServiceDependency[]
  dataOwnership: string[]
  sla: ServiceLevelAgreement
}

interface ServiceEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  requestSchema: JSONSchema
  responseSchema: JSONSchema
  authentication: AuthenticationRequirement
  rateLimit: RateLimitConfig
}

interface ServiceDependency {
  serviceName: string
  type: 'synchronous' | 'asynchronous' | 'data'
  criticality: 'critical' | 'important' | 'optional'
  fallbackStrategy: FallbackStrategy
}
```

## Service Decomposition

### 1. Core Business Services

#### 1.1 User Management Service
```typescript
// User Management Service
interface UserManagementService {
  // Core user operations
  createUser(userData: CreateUserRequest): Promise<User>
  updateUser(userId: string, updates: UpdateUserRequest): Promise<User>
  deleteUser(userId: string): Promise<void>
  getUserById(userId: string): Promise<User>
  getUsersByTenant(tenantId: string): Promise<User[]>
  
  // Authentication operations
  authenticateUser(credentials: LoginCredentials): Promise<AuthResult>
  refreshToken(refreshToken: string): Promise<TokenPair>
  revokeToken(token: string): Promise<void>
  
  // Profile management
  updateProfile(userId: string, profile: UserProfile): Promise<UserProfile>
  uploadAvatar(userId: string, avatar: File): Promise<string>
  
  // Security operations
  enableMFA(userId: string, mfaConfig: MFAConfig): Promise<void>
  verifyMFA(userId: string, token: string): Promise<boolean>
  resetPassword(email: string): Promise<void>
}

// Service boundaries and data ownership
const UserServiceBoundaries = {
  dataOwnership: [
    'users',
    'user_profiles',
    'user_sessions',
    'user_preferences',
    'authentication_logs'
  ],
  businessCapabilities: [
    'User Registration',
    'Authentication',
    'Profile Management',
    'Session Management',
    'Security Controls'
  ],
  externalDependencies: [
    'notification-service',
    'audit-service',
    'file-storage-service'
  ]
}
```

#### 1.2 Tenant Management Service
```typescript
// Tenant Management Service
interface TenantManagementService {
  // Tenant lifecycle
  createTenant(tenantData: CreateTenantRequest): Promise<Tenant>
  updateTenant(tenantId: string, updates: UpdateTenantRequest): Promise<Tenant>
  suspendTenant(tenantId: string, reason: string): Promise<void>
  activateTenant(tenantId: string): Promise<void>
  deleteTenant(tenantId: string): Promise<void>
  
  // Tenant configuration
  updateTenantSettings(tenantId: string, settings: TenantSettings): Promise<void>
  getTenantSettings(tenantId: string): Promise<TenantSettings>
  
  // Subscription management
  updateSubscription(tenantId: string, plan: SubscriptionPlan): Promise<void>
  getUsageMetrics(tenantId: string): Promise<UsageMetrics>
  
  // Tenant isolation
  validateTenantAccess(tenantId: string, userId: string): Promise<boolean>
  getTenantResources(tenantId: string): Promise<TenantResources>
}

const TenantServiceBoundaries = {
  dataOwnership: [
    'tenants',
    'tenant_settings',
    'tenant_subscriptions',
    'tenant_usage_metrics',
    'tenant_billing'
  ],
  businessCapabilities: [
    'Tenant Provisioning',
    'Subscription Management',
    'Usage Tracking',
    'Billing Integration',
    'Tenant Isolation'
  ]
}
```

#### 1.3 Vendor Management Service
```typescript
// Vendor Management Service
interface VendorManagementService {
  // Vendor lifecycle
  createVendor(vendorData: CreateVendorRequest): Promise<Vendor>
  updateVendor(vendorId: string, updates: UpdateVendorRequest): Promise<Vendor>
  verifyVendor(vendorId: string, verificationData: VerificationData): Promise<void>
  suspendVendor(vendorId: string, reason: string): Promise<void>
  
  // Vendor onboarding
  initiateOnboarding(vendorId: string): Promise<OnboardingFlow>
  updateOnboardingStep(vendorId: string, step: OnboardingStep): Promise<void>
  completeOnboarding(vendorId: string): Promise<void>
  
  // Vendor configuration
  updateVendorSettings(vendorId: string, settings: VendorSettings): Promise<void>
  getVendorSettings(vendorId: string): Promise<VendorSettings>
  
  // Vendor analytics
  getVendorMetrics(vendorId: string, timeRange: TimeRange): Promise<VendorMetrics>
  getVendorPerformance(vendorId: string): Promise<PerformanceMetrics>
}

const VendorServiceBoundaries = {
  dataOwnership: [
    'vendors',
    'vendor_profiles',
    'vendor_settings',
    'vendor_verification',
    'vendor_onboarding',
    'vendor_metrics'
  ],
  businessCapabilities: [
    'Vendor Registration',
    'Vendor Verification',
    'Onboarding Management',
    'Vendor Configuration',
    'Performance Tracking'
  ]
}
```

#### 1.4 Transaction Processing Service
```typescript
// Transaction Processing Service
interface TransactionProcessingService {
  // Transaction lifecycle
  initiateTransaction(transactionData: InitiateTransactionRequest): Promise<Transaction>
  processPayment(transactionId: string, paymentData: PaymentData): Promise<PaymentResult>
  confirmTransaction(transactionId: string): Promise<void>
  cancelTransaction(transactionId: string, reason: string): Promise<void>
  
  // Transaction queries
  getTransaction(transactionId: string): Promise<Transaction>
  getTransactionsByVendor(vendorId: string, filters: TransactionFilters): Promise<Transaction[]>
  getTransactionsByCustomer(customerId: string, filters: TransactionFilters): Promise<Transaction[]>
  
  // Refund management
  initiateRefund(transactionId: string, refundData: RefundData): Promise<Refund>
  processRefund(refundId: string): Promise<RefundResult>
  
  // Transaction analytics
  getTransactionMetrics(filters: MetricsFilters): Promise<TransactionMetrics>
  getRevenueAnalytics(vendorId: string, timeRange: TimeRange): Promise<RevenueAnalytics>
}

const TransactionServiceBoundaries = {
  dataOwnership: [
    'transactions',
    'payments',
    'refunds',
    'transaction_logs',
    'payment_methods'
  ],
  businessCapabilities: [
    'Payment Processing',
    'Transaction Management',
    'Refund Processing',
    'Transaction Analytics',
    'Revenue Tracking'
  ]
}
```

#### 1.5 Product Catalog Service
```typescript
// Product Catalog Service
interface ProductCatalogService {
  // Product management
  createProduct(productData: CreateProductRequest): Promise<Product>
  updateProduct(productId: string, updates: UpdateProductRequest): Promise<Product>
  deleteProduct(productId: string): Promise<void>
  getProduct(productId: string): Promise<Product>
  
  // Catalog management
  getProductsByVendor(vendorId: string, filters: ProductFilters): Promise<Product[]>
  searchProducts(query: SearchQuery): Promise<SearchResult>
  
  // Category management
  createCategory(categoryData: CreateCategoryRequest): Promise<Category>
  updateCategory(categoryId: string, updates: UpdateCategoryRequest): Promise<Category>
  getCategoriesByVendor(vendorId: string): Promise<Category[]>
  
  // Inventory integration
  updateProductInventory(productId: string, inventory: InventoryUpdate): Promise<void>
  getProductAvailability(productId: string): Promise<AvailabilityInfo>
}

const ProductCatalogBoundaries = {
  dataOwnership: [
    'products',
    'product_variants',
    'categories',
    'product_images',
    'product_attributes'
  ],
  businessCapabilities: [
    'Product Management',
    'Catalog Organization',
    'Product Search',
    'Category Management',
    'Product Analytics'
  ]
}
```

#### 1.6 Order Management Service
```typescript
// Order Management Service
interface OrderManagementService {
  // Order lifecycle
  createOrder(orderData: CreateOrderRequest): Promise<Order>
  updateOrder(orderId: string, updates: UpdateOrderRequest): Promise<Order>
  cancelOrder(orderId: string, reason: string): Promise<void>
  
  // Order processing
  confirmOrder(orderId: string): Promise<void>
  fulfillOrder(orderId: string, fulfillmentData: FulfillmentData): Promise<void>
  completeOrder(orderId: string): Promise<void>
  
  // Order queries
  getOrder(orderId: string): Promise<Order>
  getOrdersByVendor(vendorId: string, filters: OrderFilters): Promise<Order[]>
  getOrdersByCustomer(customerId: string, filters: OrderFilters): Promise<Order[]>
  
  // Order analytics
  getOrderMetrics(vendorId: string, timeRange: TimeRange): Promise<OrderMetrics>
  getOrderTrends(filters: TrendFilters): Promise<OrderTrends>
}

const OrderManagementBoundaries = {
  dataOwnership: [
    'orders',
    'order_items',
    'order_status_history',
    'fulfillment_records',
    'delivery_tracking'
  ],
  businessCapabilities: [
    'Order Processing',
    'Order Fulfillment',
    'Order Tracking',
    'Order Analytics',
    'Customer Communication'
  ]
}
```

### 2. Platform Services

#### 2.1 Notification Service
```typescript
// Notification Service
interface NotificationService {
  // Notification delivery
  sendEmail(emailData: EmailNotification): Promise<void>
  sendSMS(smsData: SMSNotification): Promise<void>
  sendPushNotification(pushData: PushNotification): Promise<void>
  sendInAppNotification(notificationData: InAppNotification): Promise<void>
  
  // Notification management
  createNotificationTemplate(template: NotificationTemplate): Promise<void>
  updateNotificationTemplate(templateId: string, updates: TemplateUpdates): Promise<void>
  
  // Subscription management
  subscribeToNotifications(userId: string, preferences: NotificationPreferences): Promise<void>
  unsubscribeFromNotifications(userId: string, types: NotificationType[]): Promise<void>
  
  // Notification analytics
  getDeliveryMetrics(filters: MetricsFilters): Promise<DeliveryMetrics>
  getEngagementMetrics(filters: MetricsFilters): Promise<EngagementMetrics>
}
```

#### 2.2 File Storage Service
```typescript
// File Storage Service
interface FileStorageService {
  // File operations
  uploadFile(fileData: FileUploadRequest): Promise<FileMetadata>
  downloadFile(fileId: string): Promise<FileStream>
  deleteFile(fileId: string): Promise<void>
  
  // File management
  getFileMetadata(fileId: string): Promise<FileMetadata>
  updateFileMetadata(fileId: string, metadata: FileMetadata): Promise<void>
  
  // File organization
  createFolder(folderData: CreateFolderRequest): Promise<Folder>
  moveFile(fileId: string, destinationFolderId: string): Promise<void>
  
  // File security
  generateSignedUrl(fileId: string, expirationTime: number): Promise<string>
  setFilePermissions(fileId: string, permissions: FilePermissions): Promise<void>
}
```

#### 2.3 Analytics Service
```typescript
// Analytics Service
interface AnalyticsService {
  // Event tracking
  trackEvent(event: AnalyticsEvent): Promise<void>
  trackUserAction(userId: string, action: UserAction): Promise<void>
  trackBusinessMetric(metric: BusinessMetric): Promise<void>
  
  // Report generation
  generateReport(reportConfig: ReportConfig): Promise<Report>
  scheduleReport(reportConfig: ReportConfig, schedule: Schedule): Promise<void>
  
  // Real-time analytics
  getRealTimeMetrics(filters: MetricsFilters): Promise<RealTimeMetrics>
  getCustomMetrics(query: CustomQuery): Promise<CustomMetrics>
  
  // Data export
  exportData(exportConfig: ExportConfig): Promise<ExportResult>
  getExportStatus(exportId: string): Promise<ExportStatus>
}
```

### 3. Infrastructure Services

#### 3.1 API Gateway Service
```typescript
// API Gateway Service
interface APIGatewayService {
  // Request routing
  routeRequest(request: IncomingRequest): Promise<ServiceResponse>
  
  // Authentication & Authorization
  authenticateRequest(request: IncomingRequest): Promise<AuthenticationResult>
  authorizeRequest(request: AuthenticatedRequest): Promise<AuthorizationResult>
  
  // Rate limiting
  checkRateLimit(clientId: string, endpoint: string): Promise<RateLimitResult>
  updateRateLimit(clientId: string, limits: RateLimitConfig): Promise<void>
  
  // Request transformation
  transformRequest(request: IncomingRequest): Promise<TransformedRequest>
  transformResponse(response: ServiceResponse): Promise<TransformedResponse>
  
  // Circuit breaker
  checkCircuitBreaker(serviceName: string): Promise<CircuitBreakerStatus>
  updateCircuitBreaker(serviceName: string, status: CircuitBreakerStatus): Promise<void>
}
```

#### 3.2 Configuration Service
```typescript
// Configuration Service
interface ConfigurationService {
  // Configuration management
  getConfiguration(service: string, environment: string): Promise<ServiceConfig>
  updateConfiguration(service: string, config: ServiceConfig): Promise<void>
  
  // Feature flags
  getFeatureFlags(tenantId: string): Promise<FeatureFlags>
  updateFeatureFlag(flagName: string, value: boolean, scope: FlagScope): Promise<void>
  
  // Environment management
  getEnvironmentConfig(environment: string): Promise<EnvironmentConfig>
  promoteConfiguration(fromEnv: string, toEnv: string): Promise<void>
}
```

## Service Communication Patterns

### 1. Synchronous Communication

#### 1.1 REST API Communication
```typescript
// Service-to-service HTTP client
class ServiceClient {
  private baseUrl: string
  private timeout: number
  private retryConfig: RetryConfig
  
  constructor(serviceName: string, config: ClientConfig) {
    this.baseUrl = this.resolveServiceUrl(serviceName)
    this.timeout = config.timeout || 5000
    this.retryConfig = config.retry || { attempts: 3, backoff: 'exponential' }
  }
  
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest('GET', path, undefined, options)
  }
  
  async post<T>(path: string, data: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest('POST', path, data, options)
  }
  
  private async makeRequest<T>(
    method: string,
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const request = {
      method,
      url: `${this.baseUrl}${path}`,
      data,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': generateRequestId(),
        'X-Tenant-ID': options?.tenantId,
        'Authorization': `Bearer ${options?.token}`
      }
    }
    
    return this.executeWithRetry(request)
  }
  
  private async executeWithRetry<T>(request: RequestConfig): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        const response = await this.httpClient.request(request)
        return response.data
      } catch (error) {
        lastError = error
        
        if (!this.shouldRetry(error, attempt)) {
          throw error
        }
        
        await this.delay(this.calculateBackoff(attempt))
      }
    }
    
    throw lastError
  }
}
```

#### 1.2 GraphQL Federation
```typescript
// GraphQL service schema
const userServiceSchema = `
  extend type Query {
    user(id: ID!): User
    users(filter: UserFilter): [User]
  }
  
  extend type Mutation {
    createUser(input: CreateUserInput!): User
    updateUser(id: ID!, input: UpdateUserInput!): User
  }
  
  type User @key(fields: "id") {
    id: ID!
    email: String!
    profile: UserProfile
    tenant: Tenant
  }
  
  type UserProfile {
    firstName: String
    lastName: String
    avatar: String
    preferences: UserPreferences
  }
`

// Service resolver
const userServiceResolvers = {
  Query: {
    user: async (_, { id }, context) => {
      return userService.getUserById(id, context)
    },
    users: async (_, { filter }, context) => {
      return userService.getUsers(filter, context)
    }
  },
  
  Mutation: {
    createUser: async (_, { input }, context) => {
      return userService.createUser(input, context)
    },
    updateUser: async (_, { id, input }, context) => {
      return userService.updateUser(id, input, context)
    }
  },
  
  User: {
    __resolveReference: async (user, context) => {
      return userService.getUserById(user.id, context)
    },
    tenant: async (user, _, context) => {
      return { __typename: 'Tenant', id: user.tenantId }
    }
  }
}
```

### 2. Asynchronous Communication

#### 2.1 Event-Driven Architecture
```typescript
// Event publisher
class EventPublisher {
  private messageQueue: MessageQueue
  
  async publishEvent(event: DomainEvent): Promise<void> {
    const message = {
      id: generateEventId(),
      type: event.type,
      source: event.source,
      data: event.data,
      timestamp: new Date(),
      version: event.version,
      correlationId: event.correlationId
    }
    
    await this.messageQueue.publish(event.topic, message)
    await this.auditService.logEventPublished(message)
  }
}

// Event subscriber
class EventSubscriber {
  private messageQueue: MessageQueue
  private eventHandlers: Map<string, EventHandler[]>
  
  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    
    this.eventHandlers.get(eventType)!.push(handler)
    
    await this.messageQueue.subscribe(eventType, async (message) => {
      await this.handleEvent(message)
    })
  }
  
  private async handleEvent(message: EventMessage): Promise<void> {
    const handlers = this.eventHandlers.get(message.type) || []
    
    for (const handler of handlers) {
      try {
        await handler.handle(message)
        await this.auditService.logEventProcessed(message.id, handler.name)
      } catch (error) {
        await this.handleEventError(message, handler, error)
      }
    }
  }
}
```

#### 2.2 Saga Pattern Implementation
```typescript
// Saga orchestrator
class OrderProcessingSaga {
  private sagaManager: SagaManager
  
  async processOrder(orderData: CreateOrderRequest): Promise<void> {
    const sagaId = generateSagaId()
    
    const saga = new Saga(sagaId, 'order-processing', [
      new ReserveInventoryStep(),
      new ProcessPaymentStep(),
      new CreateOrderStep(),
      new SendConfirmationStep()
    ])
    
    await this.sagaManager.execute(saga, orderData)
  }
}

// Saga step implementation
class ReserveInventoryStep implements SagaStep {
  async execute(context: SagaContext): Promise<StepResult> {
    try {
      const reservation = await this.inventoryService.reserveItems(
        context.data.items,
        context.sagaId
      )
      
      return {
        status: 'completed',
        data: { reservationId: reservation.id },
        compensationData: { reservationId: reservation.id }
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      }
    }
  }
  
  async compensate(context: SagaContext): Promise<void> {
    if (context.compensationData?.reservationId) {
      await this.inventoryService.releaseReservation(
        context.compensationData.reservationId
      )
    }
  }
}
```

## Data Management Strategies

### 1. Database per Service

#### 1.1 Service-Specific Databases
```typescript
// Database configuration per service
const serviceDataConfigs = {
  'user-service': {
    type: 'postgresql',
    database: 'user_service_db',
    schema: 'users',
    tables: ['users', 'user_profiles', 'user_sessions']
  },
  'vendor-service': {
    type: 'postgresql',
    database: 'vendor_service_db',
    schema: 'vendors',
    tables: ['vendors', 'vendor_settings', 'vendor_metrics']
  },
  'transaction-service': {
    type: 'postgresql',
    database: 'transaction_service_db',
    schema: 'transactions',
    tables: ['transactions', 'payments', 'refunds']
  },
  'analytics-service': {
    type: 'timeseries',
    database: 'analytics_db',
    tables: ['events', 'metrics', 'aggregations']
  }
}
```

#### 1.2 Data Synchronization
```typescript
// Event-driven data synchronization
class DataSynchronizer {
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    // Sync user data to other services that need it
    await Promise.all([
      this.syncToVendorService(event.userData),
      this.syncToAnalyticsService(event.userData),
      this.syncToNotificationService(event.userData)
    ])
  }
  
  private async syncToVendorService(userData: UserData): Promise<void> {
    const vendorUserData = {
      userId: userData.id,
      email: userData.email,
      tenantId: userData.tenantId,
      role: userData.role
    }
    
    await this.vendorService.createUserReference(vendorUserData)
  }
}
```

### 2. CQRS Implementation

#### 2.1 Command and Query Separation
```typescript
// Command side
class OrderCommandHandler {
  async handle(command: CreateOrderCommand): Promise<void> {
    // Validate command
    await this.validateCommand(command)
    
    // Create domain aggregate
    const order = Order.create(command.orderData)
    
    // Apply business rules
    await order.validateBusinessRules()
    
    // Persist to write store
    await this.orderRepository.save(order)
    
    // Publish domain events
    for (const event of order.getUncommittedEvents()) {
      await this.eventPublisher.publish(event)
    }
  }
}

// Query side
class OrderQueryHandler {
  async getOrderById(orderId: string): Promise<OrderView> {
    return this.orderReadRepository.findById(orderId)
  }
  
  async getOrdersByVendor(vendorId: string, filters: OrderFilters): Promise<OrderView[]> {
    return this.orderReadRepository.findByVendor(vendorId, filters)
  }
}

// Event handler for read model updates
class OrderViewUpdater {
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const orderView = {
      id: event.orderId,
      vendorId: event.vendorId,
      customerId: event.customerId,
      status: event.status,
      totalAmount: event.totalAmount,
      items: event.items,
      createdAt: event.timestamp
    }
    
    await this.orderViewRepository.create(orderView)
  }
}
```

## Service Discovery and Load Balancing

### 1. Service Registry
```typescript
// Service registry implementation
class ServiceRegistry {
  private services: Map<string, ServiceInstance[]> = new Map()
  
  async registerService(instance: ServiceInstance): Promise<void> {
    const serviceName = instance.name
    
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, [])
    }
    
    this.services.get(serviceName)!.push(instance)
    
    // Start health checking
    this.startHealthCheck(instance)
    
    console.log(`Service ${serviceName} registered at ${instance.address}:${instance.port}`)
  }
  
  async discoverService(serviceName: string): Promise<ServiceInstance[]> {
    const instances = this.services.get(serviceName) || []
    return instances.filter(instance => instance.status === 'healthy')
  }
  
  private async startHealthCheck(instance: ServiceInstance): Promise<void> {
    setInterval(async () => {
      try {
        await this.checkHealth(instance)
        instance.status = 'healthy'
        instance.lastHealthCheck = new Date()
      } catch (error) {
        instance.status = 'unhealthy'
        console.warn(`Health check failed for ${instance.name}: ${error.message}`)
      }
    }, 30000) // Check every 30 seconds
  }
}
```

### 2. Load Balancing Strategies
```typescript
// Load balancer implementation
class LoadBalancer {
  private strategies: Map<string, LoadBalancingStrategy> = new Map()
  
  constructor() {
    this.strategies.set('round-robin', new RoundRobinStrategy())
    this.strategies.set('least-connections', new LeastConnectionsStrategy())
    this.strategies.set('weighted', new WeightedStrategy())
    this.strategies.set('health-aware', new HealthAwareStrategy())
  }
  
  async selectInstance(
    serviceName: string,
    strategy: string = 'round-robin'
  ): Promise<ServiceInstance> {
    const instances = await this.serviceRegistry.discoverService(serviceName)
    
    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`)
    }
    
    const loadBalancingStrategy = this.strategies.get(strategy)
    if (!loadBalancingStrategy) {
      throw new Error(`Unknown load balancing strategy: ${strategy}`)
    }
    
    return loadBalancingStrategy.selectInstance(instances)
  }
}

// Round-robin strategy
class RoundRobinStrategy implements LoadBalancingStrategy {
  private counters: Map<string, number> = new Map()
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const serviceName = instances[0].name
    const currentCount = this.counters.get(serviceName) || 0
    const selectedIndex = currentCount % instances.length
    
    this.counters.set(serviceName, currentCount + 1)
    
    return instances[selectedIndex]
  }
}
```

## Deployment and DevOps

### 1. Containerization
```dockerfile
# Multi-stage Dockerfile for Node.js service
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### 2. Kubernetes Deployment
```yaml
# Service deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v1
    spec:
      containers:
      - name: user-service
        image: pos-admin/user-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: user-service-config
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### 3. Service Mesh Configuration
```yaml
# Istio service mesh configuration
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
  - user-service
  http:
  - match:
    - headers:
        x-user-type:
          exact: premium
    route:
    - destination:
        host: user-service
        subset: v2
      weight: 100
  - route:
    - destination:
        host: user-service
        subset: v1
      weight: 90
    - destination:
        host: user-service
        subset: v2
      weight: 10
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service
spec:
  host: user-service
  trafficPolicy:
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

## Monitoring and Observability

### 1. Distributed Tracing
```typescript
// OpenTelemetry tracing setup
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
})

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations()]
})

sdk.start()

// Custom tracing in service methods
class UserService {
  @Trace('user-service.create-user')
  async createUser(userData: CreateUserRequest): Promise<User> {
    const span = trace.getActiveSpan()
    span?.setAttributes({
      'user.email': userData.email,
      'user.tenant_id': userData.tenantId
    })
    
    try {
      const user = await this.userRepository.create(userData)
      span?.setStatus({ code: SpanStatusCode.OK })
      return user
    } catch (error) {
      span?.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })
      throw error
    }
  }
}
```

### 2. Metrics Collection
```typescript
// Prometheus metrics
import { register, Counter, Histogram, Gauge } from 'prom-client'

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['service']
})

// Middleware for metrics collection
const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
      service: process.env.SERVICE_NAME
    })
    
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      service: process.env.SERVICE_NAME
    }, duration)
  })
  
  next()
}
```

## Security Considerations

### 1. Service-to-Service Authentication
```typescript
// JWT-based service authentication
class ServiceAuthenticator {
  private privateKey: string
  private publicKeys: Map<string, string> = new Map()
  
  async generateServiceToken(serviceName: string, audience: string): Promise<string> {
    const payload = {
      iss: serviceName,
      aud: audience,
      sub: serviceName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      scope: await this.getServicePermissions(serviceName)
    }
    
    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' })
  }
  
  async verifyServiceToken(token: string, expectedAudience: string): Promise<ServiceClaims> {
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token format')
    }
    
    const issuer = decoded.payload.iss
    const publicKey = this.publicKeys.get(issuer)
    
    if (!publicKey) {
      throw new Error(`Unknown service issuer: ${issuer}`)
    }
    
    const verified = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: expectedAudience
    })
    
    return verified as ServiceClaims
  }
}
```

### 2. Network Security
```typescript
// mTLS configuration
const tlsOptions = {
  key: fs.readFileSync('/etc/ssl/private/service.key'),
  cert: fs.readFileSync('/etc/ssl/certs/service.crt'),
  ca: fs.readFileSync('/etc/ssl/certs/ca.crt'),
  requestCert: true,
  rejectUnauthorized: true
}

const server = https.createServer(tlsOptions, app)

// Network policies for Kubernetes
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: user-service-netpol
spec:
  podSelector:
    matchLabels:
      app: user-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

## Implementation Guidelines

### 1. Development Best Practices
- Implement comprehensive logging with correlation IDs
- Use circuit breakers for external service calls
- Implement graceful shutdown procedures
- Follow 12-factor app principles
- Implement health checks and readiness probes

### 2. Testing Strategy
- Unit tests for business logic
- Integration tests for service interactions
- Contract tests for API compatibility
- End-to-end tests for critical user journeys
- Chaos engineering for resilience testing

### 3. Deployment Strategy
- Blue-green deployments for zero downtime
- Canary releases for gradual rollouts
- Feature flags for controlled feature releases
- Automated rollback procedures
- Infrastructure as code

## Conclusion

This microservices architecture provides a scalable, maintainable, and resilient foundation for the POS Super Admin Dashboard. The design emphasizes service autonomy, clear boundaries, and robust communication patterns while ensuring security, observability, and operational excellence.