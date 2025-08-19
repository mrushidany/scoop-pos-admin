# API Gateway and Service Mesh Architecture

## Overview

This document outlines the comprehensive design for an API Gateway and Service Mesh architecture for the POS Super Admin Dashboard. The design focuses on centralized API management, intelligent routing, rate limiting, security enforcement, and service-to-service communication optimization.

## Architecture Principles

### 1. Core Design Principles
- **Centralized API Management**: Single entry point for all external API requests
- **Service Mesh Integration**: Secure and observable service-to-service communication
- **Intelligent Routing**: Dynamic routing based on various criteria
- **Rate Limiting & Throttling**: Protect services from overload
- **Security Enforcement**: Authentication, authorization, and threat protection
- **Observability**: Comprehensive monitoring and tracing
- **High Availability**: Fault tolerance and graceful degradation
- **Scalability**: Horizontal scaling capabilities

### 2. Gateway Responsibilities
```typescript
interface APIGatewayResponsibilities {
  routing: {
    pathBasedRouting: boolean
    headerBasedRouting: boolean
    weightBasedRouting: boolean
    canaryDeployments: boolean
  }
  security: {
    authentication: boolean
    authorization: boolean
    rateLimiting: boolean
    ddosProtection: boolean
    inputValidation: boolean
  }
  transformation: {
    requestTransformation: boolean
    responseTransformation: boolean
    protocolTranslation: boolean
    dataAggregation: boolean
  }
  monitoring: {
    requestLogging: boolean
    metricsCollection: boolean
    distributedTracing: boolean
    healthChecking: boolean
  }
}
```

## API Gateway Architecture

### 1. Gateway Core Components

#### 1.1 Request Processing Pipeline
```typescript
// API Gateway request processing pipeline
class APIGatewayPipeline {
  private middlewares: Middleware[] = []
  
  constructor() {
    this.setupDefaultMiddlewares()
  }
  
  private setupDefaultMiddlewares(): void {
    this.middlewares = [
      new RequestValidationMiddleware(),
      new AuthenticationMiddleware(),
      new AuthorizationMiddleware(),
      new RateLimitingMiddleware(),
      new RequestTransformationMiddleware(),
      new RoutingMiddleware(),
      new LoadBalancingMiddleware(),
      new CircuitBreakerMiddleware(),
      new ResponseTransformationMiddleware(),
      new LoggingMiddleware(),
      new MetricsMiddleware()
    ]
  }
  
  async processRequest(request: GatewayRequest): Promise<GatewayResponse> {
    let context = new RequestContext(request)
    
    try {
      // Execute middleware chain
      for (const middleware of this.middlewares) {
        context = await middleware.execute(context)
        
        // Early return if middleware short-circuits
        if (context.shouldShortCircuit) {
          return context.response
        }
      }
      
      // Forward request to target service
      const response = await this.forwardRequest(context)
      
      // Process response through middleware chain (reverse order)
      for (let i = this.middlewares.length - 1; i >= 0; i--) {
        const middleware = this.middlewares[i]
        if (middleware.processResponse) {
          context = await middleware.processResponse(context, response)
        }
      }
      
      return context.response
    } catch (error) {
      return this.handleError(context, error)
    }
  }
  
  private async forwardRequest(context: RequestContext): Promise<ServiceResponse> {
    const targetService = context.targetService
    const loadBalancer = this.getLoadBalancer(targetService.name)
    
    const instance = await loadBalancer.selectInstance()
    
    return await this.httpClient.request({
      url: `${instance.url}${context.request.path}`,
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      timeout: targetService.timeout || 30000
    })
  }
}

// Request context for pipeline processing
class RequestContext {
  public request: GatewayRequest
  public response?: GatewayResponse
  public targetService?: ServiceDefinition
  public user?: AuthenticatedUser
  public metadata: Map<string, any> = new Map()
  public shouldShortCircuit = false
  public startTime = Date.now()
  
  constructor(request: GatewayRequest) {
    this.request = request
  }
  
  setMetadata(key: string, value: any): void {
    this.metadata.set(key, value)
  }
  
  getMetadata<T>(key: string): T | undefined {
    return this.metadata.get(key)
  }
  
  shortCircuit(response: GatewayResponse): void {
    this.response = response
    this.shouldShortCircuit = true
  }
}
```

#### 1.2 Service Discovery and Registration
```typescript
// Service discovery interface
interface ServiceDiscovery {
  registerService(service: ServiceDefinition): Promise<void>
  deregisterService(serviceId: string): Promise<void>
  discoverServices(serviceName: string): Promise<ServiceInstance[]>
  watchService(serviceName: string, callback: ServiceWatchCallback): void
  getHealthyInstances(serviceName: string): Promise<ServiceInstance[]>
}

// Consul-based service discovery implementation
class ConsulServiceDiscovery implements ServiceDiscovery {
  private consul: Consul
  private watchers: Map<string, ServiceWatchCallback[]> = new Map()
  
  constructor(config: ConsulConfig) {
    this.consul = new Consul({
      host: config.host,
      port: config.port,
      secure: config.secure
    })
  }
  
  async registerService(service: ServiceDefinition): Promise<void> {
    await this.consul.agent.service.register({
      id: service.id,
      name: service.name,
      address: service.address,
      port: service.port,
      tags: service.tags,
      meta: service.metadata,
      check: {
        http: `${service.address}:${service.port}/health`,
        interval: '10s',
        timeout: '5s',
        deregistercriticalserviceafter: '1m'
      }
    })
  }
  
  async discoverServices(serviceName: string): Promise<ServiceInstance[]> {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true
    })
    
    return services.map(service => ({
      id: service.Service.ID,
      name: service.Service.Service,
      address: service.Service.Address,
      port: service.Service.Port,
      tags: service.Service.Tags,
      metadata: service.Service.Meta,
      health: 'healthy'
    }))
  }
  
  watchService(serviceName: string, callback: ServiceWatchCallback): void {
    const callbacks = this.watchers.get(serviceName) || []
    callbacks.push(callback)
    this.watchers.set(serviceName, callbacks)
    
    // Start watching if this is the first callback
    if (callbacks.length === 1) {
      this.startWatching(serviceName)
    }
  }
  
  private startWatching(serviceName: string): void {
    const watch = this.consul.watch({
      method: this.consul.health.service,
      options: { service: serviceName, passing: true }
    })
    
    watch.on('change', (data) => {
      const instances = data.map(service => ({
        id: service.Service.ID,
        name: service.Service.Service,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags,
        metadata: service.Service.Meta,
        health: 'healthy'
      }))
      
      const callbacks = this.watchers.get(serviceName) || []
      callbacks.forEach(callback => callback(instances))
    })
    
    watch.on('error', (error) => {
      console.error(`Error watching service ${serviceName}:`, error)
    })
  }
}

// Service registry with caching
class ServiceRegistry {
  private services: Map<string, ServiceInstance[]> = new Map()
  private discovery: ServiceDiscovery
  private cacheTimeout = 30000 // 30 seconds
  
  constructor(discovery: ServiceDiscovery) {
    this.discovery = discovery
    this.setupServiceWatching()
  }
  
  async getServiceInstances(serviceName: string): Promise<ServiceInstance[]> {
    // Check cache first
    const cached = this.services.get(serviceName)
    if (cached) {
      return cached
    }
    
    // Discover services
    const instances = await this.discovery.discoverServices(serviceName)
    this.services.set(serviceName, instances)
    
    // Set cache expiration
    setTimeout(() => {
      this.services.delete(serviceName)
    }, this.cacheTimeout)
    
    return instances
  }
  
  private setupServiceWatching(): void {
    // Watch for service changes and update cache
    const serviceNames = ['user-service', 'vendor-service', 'transaction-service', 
                         'inventory-service', 'notification-service']
    
    serviceNames.forEach(serviceName => {
      this.discovery.watchService(serviceName, (instances) => {
        this.services.set(serviceName, instances)
      })
    })
  }
}
```

### 2. Load Balancing Strategies

