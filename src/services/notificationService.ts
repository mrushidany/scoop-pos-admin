import { BaseApiService, ApiResponse, PaginationParams, FilterParams } from './api'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  category: 'order' | 'inventory' | 'payment' | 'user' | 'vendor' | 'system' | 'security' | 'promotion'
  title: string
  message: string
  data?: Record<string, string | number | boolean | undefined | null>
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'unread' | 'read' | 'archived' | 'dismissed'
  userId: string
  senderId?: string
  senderName?: string
  channels: NotificationChannel[]
  scheduledFor?: string
  expiresAt?: string
  actionUrl?: string
  actionLabel?: string
  imageUrl?: string
  tags: string[]
  metadata: {
    createdAt: string
    updatedAt: string
    readAt?: string
    deliveredAt?: string
    clickedAt?: string
    source: 'system' | 'user' | 'api' | 'webhook'
    deviceInfo?: {
      platform: string
      browser?: string
      version?: string
    }
  }
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in_app' | 'webhook'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sentAt?: string
  deliveredAt?: string
  failureReason?: string
  retryCount: number
  maxRetries: number
}

export interface NotificationTemplate {
  id: string
  name: string
  description?: string
  type: Notification['type']
  category: Notification['category']
  title: string
  message: string
  channels: NotificationChannel['type'][]
  priority: Notification['priority']
  variables: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'date'
    required: boolean
    defaultValue?: string | number | boolean
    description?: string
  }>
  conditions?: Array<{
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: string | number | boolean
  }>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  userId: string
  channels: {
    push: {
      enabled: boolean
      categories: Record<string, boolean>
      quietHours?: {
        enabled: boolean
        start: string // HH:mm format
        end: string // HH:mm format
        timezone: string
      }
    }
    email: {
      enabled: boolean
      categories: Record<string, boolean>
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
      digest: boolean
    }
    sms: {
      enabled: boolean
      categories: Record<string, boolean>
      urgentOnly: boolean
    }
    inApp: {
      enabled: boolean
      categories: Record<string, boolean>
      showDesktop: boolean
      playSound: boolean
    }
  }
  globalSettings: {
    doNotDisturb: boolean
    doNotDisturbStart?: string
    doNotDisturbEnd?: string
    timezone: string
    language: string
  }
  updatedAt: string
}

export interface CreateNotificationRequest {
  type: Notification['type']
  category: Notification['category']
  title: string
  message: string
  userIds?: string[]
  roleIds?: string[]
  departmentIds?: string[]
  data?: Notification['data']
  priority?: Notification['priority']
  channels?: NotificationChannel['type'][]
  scheduledFor?: string
  expiresAt?: string
  actionUrl?: string
  actionLabel?: string
  imageUrl?: string
  tags?: string[]
  templateId?: string
  templateVariables?: Record<string, string | number | boolean | undefined | null>
}

export interface NotificationFilters extends FilterParams {
  type?: string
  category?: string
  status?: string
  priority?: string
  userId?: string
  senderId?: string
  dateFrom?: string
  dateTo?: string
  tags?: string
  hasAction?: boolean
  isExpired?: boolean
}

export interface NotificationAnalytics {
  totalNotifications: number
  unreadNotifications: number
  deliveryRate: number
  clickThroughRate: number
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
  channelPerformance: Array<{
    channel: string
    sent: number
    delivered: number
    clicked: number
    deliveryRate: number
    clickRate: number
  }>
  dailyTrends: Array<{
    date: string
    sent: number
    delivered: number
    clicked: number
    unsubscribed: number
  }>
  topPerformingNotifications: Array<{
    id: string
    title: string
    category: string
    sent: number
    clickRate: number
    createdAt: string
  }>
  userEngagement: {
    activeUsers: number
    averageNotificationsPerUser: number
    mostEngagedUsers: Array<{
      userId: string
      username: string
      notificationsReceived: number
      clickRate: number
    }>
  }
}

class NotificationService extends BaseApiService {
  private endpoint = '/notifications'
  private templatesEndpoint = '/notification-templates'
  private preferencesEndpoint = '/notification-preferences'

  // Notification CRUD operations
  async getNotifications(
    params?: PaginationParams & NotificationFilters
  ): Promise<ApiResponse<Notification[]>> {
    return this.getAll<Notification>(this.endpoint, params)
  }

  async getNotification(id: string): Promise<ApiResponse<Notification>> {
    return this.getById<Notification>(this.endpoint, id)
  }

  async createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}`, {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }

  async updateNotification(
    id: string,
    updates: Partial<Notification>
  ): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.endpoint, id)
  }

  // Notification status management
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}/${id}/read`, {
      method: 'POST'
    })
  }

  async markAsUnread(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}/${id}/unread`, {
      method: 'POST'
    })
  }

  async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/mark-all-read`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
  }

  async archiveNotification(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}/${id}/archive`, {
      method: 'POST'
    })
  }

  async dismissNotification(id: string): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}/${id}/dismiss`, {
      method: 'POST'
    })
  }

  // Bulk operations
  async bulkMarkAsRead(notificationIds: string[]): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/bulk-read`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds })
    })
  }

  async bulkArchive(notificationIds: string[]): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/bulk-archive`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds })
    })
  }

  async bulkDelete(notificationIds: string[]): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds })
    })
  }

  // User-specific notifications
  async getUserNotifications(
    userId: string,
    params?: PaginationParams & NotificationFilters
  ): Promise<ApiResponse<Notification[]>> {
    return this.getAll<Notification>(`${this.endpoint}/user/${userId}`, params)
  }

  async getUnreadCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    return this.request(`${this.endpoint}/user/${userId}/unread-count`)
  }

  async getRecentNotifications(
    userId: string,
    limit: number = 10
  ): Promise<ApiResponse<Notification[]>> {
    return this.request(`${this.endpoint}/user/${userId}/recent?limit=${limit}`)
  }

  // Real-time notifications
  async subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): Promise<() => void> {
    // WebSocket or Server-Sent Events implementation
    const eventSource = new EventSource(`${this.baseUrl}${this.endpoint}/stream/${userId}`)
    
    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification
        callback(notification)
      } catch (error) {
        console.error('Failed to parse notification:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Notification stream error:', error)
    }

    return () => {
      eventSource.close()
    }
  }

  async sendPushNotification(
    userId: string,
    notification: {
      title: string
      body: string
      icon?: string
      badge?: string
      data?: Record<string, string | number | boolean | undefined | null>
      actions?: Array<{
        action: string
        title: string
        icon?: string
      }>
    }
  ): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/push`, {
      method: 'POST',
      body: JSON.stringify({ userId, notification })
    })
  }

  // Template management
  async getTemplates(
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<NotificationTemplate[]>> {
    return this.getAll<NotificationTemplate>(this.templatesEndpoint, params)
  }

  async getTemplate(id: string): Promise<ApiResponse<NotificationTemplate>> {
    return this.getById<NotificationTemplate>(this.templatesEndpoint, id)
  }

  async createTemplate(
    templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<NotificationTemplate>> {
    return this.request(`${this.templatesEndpoint}`, {
      method: 'POST',
      body: JSON.stringify(templateData)
    })
  }

  async updateTemplate(
    id: string,
    updates: Partial<NotificationTemplate>
  ): Promise<ApiResponse<NotificationTemplate>> {
    return this.request(`${this.templatesEndpoint}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.templatesEndpoint, id)
  }

  async sendFromTemplate(
    templateId: string,
    recipients: {
      userIds?: string[]
      roleIds?: string[]
      departmentIds?: string[]
    },
    variables?: Record<string, string | number | boolean | undefined | null>,
    options?: {
      scheduledFor?: string
      priority?: Notification['priority']
      channels?: NotificationChannel['type'][]
    }
  ): Promise<ApiResponse<Notification[]>> {
    return this.request(`${this.templatesEndpoint}/${templateId}/send`, {
      method: 'POST',
      body: JSON.stringify({ recipients, variables, options })
    })
  }

  // Preferences management
  async getPreferences(userId: string): Promise<ApiResponse<NotificationPreferences>> {
    return this.request(`${this.preferencesEndpoint}/${userId}`)
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    return this.request(`${this.preferencesEndpoint}/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    })
  }

  async resetPreferences(userId: string): Promise<ApiResponse<NotificationPreferences>> {
    return this.request(`${this.preferencesEndpoint}/${userId}/reset`, {
      method: 'POST'
    })
  }

  // Analytics and reporting
  async getAnalytics(
    dateRange?: { start: string; end: string },
    filters?: NotificationFilters
  ): Promise<ApiResponse<NotificationAnalytics>> {
    const params = { ...dateRange, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/analytics${queryString}`)
  }

  async getDeliveryReport(
    dateRange: { start: string; end: string },
    groupBy: 'hour' | 'day' | 'week' = 'day'
  ): Promise<ApiResponse<Array<{
    period: string
    sent: number
    delivered: number
    failed: number
    deliveryRate: number
  }>>> {
    const queryString = this.buildQueryString({ ...dateRange, groupBy })
    return this.request(`${this.endpoint}/reports/delivery${queryString}`)
  }

  async getEngagementReport(
    dateRange: { start: string; end: string }
  ): Promise<ApiResponse<{
    totalNotifications: number
    totalClicks: number
    clickThroughRate: number
    topCategories: Array<{
      category: string
      clicks: number
      clickRate: number
    }>
    userEngagement: Array<{
      userId: string
      username: string
      notificationsReceived: number
      notificationsClicked: number
      engagementRate: number
    }>
  }>> {
    const queryString = this.buildQueryString(dateRange)
    return this.request(`${this.endpoint}/reports/engagement${queryString}`)
  }

  // Search and filtering
  async searchNotifications(
    query: string,
    filters?: NotificationFilters
  ): Promise<ApiResponse<Notification[]>> {
    const params = { search: query, ...filters }
    const queryString = this.buildQueryString(params)
    return this.request(`${this.endpoint}/search${queryString}`)
  }

  async getNotificationsByCategory(
    category: Notification['category'],
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Notification[]>> {
    return this.getAll<Notification>(`${this.endpoint}/category/${category}`, params)
  }

  async getNotificationsByType(
    type: Notification['type'],
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Notification[]>> {
    return this.getAll<Notification>(`${this.endpoint}/type/${type}`, params)
  }

  // Scheduled notifications
  async getScheduledNotifications(
    params?: PaginationParams & FilterParams
  ): Promise<ApiResponse<Notification[]>> {
    return this.getAll<Notification>(`${this.endpoint}/scheduled`, params)
  }

  async cancelScheduledNotification(id: string): Promise<ApiResponse<void>> {
    return this.request(`${this.endpoint}/${id}/cancel`, {
      method: 'POST'
    })
  }

  async rescheduleNotification(
    id: string,
    newScheduleTime: string
  ): Promise<ApiResponse<Notification>> {
    return this.request(`${this.endpoint}/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledFor: newScheduleTime })
    })
  }

  // Export functionality
  async exportNotifications(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    filters?: NotificationFilters & { dateFrom?: string; dateTo?: string }
  ): Promise<Blob> {
    const queryString = this.buildQueryString({ format, ...filters })
    const response = await fetch(`${this.baseUrl}${this.endpoint}/export${queryString}`)
    return response.blob()
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService()