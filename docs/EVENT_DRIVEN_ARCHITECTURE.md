# Real-Time Event-Driven Architecture Design

## Overview

This document outlines a comprehensive event-driven architecture for the POS Super Admin Dashboard, enabling real-time data processing, scalable microservices communication, and responsive user experiences across all system components.

## Architecture Principles

### 1. Core Event-Driven Principles
- **Event Sourcing**: Store all changes as a sequence of events
- **CQRS (Command Query Responsibility Segregation)**: Separate read and write operations
- **Eventual Consistency**: Accept temporary inconsistency for better performance
- **Loose Coupling**: Services communicate through events, not direct calls
- **Scalability**: Handle high-volume events with horizontal scaling
- **Resilience**: Graceful degradation and fault tolerance
- **Real-time Processing**: Immediate event processing and notifications

### 2. Event Architecture Components
```typescript
// Core event interfaces
interface BaseEvent {
  id: string
  type: string
  aggregateId: string
  aggregateType: string
  version: number
  timestamp: Date
  correlationId?: string
  causationId?: string
  metadata: EventMetadata
}

interface EventMetadata {
  userId?: string
  tenantId: string
  source: string
  traceId: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

interface DomainEvent extends BaseEvent {
  data: Record<string, any>
}

interface EventStore {
  append(streamId: string, events: DomainEvent[], expectedVersion: number): Promise<void>
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>
  getAllEvents(fromPosition?: number): Promise<DomainEvent[]>
  subscribe(eventTypes: string[], handler: EventHandler): Promise<Subscription>
}
```

## Event Categories and Schemas

### 1. Authentication & Authorization Events

#### 1.1 User Authentication Events
```typescript
// User login event
interface UserLoggedInEvent extends DomainEvent {
  type: 'user.logged_in'
  data: {
    userId: string
    email: string
    loginMethod: 'password' | 'sso' | 'mfa'
    deviceInfo: DeviceInfo
    location: GeoLocation
    sessionId: string
  }
}

// User logout event
interface UserLoggedOutEvent extends DomainEvent {
  type: 'user.logged_out'
  data: {
    userId: string
    sessionId: string
    logoutReason: 'manual' | 'timeout' | 'forced'
  }
}

// Failed login attempt
interface LoginFailedEvent extends DomainEvent {
  type: 'user.login_failed'
  data: {
    email: string
    failureReason: string
    attemptCount: number
    deviceInfo: DeviceInfo
    location: GeoLocation
  }
}

// MFA events
interface MFAEnabledEvent extends DomainEvent {
  type: 'user.mfa_enabled'
  data: {
    userId: string
    mfaMethod: string
    backupCodesGenerated: boolean
  }
}

interface MFAVerificationFailedEvent extends DomainEvent {
  type: 'user.mfa_verification_failed'
  data: {
    userId: string
    mfaMethod: string
    attemptCount: number
  }
}
```

#### 1.2 Role and Permission Events
```typescript
// Role assignment events
interface RoleAssignedEvent extends DomainEvent {
  type: 'user.role_assigned'
  data: {
    userId: string
    roleId: string
    roleName: string
    assignedBy: string
    effectiveDate: Date
    expirationDate?: Date
  }
}

interface RoleRevokedEvent extends DomainEvent {
  type: 'user.role_revoked'
  data: {
    userId: string
    roleId: string
    roleName: string
    revokedBy: string
    reason: string
  }
}

// Permission events
interface PermissionGrantedEvent extends DomainEvent {
  type: 'user.permission_granted'
  data: {
    userId: string
    permission: string
    resource: string
    scope: string
    grantedBy: string
  }
}
```

### 2. Vendor Management Events

