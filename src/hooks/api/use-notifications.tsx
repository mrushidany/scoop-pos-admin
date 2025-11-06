import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApiService } from '@/services/mock/api-service'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { Notification as NotificationType } from '@/stores/types'

// Query keys for notifications
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (userId: string) => [...notificationKeys.lists(), userId] as const,
  count: (userId: string) => [...notificationKeys.all, 'count', userId] as const,
}

// Notification queries
export const useNotifications = (userId: string) => {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: () => notificationApiService.getNotifications(userId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  })
}

export const useNotificationCount = (userId: string) => {
  return useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: async () => {
      const response = await notificationApiService.getNotifications(userId)
      if (response.success) {
        const unreadCount = response.data?.filter(n => !n.isRead).length || 0
        return { success: true, data: { count: unreadCount } }
      }
      return response
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  })
}

// Notification mutations
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => notificationApiService.markAsRead(id),
    onSuccess: (response, id) => {
      if (response.success) {
        // Update all notification queries
        queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        
        toast.push(
          <Notification title="Success" type="success">
            Notification marked as read
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to mark notification as read'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      console.error('Mark notification as read error:', error)
      toast.push(
        <Notification title="Error" type="danger">
          Failed to mark notification as read
        </Notification>
      )
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: string) => notificationApiService.markAllAsRead(userId),
    onSuccess: (response, userId) => {
      if (response.success) {
        // Update all notification queries
        queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        
        toast.push(
          <Notification title="Success" type="success">
            All notifications marked as read
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to mark all notifications as read'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      console.error('Mark all notifications as read error:', error)
      toast.push(
        <Notification title="Error" type="danger">
          Failed to mark all notifications as read
        </Notification>
      )
    },
  })
}

// Real-time notification hook
export const useRealTimeNotifications = (userId: string) => {
  const queryClient = useQueryClient()
  
  // This would be implemented with WebSocket in a real application
  // For now, we'll use polling as a fallback
  const { data: notifications } = useQuery({
    queryKey: [...notificationKeys.list(userId), 'realtime'],
    queryFn: () => notificationApiService.getNotifications(userId),
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!userId,
  })
  
  return {
    notifications: notifications?.data || [],
    isConnected: true, // Would be actual WebSocket connection status
    reconnect: () => {
      // Would reconnect WebSocket
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  }
}

// Notification preferences hook (placeholder for future implementation)
export const useNotificationPreferences = (userId: string) => {
  return useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      // Placeholder - would fetch user's notification preferences
      return {
        success: true,
        data: {
          email: true,
          push: true,
          inApp: true,
          sms: false,
          categories: {
            orders: true,
            inventory: true,
            transactions: true,
            security: true,
            marketing: false,
          },
        },
      }
    },
    enabled: !!userId,
  })
}

// System alerts hook
export const useSystemAlerts = () => {
  return useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      // Placeholder - would fetch system-wide alerts
      return {
        success: true,
        data: [
          {
            id: 'alert-1',
            type: 'maintenance',
            severity: 'medium',
            title: 'Scheduled Maintenance',
            message: 'System maintenance scheduled for tonight at 2 AM',
            startTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            endTime: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
            affectedServices: ['payments', 'reports'],
          },
        ],
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}