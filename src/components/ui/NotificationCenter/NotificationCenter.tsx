'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  HiBell, 
  HiOutlineBell, 
  HiCheck, 
  HiArchiveBox,
  HiTrash,
  HiEllipsisVertical,
  HiClock,
  HiExclamationTriangle,
  HiInformationCircle,
  HiCheckCircle,
  HiXCircle,
  HiCog6Tooth,
  HiMagnifyingGlass
} from 'react-icons/hi2'
import { HiX } from 'react-icons/hi'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Input } from '../Input'
import type { Notification } from '../../../stores/types'

export interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onNotificationClick: (notification: Notification) => void
  onSettingsClick: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  onNotificationClick,
  onSettingsClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <HiExclamationTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <HiXCircle className="w-5 h-5 text-red-500" />
      case 'info':
      default:
        return <HiInformationCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-700'
      case 'warning':
        return 'border-orange-200 bg-orange-50 text-orange-700'
      case 'success':
        return 'border-green-200 bg-green-50 text-green-700'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50 text-blue-700'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !notification.isRead) ||
                         (selectedFilter === 'read' && notification.isRead) ||
                         notification.type === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'read' | 'archive' | 'delete') => {
    selectedNotifications.forEach(id => {
      switch (action) {
        case 'read':
          onMarkAsRead(id)
          break
        case 'archive':
          onArchive(id)
          break
        case 'delete':
          onDelete(id)
          break
      }
    })
    setSelectedNotifications([])
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'order', label: 'Orders' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'payment', label: 'Payments' }
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="plain"
        size="sm"
        onClick={onToggle}
        className="relative p-2"
      >
        {unreadCount > 0 ? (
          <HiBell className="w-6 h-6 text-blue-600" />
        ) : (
          <HiOutlineBell className="w-6 h-6 text-gray-600" />
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 text-xs flex items-center justify-center bg-red-500 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="plain"
                  size="sm"
                  onClick={onSettingsClick}
                  className="p-1"
                >
                  <HiCog6Tooth className="w-4 h-4" />
                </Button>
                <Button
                  variant="plain"
                  size="sm"
                  onClick={onClose}
                  className="p-1"
                >
                  <HiX className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {unreadCount > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-md">
                <span className="text-sm text-blue-700">
                  {selectedNotifications.length} selected
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => handleBulkAction('read')}
                    className="text-xs"
                  >
                    <HiCheck className="w-3 h-3 mr-1" />
                    Read
                  </Button>
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                    className="text-xs"
                  >
                    <HiArchiveBox className="w-3 h-3 mr-1" />
                    Archive
                  </Button>
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <HiTrash className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <HiOutlineBell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'No notifications match your filters'
                    : 'No notifications yet'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectNotification(notification.id)
                        }}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />

                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              {notification.type && (
                                <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(notification.type)}`}>
                                  {notification.type}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <HiClock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {notification.type}
                              </span>
                            </div>
                          </div>

                          {/* Action Menu */}
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <div className="relative group">
                              <Button
                                variant="plain"
                                size="sm"
                                className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle dropdown menu
                                }}
                              >
                                <HiEllipsisVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(notification.actionUrl, '_blank')
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="default"
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter