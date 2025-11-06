import { useState } from 'react'
import { PiBellDuotone, PiXBold, PiWarningDuotone, PiInfoDuotone, PiCheckCircleDuotone } from 'react-icons/pi'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import { useRealTimeNotifications, useSystemAlerts } from '@/hooks/use-real-time-notifications'
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/api/use-notifications'
import classNames from 'classnames'
import type { Notification as NotificationType } from '@/stores/types'
import type { SystemAlert } from '@/services/notification-service'

// Notification item component
interface NotificationItemProps {
  notification: NotificationType
  onMarkAsRead: (id: string) => void
  onClose?: () => void
}

const NotificationItem = ({ notification, onMarkAsRead, onClose }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <PiCheckCircleDuotone className="w-4 h-4 text-green-500" />
      case 'warning':
        return <PiWarningDuotone className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <PiWarningDuotone className="w-4 h-4 text-red-500" />
      case 'system':
        return <PiInfoDuotone className="w-4 h-4 text-blue-500" />
      case 'info':
      default:
        return <PiBellDuotone className="w-4 h-4 text-gray-500" />
    }
  }

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={classNames(
        'p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
        {
          'bg-blue-50': !notification.isRead,
        }
      )}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={classNames(
              'text-sm font-medium text-gray-900 truncate',
              { 'font-semibold': !notification.isRead }
            )}>
              {notification.title}
            </h4>
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <PiXBold className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
            {!notification.isRead && (
              <Badge content="New" innerClass="bg-blue-500 text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// System alert item component
interface SystemAlertItemProps {
  alert: SystemAlert
  onDismiss: (id: string) => void
}

const SystemAlertItem = ({ alert, onDismiss }: SystemAlertItemProps) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
      case 'high':
        return <PiWarningDuotone className="w-4 h-4" />
      default:
        return <PiInfoDuotone className="w-4 h-4" />
    }
  }

  return (
    <div className={classNames(
      'p-3 border rounded-lg mb-2',
      getSeverityColor()
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            {getSeverityIcon()}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold">
              {alert.title}
            </h4>
            <p className="text-sm mt-1">
              {alert.message}
            </p>
            {alert.actionRequired && (
              <Badge content="Action Required" innerClass="bg-yellow-500 text-white" className="mt-2" />
            )}
          </div>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className="text-current hover:opacity-70"
        >
          <PiXBold className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Main notification center component
interface NotificationCenterProps {
  className?: string
}

const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts'>('notifications')
  
  // Real-time notifications
  const {
    recentNotifications,
    unreadCount,
    isConnected,
    clearRecentNotifications
  } = useRealTimeNotifications()
  
  // System alerts
  const {
    systemAlerts,
    criticalAlerts,
    markAlertAsRead,
    hasAlerts,
    hasCriticalAlerts
  } = useSystemAlerts()
  
  // API notifications
  const { data: notifications, isLoading } = useNotifications('current-user')
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  
  // Handle marking notification as read
  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }
  
  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate('current-user')
  }
  
  // Handle dismissing system alert
  const handleDismissAlert = (alertId: string) => {
    if (markAlertAsRead) {
      markAlertAsRead(alertId)
    }
  }
  
  // Calculate total unread count
  const totalUnreadCount = unreadCount + (notifications?.data?.filter(n => !n.isRead).length || 0)
  const totalAlertsCount = systemAlerts.length
  
  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border-b">
      <div className={classNames(
        'w-2 h-2 rounded-full',
        isConnected ? 'bg-green-500' : 'bg-red-500'
      )} />
      <span className="text-xs text-gray-600">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
  
  const dropdownContent = (
    <Card className="w-80 max-h-96 overflow-hidden">
      <ConnectionStatus />
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('notifications')}
          className={classNames(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'notifications'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Notifications
          {totalUnreadCount > 0 && (
            <Badge content={totalUnreadCount.toString()} innerClass="bg-blue-500 text-white" className="ml-2" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={classNames(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'alerts'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Alerts
          {totalAlertsCount > 0 && (
            <Badge 
              content={totalAlertsCount.toString()}
              innerClass={hasCriticalAlerts ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}
              className="ml-2"
            />
          )}
        </button>
      </div>
      
      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        <ScrollBar>
          {activeTab === 'notifications' && (
            <div>
              {/* Header actions */}
              {(totalUnreadCount > 0 || recentNotifications.length > 0) && (
                <div className="flex justify-between items-center p-3 border-b bg-gray-50">
                  <span className="text-sm font-medium text-gray-700">
                    {totalUnreadCount} unread
                  </span>
                  <div className="flex space-x-2">
                    {recentNotifications.length > 0 && (
                      <Button
                        size="xs"
                        variant="plain"
                        onClick={clearRecentNotifications}
                      >
                        Clear Recent
                      </Button>
                    )}
                    {totalUnreadCount > 0 && (
                      <Button
                        size="xs"
                        variant="plain"
                        onClick={handleMarkAllAsRead}
                        loading={markAllAsReadMutation.isPending}
                      >
                        Mark All Read
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Loading state */}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Spinner size="sm" />
                </div>
              )}
              
              {/* Recent notifications from real-time */}
              {recentNotifications.length > 0 && (
                <div>
                  <div className="px-3 py-2 bg-blue-50 border-b">
                    <span className="text-xs font-medium text-blue-700">
                      Recent ({recentNotifications.length})
                    </span>
                  </div>
                  {recentNotifications.map((event, index) => {
                    if (event.type === 'notification') {
                      const notification = event.data as NotificationType
                      return (
                        <NotificationItem
                          key={`recent-${notification.id}-${index}`}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      )
                    }
                    return null
                  })}
                </div>
              )}
              
              {/* API notifications */}
              {notifications?.data && notifications.data.length > 0 && (
                <div>
                  {recentNotifications.length > 0 && (
                    <div className="px-3 py-2 bg-gray-50 border-b">
                      <span className="text-xs font-medium text-gray-700">
                        Earlier
                      </span>
                    </div>
                  )}
                  {notifications.data.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}
              
              {/* Empty state */}
              {!isLoading && (!notifications?.data || notifications.data.length === 0) && recentNotifications.length === 0 && (
                <div className="p-6 text-center">
                  <PiBellDuotone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div className="p-3">
              {/* Critical alerts first */}
              {criticalAlerts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">
                    Critical Alerts
                  </h4>
                  {criticalAlerts.map((alert) => (
                    <SystemAlertItem
                      key={alert.id}
                      alert={alert}
                      onDismiss={handleDismissAlert}
                    />
                  ))}
                </div>
              )}
              
              {/* Other alerts */}
              {systemAlerts.filter(alert => alert.severity !== 'critical').map((alert) => (
                <SystemAlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                />
              ))}
              
              {/* Empty state */}
              {!hasAlerts && (
                <div className="text-center py-6">
                  <PiCheckCircleDuotone className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No active alerts
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollBar>
      </div>
    </Card>
  )
  
  return (
    <div className={className}>
      <Dropdown
        placement="bottom-end"
        renderTitle={
          <Button variant="plain" size="sm" icon={<PiBellDuotone />}>
            {(totalUnreadCount > 0 || hasCriticalAlerts) && (
              <Badge 
                content={Math.min(totalUnreadCount + totalAlertsCount, 99).toString()}
                innerClass={hasCriticalAlerts ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs"
              />
            )}
          </Button>
        }
        onOpen={() => {}}
      >
        {dropdownContent}
      </Dropdown>
    </div>
  )
}

export default NotificationCenter