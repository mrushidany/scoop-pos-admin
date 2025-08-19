# Advanced Role-Based Access Control (RBAC) System Design

## Overview

This document outlines the design and implementation of a sophisticated Role-Based Access Control (RBAC) system for the multi-tenant POS Super Admin Dashboard, providing granular permissions, dynamic role management, and context-aware access control.

## RBAC Architecture

### 1. Core RBAC Components

#### 1.1 Entities and Relationships
```typescript
// Core RBAC entities
interface User {
  id: string
  email: string
  tenantId: string
  vendorId?: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: Date
  mfaEnabled: boolean
  preferences: UserPreferences
}

interface Role {
  id: string
  name: string
  description: string
  tenantId: string
  type: 'system' | 'custom' | 'inherited'
  level: 'super_admin' | 'tenant_admin' | 'vendor_admin' | 'manager' | 'staff' | 'readonly'
  permissions: Permission[]
  constraints: RoleConstraints
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  scope: PermissionScope
  conditions: AccessCondition[]
  metadata: PermissionMetadata
}

interface UserRole {
  userId: string
  roleId: string
  tenantId: string
  vendorId?: string
  assignedBy: string
  assignedAt: Date
  expiresAt?: Date
  isActive: boolean
  context: RoleContext
}
```

#### 1.2 Permission Scoping
```typescript
interface PermissionScope {
  level: 'global' | 'tenant' | 'vendor' | 'department' | 'self'
  resources: string[]
  conditions: ScopeCondition[]
  timeRestrictions?: TimeRestriction[]
  locationRestrictions?: LocationRestriction[]
}

interface ScopeCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with'
  value: any
  dynamic?: boolean // For runtime evaluation
}

interface TimeRestriction {
  type: 'business_hours' | 'specific_times' | 'date_range'
  timezone: string
  schedule?: BusinessHours
  startDate?: Date
  endDate?: Date
}

interface LocationRestriction {
  type: 'ip_range' | 'country' | 'region' | 'specific_locations'
  allowedIPs?: string[]
  allowedCountries?: string[]
  allowedRegions?: string[]
  specificLocations?: GeoLocation[]
}
```

### 2. Hierarchical Role System

#### 2.1 Role Hierarchy Definition
```typescript
enum RoleLevel {
  SUPER_ADMIN = 100,      // Platform-wide access
  TENANT_ADMIN = 80,      // Full tenant access
  VENDOR_ADMIN = 60,      // Full vendor access
  DEPARTMENT_MANAGER = 40, // Department-specific access
  STAFF = 20,             // Limited operational access
  READONLY = 10           // View-only access
}

class RoleHierarchy {
  private hierarchy: Map<RoleLevel, RoleLevel[]> = new Map([
    [RoleLevel.SUPER_ADMIN, [RoleLevel.TENANT_ADMIN, RoleLevel.VENDOR_ADMIN, RoleLevel.DEPARTMENT_MANAGER, RoleLevel.STAFF, RoleLevel.READONLY]],
    [RoleLevel.TENANT_ADMIN, [RoleLevel.VENDOR_ADMIN, RoleLevel.DEPARTMENT_MANAGER, RoleLevel.STAFF, RoleLevel.READONLY]],
    [RoleLevel.VENDOR_ADMIN, [RoleLevel.DEPARTMENT_MANAGER, RoleLevel.STAFF, RoleLevel.READONLY]],
    [RoleLevel.DEPARTMENT_MANAGER, [RoleLevel.STAFF, RoleLevel.READONLY]],
    [RoleLevel.STAFF, [RoleLevel.READONLY]],
    [RoleLevel.READONLY, []]
  ])

  canManageRole(managerLevel: RoleLevel, targetLevel: RoleLevel): boolean {
    const subordinates = this.hierarchy.get(managerLevel) || []
    return subordinates.includes(targetLevel)
  }

  getInheritedPermissions(roleLevel: RoleLevel): Permission[] {
    const subordinateRoles = this.hierarchy.get(roleLevel) || []
    const permissions: Permission[] = []
    
    for (const subordinateLevel of subordinateRoles) {
      permissions.push(...this.getBasePermissions(subordinateLevel))
    }
    
    return this.deduplicatePermissions(permissions)
  }
}
```

#### 2.2 Dynamic Role Composition
```typescript
class DynamicRoleComposer {
  async composeUserRole(userId: string, context: AccessContext): Promise<ComposedRole> {
    const userRoles = await this.getUserRoles(userId)
    const contextualRoles = await this.getContextualRoles(userId, context)
    const temporaryRoles = await this.getTemporaryRoles(userId)
    
    const allRoles = [...userRoles, ...contextualRoles, ...temporaryRoles]
    const effectivePermissions = this.mergePermissions(allRoles)
    
    return {
      userId,
      context,
      roles: allRoles,
      permissions: effectivePermissions,
      computedAt: new Date(),
      expiresAt: this.calculateExpiration(allRoles)
    }
  }

  private mergePermissions(roles: Role[]): Permission[] {
    const permissionMap = new Map<string, Permission>()
    
    // Sort roles by priority (higher level roles override lower level)
    const sortedRoles = roles.sort((a, b) => b.level - a.level)
    
    for (const role of sortedRoles) {
      for (const permission of role.permissions) {
        const key = `${permission.resource}:${permission.action}`
        
        if (!permissionMap.has(key) || this.isMorePermissive(permission, permissionMap.get(key)!)) {
          permissionMap.set(key, permission)
        }
      }
    }
    
    return Array.from(permissionMap.values())
  }
}
```

### 3. Granular Permission System

#### 3.1 Resource-Action Matrix
```typescript
// Define all system resources and actions
const RESOURCES = {
  // User Management
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  
  // Vendor Management
  VENDORS: 'vendors',
  VENDOR_SETTINGS: 'vendor_settings',
  VENDOR_ANALYTICS: 'vendor_analytics',
  
  // Transaction Management
  TRANSACTIONS: 'transactions',
  PAYMENTS: 'payments',
  REFUNDS: 'refunds',
  
  // Product Management
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  CATEGORIES: 'categories',
  
  // Order Management
  ORDERS: 'orders',
  ORDER_FULFILLMENT: 'order_fulfillment',
  SHIPPING: 'shipping',
  
  // Analytics and Reporting
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  DASHBOARDS: 'dashboards',
  
  // System Administration
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs',
  INTEGRATIONS: 'integrations'
} as const

const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  CONFIGURE: 'configure',
  EXECUTE: 'execute'
} as const

// Permission matrix for different role levels
const PERMISSION_MATRIX: Record<RoleLevel, Record<string, string[]>> = {
  [RoleLevel.SUPER_ADMIN]: {
    [RESOURCES.USERS]: Object.values(ACTIONS),
    [RESOURCES.VENDORS]: Object.values(ACTIONS),
    [RESOURCES.TRANSACTIONS]: Object.values(ACTIONS),
    [RESOURCES.SYSTEM_SETTINGS]: Object.values(ACTIONS),
    // ... all resources with all actions
  },
  [RoleLevel.TENANT_ADMIN]: {
    [RESOURCES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.VENDORS]: Object.values(ACTIONS),
    [RESOURCES.TRANSACTIONS]: [ACTIONS.READ, ACTIONS.EXPORT],
    // ... tenant-scoped permissions
  },
  [RoleLevel.VENDOR_ADMIN]: {
    [RESOURCES.PRODUCTS]: Object.values(ACTIONS),
    [RESOURCES.ORDERS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.EXPORT],
    [RESOURCES.ANALYTICS]: [ACTIONS.READ, ACTIONS.EXPORT],
    // ... vendor-scoped permissions
  },
  // ... other role levels
}
```

#### 3.2 Conditional Permissions
```typescript
interface ConditionalPermission extends Permission {
  conditions: AccessCondition[]
  evaluator: PermissionEvaluator
}

interface AccessCondition {
  type: 'time' | 'location' | 'resource_state' | 'user_attribute' | 'business_rule'
  field: string
  operator: ComparisonOperator
  value: any
  metadata?: Record<string, any>
}

class PermissionEvaluator {
  async evaluateConditions(
    conditions: AccessCondition[],
    context: AccessContext
  ): Promise<boolean> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, context)
      if (!result) return false
    }
    return true
  }

  private async evaluateCondition(
    condition: AccessCondition,
    context: AccessContext
  ): Promise<boolean> {
    switch (condition.type) {
      case 'time':
        return this.evaluateTimeCondition(condition, context)
      case 'location':
        return this.evaluateLocationCondition(condition, context)
      case 'resource_state':
        return await this.evaluateResourceStateCondition(condition, context)
      case 'user_attribute':
        return this.evaluateUserAttributeCondition(condition, context)
      case 'business_rule':
        return await this.evaluateBusinessRuleCondition(condition, context)
      default:
        return false
    }
  }

  private evaluateTimeCondition(condition: AccessCondition, context: AccessContext): boolean {
    const currentTime = new Date()
    const userTimezone = context.user.timezone || 'UTC'
    
    switch (condition.field) {
      case 'business_hours':
        return this.isWithinBusinessHours(currentTime, userTimezone, condition.value)
      case 'date_range':
        return this.isWithinDateRange(currentTime, condition.value.start, condition.value.end)
      case 'day_of_week':
        return condition.value.includes(currentTime.getDay())
      default:
        return false
    }
  }
}
```

### 4. Context-Aware Access Control

#### 4.1 Access Context Definition
```typescript
interface AccessContext {
  user: User
  tenant: Tenant
  vendor?: Vendor
  session: Session
  request: {
    ip: string
    userAgent: string
    location?: GeoLocation
    timestamp: Date
  }
  resource: {
    type: string
    id?: string
    attributes?: Record<string, any>
  }
  environment: {
    type: 'production' | 'staging' | 'development'
    region: string
    version: string
  }
}

class ContextAwareAccessControl {
  async checkAccess(
    userId: string,
    resource: string,
    action: string,
    context: AccessContext
  ): Promise<AccessResult> {
    // 1. Get user's effective role
    const userRole = await this.roleService.getEffectiveRole(userId, context)
    
    // 2. Check basic permission
    const hasBasicPermission = await this.hasPermission(userRole, resource, action)
    if (!hasBasicPermission) {
      return { allowed: false, reason: 'insufficient_permissions' }
    }
    
    // 3. Evaluate conditional permissions
    const permission = await this.getPermission(userRole, resource, action)
    const conditionsResult = await this.evaluateConditions(permission, context)
    if (!conditionsResult.allowed) {
      return { allowed: false, reason: 'conditions_not_met', details: conditionsResult.details }
    }
    
    // 4. Check rate limits
    const rateLimitResult = await this.checkRateLimit(userId, resource, action, context)
    if (!rateLimitResult.allowed) {
      return { allowed: false, reason: 'rate_limit_exceeded', retryAfter: rateLimitResult.retryAfter }
    }
    
    // 5. Log access attempt
    await this.auditService.logAccess(userId, resource, action, context, true)
    
    return { allowed: true, permissions: permission.scope }
  }
}
```

#### 4.2 Dynamic Permission Adjustment
```typescript
class DynamicPermissionAdjuster {
  async adjustPermissions(
    basePermissions: Permission[],
    context: AccessContext
  ): Promise<Permission[]> {
    const adjustedPermissions: Permission[] = []
    
    for (const permission of basePermissions) {
      const adjusted = await this.adjustPermission(permission, context)
      if (adjusted) {
        adjustedPermissions.push(adjusted)
      }
    }
    
    return adjustedPermissions
  }

  private async adjustPermission(
    permission: Permission,
    context: AccessContext
  ): Promise<Permission | null> {
    // Adjust based on tenant settings
    if (context.tenant.settings.restrictedMode) {
      permission = this.applyRestrictedModeAdjustments(permission)
    }
    
    // Adjust based on vendor type
    if (context.vendor) {
      permission = this.applyVendorTypeAdjustments(permission, context.vendor.type)
    }
    
    // Adjust based on time of day
    permission = this.applyTimeBasedAdjustments(permission, context.request.timestamp)
    
    // Adjust based on user's security level
    permission = this.applySecurityLevelAdjustments(permission, context.user.securityLevel)
    
    return permission
  }
}
```

### 5. Advanced RBAC Features

#### 5.1 Delegation and Proxy Access
```typescript
interface AccessDelegation {
  id: string
  delegatorId: string
  delegateeId: string
  permissions: Permission[]
  constraints: DelegationConstraints
  startDate: Date
  endDate: Date
  isActive: boolean
  auditTrail: DelegationAudit[]
}

interface DelegationConstraints {
  maxUsage?: number
  timeWindows?: TimeWindow[]
  approvalRequired?: boolean
  notificationRequired?: boolean
  revocable?: boolean
}

class DelegationManager {
  async createDelegation(
    delegatorId: string,
    delegateeId: string,
    permissions: Permission[],
    constraints: DelegationConstraints
  ): Promise<AccessDelegation> {
    // Validate delegator has permissions to delegate
    await this.validateDelegationAuthority(delegatorId, permissions)
    
    // Create delegation record
    const delegation = await this.delegationRepository.create({
      delegatorId,
      delegateeId,
      permissions,
      constraints,
      startDate: new Date(),
      endDate: constraints.endDate || this.getDefaultEndDate(),
      isActive: true
    })
    
    // Send notifications
    await this.notificationService.notifyDelegation(delegation)
    
    // Audit log
    await this.auditService.logDelegationCreated(delegation)
    
    return delegation
  }

  async executeDelegatedAction(
    delegateeId: string,
    delegationId: string,
    action: string,
    context: AccessContext
  ): Promise<ActionResult> {
    const delegation = await this.getDelegation(delegationId)
    
    // Validate delegation is active and within constraints
    await this.validateDelegationUsage(delegation, context)
    
    // Execute action on behalf of delegator
    const result = await this.actionExecutor.execute(action, {
      ...context,
      actingUserId: delegateeId,
      onBehalfOfUserId: delegation.delegatorId,
      delegationId
    })
    
    // Update usage tracking
    await this.updateDelegationUsage(delegationId)
    
    return result
  }
}
```

#### 5.2 Temporary Role Elevation
```typescript
interface RoleElevation {
  id: string
  userId: string
  fromRole: string
  toRole: string
  reason: string
  requestedBy: string
  approvedBy?: string
  startTime: Date
  endTime: Date
  status: 'pending' | 'approved' | 'active' | 'expired' | 'revoked'
  conditions: ElevationCondition[]
}

class RoleElevationManager {
  async requestElevation(
    userId: string,
    targetRole: string,
    reason: string,
    duration: number,
    requestedBy: string
  ): Promise<RoleElevation> {
    // Validate elevation request
    await this.validateElevationRequest(userId, targetRole, requestedBy)
    
    const elevation = await this.elevationRepository.create({
      userId,
      fromRole: await this.getCurrentRole(userId),
      toRole: targetRole,
      reason,
      requestedBy,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration),
      status: 'pending'
    })
    
    // Auto-approve if within policy limits
    if (await this.canAutoApprove(elevation)) {
      await this.approveElevation(elevation.id, 'system')
    } else {
      // Send for approval
      await this.sendForApproval(elevation)
    }
    
    return elevation
  }

  async approveElevation(elevationId: string, approvedBy: string): Promise<void> {
    const elevation = await this.getElevation(elevationId)
    
    // Update elevation status
    elevation.status = 'approved'
    elevation.approvedBy = approvedBy
    await this.elevationRepository.update(elevation)
    
    // Schedule activation
    await this.scheduleElevationActivation(elevation)
    
    // Schedule automatic revocation
    await this.scheduleElevationRevocation(elevation)
    
    // Notify user
    await this.notificationService.notifyElevationApproved(elevation)
  }
}
```

### 6. RBAC Security Features

#### 6.1 Permission Conflict Resolution
```typescript
class PermissionConflictResolver {
  resolveConflicts(permissions: Permission[]): Permission[] {
    const conflictGroups = this.groupConflictingPermissions(permissions)
    const resolvedPermissions: Permission[] = []
    
    for (const group of conflictGroups) {
      const resolved = this.resolveConflictGroup(group)
      resolvedPermissions.push(resolved)
    }
    
    return resolvedPermissions
  }

  private resolveConflictGroup(conflictingPermissions: Permission[]): Permission {
    // Apply resolution strategy based on permission metadata
    const strategy = this.determineResolutionStrategy(conflictingPermissions)
    
    switch (strategy) {
      case 'most_permissive':
        return this.selectMostPermissive(conflictingPermissions)
      case 'least_permissive':
        return this.selectLeastPermissive(conflictingPermissions)
      case 'highest_priority':
        return this.selectHighestPriority(conflictingPermissions)
      case 'most_recent':
        return this.selectMostRecent(conflictingPermissions)
      default:
        return this.selectDefault(conflictingPermissions)
    }
  }
}
```

#### 6.2 Access Pattern Analysis
```typescript
class AccessPatternAnalyzer {
  async analyzeUserAccess(userId: string, timeframe: TimeRange): Promise<AccessAnalysis> {
    const accessLogs = await this.getAccessLogs(userId, timeframe)
    
    return {
      totalAccesses: accessLogs.length,
      uniqueResources: this.getUniqueResources(accessLogs),
      peakHours: this.calculatePeakHours(accessLogs),
      suspiciousPatterns: await this.detectSuspiciousPatterns(accessLogs),
      permissionUtilization: this.calculatePermissionUtilization(accessLogs),
      recommendations: await this.generateRecommendations(accessLogs)
    }
  }

  private async detectSuspiciousPatterns(accessLogs: AccessLog[]): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = []
    
    // Detect unusual access times
    const unusualTimes = this.detectUnusualAccessTimes(accessLogs)
    if (unusualTimes.length > 0) {
      patterns.push({
        type: 'unusual_access_times',
        severity: 'medium',
        details: unusualTimes
      })
    }
    
    // Detect privilege escalation attempts
    const escalationAttempts = this.detectEscalationAttempts(accessLogs)
    if (escalationAttempts.length > 0) {
      patterns.push({
        type: 'privilege_escalation',
        severity: 'high',
        details: escalationAttempts
      })
    }
    
    // Detect data exfiltration patterns
    const exfiltrationPatterns = this.detectExfiltrationPatterns(accessLogs)
    if (exfiltrationPatterns.length > 0) {
      patterns.push({
        type: 'potential_data_exfiltration',
        severity: 'critical',
        details: exfiltrationPatterns
      })
    }
    
    return patterns
  }
}
```

### 7. RBAC Administration Interface

#### 7.1 Role Management API
```typescript
class RoleManagementController {
  @Post('/roles')
  @RequirePermission('roles', 'create')
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    // Validate role creation permissions
    await this.validateRoleCreation(createRoleDto)
    
    // Create role with audit trail
    const role = await this.roleService.createRole(createRoleDto)
    
    // Log role creation
    await this.auditService.logRoleCreated(role)
    
    return role
  }

  @Put('/roles/:id/permissions')
  @RequirePermission('roles', 'update')
  async updateRolePermissions(
    @Param('id') roleId: string,
    @Body() permissions: Permission[]
  ): Promise<Role> {
    // Validate permission updates
    await this.validatePermissionUpdates(roleId, permissions)
    
    // Update role permissions
    const updatedRole = await this.roleService.updatePermissions(roleId, permissions)
    
    // Invalidate affected user sessions
    await this.sessionService.invalidateRoleUsers(roleId)
    
    // Log permission changes
    await this.auditService.logPermissionChanges(roleId, permissions)
    
    return updatedRole
  }

  @Post('/users/:userId/roles')
  @RequirePermission('users', 'update')
  async assignRole(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto
  ): Promise<UserRole> {
    // Validate role assignment
    await this.validateRoleAssignment(userId, assignRoleDto.roleId)
    
    // Assign role
    const userRole = await this.roleService.assignRole(userId, assignRoleDto)
    
    // Notify user
    await this.notificationService.notifyRoleAssignment(userRole)
    
    // Log role assignment
    await this.auditService.logRoleAssignment(userRole)
    
    return userRole
  }
}
```

#### 7.2 Permission Testing Framework
```typescript
class PermissionTestingFramework {
  async testUserPermissions(
    userId: string,
    testScenarios: PermissionTestScenario[]
  ): Promise<PermissionTestResult[]> {
    const results: PermissionTestResult[] = []
    
    for (const scenario of testScenarios) {
      const result = await this.executeTestScenario(userId, scenario)
      results.push(result)
    }
    
    return results
  }

  private async executeTestScenario(
    userId: string,
    scenario: PermissionTestScenario
  ): Promise<PermissionTestResult> {
    try {
      const accessResult = await this.accessControl.checkAccess(
        userId,
        scenario.resource,
        scenario.action,
        scenario.context
      )
      
      return {
        scenarioId: scenario.id,
        expected: scenario.expectedResult,
        actual: accessResult.allowed,
        passed: scenario.expectedResult === accessResult.allowed,
        details: accessResult,
        executedAt: new Date()
      }
    } catch (error) {
      return {
        scenarioId: scenario.id,
        expected: scenario.expectedResult,
        actual: false,
        passed: false,
        error: error.message,
        executedAt: new Date()
      }
    }
  }
}
```

## Implementation Guidelines

### 1. Database Schema
```sql
-- Core RBAC tables
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    vendor_id UUID,
    status VARCHAR(50) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    preferences JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id UUID REFERENCES tenants(id),
    type VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    constraints JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    scope JSONB NOT NULL,
    conditions JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    tenant_id UUID REFERENCES tenants(id),
    vendor_id UUID,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    context JSONB,
    PRIMARY KEY (user_id, role_id)
);

-- Indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_vendor ON user_roles(tenant_id, vendor_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_roles_tenant_level ON roles(tenant_id, level);
```

### 2. Performance Considerations
- Implement permission caching with Redis
- Use database views for complex permission queries
- Implement lazy loading for role hierarchies
- Cache user sessions with computed permissions
- Use background jobs for permission propagation

### 3. Security Best Practices
- Implement principle of least privilege
- Regular permission audits and reviews
- Automated detection of permission anomalies
- Secure storage of sensitive permission data
- Comprehensive audit logging

### 4. Testing Strategy
- Unit tests for permission evaluation logic
- Integration tests for role assignment flows
- Security tests for privilege escalation
- Performance tests under load
- Compliance tests for regulatory requirements

## Conclusion

This advanced RBAC system provides comprehensive access control with granular permissions, dynamic role composition, context-aware access decisions, and sophisticated security features. The design ensures scalability, security, and flexibility while maintaining ease of administration and compliance with security best practices.