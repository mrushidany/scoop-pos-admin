'use client'

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react'
// import NotificationToast from '../ui/NotificationToast'
import { useNotificationStore } from '../../stores/notification-store'
import type { Notification } from '../../stores/types'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  showNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  archiveNotification: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  isLoading: boolean
  error: string | null
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
  userId?: string
  enableRealTime?: boolean
  enableToasts?: boolean
  toastPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
  enableSound?: boolean
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId = 'current-user',
  // enableRealTime = true,
  enableToasts = true,
  // toastPosition = 'top-right',
  maxToasts = 5,
  enableSound = true
}) => {
  const {
    notifications,
    unreadCount: storeUnreadCount,
    loading: isLoading,
    error: storeError,
    addNotification,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    archiveNotification: storeArchiveNotification,
    deleteNotification: storeDeleteNotification,
    setNotifications,
    // removeNotification
  } = useNotificationStore()
  
  // const [toastNotifications, setToastNotifications] = React.useState<Notification[]>([])

  // Initialize with mock data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Order Completed',
        message: 'Order #12345 has been successfully processed and is ready for pickup.',
        isRead: false,
        userId: userId,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Coffee Beans (Arabica) is running low. Only 5 units remaining.',
        isRead: false,
        userId: userId,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'success',
        title: 'Payment Received',
        message: 'Payment of $45.50 received from customer John Doe.',
        isRead: true,
        userId: userId,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    if (notifications.length === 0) {
      setNotifications(mockNotifications)
    }
  }, [notifications.length, setNotifications, userId])

  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    addNotification(newNotification)
    
    if (enableToasts) {
      // Toast notifications would be handled here
      
      if (enableSound) {
        // Play notification sound
        try {
          const audio = new Audio('/notification-sound.mp3')
          audio.play().catch(() => {
            // Ignore audio play errors
          })
        } catch {
          // Ignore audio creation errors
        }
      }
    }
  }, [addNotification, enableToasts, enableSound, maxToasts])

  const markAsRead = useCallback((id: string) => {
    storeMarkAsRead(id)
  }, [storeMarkAsRead])

  const markAllAsRead = useCallback(() => {
    storeMarkAllAsRead()
  }, [storeMarkAllAsRead])

  const archiveNotification = useCallback((id: string) => {
    storeArchiveNotification(id)
  }, [storeArchiveNotification])

  const deleteNotification = useCallback((id: string) => {
    storeDeleteNotification(id)
    // setToastNotifications(prev => prev.filter(n => n.id !== id))
  }, [storeDeleteNotification])

  const clearAll = useCallback(() => {
    setNotifications([])
    // setToastNotifications([])
  }, [setNotifications])

  // const removeToast = useCallback((id: string) => {
  //   setToastNotifications(prev => prev.filter(n => n.id !== id))
  // }, [])

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount: storeUnreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    isLoading,
    error: storeError
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Toast notifications would be rendered here when NotificationToast component is available */}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider