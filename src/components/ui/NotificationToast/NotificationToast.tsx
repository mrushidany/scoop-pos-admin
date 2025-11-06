'use client'

import React, { useState, useEffect } from 'react'
import { 
  HiCheckCircle,
  HiExclamationTriangle,
  HiXCircle,
  HiInformationCircle,
  HiSpeakerWave,
  HiSpeakerXMark
} from 'react-icons/hi2'
import { HiX } from 'react-icons/hi'
import { Button } from '../Button'
import type { Notification } from '../../../stores/types'

export interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
  onAction?: (notification: Notification) => void
  autoClose?: boolean
  autoCloseDelay?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showSound?: boolean
  className?: string
  priority?: string
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onAction,
  autoClose = true,
  autoCloseDelay = 5000,
  position = 'top-right',
  showSound = false,
  className = '',
  priority = 'normal'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto close timer
    let closeTimer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout
    
    if (autoClose) {
      closeTimer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)
      
      // Progress bar animation
      const progressInterval = 50
      const progressDecrement = (progressInterval / autoCloseDelay) * 100
      
      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - progressDecrement
          return newProgress <= 0 ? 0 : newProgress
        })
      }, progressInterval)
    }

    // Play sound if enabled
    if (showSound && soundEnabled) {
      playNotificationSound(notification.type)
    }

    return () => {
      clearTimeout(showTimer)
      clearTimeout(closeTimer)
      clearInterval(progressTimer)
    }
  }, [autoClose, autoCloseDelay, notification.type, showSound, soundEnabled])

  const playNotificationSound = (type: Notification['type']) => {
    try {
      const audio = new Audio()
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3'
          break
        case 'warning':
          audio.src = '/sounds/warning.mp3'
          break
        case 'error':
          audio.src = '/sounds/error.mp3'
          break
        default:
          audio.src = '/sounds/notification.mp3'
      }
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose(notification.id)
    }, 300) // Animation duration
  }

  const handleAction = () => {
    if (onAction) {
      onAction(notification)
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <HiCheckCircle className="w-6 h-6 text-green-500" />
      case 'warning':
        return <HiExclamationTriangle className="w-6 h-6 text-yellow-500" />
      case 'error':
        return <HiXCircle className="w-6 h-6 text-red-500" />
      case 'info':
      default:
        return <HiInformationCircle className="w-6 h-6 text-blue-500" />
    }
  }

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      case 'info':
      default:
        return 'bg-blue-500'
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getPriorityIndicator = () => {
    if (priority === 'urgent') {        
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )
    }
    if (priority === 'high') {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
      )
    }
    return null
  }

  return (
    <div
      className={`
        fixed z-50 w-96 max-w-sm transition-all duration-300 ease-in-out
        ${getPositionClasses()}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${isClosing ? 'opacity-0 translate-x-full' : ''}
        ${className}
      `}
    >
      <div className={`
        relative bg-white rounded-lg shadow-lg border-l-4 p-4
        ${getColorClasses()}
        hover:shadow-xl transition-shadow duration-200
      `}>
        {/* Priority Indicator */}
        {getPriorityIndicator()}

        {/* Progress Bar */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
                
                {/* Metadata */}
                <div className='flex items-center gap-2 mt-2 text-xs text-gray-500'>
                  <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded-full'>
                    {notification.type}
                  </span>
                </div>

                {/* Action Button */}
                {(notification.actionUrl || onAction) && (
                  <div className='mt-3'>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAction}
                      className="text-xs"
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 ml-2">
                {showSound && (
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={soundEnabled ? 'Disable sound' : 'Enable sound'}
                  >
                    {soundEnabled ? (
                      <HiSpeakerWave className="w-4 h-4" />
                    ) : (
                      <HiSpeakerXMark className="w-4 h-4" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="plain"
                  size="sm"
                  onClick={handleClose}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Close notification"
                >
                  <HiX className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationToast