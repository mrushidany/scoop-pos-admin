import { QueryClient } from '@tanstack/react-query'
import { notificationKeys } from '@/hooks/api/use-notifications'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { Notification as NotificationType } from '@/stores/types'

// WebSocket connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// Real-time notification events
export interface NotificationEvent {
  type: 'notification' | 'alert' | 'system_message'
  data: NotificationType | SystemAlert | SystemMessage
  timestamp: string
}

export interface SystemAlert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  category: 'security' | 'system' | 'business' | 'maintenance'
  actionRequired: boolean
  expiresAt?: string
}

export interface SystemMessage {
  id: string
  type: 'announcement' | 'update' | 'warning'
  title: string
  message: string
  targetUsers?: string[]
  priority: 'low' | 'medium' | 'high'
}

// Real-time notification service
export class RealTimeNotificationService {
  private ws: WebSocket | null = null
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private queryClient: QueryClient
  private userId: string | null = null
  private listeners: Set<(event: NotificationEvent) => void> = new Set()
  private stateListeners: Set<(state: ConnectionState) => void> = new Set()

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  // Connect to WebSocket server
  connect(userId: string, tenantId?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    this.userId = userId
    this.setConnectionState(ConnectionState.CONNECTING)

    try {
      // In a real implementation, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      const wsUrl = this.buildWebSocketUrl(userId, tenantId)
      
      // Simulate WebSocket connection
      this.simulateWebSocketConnection()
      
    } catch (error) {
      console.error('Failed to connect to notification service:', error)
      this.setConnectionState(ConnectionState.ERROR)
      this.scheduleReconnect()
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.setConnectionState(ConnectionState.DISCONNECTED)
    this.reconnectAttempts = 0
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  // Add event listener
  addEventListener(listener: (event: NotificationEvent) => void): void {
    this.listeners.add(listener)
  }

  // Remove event listener
  removeEventListener(listener: (event: NotificationEvent) => void): void {
    this.listeners.delete(listener)
  }

  // Add connection state listener
  addStateListener(listener: (state: ConnectionState) => void): void {
    this.stateListeners.add(listener)
  }

  // Remove connection state listener
  removeStateListener(listener: (state: ConnectionState) => void): void {
    this.stateListeners.delete(listener)
  }

  // Send message to server
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message)
    }
  }

  // Private methods
  private buildWebSocketUrl(userId: string, tenantId?: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const params = new URLSearchParams({
      userId,
      ...(tenantId && { tenantId }),
    })
    
    return `${protocol}//${host}/ws/notifications?${params.toString()}`
  }

  private simulateWebSocketConnection(): void {
    // Simulate successful connection
    setTimeout(() => {
      this.setConnectionState(ConnectionState.CONNECTED)
      this.reconnectAttempts = 0
      this.startHeartbeat()
      
      // Simulate receiving notifications periodically
      this.simulateIncomingNotifications()
    }, 1000)
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.setConnectionState(ConnectionState.CONNECTED)
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleIncomingMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      this.setConnectionState(ConnectionState.DISCONNECTED)
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

      // Attempt to reconnect if not a clean close
      if (event.code !== 1000) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.setConnectionState(ConnectionState.ERROR)
    }
  }

  private handleIncomingMessage(data: any): void {
    if (data.type === 'pong') {
      // Heartbeat response
      return
    }

    const event: NotificationEvent = {
      type: data.type,
      data: data.data,
      timestamp: data.timestamp || new Date().toISOString(),
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })

    // Handle different event types
    this.processNotificationEvent(event)
  }

  private processNotificationEvent(event: NotificationEvent): void {
    switch (event.type) {
      case 'notification':
        this.handleNewNotification(event.data as NotificationType)
        break
      case 'alert':
        this.handleSystemAlert(event.data as SystemAlert)
        break
      case 'system_message':
        this.handleSystemMessage(event.data as SystemMessage)
        break
    }
  }

  private handleNewNotification(notification: NotificationType): void {
    // Update React Query cache
    if (this.userId) {
      this.queryClient.invalidateQueries({
        queryKey: notificationKeys.list(this.userId)
      })
      this.queryClient.invalidateQueries({
        queryKey: notificationKeys.count(this.userId)
      })
    }

    // Show toast notification
    toast.push(
      <Notification title={notification.title} type="info">
        {notification.message}
      </Notification>
    )
  }

  private handleSystemAlert(alert: SystemAlert): void {
    // Show system alert with appropriate severity
    const type = alert.severity === 'critical' ? 'danger' : 
                alert.severity === 'high' ? 'warning' : 'info'
    
    toast.push(
      <Notification title={alert.title} type={type}>
        {alert.message}
      </Notification>
    )
  }

  private handleSystemMessage(message: SystemMessage): void {
    // Show system message
    const type = message.priority === 'high' ? 'warning' : 'info'
    
    toast.push(
      <Notification title={message.title} type={type}>
        {message.message}
      </Notification>
    )
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state
    this.stateListeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('Error in state listener:', error)
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.setConnectionState(ConnectionState.RECONNECTING)
    this.reconnectAttempts++

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId)
      }
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: new Date().toISOString() })
    }, 30000) // Send ping every 30 seconds
  }

  private simulateIncomingNotifications(): void {
    // Simulate receiving notifications for demo purposes
    const notifications = [
      {
        type: 'notification',
        data: {
          id: `notif-${Date.now()}`,
          userId: this.userId,
          title: 'New Order Received',
          message: 'You have received a new order #12345',
          type: 'order',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      {
        type: 'alert',
        data: {
          id: `alert-${Date.now()}`,
          severity: 'medium',
          title: 'Low Stock Alert',
          message: 'Product inventory is running low',
          category: 'business',
          actionRequired: true,
        },
        timestamp: new Date().toISOString(),
      },
    ]

    // Simulate random notifications
    setInterval(() => {
      if (this.connectionState === ConnectionState.CONNECTED && Math.random() > 0.8) {
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        this.handleIncomingMessage(randomNotification)
      }
    }, 60000) // Check every minute
  }
}

// Global notification service instance
let notificationService: RealTimeNotificationService | null = null

export const getNotificationService = (queryClient: QueryClient): RealTimeNotificationService => {
  if (!notificationService) {
    notificationService = new RealTimeNotificationService(queryClient)
  }
  return notificationService
}

export default RealTimeNotificationService