#### 2.1 Vendor Lifecycle Events
```typescript
// Vendor onboarding events
interface VendorRegisteredEvent extends DomainEvent {
  type: 'vendor.registered'
  data: {
    vendorId: string
    businessName: string
    contactEmail: string
    businessType: string
    registrationData: VendorRegistrationData
    status: 'pending_verification'
  }
}

interface VendorVerifiedEvent extends DomainEvent {
  type: 'vendor.verified'
  data: {
    vendorId: string
    verifiedBy: string
    verificationMethod: string
    documentsVerified: string[]
    status: 'active'
  }
}

interface VendorSuspendedEvent extends DomainEvent {
  type: 'vendor.suspended'
  data: {
    vendorId: string
    suspendedBy: string
    reason: string
    suspensionType: 'temporary' | 'permanent'
    suspensionPeriod?: number
  }
}

// Vendor configuration events
interface VendorConfigurationUpdatedEvent extends DomainEvent {
  type: 'vendor.configuration_updated'
  data: {
    vendorId: string
    configurationChanges: ConfigurationChange[]
    updatedBy: string
    previousConfiguration: VendorConfiguration
    newConfiguration: VendorConfiguration
  }
}

interface VendorPaymentSettingsUpdatedEvent extends DomainEvent {
  type: 'vendor.payment_settings_updated'
  data: {
    vendorId: string
    paymentMethods: PaymentMethod[]
    commissionRates: CommissionRate[]
    settlementSchedule: SettlementSchedule
    updatedBy: string
  }
}
```

#### 2.2 Vendor Operations Events
```typescript
// Store management events
interface StoreCreatedEvent extends DomainEvent {
  type: 'vendor.store_created'
  data: {
    vendorId: string
    storeId: string
    storeName: string
    location: StoreLocation
    operatingHours: OperatingHours
    createdBy: string
  }
}

interface StoreStatusChangedEvent extends DomainEvent {
  type: 'vendor.store_status_changed'
  data: {
    vendorId: string
    storeId: string
    previousStatus: string
    newStatus: string
    reason: string
    changedBy: string
  }
}
```

### 3. Inventory Management Events

#### 3.1 Product Events
```typescript
// Product lifecycle events
interface ProductCreatedEvent extends DomainEvent {
  type: 'inventory.product_created'
  data: {
    productId: string
    vendorId: string
    storeId: string
    productData: ProductData
    initialStock: number
    createdBy: string
  }
}

interface ProductUpdatedEvent extends DomainEvent {
  type: 'inventory.product_updated'
  data: {
    productId: string
    vendorId: string
    changes: ProductChange[]
    updatedBy: string
    previousData: ProductData
    newData: ProductData
  }
}

interface ProductDiscontinuedEvent extends DomainEvent {
  type: 'inventory.product_discontinued'
  data: {
    productId: string
    vendorId: string
    reason: string
    discontinuedBy: string
    finalStock: number
  }
}
```

#### 3.2 Stock Management Events
```typescript
// Stock level events
interface StockUpdatedEvent extends DomainEvent {
  type: 'inventory.stock_updated'
  data: {
    productId: string
    vendorId: string
    storeId: string
    previousQuantity: number
    newQuantity: number
    changeType: 'restock' | 'sale' | 'adjustment' | 'return'
    referenceId?: string
    updatedBy: string
  }
}

interface LowStockAlertEvent extends DomainEvent {
  type: 'inventory.low_stock_alert'
  data: {
    productId: string
    vendorId: string
    storeId: string
    currentQuantity: number
    minimumThreshold: number
    alertLevel: 'warning' | 'critical'
  }
}

interface StockOutEvent extends DomainEvent {
  type: 'inventory.stock_out'
  data: {
    productId: string
    vendorId: string
    storeId: string
    lastSaleTimestamp: Date
    estimatedRestockDate?: Date
  }
}

// Inventory audit events
interface InventoryAuditStartedEvent extends DomainEvent {
  type: 'inventory.audit_started'
  data: {
    auditId: string
    vendorId: string
    storeId: string
    auditType: 'full' | 'partial' | 'cycle'
    startedBy: string
    expectedDuration: number
  }
}

interface InventoryDiscrepancyFoundEvent extends DomainEvent {
  type: 'inventory.discrepancy_found'
  data: {
    auditId: string
    productId: string
    vendorId: string
    storeId: string
    expectedQuantity: number
    actualQuantity: number
    discrepancyValue: number
    possibleCauses: string[]
  }
}
```

### 4. Transaction and Order Events

#### 4.1 Transaction Events
```typescript
// Transaction lifecycle events
interface TransactionInitiatedEvent extends DomainEvent {
  type: 'transaction.initiated'
  data: {
    transactionId: string
    vendorId: string
    storeId: string
    customerId?: string
    items: TransactionItem[]
    totalAmount: number
    paymentMethod: string
    initiatedBy: string
  }
}

interface PaymentProcessedEvent extends DomainEvent {
  type: 'transaction.payment_processed'
  data: {
    transactionId: string
    paymentId: string
    amount: number
    paymentMethod: string
    paymentStatus: 'success' | 'failed' | 'pending'
    gatewayResponse: PaymentGatewayResponse
    processedAt: Date
  }
}

interface TransactionCompletedEvent extends DomainEvent {
  type: 'transaction.completed'
  data: {
    transactionId: string
    vendorId: string
    storeId: string
    finalAmount: number
    commission: number
    netAmount: number
    completedAt: Date
  }
}

interface TransactionRefundedEvent extends DomainEvent {
  type: 'transaction.refunded'
  data: {
    transactionId: string
    refundId: string
    refundAmount: number
    refundReason: string
    refundedBy: string
    refundedAt: Date
  }
}
```

#### 4.2 Order Management Events
```typescript
// Order lifecycle events
interface OrderCreatedEvent extends DomainEvent {
  type: 'order.created'
  data: {
    orderId: string
    vendorId: string
    storeId: string
    customerId: string
    orderItems: OrderItem[]
    orderType: 'pickup' | 'delivery' | 'dine_in'
    totalAmount: number
    estimatedTime: number
  }
}

interface OrderStatusChangedEvent extends DomainEvent {
  type: 'order.status_changed'
  data: {
    orderId: string
    vendorId: string
    previousStatus: OrderStatus
    newStatus: OrderStatus
    changedBy: string
    estimatedCompletion?: Date
  }
}

interface OrderFulfilledEvent extends DomainEvent {
  type: 'order.fulfilled'
  data: {
    orderId: string
    vendorId: string
    fulfilledBy: string
    fulfilledAt: Date
    customerRating?: number
    customerFeedback?: string
  }
}

interface OrderCancelledEvent extends DomainEvent {
  type: 'order.cancelled'
  data: {
    orderId: string
    vendorId: string
    cancelledBy: string
    cancellationReason: string
    refundAmount: number
    cancelledAt: Date
  }
}
```

### 5. Analytics and Reporting Events

#### 5.1 Business Intelligence Events
```typescript
// Performance metrics events
interface SalesMetricsCalculatedEvent extends DomainEvent {
  type: 'analytics.sales_metrics_calculated'
  data: {
    vendorId: string
    storeId?: string
    period: TimePeriod
    metrics: SalesMetrics
    calculatedAt: Date
  }
}

interface InventoryMetricsCalculatedEvent extends DomainEvent {
  type: 'analytics.inventory_metrics_calculated'
  data: {
    vendorId: string
    storeId?: string
    period: TimePeriod
    metrics: InventoryMetrics
    calculatedAt: Date
  }
}

interface CustomerBehaviorAnalyzedEvent extends DomainEvent {
  type: 'analytics.customer_behavior_analyzed'
  data: {
    customerId: string
    vendorId: string
    behaviorPatterns: CustomerBehaviorPattern[]
    recommendations: CustomerRecommendation[]
    analyzedAt: Date
  }
}
```

#### 5.2 Alert and Notification Events
```typescript
// System alerts
interface SystemAlertTriggeredEvent extends DomainEvent {
  type: 'system.alert_triggered'
  data: {
    alertId: string
    alertType: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    affectedEntities: string[]
    triggeredBy: string
    actionRequired: boolean
  }
}

interface NotificationSentEvent extends DomainEvent {
  type: 'notification.sent'
  data: {
    notificationId: string
    recipientId: string
    recipientType: 'user' | 'vendor' | 'customer'
    channel: 'email' | 'sms' | 'push' | 'in_app'
    messageType: string
    sentAt: Date
    deliveryStatus: 'sent' | 'delivered' | 'failed'
  }
}
```

## Event Processing Architecture

### 1. Event Bus Implementation

#### 1.1 Message Broker Configuration
```typescript
// Apache Kafka configuration
class KafkaEventBus implements EventBus {
  private kafka: Kafka
  private producer: Producer
  private consumers: Map<string, Consumer> = new Map()
  
  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    })
    
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    })
  }
  
  async publish(event: DomainEvent): Promise<void> {
    const topic = this.getTopicForEvent(event.type)
    const partition = this.getPartitionForEvent(event)
    
    await this.producer.send({
      topic,
      messages: [{
        partition,
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.type,
          correlationId: event.correlationId || '',
          tenantId: event.metadata.tenantId
        }
      }]
    })
  }
  
  async subscribe(eventTypes: string[], handler: EventHandler): Promise<Subscription> {
    const groupId = `${handler.constructor.name}-${Date.now()}`
    const consumer = this.kafka.consumer({ groupId })
    
    const topics = eventTypes.map(type => this.getTopicForEvent(type))
    await consumer.subscribe({ topics })
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value!.toString()) as DomainEvent
          await handler.handle(event)
        } catch (error) {
          console.error('Error processing event:', error)
          // Send to dead letter queue
          await this.sendToDeadLetterQueue(message, error)
        }
      }
    })
    
    this.consumers.set(groupId, consumer)
    
    return {
      unsubscribe: async () => {
        await consumer.disconnect()
        this.consumers.delete(groupId)
      }
    }
  }
  
  private getTopicForEvent(eventType: string): string {
    const [domain] = eventType.split('.')
    return `pos-${domain}-events`
  }
  
  private getPartitionForEvent(event: DomainEvent): number {
    // Partition by tenant for better distribution
    const hash = this.hashString(event.metadata.tenantId)
    return hash % 10 // Assuming 10 partitions per topic
  }
}
```

#### 1.2 Event Store Implementation
```typescript
// Event sourcing with PostgreSQL
class PostgreSQLEventStore implements EventStore {
  private pool: Pool
  
  constructor(config: DatabaseConfig) {
    this.pool = new Pool(config)
  }
  
  async append(streamId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Check current version
      const versionResult = await client.query(
        'SELECT COALESCE(MAX(version), 0) as current_version FROM events WHERE stream_id = $1',
        [streamId]
      )
      
      const currentVersion = versionResult.rows[0].current_version
      
      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(`Expected version ${expectedVersion}, but current version is ${currentVersion}`)
      }
      
      // Insert events
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        const version = expectedVersion + i + 1
        
        await client.query(
          `INSERT INTO events (
            id, stream_id, version, event_type, aggregate_id, aggregate_type,
            event_data, metadata, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            event.id,
            streamId,
            version,
            event.type,
            event.aggregateId,
            event.aggregateType,
            JSON.stringify(event.data),
            JSON.stringify(event.metadata),
            event.timestamp
          ]
        )
      }
      
      await client.query('COMMIT')
      
      // Publish events to event bus
      for (const event of events) {
        await this.eventBus.publish(event)
      }
      
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
  
  async getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]> {
    const query = fromVersion
      ? 'SELECT * FROM events WHERE stream_id = $1 AND version >= $2 ORDER BY version'
      : 'SELECT * FROM events WHERE stream_id = $1 ORDER BY version'
    
    const params = fromVersion ? [streamId, fromVersion] : [streamId]
    const result = await this.pool.query(query, params)
    
    return result.rows.map(row => ({
      id: row.id,
      type: row.event_type,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      version: row.version,
      timestamp: row.timestamp,
      data: JSON.parse(row.event_data),
      metadata: JSON.parse(row.metadata)
    }))
  }
}
```

### 2. Event Handlers and Projections

#### 2.1 Command Handlers
```typescript
// User management command handler
class UserCommandHandler {
  constructor(
    private userRepository: UserRepository,
    private eventStore: EventStore
  ) {}
  
  async handle(command: CreateUserCommand): Promise<void> {
    // Validate command
    await this.validateCreateUserCommand(command)
    
    // Create events
    const events: DomainEvent[] = [
      {
        id: generateEventId(),
        type: 'user.created',
        aggregateId: command.userId,
        aggregateType: 'User',
        version: 1,
        timestamp: new Date(),
        correlationId: command.correlationId,
        metadata: {
          tenantId: command.tenantId,
          source: 'user-service',
          traceId: command.traceId,
          userId: command.createdBy
        },
        data: {
          userId: command.userId,
          email: command.email,
          firstName: command.firstName,
          lastName: command.lastName,
          role: command.role,
          createdBy: command.createdBy
        }
      }
    ]
    
    // Store events
    await this.eventStore.append(`user-${command.userId}`, events, 0)
  }
  
  async handle(command: AssignRoleCommand): Promise<void> {
    // Load user aggregate
    const userEvents = await this.eventStore.getEvents(`user-${command.userId}`)
    const user = UserAggregate.fromEvents(userEvents)
    
    // Execute business logic
    const newEvents = user.assignRole(command.roleId, command.assignedBy)
    
    // Store new events
    await this.eventStore.append(
      `user-${command.userId}`,
      newEvents,
      user.version
    )
  }
}
```

#### 2.2 Event Projections
```typescript
// User read model projection
class UserProjectionHandler implements EventHandler {
  constructor(private readModelStore: ReadModelStore) {}
  
  async handle(event: DomainEvent): Promise<void> {
    switch (event.type) {
      case 'user.created':
        await this.handleUserCreated(event)
        break
      case 'user.role_assigned':
        await this.handleRoleAssigned(event)
        break
      case 'user.logged_in':
        await this.handleUserLoggedIn(event)
        break
      default:
        // Ignore unknown events
        break
    }
  }
  
  private async handleUserCreated(event: DomainEvent): Promise<void> {
    const userData = event.data
    
    await this.readModelStore.upsert('users', {
      id: userData.userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      status: 'active',
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      tenantId: event.metadata.tenantId
    })
  }
  
  private async handleRoleAssigned(event: DomainEvent): Promise<void> {
    const roleData = event.data
    
    await this.readModelStore.update('users', roleData.userId, {
      role: roleData.roleName,
      updatedAt: event.timestamp
    })
    
    // Also update user roles table
    await this.readModelStore.upsert('user_roles', {
      userId: roleData.userId,
      roleId: roleData.roleId,
      roleName: roleData.roleName,
      assignedBy: roleData.assignedBy,
      assignedAt: event.timestamp,
      effectiveDate: roleData.effectiveDate,
      expirationDate: roleData.expirationDate
    })
  }
  
  private async handleUserLoggedIn(event: DomainEvent): Promise<void> {
    const loginData = event.data
    
    // Update last login
    await this.readModelStore.update('users', loginData.userId, {
      lastLoginAt: event.timestamp,
      lastLoginMethod: loginData.loginMethod,
      updatedAt: event.timestamp
    })
    
    // Record login session
    await this.readModelStore.insert('user_sessions', {
      sessionId: loginData.sessionId,
      userId: loginData.userId,
      loginMethod: loginData.loginMethod,
      deviceInfo: loginData.deviceInfo,
      location: loginData.location,
      loginAt: event.timestamp,
      tenantId: event.metadata.tenantId
    })
  }
}
```

### 3. Real-Time Notifications

#### 3.1 WebSocket Event Broadcasting
```typescript
// Real-time notification service
class RealTimeNotificationService implements EventHandler {
  private wsServer: WebSocketServer
  private connections: Map<string, WebSocket[]> = new Map()
  
  constructor(server: Server) {
    this.wsServer = new WebSocketServer({ server })
    this.setupWebSocketServer()
  }
  
  private setupWebSocketServer(): void {
    this.wsServer.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const url = new URL(request.url!, `http://${request.headers.host}`)
      const tenantId = url.searchParams.get('tenantId')
      const userId = url.searchParams.get('userId')
      
      if (!tenantId || !userId) {
        ws.close(1008, 'Missing required parameters')
        return
      }
      
      // Authenticate connection
      this.authenticateConnection(ws, tenantId, userId)
        .then(authenticated => {
          if (authenticated) {
            this.addConnection(tenantId, userId, ws)
            this.setupConnectionHandlers(ws, tenantId, userId)
          } else {
            ws.close(1008, 'Authentication failed')
          }
        })
    })
  }
  
  async handle(event: DomainEvent): Promise<void> {
    const notifications = await this.generateNotifications(event)
    
    for (const notification of notifications) {
      await this.broadcastNotification(notification)
    }
  }
  
  private async generateNotifications(event: DomainEvent): Promise<Notification[]> {
    const notifications: Notification[] = []
    
    switch (event.type) {
      case 'inventory.low_stock_alert':
        notifications.push({
          type: 'inventory_alert',
          tenantId: event.metadata.tenantId,
          recipients: await this.getInventoryManagers(event.data.vendorId),
          title: 'Low Stock Alert',
          message: `Product ${event.data.productId} is running low on stock`,
          data: event.data,
          priority: 'high'
        })
        break
        
      case 'transaction.completed':
        notifications.push({
          type: 'transaction_update',
          tenantId: event.metadata.tenantId,
          recipients: await this.getVendorUsers(event.data.vendorId),
          title: 'Transaction Completed',
          message: `Transaction ${event.data.transactionId} completed successfully`,
          data: event.data,
          priority: 'medium'
        })
        break
        
      case 'order.status_changed':
        notifications.push({
          type: 'order_update',
          tenantId: event.metadata.tenantId,
          recipients: await this.getOrderStakeholders(event.data.orderId),
          title: 'Order Status Update',
          message: `Order ${event.data.orderId} status changed to ${event.data.newStatus}`,
          data: event.data,
          priority: 'medium'
        })
        break
    }
    
    return notifications
  }
  
  private async broadcastNotification(notification: Notification): Promise<void> {
    for (const recipient of notification.recipients) {
      const connections = this.connections.get(`${notification.tenantId}:${recipient}`) || []
      
      for (const ws of connections) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'notification',
            data: notification
          }))
        }
      }
    }
  }
}
```

#### 3.2 Push Notification Integration
```typescript
// Push notification service
class PushNotificationService implements EventHandler {
  private fcm: admin.messaging.Messaging
  
  constructor() {
    this.fcm = admin.messaging()
  }
  
  async handle(event: DomainEvent): Promise<void> {
    const pushNotifications = await this.generatePushNotifications(event)
    
    for (const notification of pushNotifications) {
      await this.sendPushNotification(notification)
    }
  }
  
  private async generatePushNotifications(event: DomainEvent): Promise<PushNotification[]> {
    const notifications: PushNotification[] = []
    
    switch (event.type) {
      case 'user.login_failed':
        if (event.data.attemptCount >= 3) {
          const userTokens = await this.getUserDeviceTokens(event.data.email)
          notifications.push({
            tokens: userTokens,
            title: 'Security Alert',
            body: 'Multiple failed login attempts detected',
            data: {
              type: 'security_alert',
              eventId: event.id
            }
          })
        }
        break
        
      case 'vendor.suspended':
        const vendorUsers = await this.getVendorUserTokens(event.data.vendorId)
        notifications.push({
          tokens: vendorUsers,
          title: 'Account Suspended',
          body: 'Your vendor account has been suspended',
          data: {
            type: 'account_suspension',
            vendorId: event.data.vendorId
          }
        })
        break
    }
    
    return notifications
  }
  
  private async sendPushNotification(notification: PushNotification): Promise<void> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: notification.tokens,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      }
      
      const response = await this.fcm.sendMulticast(message)
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        await this.handleFailedTokens(notification.tokens, response.responses)
      }
      
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }
}
```

### 4. Event Replay and Recovery

#### 4.1 Event Replay Service
```typescript
// Event replay for system recovery
class EventReplayService {
  constructor(
    private eventStore: EventStore,
    private projectionHandlers: Map<string, EventHandler>
  ) {}
  
  async replayEvents(fromTimestamp: Date, toTimestamp?: Date): Promise<void> {
    const events = await this.eventStore.getAllEvents()
    
    const filteredEvents = events.filter(event => {
      const eventTime = new Date(event.timestamp)
      return eventTime >= fromTimestamp && 
             (!toTimestamp || eventTime <= toTimestamp)
    })
    
    console.log(`Replaying ${filteredEvents.length} events...`)
    
    for (const event of filteredEvents) {
      await this.replayEvent(event)
    }
    
    console.log('Event replay completed')
  }
  
  async rebuildProjection(projectionName: string, fromVersion?: number): Promise<void> {
    const handler = this.projectionHandlers.get(projectionName)
    if (!handler) {
      throw new Error(`Projection handler not found: ${projectionName}`)
    }
    
    // Clear existing projection data
    await this.clearProjectionData(projectionName)
    
    // Replay all events for this projection
    const events = await this.eventStore.getAllEvents(fromVersion)
    
    for (const event of events) {
      try {
        await handler.handle(event)
      } catch (error) {
        console.error(`Error replaying event ${event.id} for projection ${projectionName}:`, error)
      }
    }
  }
  
  private async replayEvent(event: DomainEvent): Promise<void> {
    // Replay event to all relevant handlers
    for (const [name, handler] of this.projectionHandlers) {
      try {
        await handler.handle(event)
      } catch (error) {
        console.error(`Error replaying event ${event.id} to handler ${name}:`, error)
      }
    }
  }
}
```

#### 4.2 Snapshot Management
```typescript
// Aggregate snapshot service
class SnapshotService {
  constructor(private snapshotStore: SnapshotStore) {}
  
  async saveSnapshot(aggregateId: string, aggregate: any, version: number): Promise<void> {
    const snapshot: AggregateSnapshot = {
      aggregateId,
      aggregateType: aggregate.constructor.name,
      version,
      data: aggregate.toSnapshot(),
      timestamp: new Date()
    }
    
    await this.snapshotStore.save(snapshot)
  }
  
  async loadSnapshot(aggregateId: string): Promise<AggregateSnapshot | null> {
    return await this.snapshotStore.load(aggregateId)
  }
  
  async loadAggregateFromSnapshot(aggregateId: string): Promise<any> {
    const snapshot = await this.loadSnapshot(aggregateId)
    
    if (snapshot) {
      // Load events since snapshot
      const events = await this.eventStore.getEvents(
        `${snapshot.aggregateType.toLowerCase()}-${aggregateId}`,
        snapshot.version + 1
      )
      
      // Reconstruct aggregate from snapshot + events
      const aggregate = this.createAggregateFromSnapshot(snapshot)
      return aggregate.applyEvents(events)
    }
    
    // No snapshot, load from all events
    const events = await this.eventStore.getEvents(
      `${aggregateId}`
    )
    
    return this.createAggregateFromEvents(events)
  }
}
```

## Performance Optimization

### 1. Event Batching and Compression
```typescript
// Event batching for high-throughput scenarios
class BatchEventProcessor {
  private eventBatch: DomainEvent[] = []
  private batchSize = 100
  private batchTimeout = 1000 // 1 second
  private batchTimer?: NodeJS.Timeout
  
  constructor(private eventStore: EventStore) {
    this.startBatchTimer()
  }
  
  async addEvent(event: DomainEvent): Promise<void> {
    this.eventBatch.push(event)
    
    if (this.eventBatch.length >= this.batchSize) {
      await this.processBatch()
    }
  }
  
  private async processBatch(): Promise<void> {
    if (this.eventBatch.length === 0) return
    
    const batch = [...this.eventBatch]
    this.eventBatch = []
    
    try {
      await this.eventStore.appendBatch(batch)
    } catch (error) {
      console.error('Error processing event batch:', error)
      // Implement retry logic or dead letter queue
    }
    
    this.resetBatchTimer()
  }
  
  private startBatchTimer(): void {
    this.batchTimer = setTimeout(() => {
      this.processBatch()
    }, this.batchTimeout)
  }
  
  private resetBatchTimer(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }
    this.startBatchTimer()
  }
}
```

### 2. Event Partitioning Strategy
```typescript
// Intelligent event partitioning
class EventPartitioningStrategy {
  getPartitionKey(event: DomainEvent): string {
    // Partition by tenant for data isolation
    if (event.metadata.tenantId) {
      return event.metadata.tenantId
    }
    
    // Partition by aggregate ID for related events
    return event.aggregateId
  }
  
  getPartitionCount(eventType: string): number {
    // Different partition counts based on event volume
    const highVolumeEvents = [
      'transaction.initiated',
      'transaction.completed',
      'inventory.stock_updated'
    ]
    
    return highVolumeEvents.includes(eventType) ? 20 : 10
  }
}
```

## Monitoring and Observability

### 1. Event Metrics Collection
```typescript
// Event processing metrics
class EventMetricsCollector {
  private metrics = {
    eventsProcessed: new Map<string, number>(),
    processingLatency: new Map<string, number[]>(),
    errorCounts: new Map<string, number>()
  }
  
  recordEventProcessed(eventType: string, processingTime: number): void {
    // Count events
    const current = this.metrics.eventsProcessed.get(eventType) || 0
    this.metrics.eventsProcessed.set(eventType, current + 1)
    
    // Track latency
    const latencies = this.metrics.processingLatency.get(eventType) || []
    latencies.push(processingTime)
    this.metrics.processingLatency.set(eventType, latencies)
  }
  
  recordEventError(eventType: string): void {
    const current = this.metrics.errorCounts.get(eventType) || 0
    this.metrics.errorCounts.set(eventType, current + 1)
  }
  
  getMetrics(): EventMetrics {
    return {
      totalEventsProcessed: Array.from(this.metrics.eventsProcessed.values())
        .reduce((sum, count) => sum + count, 0),
      eventTypeBreakdown: Object.fromEntries(this.metrics.eventsProcessed),
      averageLatency: this.calculateAverageLatencies(),
      errorRates: this.calculateErrorRates()
    }
  }
}
```

## Implementation Guidelines

### 1. Development Best Practices
- **Event Versioning**: Plan for event schema evolution
- **Idempotency**: Ensure event handlers are idempotent
- **Error Handling**: Implement comprehensive error handling and retry logic
- **Testing**: Create comprehensive test suites for event handlers
- **Documentation**: Maintain clear event documentation and schemas

### 2. Operational Considerations
- **Monitoring**: Implement comprehensive event processing monitoring
- **Alerting**: Set up alerts for event processing failures
- **Capacity Planning**: Plan for event volume growth
- **Disaster Recovery**: Implement event store backup and recovery
- **Performance Tuning**: Continuously optimize event processing performance

### 3. Security Considerations
- **Event Encryption**: Encrypt sensitive event data
- **Access Control**: Implement proper access controls for event streams
- **Audit Logging**: Log all event processing activities
- **Data Privacy**: Ensure compliance with data privacy regulations

## Conclusion

This event-driven architecture provides a robust foundation for building a scalable, real-time POS Super Admin Dashboard. The architecture enables loose coupling between services, supports high-volume event processing, and provides comprehensive monitoring and recovery capabilities. The implementation supports both immediate consistency for critical operations and eventual consistency for analytics and reporting, ensuring optimal performance across all system components.