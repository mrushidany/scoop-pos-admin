'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import SearchAndFilter from '@/components/shared/SearchAndFilter/SearchAndFilter'
import { useUserStore } from '@/stores'
import type { AdvancedSearchParams } from '@/services/search-service'
import type { User, UserRole } from '@/stores/types'
import {
  HiOutlineDocumentArrowDown,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineCheckCircle,

  HiOutlineClock,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })



export default function UsersPage() {
  const {
    users,
    getFilteredUsers,
    setFilters
  } = useUserStore()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const itemsPerPage = 10
  
  // Get filtered users from store
  const filteredUsers = getFilteredUsers()

  // Mock permissions data
  const mockPermissions = {
    all: { id: 'perm-all', name: 'All Permissions', resource: 'system', action: 'all', description: 'Full system access' },
    usersRead: { id: 'perm-users-read', name: 'Read Users', resource: 'users', action: 'read', description: 'View user information' },
    usersWrite: { id: 'perm-users-write', name: 'Write Users', resource: 'users', action: 'write', description: 'Create and edit users' },
    inventoryRead: { id: 'perm-inventory-read', name: 'Read Inventory', resource: 'inventory', action: 'read', description: 'View inventory data' },
    inventoryWrite: { id: 'perm-inventory-write', name: 'Write Inventory', resource: 'inventory', action: 'write', description: 'Manage inventory' },
    ordersRead: { id: 'perm-orders-read', name: 'Read Orders', resource: 'orders', action: 'read', description: 'View orders' },
    ordersWrite: { id: 'perm-orders-write', name: 'Write Orders', resource: 'orders', action: 'write', description: 'Manage orders' },
    reportsRead: { id: 'perm-reports-read', name: 'Read Reports', resource: 'reports', action: 'read', description: 'View reports' }
  }

  // Mock roles data
  const mockRoles: UserRole[] = [
    {
      id: 'role-001',
      name: 'Super Admin',
      permissions: [mockPermissions.all],
      description: 'Full system access with all permissions'
    },
    {
      id: 'role-002',
      name: 'Admin',
      permissions: [mockPermissions.usersRead, mockPermissions.usersWrite, mockPermissions.inventoryRead, mockPermissions.inventoryWrite, mockPermissions.ordersRead, mockPermissions.ordersWrite, mockPermissions.reportsRead],
      description: 'Administrative access to most system features'
    },
    {
      id: 'role-003',
      name: 'Manager',
      permissions: [mockPermissions.inventoryRead, mockPermissions.inventoryWrite, mockPermissions.ordersRead, mockPermissions.ordersWrite, mockPermissions.reportsRead, mockPermissions.usersRead],
      description: 'Management level access to operations'
    },
    {
      id: 'role-004',
      name: 'Employee',
      permissions: [mockPermissions.inventoryRead, mockPermissions.ordersRead],
      description: 'Basic employee access for daily operations'
    },
    {
      id: 'role-005',
      name: 'Viewer',
      permissions: [mockPermissions.inventoryRead, mockPermissions.reportsRead],
      description: 'Read-only access to system data'
    }
  ]

  // Mock users data
  const mockUsers: User[] = [
    {
      id: 'USR-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      phone: '+1-555-0101',
      avatar: '/img/avatars/avatar-1.jpg',
      role: mockRoles[0], // Super Admin
      status: 'active',
      lastLoginAt: '2024-01-18T14:30:00Z',
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      permissions: [mockPermissions.all]
    },
    {
      id: 'USR-002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1-555-0102',
      avatar: '/img/avatars/avatar-2.jpg',
      role: mockRoles[1], // Admin
      status: 'active',
      lastLoginAt: '2024-01-18T10:15:00Z',
      createdAt: '2023-03-20T10:30:00Z',
      updatedAt: '2024-01-18T10:15:00Z',
      permissions: [mockPermissions.usersRead, mockPermissions.usersWrite, mockPermissions.inventoryRead, mockPermissions.inventoryWrite, mockPermissions.ordersRead, mockPermissions.ordersWrite, mockPermissions.reportsRead]
    },
    {
      id: 'USR-003',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike.wilson@company.com',
      phone: '+1-555-0103',
      role: mockRoles[2], // Manager
      status: 'active',
      lastLoginAt: '2024-01-17T16:45:00Z',
      createdAt: '2023-05-10T11:15:00Z',
      updatedAt: '2024-01-17T16:45:00Z',
      permissions: [mockPermissions.inventoryRead, mockPermissions.inventoryWrite, mockPermissions.ordersRead, mockPermissions.ordersWrite, mockPermissions.reportsRead, mockPermissions.usersRead]
    },
    {
      id: 'USR-004',
      firstName: 'Lisa',
      lastName: 'Chen',
      email: 'lisa.chen@company.com',
      phone: '+1-555-0104',
      role: mockRoles[3], // Employee
      status: 'active',
      lastLoginAt: '2024-01-18T09:30:00Z',
      createdAt: '2023-08-15T14:20:00Z',
      updatedAt: '2024-01-18T09:30:00Z',
      permissions: [mockPermissions.inventoryRead, mockPermissions.ordersRead]
    },
    {
      id: 'USR-005',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@company.com',
      phone: '+1-555-0105',
      role: mockRoles[3], // Employee
      status: 'inactive',
      lastLoginAt: '2024-01-10T15:20:00Z',
      createdAt: '2023-09-01T08:45:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
      permissions: [mockPermissions.inventoryRead, mockPermissions.ordersRead]
    },
    {
      id: 'USR-006',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@company.com',
      role: mockRoles[4], // Viewer
      status: 'pending',
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-18T09:00:00Z',
      permissions: [mockPermissions.inventoryRead, mockPermissions.reportsRead]
    },
    {
      id: 'USR-007',
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.taylor@company.com',
      phone: '+1-555-0107',
      role: mockRoles[2], // Manager
      status: 'suspended',
      lastLoginAt: '2024-01-05T11:15:00Z',
      createdAt: '2023-04-12T13:30:00Z',
      updatedAt: '2024-01-08T10:00:00Z',
      permissions: [mockPermissions.inventoryRead, mockPermissions.inventoryWrite, mockPermissions.ordersRead, mockPermissions.ordersWrite, mockPermissions.reportsRead, mockPermissions.usersRead]
    },
    {
      id: 'USR-008',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jennifer.martinez@company.com',
      phone: '+1-555-0108',
      role: mockRoles[3], // Employee
      status: 'suspended',
      lastLoginAt: '2024-01-16T14:00:00Z',
      createdAt: '2023-07-20T10:15:00Z',
      updatedAt: '2024-01-16T14:00:00Z',
      permissions: [mockPermissions.inventoryRead, mockPermissions.ordersRead]
    }
  ]

  // Handle search and filter changes
  const handleSearch = (params: AdvancedSearchParams) => {
    setFilters({
      search: params.search || '',
      status: (typeof params.filters?.status === 'string' ? params.filters.status : '') || '',
      role: (typeof params.filters?.role === 'string' ? params.filters.role : '') || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    })
    
    setCurrentPage(params.page || 1)
  }

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Analytics data
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const pendingUsers = users.filter(u => u.status === 'pending').length
  const suspendedUsers = users.filter(u => u.status === 'suspended').length

  // Chart data for user status distribution
  const statusDistributionOptions = {
    chart: {
      type: 'donut' as const,
      height: 300
    },
    labels: ['Active', 'Inactive', 'Pending', 'Suspended'],
    colors: ['#10B981', '#6B7280', '#F59E0B', '#EF4444'],
    legend: {
      position: 'bottom' as const
    }
  }

  const statusDistributionSeries = [
    mockUsers.filter(u => u.status === 'active').length,
    mockUsers.filter(u => u.status === 'inactive').length,
    mockUsers.filter(u => u.status === 'pending').length,
    mockUsers.filter(u => u.status === 'suspended').length
  ]

  // Role distribution chart
  const roleDistributionOptions = {
    chart: {
      type: 'bar' as const,
      height: 300,
      toolbar: { show: false }
    },
    xaxis: {
      categories: mockRoles.map(role => role.name)
    },
    colors: ['#3B82F6'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false
      }
    }
  }

  const roleDistributionSeries = [{
    name: 'Users',
    data: mockRoles.map(role => 
      mockUsers.filter(user => user.role.id === role.id).length
    )
  }]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800'
      case 'Admin':
        return 'bg-blue-100 text-blue-800'
      case 'Manager':
        return 'bg-indigo-100 text-indigo-800'
      case 'Employee':
        return 'bg-green-100 text-green-800'
      case 'Viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['User ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Last Login'].join(','),
      ...filteredUsers.map(u => [
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.role.name,
        u.status,
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleUserAction = (action: string, userId: string) => {
    // Mock action handler
    console.log(`${action} user ${userId}`)
    // In real implementation, this would call API endpoints
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button onClick={handleExport} variant="plain">
            <HiOutlineDocumentArrowDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <HiOutlinePlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsers}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <HiOutlineUserGroup className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeUsers}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <HiOutlineCheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingUsers}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <HiOutlineClock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {suspendedUsers}
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <HiOutlineExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Status Distribution</h3>
          <Chart
            options={statusDistributionOptions}
            series={statusDistributionSeries}
            type="donut"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
          <Chart
            options={roleDistributionOptions}
            series={roleDistributionSeries}
            type="bar"
            height={300}
          />
        </Card>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        module="users"
        onSearch={handleSearch}
        placeholder="Search users by name, email, or ID..."
        className="mb-6"
      />

      {/* Users Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Users</h3>
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-10 h-10 rounded-full" />
                        ) : (
                          <HiOutlineUser className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getRoleBadgeClass(user.role.name)}>
                      {user.role.name}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusBadgeClass(user.status)}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </div>
                    {user.lastLoginAt && (
                      <div className="text-xs text-gray-500">
                        {new Date(user.lastLoginAt).toLocaleTimeString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="plain"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="plain"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowEditModal(true)
                        }}
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => handleUserAction('suspend', user.id)}
                        >
                          <HiOutlineLockClosed className="h-4 w-4 text-red-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => handleUserAction('activate', user.id)}
                        >
                          <HiOutlineLockOpen className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              total={filteredUsers.length}
              pageSize={itemsPerPage}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">User Details</h3>
                <Button
                  variant="plain"
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} className="w-16 h-16 rounded-full" />
                      ) : (
                        <HiOutlineUser className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h4>
                      <p className="text-gray-500">{selectedUser.email}</p>
                      <p className="text-sm text-gray-400">{selectedUser.id}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                        <Badge className={getRoleBadgeClass(selectedUser.role.name)}>
                          {selectedUser.role.name}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <Badge className={getStatusBadgeClass(selectedUser.status)}>
                          {selectedUser.status}
                        </Badge>
                      </div>
                      

                      
                      {selectedUser.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedUser.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  

                  
                  <div>
                    <h4 className="text-md font-semibold mb-4">Permissions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedUser.permissions.map((permission: any, index: number) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  

                </div>
                
                {/* Activity & Stats */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold mb-4">Activity</h4>
                    <div className="space-y-4">

                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Login</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold mb-4">Timeline</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedUser.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold mb-4">Role Details</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="font-medium text-gray-900 dark:text-white">{selectedUser.role.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedUser.role.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="plain" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
                <Button onClick={() => setShowEditModal(true)}>
                  Edit User
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create/Edit User Modal (simplified placeholder) */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {showCreateModal ? 'Add New User' : 'Edit User'}
                </h3>
                <Button
                  variant="plain"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="text-center py-8">
                <HiOutlineUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {showCreateModal ? 'User creation form would be implemented here' : 'User editing form would be implemented here'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This would include personal details, role assignment, permissions, etc.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="plain" 
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setSelectedUser(null)
                  }}
                >
                  {showCreateModal ? 'Create User' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}