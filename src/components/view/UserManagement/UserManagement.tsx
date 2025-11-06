import React from 'react'
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/DataTable/DataTable'
import { Badge, Avatar, Button } from '@/components/ui'
import { PiEyeBold, PiPencilBold, PiTrashBold, PiUserPlusBold } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import type { User } from '@/stores/types'

interface UserManagementProps {
  onCreateUser?: () => void
  onEditUser?: (user: User) => void
  onDeleteUser?: (user: User) => void
  onViewUser?: (user: User) => void
}

export const UserManagement: React.FC<UserManagementProps> = ({
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onViewUser,
}) => {
  const router = useRouter()

  // Define table columns
  const columns: DataTableColumn<User>[] = [
    {
      key: 'avatar',
      title: '',
      width: 60,
      render: (_, record) => (
        <Avatar
          size="sm"
          src={record.avatar}
          alt={`${record.firstName} ${record.lastName}`}
          className="h-8 w-8"
        >
          {record.firstName.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      key: 'firstName',
      title: 'Name',
      dataIndex: 'firstName',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {record.email}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      sortable: true,
      filterable: true,
      render: (value) => {
        const roleColors = {
          admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          employee: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        }
        
        return (
          <Badge
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              roleColors[value.name as keyof typeof roleColors] || roleColors.viewer
            }`}
          >
            {value.name}
          </Badge>
        )
      },
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const statusConfig = {
          active: {
            label: 'Active',
            className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          },
          inactive: {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          },
          suspended: {
            label: 'Suspended',
            className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          },
        }
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.inactive
        
        return (
          <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      sortable: true,
      filterable: true,
      render: (value) => value || 'N/A',
    },
    {
      key: 'lastLoginAt',
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-gray-400">Never</span>
        
        const date = new Date(value)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        
        if (diffInHours < 1) {
          return <span className="text-green-600 dark:text-green-400">Just now</span>
        } else if (diffInHours < 24) {
          return <span className="text-blue-600 dark:text-blue-400">{diffInHours}h ago</span>
        } else {
          return (
            <span className="text-gray-600 dark:text-gray-400">
              {date.toLocaleDateString()}
            </span>
          )
        }
      },
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  // Define table actions
  const actions: DataTableAction<User>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: PiEyeBold,
      onClick: (user) => {
        if (onViewUser) {
          onViewUser(user)
        } else {
          router.push(`/users/${user.id}`)
        }
      },
    },
    {
      key: 'edit',
      label: 'Edit User',
      icon: PiPencilBold,
      onClick: (user) => {
        if (onEditUser) {
          onEditUser(user)
        } else {
          router.push(`/users/${user.id}/edit`)
        }
      },
      disabled: (user) => user.role.name === 'admin' && user.id === 'current-user-id', // Prevent self-edit for admin
    },
    {
      key: 'delete',
      label: 'Delete User',
      icon: PiTrashBold,
      variant: 'plain',
      onClick: (user) => {
        if (onDeleteUser) {
          onDeleteUser(user)
        }
      },
      disabled: (user) => user.role.name === 'admin' || user.id === 'current-user-id', // Prevent deletion of admin or self
      hidden: (user) => user.status === 'suspended', // Hide delete for suspended users
    },
  ]

  // Handle data export
  const handleExport = (users: User[]) => {
    const csvData = users.map(user => ({
      Name: `${user.firstName} ${user.lastName}`,
      Email: user.email,
      Role: user.role.name,
      Status: user.status,
      Phone: user.phone || 'N/A',
      'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never',
      Created: new Date(user.createdAt).toLocaleString(),
    }))
    
    // Convert to CSV and download
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        {onCreateUser && (
          <Button onClick={onCreateUser} className="flex items-center gap-2">
            <PiUserPlusBold className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        module="users"
        columns={columns}
        actions={actions}
        title="Users"
        description="Search and filter users by name, email, role, status, department, and more"
        showSearch={true}
        showFilters={true}
        showExport={true}
        showRefresh={true}
        selectable={true}
        onExport={handleExport}
        initialParams={{
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 25,
        }}
        emptyStateMessage="No users found"
        emptyStateDescription="Get started by adding your first user to the system"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
      />
    </div>
  )
}

export default UserManagement