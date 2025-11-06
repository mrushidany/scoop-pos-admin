import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Notification, NotificationType } from './types'

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'
type NotificationStatus = 'unread' | 'read' | 'archived'

interface ExtendedNotification extends Notification {
  priority?: NotificationPriority
  status?: NotificationStatus
  readAt?: string
  archivedAt?: string
}

interface NotificationState {
  // State
  notifications: ExtendedNotification[]
  selectedNotification: ExtendedNotification | null
  loading: boolean
  error: string | null
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    search: string
    priority: NotificationPriority | ''
    status: NotificationStatus | ''
    type: NotificationType | ''
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  settings: {
    enableToasts: boolean
    enableSounds: boolean
    toastPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    autoMarkAsRead: boolean
    autoArchiveAfterDays: number
  }

  // Actions
  setNotifications: (notifications: ExtendedNotification[]) => void
  setSelectedNotification: (notification: ExtendedNotification | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (pagination: Partial<NotificationState['pagination']>) => void
  setFilters: (filters: Partial<NotificationState['filters']>) => void
  setSettings: (settings: Partial<NotificationState['settings']>) => void
  
  // Notification CRUD operations
  addNotification: (notification: ExtendedNotification) => void
  updateNotification: (id: string, updates: Partial<ExtendedNotification>) => void
  removeNotification: (id: string) => void
  
  // Notification operations
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  archiveNotification: (id: string) => void
  unarchiveNotification: (id: string) => void
  deleteNotification: (id: string) => void
  bulkMarkAsRead: (ids: string[]) => void
  bulkArchive: (ids: string[]) => void
  bulkDelete: (ids: string[]) => void
  
  // Utility functions
  getNotificationById: (id: string) => ExtendedNotification | undefined
  getFilteredNotifications: () => ExtendedNotification[]
  getUnreadNotifications: () => ExtendedNotification[]
  getNotificationsByPriority: (priority: NotificationPriority) => ExtendedNotification[]
  getNotificationsByType: (type: NotificationType) => ExtendedNotification[]
  getRecentNotifications: (limit?: number) => ExtendedNotification[]
  updateUnreadCount: () => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters = {
  search: '',
  priority: '' as NotificationPriority | '',
  status: '' as NotificationStatus | '',
  type: '' as NotificationType | '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
}

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

const initialSettings = {
  enableToasts: true,
  enableSounds: true,
  toastPosition: 'top-right' as const,
  autoMarkAsRead: false,
  autoArchiveAfterDays: 30,
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      selectedNotification: null,
      loading: false,
      error: null,
      unreadCount: 0,
      pagination: initialPagination,
      filters: initialFilters,
      settings: initialSettings,

      // Basic setters
      setNotifications: (notifications) => {
        set({ notifications })
        get().updateUnreadCount()
      },
      setSelectedNotification: (selectedNotification) => set({ selectedNotification }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => 
        set((state) => ({ 
          pagination: { ...state.pagination, ...pagination } 
        })),
      setFilters: (filters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
      setSettings: (settings) => 
        set((state) => ({ 
          settings: { ...state.settings, ...settings } 
        })),

      // CRUD operations
      addNotification: (notification) => {
        set((state) => ({ 
          notifications: [notification, ...state.notifications] 
        }))
        get().updateUnreadCount()
      },
      
      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map((notification) => 
            notification.id === id ? { ...notification, ...updates } : notification
          ),
          selectedNotification: state.selectedNotification?.id === id 
            ? { ...state.selectedNotification, ...updates } 
            : state.selectedNotification,
        }))
        get().updateUnreadCount()
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((notification) => notification.id !== id),
          selectedNotification: state.selectedNotification?.id === id ? null : state.selectedNotification,
        }))
        get().updateUnreadCount()
      },

      // Notification operations
      markAsRead: (id) => {
        get().updateNotification(id, { 
          isRead: true,
          status: 'read',
          readAt: new Date().toISOString()
        })
      },
      
      markAsUnread: (id) => {
        get().updateNotification(id, { 
          isRead: false,
          status: 'unread',
          readAt: undefined
        })
      },
      
      markAllAsRead: () => {
        const { notifications } = get()
        const updates = notifications
          .filter(n => !n.isRead)
          .map(n => ({ 
            ...n, 
            isRead: true,
            status: 'read' as NotificationStatus,
            readAt: new Date().toISOString()
          }))
        
        set((state) => ({
          notifications: state.notifications.map(notification => {
            const update = updates.find(u => u.id === notification.id)
            return update || notification
          })
        }))
        get().updateUnreadCount()
      },
      
      archiveNotification: (id) => {
        get().updateNotification(id, { 
          status: 'archived',
          archivedAt: new Date().toISOString()
        })
      },
      
      unarchiveNotification: (id) => {
        get().updateNotification(id, { 
          status: 'read',
          archivedAt: undefined
        })
      },
      
      deleteNotification: (id) => {
        get().removeNotification(id)
      },
      
      bulkMarkAsRead: (ids) => {
        ids.forEach(id => get().markAsRead(id))
      },
      
      bulkArchive: (ids) => {
        ids.forEach(id => get().archiveNotification(id))
      },
      
      bulkDelete: (ids) => {
        ids.forEach(id => get().deleteNotification(id))
      },

      // Utility functions
      getNotificationById: (id) => {
        const { notifications } = get()
        return notifications.find((notification) => notification.id === id)
      },
      
      getFilteredNotifications: () => {
        const { notifications, filters } = get()
        let filtered = [...notifications]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter((notification) =>
            notification.title.toLowerCase().includes(searchLower) ||
            notification.message.toLowerCase().includes(searchLower)
          )
        }

        // Apply priority filter
        if (filters.priority) {
          filtered = filtered.filter((notification) => notification.priority === filters.priority)
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter((notification) => notification.status === filters.status)
        }

        // Apply type filter
        if (filters.type) {
          filtered = filtered.filter((notification) => notification.type === filters.type)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof ExtendedNotification] as string
          const bValue = b[filters.sortBy as keyof ExtendedNotification] as string
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        return filtered
      },
      
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter((notification) => !notification.isRead)
      },
      
      getNotificationsByPriority: (priority) => {
        const { notifications } = get()
        return notifications.filter((notification) => notification.priority === priority)
      },
      
      getNotificationsByType: (type) => {
        const { notifications } = get()
        return notifications.filter((notification) => notification.type === type)
      },
      
      getRecentNotifications: (limit = 10) => {
        const { notifications } = get()
        return notifications
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      },
      
      updateUnreadCount: () => {
        const { notifications } = get()
        const unreadCount = notifications.filter(n => !n.isRead).length
        set({ unreadCount })
      },
      
      resetFilters: () => set({ filters: initialFilters }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'notification-store',
    }
  )
)