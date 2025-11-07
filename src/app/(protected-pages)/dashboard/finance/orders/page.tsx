
'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import {
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentArrowDown,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi2'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface OrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
}

interface OrderFilters {
  status: string
  paymentStatus: string
  paymentMethod: string
  dateRange: string
  search: string
}

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    paymentStatus: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const itemsPerPage = 10

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      orderNumber: 'ORD-2024-001',
      customerId: 'CUST-001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@email.com',
      customerPhone: '+1-555-0123',
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      items: [
        {
          id: 'ITEM-001',
          productId: 'PRD-001',
          productName: 'Premium Coffee Beans',
          sku: 'COF-001',
          quantity: 2,
          unitPrice: 24.99,
          totalPrice: 49.98
        }
      ],
      subtotal: 49.98,
      tax: 4.50,
      shipping: 5.99,
      discount: 0,
      total: 60.47,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      notes: 'Please deliver after 2 PM',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      estimatedDelivery: '2024-01-20T12:00:00Z'
    },
    {
      id: 'ORD-002',
      orderNumber: 'ORD-2024-002',
      customerId: 'CUST-002',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@email.com',
      customerPhone: '+1-555-0124',
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'digital_wallet',
      items: [
        {
          id: 'ITEM-002',
          productId: 'PRD-003',
          productName: 'Wireless Headphones',
          sku: 'ELC-003',
          quantity: 1,
          unitPrice: 199.99,
          totalPrice: 199.99
        }
      ],
      subtotal: 199.99,
      tax: 18.00,
      shipping: 0,
      discount: 20.00,
      total: 197.99,
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T15:00:00Z',
      estimatedDelivery: '2024-01-22T12:00:00Z'
    },
    {
      id: 'ORD-003',
      orderNumber: 'ORD-2024-003',
      customerId: 'CUST-003',
      customerName: 'Bob Johnson',
      customerEmail: 'bob.johnson@email.com',
      customerPhone: '+1-555-0125',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      items: [
        {
          id: 'ITEM-003',
          productId: 'PRD-002',
          productName: 'Organic Apples',
          sku: 'FRT-002',
          quantity: 5,
          unitPrice: 3.99,
          totalPrice: 19.95
        }
      ],
      subtotal: 19.95,
      tax: 1.80,
      shipping: 3.99,
      discount: 0,
      total: 25.74,
      shippingAddress: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      createdAt: '2024-01-17T09:15:00Z',
      updatedAt: '2024-01-17T09:15:00Z'
    },
    {
      id: 'ORD-004',
      orderNumber: 'ORD-2024-004',
      customerId: 'CUST-004',
      customerName: 'Alice Brown',
      customerEmail: 'alice.brown@email.com',
      customerPhone: '+1-555-0126',
      status: 'cancelled',
      paymentStatus: 'refunded',
      paymentMethod: 'card',
      items: [
        {
          id: 'ITEM-004',
          productId: 'PRD-005',
          productName: 'Vintage T-Shirt',
          sku: 'CLT-005',
          quantity: 3,
          unitPrice: 29.99,
          totalPrice: 89.97
        }
      ],
      subtotal: 89.97,
      tax: 8.10,
      shipping: 7.99,
      discount: 10.00,
      total: 96.06,
      shippingAddress: {
        street: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      notes: 'Customer requested cancellation',
      createdAt: '2024-01-14T16:45:00Z',
      updatedAt: '2024-01-15T10:20:00Z'
    },
    {
      id: 'ORD-005',
      orderNumber: 'ORD-2024-005',
      customerId: 'CUST-005',
      customerName: 'Charlie Wilson',
      customerEmail: 'charlie.wilson@email.com',
      customerPhone: '+1-555-0127',
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      items: [
        {
          id: 'ITEM-005',
          productId: 'PRD-004',
          productName: 'Classic Novel Collection',
          sku: 'BOK-004',
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99
        }
      ],
      subtotal: 89.99,
      tax: 8.10,
      shipping: 9.99,
      discount: 0,
      total: 108.08,
      shippingAddress: {
        street: '654 Maple Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      createdAt: '2024-01-13T11:20:00Z',
      updatedAt: '2024-01-17T08:45:00Z',
      estimatedDelivery: '2024-01-19T12:00:00Z'
    }
  ]

  // Filter orders based on current filters
  const filteredOrders = mockOrders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.paymentStatus !== 'all' && order.paymentStatus !== filters.paymentStatus) return false
    if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) return false
    if (filters.search && !(
      order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(filters.search.toLowerCase())
    )) return false
    return true
  })

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  // Analytics data
  const totalOrders = mockOrders.length
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length
  const completedOrders = mockOrders.filter(o => o.status === 'delivered').length
  const totalRevenue = mockOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)

  // Chart data for order status distribution
  const statusDistributionOptions = {
    chart: {
      type: 'donut' as const,
      height: 300
    },
    labels: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    colors: ['#F59E0B', '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#EF4444'],
    legend: {
      position: 'bottom' as const
    }
  }

  const statusDistributionSeries = [
    mockOrders.filter(o => o.status === 'pending').length,
    mockOrders.filter(o => o.status === 'confirmed').length,
    mockOrders.filter(o => o.status === 'processing').length,
    mockOrders.filter(o => o.status === 'shipped').length,
    mockOrders.filter(o => o.status === 'delivered').length,
    mockOrders.filter(o => o.status === 'cancelled').length
  ]

  // Revenue trend chart
  const revenueTrendOptions = {
    chart: {
      type: 'line' as const,
      height: 300,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    xaxis: {
      categories: ['Jan 13', 'Jan 14', 'Jan 15', 'Jan 16', 'Jan 17']
    },
    colors: ['#10B981'],
    yaxis: {
      title: {
        text: 'Revenue ($)'
      }
    }
  }

  const revenueTrendSeries = [{
    name: 'Daily Revenue',
    data: [108.08, 96.06, 60.47, 197.99, 25.74]
  }]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-cyan-100 text-cyan-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Order ID', 'Order Number', 'Customer', 'Status', 'Payment Status', 'Total', 'Created Date'].join(','),
      ...filteredOrders.map(o => [
        o.id,
        o.orderNumber,
        o.customerName,
        o.status,
        o.paymentStatus,
        o.total.toFixed(2),
        new Date(o.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage orders, track status, and analyze order performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button onClick={handleExport} variant="plain">
            <HiOutlineDocumentArrowDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <HiOutlinePlus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalOrders}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <HiOutlineShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingOrders}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedOrders}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <HiOutlineCurrencyDollar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <Chart
            options={statusDistributionOptions}
            series={statusDistributionSeries}
            type="donut"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <Chart
            options={revenueTrendOptions}
            series={revenueTrendSeries}
            type="line"
            height={300}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={{ value: filters.status, label: filters.status === 'all' ? 'All Status' : filters.status }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, status: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Status
            </label>
            <Select
              value={{ value: filters.paymentStatus, label: filters.paymentStatus === 'all' ? 'All Payment Status' : filters.paymentStatus }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, paymentStatus: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Payment Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <Select
              value={{ value: filters.paymentMethod, label: filters.paymentMethod === 'all' ? 'All Methods' : filters.paymentMethod.replace('_', ' ') }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, paymentMethod: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'digital_wallet', label: 'Digital Wallet' },
                { value: 'bank_transfer', label: 'Bank Transfer' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <Select
              value={{ value: filters.dateRange, label: filters.dateRange === 'all' ? 'All Time' : filters.dateRange }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, dateRange: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Orders</h3>
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <Badge className={getPaymentStatusBadgeClass(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">{order.paymentMethod.replace('_', ' ')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="plain"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="plain"
                        size="sm"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > itemsPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              total={filteredOrders.length}
              pageSize={itemsPerPage}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <Button
                  variant="plain"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Number</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                      <Badge className={getPaymentStatusBadgeClass(selectedOrder.paymentStatus)}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p>{selectedOrder.customerEmail}</p>
                      <p>{selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Address</label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                  
                  {selectedOrder.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</label>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">${item.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order Summary</label>
                    <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${selectedOrder.shipping.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-${selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Updated</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedOrder.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedOrder.estimatedDelivery && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Delivery</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="plain" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button>
                  Edit Order
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Order Modal (simplified placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Order</h3>
                <Button
                  variant="plain"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="text-center py-8">
                <HiOutlineClipboardDocumentList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Create Order form would be implemented here</p>
                <p className="text-sm text-gray-400 mt-2">This would include customer selection, product selection, pricing, etc.</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="plain" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Create Order
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