#### 2.1 Load Balancer Implementation
```typescript
// Load balancing strategies
interface LoadBalancingStrategy {
  selectInstance(instances: ServiceInstance[], context?: RequestContext): ServiceInstance
}

// Round-robin load balancing
class RoundRobinStrategy implements LoadBalancingStrategy {
  private counters: Map<string, number> = new Map()
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No healthy instances available')
    }
    
    const serviceName = instances[0].name
    const counter = this.counters.get(serviceName) || 0
    const selectedIndex = counter % instances.length
    
    this.counters.set(serviceName, counter + 1)
    
    return instances[selectedIndex]
  }
}

// Weighted round-robin load balancing
class WeightedRoundRobinStrategy implements LoadBalancingStrategy {
  private currentWeights: Map<string, Map<string, number>> = new Map()
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No healthy instances available')
    }
    
    const serviceName = instances[0].name
    let serviceWeights = this.currentWeights.get(serviceName)
    
    if (!serviceWeights) {
      serviceWeights = new Map()
      instances.forEach(instance => {
        const weight = parseInt(instance.metadata?.weight || '1')
        serviceWeights!.set(instance.id, weight)
      })
      this.currentWeights.set(serviceName, serviceWeights)
    }
    
    // Find instance with highest current weight
    let selectedInstance = instances[0]
    let maxWeight = serviceWeights.get(selectedInstance.id) || 1
    
    instances.forEach(instance => {
      const currentWeight = serviceWeights!.get(instance.id) || 1
      if (currentWeight > maxWeight) {
        maxWeight = currentWeight
        selectedInstance = instance
      }
    })
    
    // Decrease selected instance weight
    const originalWeight = parseInt(selectedInstance.metadata?.weight || '1')
    serviceWeights.set(selectedInstance.id, maxWeight - originalWeight)
    
    // Increase all weights
    instances.forEach(instance => {
      const currentWeight = serviceWeights!.get(instance.id) || 1
      const originalWeight = parseInt(instance.metadata?.weight || '1')
      serviceWeights!.set(instance.id, currentWeight + originalWeight)
    })
    
    return selectedInstance
  }
}

// Least connections load balancing
class LeastConnectionsStrategy implements LoadBalancingStrategy {
  private connections: Map<string, number> = new Map()
  
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No healthy instances available')
    }
    
    // Find instance with least connections
    let selectedInstance = instances[0]
    let minConnections = this.connections.get(selectedInstance.id) || 0
    
    instances.forEach(instance => {
      const connections = this.connections.get(instance.id) || 0
      if (connections < minConnections) {
        minConnections = connections
        selectedInstance = instance
      }
    })
    
    // Increment connection count
    this.connections.set(selectedInstance.id, minConnections + 1)
    
    return selectedInstance
  }
  
  releaseConnection(instanceId: string): void {
    const connections = this.connections.get(instanceId) || 0
    this.connections.set(instanceId, Math.max(0, connections - 1))
  }
}

// Consistent hashing load balancing
class ConsistentHashingStrategy implements LoadBalancingStrategy {
  private hashRing: Map<number, ServiceInstance> = new Map()
  private virtualNodes = 150
  
  selectInstance(instances: ServiceInstance[], context?: RequestContext): ServiceInstance {
    if (instances.length === 0) {
      throw new Error('No healthy instances available')
    }
    
    // Rebuild hash ring if needed
    this.buildHashRing(instances)
    
    // Get hash key from request context
    const hashKey = this.getHashKey(context)
    const hash = this.hash(hashKey)
    
    // Find the first node in the ring >= hash
    const sortedHashes = Array.from(this.hashRing.keys()).sort((a, b) => a - b)
    
    for (const ringHash of sortedHashes) {
      if (ringHash >= hash) {
        return this.hashRing.get(ringHash)!
      }
    }
    
    // Wrap around to the first node
    return this.hashRing.get(sortedHashes[0])!
  }
  
  private buildHashRing(instances: ServiceInstance[]): void {
    this.hashRing.clear()
    
    instances.forEach(instance => {
      for (let i = 0; i < this.virtualNodes; i++) {
        const virtualNodeKey = `${instance.id}:${i}`
        const hash = this.hash(virtualNodeKey)
        this.hashRing.set(hash, instance)
      }
    })
  }
  
  private getHashKey(context?: RequestContext): string {
    if (context?.user?.id) {
      return context.user.id
    }
    
    if (context?.request.headers['x-session-id']) {
      return context.request.headers['x-session-id']
    }
    
    return context?.request.ip || 'default'
  }
  
  private hash(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// Load balancer with health checking
class LoadBalancer {
  private strategy: LoadBalancingStrategy
  private serviceRegistry: ServiceRegistry
  private healthChecker: HealthChecker
  
  constructor(
    strategy: LoadBalancingStrategy,
    serviceRegistry: ServiceRegistry,
    healthChecker: HealthChecker
  ) {
    this.strategy = strategy
    this.serviceRegistry = serviceRegistry
    this.healthChecker = healthChecker
  }
  
  async selectInstance(serviceName: string, context?: RequestContext): Promise<ServiceInstance> {
    const instances = await this.serviceRegistry.getServiceInstances(serviceName)
    const healthyInstances = await this.healthChecker.filterHealthyInstances(instances)
    
    if (healthyInstances.length === 0) {
      throw new Error(`No healthy instances available for service: ${serviceName}`)
    }
    
    return this.strategy.selectInstance(healthyInstances, context)
  }
}
```

### 3. Rate Limiting and Throttling

#### 3.1 Rate Limiting Strategies
```typescript
// Rate limiting interface
interface RateLimiter {
  isAllowed(key: string, limit: number, window: number): Promise<RateLimitResult>
  getRemainingRequests(key: string, limit: number, window: number): Promise<number>
  reset(key: string): Promise<void>
}

// Rate limit result
interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

// Token bucket rate limiter
class TokenBucketRateLimiter implements RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map()
  private redis: Redis
  
  constructor(redis: Redis) {
    this.redis = redis
  }
  
  async isAllowed(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const bucket = await this.getBucket(key, limit, window)
    
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1
      await this.saveBucket(key, bucket)
      
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: bucket.lastRefill + window
      }
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: bucket.lastRefill + window,
      retryAfter: Math.ceil((1 - bucket.tokens) * (window / limit))
    }
  }
  
  private async getBucket(key: string, limit: number, window: number): Promise<TokenBucket> {
    const cached = await this.redis.get(`rate_limit:${key}`)
    
    if (cached) {
      const bucket = JSON.parse(cached) as TokenBucket
      return this.refillBucket(bucket, limit, window)
    }
    
    return {
      tokens: limit,
      lastRefill: Date.now(),
      capacity: limit,
      refillRate: limit / window
    }
  }
  
  private refillBucket(bucket: TokenBucket, limit: number, window: number): TokenBucket {
    const now = Date.now()
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = (timePassed / window) * limit
    
    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
    
    return bucket
  }
  
  private async saveBucket(key: string, bucket: TokenBucket): Promise<void> {
    await this.redis.setex(`rate_limit:${key}`, 3600, JSON.stringify(bucket))
  }
}

// Sliding window rate limiter
class SlidingWindowRateLimiter implements RateLimiter {
  private redis: Redis
  
  constructor(redis: Redis) {
    this.redis = redis
  }
  
  async isAllowed(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - window
    
    // Use Redis sorted set to track requests in time window
    const pipeline = this.redis.pipeline()
    
    // Remove old entries
    pipeline.zremrangebyscore(`rate_limit:${key}`, 0, windowStart)
    
    // Count current requests
    pipeline.zcard(`rate_limit:${key}`)
    
    // Add current request
    pipeline.zadd(`rate_limit:${key}`, now, `${now}-${Math.random()}`)
    
    // Set expiration
    pipeline.expire(`rate_limit:${key}`, Math.ceil(window / 1000))
    
    const results = await pipeline.exec()
    const currentCount = results![1][1] as number
    
    if (currentCount < limit) {
      return {
        allowed: true,
        remaining: limit - currentCount - 1,
        resetTime: now + window
      }
    }
    
    // Remove the request we just added since it's not allowed
    await this.redis.zremrangebyrank(`rate_limit:${key}`, -1, -1)
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: now + window,
      retryAfter: Math.ceil(window / 1000)
    }
  }
  
  async getRemainingRequests(key: string, limit: number, window: number): Promise<number> {
    const now = Date.now()
    const windowStart = now - window
    
    await this.redis.zremrangebyscore(`rate_limit:${key}`, 0, windowStart)
    const currentCount = await this.redis.zcard(`rate_limit:${key}`)
    
    return Math.max(0, limit - currentCount)
  }
}

// Distributed rate limiter with Redis
class DistributedRateLimiter implements RateLimiter {
  private redis: Redis
  private algorithm: 'token_bucket' | 'sliding_window' | 'fixed_window'
  
  constructor(redis: Redis, algorithm: 'token_bucket' | 'sliding_window' | 'fixed_window' = 'sliding_window') {
    this.redis = redis
    this.algorithm = algorithm
  }
  
  async isAllowed(key: string, limit: number, window: number): Promise<RateLimitResult> {
    switch (this.algorithm) {
      case 'token_bucket':
        return this.tokenBucketCheck(key, limit, window)
      case 'sliding_window':
        return this.slidingWindowCheck(key, limit, window)
      case 'fixed_window':
        return this.fixedWindowCheck(key, limit, window)
      default:
        throw new Error(`Unknown rate limiting algorithm: ${this.algorithm}`)
    }
  }
  
  private async fixedWindowCheck(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const now = Date.now()
    const windowKey = Math.floor(now / window)
    const redisKey = `rate_limit:${key}:${windowKey}`
    
    const current = await this.redis.incr(redisKey)
    
    if (current === 1) {
      await this.redis.expire(redisKey, Math.ceil(window / 1000))
    }
    
    const resetTime = (windowKey + 1) * window
    
    if (current <= limit) {
      return {
        allowed: true,
        remaining: limit - current,
        resetTime
      }
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000)
    }
  }
  
  private async tokenBucketCheck(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local tokens = tonumber(ARGV[2])
      local interval = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      
      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local current_tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now
      
      local elapsed = now - last_refill
      local tokens_to_add = math.floor(elapsed * tokens / interval)
      current_tokens = math.min(capacity, current_tokens + tokens_to_add)
      
      if current_tokens >= 1 then
        current_tokens = current_tokens - 1
        redis.call('HMSET', key, 'tokens', current_tokens, 'last_refill', now)
        redis.call('EXPIRE', key, interval / 1000)
        return {1, current_tokens, last_refill + interval}
      else
        redis.call('HMSET', key, 'tokens', current_tokens, 'last_refill', now)
        redis.call('EXPIRE', key, interval / 1000)
        return {0, 0, last_refill + interval}
      end
    `
    
    const result = await this.redis.eval(
      luaScript,
      1,
      `rate_limit:${key}`,
      limit.toString(),
      limit.toString(),
      window.toString(),
      Date.now().toString()
    ) as [number, number, number]
    
    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2],
      retryAfter: result[0] === 0 ? Math.ceil((result[2] - Date.now()) / 1000) : undefined
    }
  }
  
  private async slidingWindowCheck(key: string, limit: number, window: number): Promise<RateLimitResult> {
    const luaScript = `
      local key = KEYS[1]
      local window = tonumber(ARGV[1])
      local limit = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local uuid = ARGV[4]
      
      local clearBefore = now - window
      
      redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
      
      local current = redis.call('ZCARD', key)
      
      if current < limit then
        redis.call('ZADD', key, now, uuid)
        redis.call('EXPIRE', key, math.ceil(window / 1000))
        return {1, limit - current - 1, now + window}
      else
        return {0, 0, now + window}
      end
    `
    
    const uuid = `${Date.now()}-${Math.random()}`
    const result = await this.redis.eval(
      luaScript,
      1,
      `rate_limit:${key}`,
      window.toString(),
      limit.toString(),
      Date.now().toString(),
      uuid
    ) as [number, number, number]
    
    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2],
      retryAfter: result[0] === 0 ? Math.ceil(window / 1000) : undefined
    }
  }
}
```

#### 3.2 Rate Limiting Middleware
```typescript
// Rate limiting middleware
class RateLimitingMiddleware implements Middleware {
  private rateLimiter: RateLimiter
  private rules: RateLimitRule[]
  
  constructor(rateLimiter: RateLimiter, rules: RateLimitRule[]) {
    this.rateLimiter = rateLimiter
    this.rules = rules
  }
  
  async execute(context: RequestContext): Promise<RequestContext> {
    const applicableRules = this.getApplicableRules(context)
    
    for (const rule of applicableRules) {
      const key = this.generateRateLimitKey(context, rule)
      const result = await this.rateLimiter.isAllowed(key, rule.limit, rule.window)
      
      // Add rate limit headers
      context.setMetadata('rateLimitHeaders', {
        'X-RateLimit-Limit': rule.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
      })
      
      if (!result.allowed) {
        const response: GatewayResponse = {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '60',
            ...context.getMetadata('rateLimitHeaders')
          },
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many requests. Limit: ${rule.limit} requests per ${rule.window}ms`,
            retryAfter: result.retryAfter
          })
        }
        
        context.shortCircuit(response)
        return context
      }
    }
    
    return context
  }
  
  private getApplicableRules(context: RequestContext): RateLimitRule[] {
    return this.rules.filter(rule => {
      // Check path pattern
      if (rule.pathPattern && !new RegExp(rule.pathPattern).test(context.request.path)) {
        return false
      }
      
      // Check method
      if (rule.methods && !rule.methods.includes(context.request.method)) {
        return false
      }
      
      // Check user role
      if (rule.userRoles && context.user) {
        const userRoles = context.user.roles || []
        if (!rule.userRoles.some(role => userRoles.includes(role))) {
          return false
        }
      }
      
      return true
    })
  }
  
  private generateRateLimitKey(context: RequestContext, rule: RateLimitRule): string {
    const parts = ['rate_limit']
    
    switch (rule.keyType) {
      case 'ip':
        parts.push('ip', context.request.ip)
        break
      case 'user':
        if (context.user) {
          parts.push('user', context.user.id)
        } else {
          parts.push('ip', context.request.ip)
        }
        break
      case 'tenant':
        if (context.user?.tenantId) {
          parts.push('tenant', context.user.tenantId)
        } else {
          parts.push('ip', context.request.ip)
        }
        break
      case 'api_key':
        const apiKey = context.request.headers['x-api-key']
        if (apiKey) {
          parts.push('api_key', apiKey)
        } else {
          parts.push('ip', context.request.ip)
        }
        break
      default:
        parts.push('global')
    }
    
    if (rule.pathPattern) {
      parts.push('path', rule.pathPattern)
    }
    
    return parts.join(':')
  }
}

// Rate limit rule configuration
interface RateLimitRule {
  id: string
  name: string
  limit: number // requests
  window: number // milliseconds
  keyType: 'ip' | 'user' | 'tenant' | 'api_key' | 'global'
  pathPattern?: string
  methods?: string[]
  userRoles?: string[]
  priority: number
  enabled: boolean
}

// Rate limiting configuration
const rateLimitRules: RateLimitRule[] = [
  {
    id: 'global_limit',
    name: 'Global Rate Limit',
    limit: 1000,
    window: 60000, // 1 minute
    keyType: 'ip',
    priority: 1,
    enabled: true
  },
  {
    id: 'auth_limit',
    name: 'Authentication Rate Limit',
    limit: 5,
    window: 60000, // 1 minute
    keyType: 'ip',
    pathPattern: '/api/auth/.*',
    methods: ['POST'],
    priority: 2,
    enabled: true
  },
  {
    id: 'user_api_limit',
    name: 'User API Rate Limit',
    limit: 100,
    window: 60000, // 1 minute
    keyType: 'user',
    pathPattern: '/api/.*',
    priority: 3,
    enabled: true
  },
  {
    id: 'admin_api_limit',
    name: 'Admin API Rate Limit',
    limit: 500,
    window: 60000, // 1 minute
    keyType: 'user',
    pathPattern: '/api/admin/.*',
    userRoles: ['admin', 'super_admin'],
    priority: 4,
    enabled: true
  },
  {
    id: 'tenant_limit',
    name: 'Tenant Rate Limit',
    limit: 1000,
    window: 60000, // 1 minute
    keyType: 'tenant',
    priority: 5,
    enabled: true
  }
]
```

### 4. Circuit Breaker Pattern

#### 4.1 Circuit Breaker Implementation
```typescript
// Circuit breaker states
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures to open circuit
  recoveryTimeout: number // Time to wait before trying again (ms)
  monitoringPeriod: number // Time window for failure counting (ms)
  halfOpenMaxCalls: number // Max calls allowed in half-open state
  successThreshold: number // Successes needed to close circuit
}

// Circuit breaker implementation
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0
  private halfOpenCalls = 0
  private config: CircuitBreakerConfig
  private serviceName: string
  
  constructor(serviceName: string, config: CircuitBreakerConfig) {
    this.serviceName = serviceName
    this.config = config
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN
        this.halfOpenCalls = 0
      } else {
        throw new CircuitBreakerOpenError(`Circuit breaker is OPEN for service: ${this.serviceName}`)
      }
    }
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new CircuitBreakerOpenError(`Circuit breaker HALF_OPEN max calls exceeded for service: ${this.serviceName}`)
      }
      this.halfOpenCalls++
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED
        this.successCount = 0
      }
    }
  }
  
  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN
      this.successCount = 0
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN
    }
  }
  
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeout
  }
  
  getState(): CircuitBreakerState {
    return this.state
  }
  
  getMetrics(): CircuitBreakerMetrics {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      halfOpenCalls: this.halfOpenCalls
    }
  }
}

// Circuit breaker middleware
class CircuitBreakerMiddleware implements Middleware {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map()
  private defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 60000, // 1 minute
    halfOpenMaxCalls: 3,
    successThreshold: 2
  }
  
  async execute(context: RequestContext): Promise<RequestContext> {
    if (!context.targetService) {
      return context
    }
    
    const serviceName = context.targetService.name
    const circuitBreaker = this.getCircuitBreaker(serviceName)
    
    try {
      await circuitBreaker.execute(async () => {
        // This will be executed by the next middleware in the chain
        return Promise.resolve()
      })
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        const response: GatewayResponse = {
          statusCode: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
          body: JSON.stringify({
            error: 'Service Unavailable',
            message: `Service ${serviceName} is temporarily unavailable`,
            circuitBreakerState: circuitBreaker.getState()
          })
        }
        
        context.shortCircuit(response)
      }
    }
    
    return context
  }
  
  private getCircuitBreaker(serviceName: string): CircuitBreaker {
    let circuitBreaker = this.circuitBreakers.get(serviceName)
    
    if (!circuitBreaker) {
      circuitBreaker = new CircuitBreaker(serviceName, this.defaultConfig)
      this.circuitBreakers.set(serviceName, circuitBreaker)
    }
    
    return circuitBreaker
  }
  
  getCircuitBreakerMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getMetrics())
  }
}

class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitBreakerOpenError'
  }
}
```

### 5. Service Mesh Integration

#### 5.1 Istio Service Mesh Configuration
```yaml
# Gateway configuration
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: pos-gateway
  namespace: pos-system
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - api.pos-admin.com
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: pos-tls-secret
    hosts:
    - api.pos-admin.com

---
# Virtual Service for routing
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: pos-api-routes
  namespace: pos-system
spec:
  hosts:
  - api.pos-admin.com
  gateways:
  - pos-gateway
  http:
  # Authentication routes
  - match:
    - uri:
        prefix: /api/auth
    route:
    - destination:
        host: auth-service
        port:
          number: 8080
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  
  # User management routes
  - match:
    - uri:
        prefix: /api/users
    route:
    - destination:
        host: user-service
        port:
          number: 8080
    timeout: 30s
    
  # Vendor management routes
  - match:
    - uri:
        prefix: /api/vendors
    route:
    - destination:
        host: vendor-service
        port:
          number: 8080
    timeout: 30s
    
  # Transaction routes
  - match:
    - uri:
        prefix: /api/transactions
    route:
    - destination:
        host: transaction-service
        port:
          number: 8080
    timeout: 60s
    
  # Inventory routes
  - match:
    - uri:
        prefix: /api/inventory
    route:
    - destination:
        host: inventory-service
        port:
          number: 8080
    timeout: 30s

---
# Destination rules for load balancing
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: pos-services
  namespace: pos-system
spec:
  host: "*.pos-system.svc.cluster.local"
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 10
        maxRetries: 3
        consecutiveGatewayErrors: 5
        interval: 30s
        baseEjectionTime: 30s
    outlierDetection:
      consecutiveGatewayErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minHealthPercent: 30

---
# Rate limiting with Envoy
apiVersion: networking.istio.io/v1beta1
kind: EnvoyFilter
metadata:
  name: rate-limit-filter
  namespace: pos-system
spec:
  configPatches:
  - applyTo: HTTP_FILTER
    match:
      context: SIDECAR_INBOUND
      listener:
        filterChain:
          filter:
            name: "envoy.filters.network.http_connection_manager"
    patch:
      operation: INSERT_BEFORE
      value:
        name: envoy.filters.http.local_ratelimit
        typed_config:
          "@type": type.googleapis.com/udpa.type.v1.TypedStruct
          type_url: type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
          value:
            stat_prefix: rate_limiter
            token_bucket:
              max_tokens: 100
              tokens_per_fill: 100
              fill_interval: 60s
            filter_enabled:
              runtime_key: rate_limit_enabled
              default_value:
                numerator: 100
                denominator: HUNDRED
            filter_enforced:
              runtime_key: rate_limit_enforced
              default_value:
                numerator: 100
                denominator: HUNDRED

---
# Security policies
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: pos-api-authz
  namespace: pos-system
spec:
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/pos-system/sa/api-gateway"]
  - to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
    when:
    - key: request.headers[authorization]
      values: ["Bearer *"]

---
# Mutual TLS policy
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: pos-mtls
  namespace: pos-system
spec:
  mtls:
    mode: STRICT
```

#### 5.2 Service Mesh Observability
```typescript
// Service mesh metrics collector
class ServiceMeshMetrics {
  private prometheusClient: PrometheusRegistry
  
  constructor() {
    this.prometheusClient = new PrometheusRegistry()
    this.setupMetrics()
  }
  
  private setupMetrics(): void {
    // Request duration histogram
    this.requestDuration = new Histogram({
      name: 'istio_request_duration_milliseconds',
      help: 'Request duration in milliseconds',
      labelNames: ['source_service', 'destination_service', 'method', 'status_code'],
      buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
    })
    
    // Request total counter
    this.requestTotal = new Counter({
      name: 'istio_requests_total',
      help: 'Total number of requests',
      labelNames: ['source_service', 'destination_service', 'method', 'status_code']
    })
    
    // Request size histogram
    this.requestSize = new Histogram({
      name: 'istio_request_bytes',
      help: 'Request size in bytes',
      labelNames: ['source_service', 'destination_service', 'method'],
      buckets: [1, 10, 100, 1000, 10000, 100000, 1000000]
    })
    
    // Response size histogram
    this.responseSize = new Histogram({
      name: 'istio_response_bytes',
      help: 'Response size in bytes',
      labelNames: ['source_service', 'destination_service', 'method', 'status_code'],
      buckets: [1, 10, 100, 1000, 10000, 100000, 1000000]
    })
  }
  
  recordRequest(metrics: RequestMetrics): void {
    const labels = {
      source_service: metrics.sourceService,
      destination_service: metrics.destinationService,
      method: metrics.method,
      status_code: metrics.statusCode.toString()
    }
    
    this.requestDuration.observe(labels, metrics.duration)
    this.requestTotal.inc(labels)
    this.requestSize.observe(
      { ...labels, status_code: undefined },
      metrics.requestSize
    )
    this.responseSize.observe(labels, metrics.responseSize)
  }
  
  getMetrics(): string {
    return this.prometheusClient.metrics()
  }
}

// Distributed tracing integration
class DistributedTracing {
  private tracer: Tracer
  
  constructor() {
    this.tracer = opentelemetry.trace.getTracer('pos-api-gateway')
  }
  
  createSpan(name: string, parentContext?: SpanContext): Span {
    const span = this.tracer.startSpan(name, {
      parent: parentContext
    })
    
    return span
  }
  
  async traceRequest<T>(
    name: string,
    operation: (span: Span) => Promise<T>,
    parentContext?: SpanContext
  ): Promise<T> {
    const span = this.createSpan(name, parentContext)
    
    try {
      const result = await operation(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })
      span.recordException(error)
      throw error
    } finally {
      span.end()
    }
  }
  
  injectHeaders(span: Span, headers: Record<string, string>): void {
    opentelemetry.propagation.inject(
      opentelemetry.trace.setSpan(opentelemetry.context.active(), span),
      headers
    )
  }
  
  extractContext(headers: Record<string, string>): SpanContext | undefined {
    const context = opentelemetry.propagation.extract(
      opentelemetry.context.active(),
      headers
    )
    
    return opentelemetry.trace.getSpanContext(context)
  }
}
```

## Implementation Guidelines

### 1. Deployment Strategy
- **Containerization**: Deploy gateway as containerized service
- **High Availability**: Multiple gateway instances with load balancing
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Releases**: Gradual rollout of new features

### 2. Security Considerations
- **TLS Termination**: Handle SSL/TLS at gateway level
- **Certificate Management**: Automated certificate renewal
- **Security Headers**: Add security headers to responses
- **Input Validation**: Validate all incoming requests

### 3. Monitoring and Alerting
- **Health Checks**: Regular health monitoring of services
- **Performance Metrics**: Track response times and throughput
- **Error Tracking**: Monitor and alert on error rates
- **Capacity Planning**: Monitor resource usage and scaling needs

### 4. Testing Strategy
- **Load Testing**: Test gateway under various load conditions
- **Chaos Engineering**: Test resilience with service failures
- **Security Testing**: Regular security assessments
- **Performance Testing**: Continuous performance monitoring

## Conclusion

This comprehensive API Gateway and Service Mesh design provides a robust, scalable, and secure foundation for the POS Super Admin Dashboard. The architecture ensures high availability, optimal performance, and comprehensive observability while maintaining security and compliance standards.