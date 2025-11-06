'use client'

import Header from '@/components/template/Header'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import NotificationCenter from '@/components/ui/NotificationCenter'
import HeaderLogo from '@/components/template/HeaderLogo'
import Search from '@/components/template/Search'
import MobileNav from '@/components/template/MobileNav'
import HorizontalNav from '@/components/template/HorizontalNav'
import LayoutBase from '@/components//template/LayoutBase'
import { useNotifications } from '@/components/providers'
import { LAYOUT_TOP_BAR_CLASSIC } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'

const TopBarClassic = ({ children }: CommonProps) => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        deleteNotification
    } = useNotifications()

    return (
        <LayoutBase
            type={LAYOUT_TOP_BAR_CLASSIC}
            className="app-layout-top-bar-classic flex flex-auto flex-col min-h-screen"
        >
            <div className="flex flex-auto min-w-0">
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        container
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={
                            <>
                                <MobileNav />
                                <HeaderLogo />
                            </>
                        }
                        headerMiddle={<HorizontalNav />}
                        headerEnd={
                            <>
                                <Search />
                                <NotificationCenter
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    isOpen={false}
                                    onToggle={() => {}}
                                    onClose={() => {}}
                                    onMarkAsRead={markAsRead}
                                    onMarkAllAsRead={markAllAsRead}
                                    onArchive={archiveNotification}
                                    onDelete={deleteNotification}
                                    onNotificationClick={(notification) => {
                                        markAsRead(notification.id)
                                        if (notification.actionUrl) {
                                            window.location.href = notification.actionUrl
                                        }
                                    }}
                                    onSettingsClick={() => {
                                        window.location.href = '/settings/notifications'
                                    }}
                                />
                                <UserProfileDropdown hoverable={false} />
                            </>
                        }
                    />
                    {children}
                </div>
            </div>
        </LayoutBase>
    )
}

export default TopBarClassic
