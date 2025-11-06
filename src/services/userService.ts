import { BaseApiService, ApiResponse, PaginationParams, FilterParams } from './api'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  role: UserRole
  permissions: Permission[]
  department?: string
  jobTitle?: string
  employeeId?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  preferences: {
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'auto'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    passwordExpiresAt?: string
    loginAttempts: number
    lockedUntil?: string
    lastLoginAt?: string
    lastLoginIp?: string
  }
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy: string
    lastModifiedBy: string
    emailVerifiedAt?: string
    phoneVerifiedAt?: string
  }
}

export interface UserRole {
  id: string
  name: string
  displayName: string
  description?: string
  level: number
  permissions: Permission[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  displayName: string
  description?: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute'
  conditions?: Record<string, string | number | boolean | undefined | null>
  createdAt: string
}

export interface CreateUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  phone?: string
  roleId: string
  department?: string
  jobTitle?: string
  employeeId?: string
  dateOfBirth?: string
  address?: User['address']
  emergencyContact?: User['emergencyContact']
  preferences?: Partial<User['preferences']>
  sendWelcomeEmail?: boolean
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  roleId?: string
  status?: User['status']
  department?: string
  jobTitle?: string
  employeeId?: string
  dateOfBirth?: string
  address?: Partial<User['address']>
  emergencyContact?: Partial<User['emergencyContact']>
  preferences?: Partial<User['preferences']>
}

export interface CreateRoleRequest {
  name: string
  displayName: string
  description?: string
  level: number
  permissionIds: string[]
}

export interface UpdateRoleRequest {
  name?: string
  displayName?: string
  description?: string
  level?: number
  permissionIds?: string[]
}

export interface UserFilters extends FilterParams {
  status?: string
  roleId?: string
  department?: string
  jobTitle?: string
  createdFrom?: string
  createdTo?: string
  lastLoginFrom?: string
  lastLoginTo?: string
  hasPermission?: string
  isLocked?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
}

export interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
  pendingUsers: number
  newUsersThisMonth: number
  statusBreakdown: Array<{
    status: string
    count: number
    percentage: number
  }>
  roleBreakdown: Array<{
    roleId: string
    roleName: string
    count: number
    percentage: number
  }>
  departmentBreakdown: Array<{
    department: string
    count: number
    percentage: number
  }>
  loginActivity: {
    dailyLogins: Array<{
      date: string
      count: number
    }>
    activeUsersLast30Days: number
    averageSessionDuration: number
    topActiveUsers: Array<{
      userId: string
      username: string
      loginCount: number
      lastLogin: string
    }>
  }
  securityMetrics: {
    usersWithTwoFactor: number
    twoFactorAdoptionRate: number
    lockedAccounts: number
    passwordExpiringSoon: number
    recentFailedLogins: number
  }
}

class UserService extends BaseApiService {
  private endpoint = '/users'
  private rolesEndpoint = '/roles'
  private permissionsEndpoint = '/permissions'

  // User CRUD operations
  async getUsers(
    params?: PaginationParams & UserFilters
  ): Promise<ApiResponse<User[]>> {
    return this.getAll<User>(this.endpoint, params)
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.getById<User>(this.endpoint, id)
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(
    id: string,
    updates: UpdateUserRequest
  ): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.endpoint, id)
  }

  // User status management
  async activateUser(id: string): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}/activate`, {
      method: 'POST'
    })
  }

  async deactivateUser(id: string, reason?: string): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  async suspendUser(id: string, reason: string, duration?: number): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration })
    })
  }

  async unsuspendUser(id: string): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}/unsuspend`, {
      method: 'POST'
    })
  }

  // Password management
  async changePassword(
    id: string,
    passwordData: {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(passwordData)
    })
  }

  async resetPassword(
    id: string,
    newPassword: string,
    forceChange: boolean = true
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword, forceChange })
    })
  }

  async sendPasswordResetEmail(email: string): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/password-reset-email`, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // Two-factor authentication
  async enableTwoFactor(id: string): Promise<ApiResponse<{
    qrCode: string
    backupCodes: string[]
    secret: string
  }>> {
    return this.request(`${this.endpoint}/${id}/2fa/enable`, {
      method: 'POST'
    })
  }

  async disableTwoFactor(id: string, code: string): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${id}/2fa/disable`, {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  async verifyTwoFactor(
    id: string,
    code: string
  ): Promise<ApiResponse<{ verified: boolean }>> {
    return this.request(`${this.endpoint}/${id}/2fa/verify`, {
      method: 'POST',
      body: JSON.stringify({ code })
    })
  }

  // User permissions
  async getUserPermissions(id: string): Promise<ApiResponse<Permission[]>> {
    return this.request(`${this.endpoint}/${id}/permissions`)
  }

  async assignPermissions(
    id: string,
    permissionIds: string[]
  ): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissionIds })
    })
  }

  async revokePermissions(
    id: string,
    permissionIds: string[]
  ): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${id}/permissions`, {
      method: 'DELETE',
      body: JSON.stringify({ permissionIds })
    })
  }

  // Role management
  async getRoles(
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<UserRole[]>> {
    return this.getAll<UserRole>(this.rolesEndpoint, params)
  }

  async getRole(id: string): Promise<ApiResponse<UserRole>> {
    return this.getById<UserRole>(this.rolesEndpoint, id)
  }

  async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<UserRole>> {
    return this.request(`${this.rolesEndpoint}`, {
      method: 'POST',
      body: JSON.stringify(roleData)
    })
  }

  async updateRole(
    id: string,
    updates: UpdateRoleRequest
  ): Promise<ApiResponse<UserRole>> {
    return this.request(`${this.rolesEndpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteRole(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.rolesEndpoint, id)
  }

  async assignRole(userId: string, roleId: string): Promise<ApiResponse<User>> {
    return this.request(`${this.endpoint}/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ roleId })
    })
  }

  // Permission management
  async getPermissions(
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Permission[]>> {
    return this.getAll<Permission>(this.permissionsEndpoint, params)
  }

  async getPermission(id: string): Promise<ApiResponse<Permission>> {
    return this.getById<Permission>(this.permissionsEndpoint, id)
  }

  async getPermissionsByResource(
    resource: string
  ): Promise<ApiResponse<Permission[]>> {
    return this.request(`${this.permissionsEndpoint}/resource/${resource}`)
  }

  // Search and filtering
  async searchUsers(
    query: string,
    filters?: UserFilters
  ): Promise<ApiResponse<User[]>> {
    const params = { search: query, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/search${queryString}`)
  }

  async getUsersByRole(
    roleId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<User[]>> {
    return this.getAll<User>(`${this.endpoint}/role/${roleId}`, params)
  }

  async getUsersByDepartment(
    department: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<User[]>> {
    return this.getAll<User>(`${this.endpoint}/department/${department}`, params)
  }

  async getUsersByPermission(
    permissionId: string,
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<User[]>> {
    return this.getAll<User>(`${this.endpoint}/permission/${permissionId}`, params)
  }

  // User activity and sessions
  async getUserSessions(
    id: string
  ): Promise<ApiResponse<Array<{
    id: string
    deviceInfo: string
    ipAddress: string
    location?: string
    loginAt: string
    lastActivity: string
    isActive: boolean
  }>>> {
    return this.request(`${this.endpoint}/${id}/sessions`)
  }

  async terminateSession(
    userId: string,
    sessionId: string
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${userId}/sessions/${sessionId}`, {
      method: 'DELETE'
    })
  }

  async terminateAllSessions(userId: string): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${userId}/sessions`, {
      method: 'DELETE'
    })
  }

  async getUserActivity(
    id: string,
    params?: PaginationParams & FilterParams & {
      dateFrom?: string
      dateTo?: string
      action?: string
    }
  ): Promise<ApiResponse<Array<{
    id: string
    action: string
    resource: string
    details: Record<string, string | number | boolean | undefined | null>
    ipAddress: string
    userAgent: string
    timestamp: string
  }>>> {
    return this.getAll(`${this.endpoint}/${id}/activity`, params)
  }

  // Analytics and reporting
  async getAnalytics(
    dateRange?: { start: string; end: string },
    filters?: UserFilters
  ): Promise<ApiResponse<UserAnalytics>> {
    const params = { ...dateRange, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/analytics${queryString}`)
  }

  async getLoginReport(
    dateRange: { start: string; end: string },
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<Array<{
    period: string
    totalLogins: number
    uniqueUsers: number
    failedAttempts: number
  }>>> {
    const queryString = this.buildQueryString({ ...dateRange, groupBy })
    return this.request(`${this.endpoint}/reports/logins${queryString}`)
  }

  async getSecurityReport(): Promise<ApiResponse<{
    lockedAccounts: Array<{
      user: User
      lockedAt: string
      reason: string
    }>
    passwordExpiring: Array<{
      user: User
      expiresAt: string
      daysRemaining: number
    }>
    recentFailedLogins: Array<{
      userId: string
      username: string
      attempts: number
      lastAttempt: string
      ipAddress: string
    }>
    twoFactorStats: {
      enabled: number
      disabled: number
      adoptionRate: number
    }
  }>> {
    return this.request(`${this.endpoint}/reports/security`)
  }

  // Bulk operations
  async bulkUpdateUsers(
    userIds: string[],
    updates: {
      status?: User['status']
      roleId?: string
      department?: string
    }
  ): Promise<ApiResponse<User[]>> {
    return this.request(`${this.endpoint}/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ userIds, updates })
    })
  }

  async bulkDeleteUsers(userIds: string[]): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ userIds })
    })
  }

  async importUsers(
    file: File,
    options?: {
      skipDuplicates?: boolean
      sendWelcomeEmails?: boolean
      defaultRoleId?: string
    }
  ): Promise<ApiResponse<{
    imported: number
    skipped: number
    errors: Array<{
      row: number
      error: string
    }>
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }

    return this.request(`${this.endpoint}/import`, {
      method: 'POST',
      body: formData
    })
  }

  // Export functionality
  async exportUsers(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    filters?: UserFilters
  ): Promise<Blob> {
    const queryString = this.buildQueryString({ format, ...filters })
    const response = await fetch(`${this.baseUrl}${this.endpoint}/export${queryString}`)
    return response.blob()
  }

  // Profile management
  async updateProfile(
    id: string,
    profileData: {
      firstName?: string
      lastName?: string
      phone?: string
      avatar?: File
      preferences?: Partial<User['preferences']>
    }
  ): Promise<ApiResponse<User>> {
    const formData = new FormData()
    
    Object.entries(profileData).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        formData.append('avatar', value)
      } else if (key === 'preferences' && value) {
        formData.append('preferences', JSON.stringify(value))
      } else if (value !== undefined) {
        formData.append(key, String(value))
      }
    })

    return this.request(`${this.endpoint}/${id}/profile`, {
      method: 'PATCH',
      body: formData
    })
  }

  async uploadAvatar(id: string, file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)

    return this.request(`${this.endpoint}/${id}/avatar`, {
      method: 'POST',
      body: formData
    })
  }

  async removeAvatar(id: string): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${id}/avatar`, {
      method: 'DELETE'
    })
  }
}

// Create and export singleton instance
export const userService = new UserService()