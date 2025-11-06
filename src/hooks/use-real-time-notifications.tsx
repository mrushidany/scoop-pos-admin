import { useEffect, useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { 
  getNotificationService, 
  ConnectionState, 
  NotificationEvent,
  SystemAlert
} from '@/services/notification-service'

// Hook return type
export interface UseRealTimeNotificationsReturn {
  connectionState: ConnectionState
  isConnected: boolean
  isConnecting: boolean
  isDisconnected: boolean
  hasError: boolean
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  addEventListener: (listener: (event: NotificationEvent) => void) => void
  removeEventListener: (listener: (event: NotificationEvent) => void) => void
  recentNotifications: NotificationEvent[]
  unreadCount: number
  systemAlerts: SystemAlert[]
  clearRecentNotifications: () => void
  markAlertAsRead: (alertId: string) => void
}

// Configuration options
export interface NotificationHookOptions {
  autoConnect?: boolean
  maxRecentNotifications?: number
  enableSystemAlerts?: boolean
  enableToastNotifications?: boolean
}

const DEFAULT_OPTIONS: Required<NotificationHookOptions> = {
  autoConnect: true,
  maxRecentNotifications: 50,
  enableSystemAlerts: true,
  enableToastNotifications: true,
}

/**
 * Hook for managing real-time notifications
 * Provides connection management, event handling, and notification state
 */
export const useRealTimeNotifications = (
  options: NotificationHookOptions = {}
): UseRealTimeNotificationsReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const user = session?.user
  
  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [recentNotifications, setRecentNotifications] = useState<NotificationEvent[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Refs
  const serviceRef = useRef(getNotificationService(queryClient))
  const listenersRef = useRef<Set<(event: NotificationEvent) => void>>(new Set())
  
  // Event handler for incoming notifications
  const handleNotificationEvent = useCallback((event: NotificationEvent) => {
    // Add to recent notifications
    setRecentNotifications(prev => {
      const updated = [event, ...prev].slice(0, config.maxRecentNotifications)
      return updated
    })
    
    // Handle system alerts
    if (event.type === 'alert' && config.enableSystemAlerts) {
      const alert = event.data as SystemAlert
      setSystemAlerts(prev => {
        const existing = prev.find(a => a.id === alert.id)
        if (existing) return prev
        return [alert, ...prev]
      })
    }
    
    // Update unread count for notifications
    if (event.type === 'notification') {
      setUnreadCount(prev => prev + 1)
    }
    
    // Notify external listeners
    listenersRef.current.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in notification event listener:', error)
      }
    })
  }, [config.maxRecentNotifications, config.enableSystemAlerts])
  
  // Connection state handler
  const handleConnectionStateChange = useCallback((state: ConnectionState) => {
    setConnectionState(state)
  }, [])
  
  // Connection management
  const connect = useCallback(() => {
    if (user?.id) {
      serviceRef.current.connect(user.id)
    }
  }, [user?.id])
  
  const disconnect = useCallback(() => {
    serviceRef.current.disconnect()
  }, [])
  
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 1000)
  }, [connect, disconnect])
  
  // Event listener management
  const addEventListener = useCallback((listener: (event: NotificationEvent) => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])
  
  const removeEventListener = useCallback((listener: (event: NotificationEvent) => void) => {
    listenersRef.current.delete(listener)
  }, [])
  
  // Utility functions
  const clearRecentNotifications = useCallback(() => {
    setRecentNotifications([])
    setUnreadCount(0)
  }, [])
  
  const markAlertAsRead = useCallback((alertId: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])
  
  // Setup effect
  useEffect(() => {
    const service = serviceRef.current
    
    // Add event listeners
    service.addEventListener(handleNotificationEvent)
    service.addStateListener(handleConnectionStateChange)
    
    // Auto-connect if enabled and user is available
    if (config.autoConnect && user?.id) {
      connect()
    }
    
    // Cleanup
    return () => {
      service.removeEventListener(handleNotificationEvent)
      service.removeStateListener(handleConnectionStateChange)
      if (config.autoConnect) {
        disconnect()
      }
    }
  }, [user?.id, config.autoConnect, connect, disconnect, handleNotificationEvent, handleConnectionStateChange])
  
  // Computed states
  const isConnected = connectionState === ConnectionState.CONNECTED
  const isConnecting = connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING
  const isDisconnected = connectionState === ConnectionState.DISCONNECTED
  const hasError = connectionState === ConnectionState.ERROR
  
  return {
    connectionState,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    connect,
    disconnect,
    reconnect,
    addEventListener,
    removeEventListener,
    recentNotifications,
    unreadCount,
    systemAlerts,
    clearRecentNotifications,
    markAlertAsRead,
  }
}

/**
 * Hook for listening to specific notification types
 */
export const useNotificationListener = (
  eventType: 'notification' | 'alert' | 'system_message',
  callback: (event: NotificationEvent) => void,
  dependencies: unknown[] = []
) => {
  const { addEventListener, removeEventListener } = useRealTimeNotifications({ autoConnect: false })
  
  useEffect(() => {
    const listener = (event: NotificationEvent) => {
      if (event.type === eventType) {
        callback(event)
      }
    }
    
    addEventListener(listener)
    
    return () => {
      removeEventListener(listener)
    }
  }, [eventType, addEventListener, removeEventListener, ...dependencies])
}

/**
 * Hook for system alerts only
 */
export const useSystemAlerts = () => {
  const { systemAlerts, markAlertAsRead, isConnected } = useRealTimeNotifications({
    enableSystemAlerts: true,
    enableToastNotifications: false,
  })
  
  const criticalAlerts = systemAlerts.filter(alert => alert.severity === 'critical')
  const highPriorityAlerts = systemAlerts.filter(alert => alert.severity === 'high')
  const actionRequiredAlerts = systemAlerts.filter(alert => alert.actionRequired)
  
  return {
    systemAlerts,
    criticalAlerts,
    highPriorityAlerts,
    actionRequiredAlerts,
    markAlertAsRead,
    isConnected,
    hasAlerts: systemAlerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
  }
}

export default useRealTimeNotifications