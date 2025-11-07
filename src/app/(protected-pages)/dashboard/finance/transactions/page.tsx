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
  HiOutlineArrowPath,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Transaction {
  id: string
  vendorId: string
  vendorName: string
  amount: number
  fee: number
  netAmount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  type: 'payment' | 'refund' | 'chargeback' | 'adjustment'
  paymentMethod: 'card' | 'bank_transfer' | 'digital_wallet' | 'cash'
  reference: string
  description: string
  createdAt: string
  processedAt?: string
  failureReason?: string
}

interface TransactionFilters {
  status: string
  type: string
  paymentMethod: string
  dateRange: string
  search: string
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    type: 'all',
    paymentMethod: 'all',
    dateRange: '30d',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const itemsPerPage = 10

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      id: 'TXN-001',
      vendorId: 'VND-001',
      vendorName: 'Coffee Corner',
      amount: 245.00,
      fee: 7.35,
      netAmount: 237.65,
      status: 'completed',
      type: 'payment',
      paymentMethod: 'card',
      reference: 'REF-001-2024',
      description: 'Order payment for items #ORD-123',
      createdAt: '2024-01-15T10:30:00Z',
      processedAt: '2024-01-15T10:31:00Z'
    },
    {
      id: 'TXN-002',
      vendorId: 'VND-002',
      vendorName: 'Fresh Market',
      amount: 189.50,
      fee: 5.69,
      netAmount: 183.81,
      status: 'pending',
      type: 'payment',
      paymentMethod: 'bank_transfer',
      reference: 'REF-002-2024',
      description: 'Bulk order payment',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 'TXN-003',
      vendorId: 'VND-003',
      vendorName: 'Tech Solutions',
      amount: 567.25,
      fee: 17.02,
      netAmount: 550.23,
      status: 'completed',
      type: 'payment',
      paymentMethod: 'digital_wallet',
      reference: 'REF-003-2024',
      description: 'Service payment',
      createdAt: '2024-01-14T16:45:00Z',
      processedAt: '2024-01-14T16:46:00Z'
    },
    {
      id: 'TXN-004',
      vendorId: 'VND-004',
      vendorName: 'Book Store',
      amount: 123.75,
      fee: 3.71,
      netAmount: 120.04,
      status: 'failed',
      type: 'payment',
      paymentMethod: 'card',
      reference: 'REF-004-2024',
      description: 'Book order payment',
      createdAt: '2024-01-14T14:20:00Z',
      failureReason: 'Insufficient funds'
    },
    {
      id: 'TXN-005',
      vendorId: 'VND-001',
      vendorName: 'Coffee Corner',
      amount: 45.00,
      fee: 1.35,
      netAmount: 43.65,
      status: 'refunded',
      type: 'refund',
      paymentMethod: 'card',
      reference: 'REF-005-2024',
      description: 'Refund for cancelled order',
      createdAt: '2024-01-13T11:30:00Z',
      processedAt: '2024-01-13T11:35:00Z'
    }
  ]

  // Filter transactions based on current filters
  const filteredTransactions = mockTransactions.filter(transaction => {
    if (filters.status !== 'all' && transaction.status !== filters.status) return false
    if (filters.type !== 'all' && transaction.type !== filters.type) return false
    if (filters.paymentMethod !== 'all' && transaction.paymentMethod !== filters.paymentMethod) return false
    if (filters.search && !(
      transaction.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.vendorName.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(filters.search.toLowerCase())
    )) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  // Analytics data
  const totalVolume = mockTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalFees = mockTransactions.reduce((sum, t) => sum + t.fee, 0)
  const completedTransactions = mockTransactions.filter(t => t.status === 'completed').length
  const successRate = (completedTransactions / mockTransactions.length) * 100

  // Chart data for transaction trends
  const transactionTrendsOptions = {
    chart: {
      type: 'line' as const,
      height: 300,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 3 },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colors: ['#3B82F6', '#10B981'],
    legend: {
      position: 'top' as const
    }
  }

  const transactionTrendsSeries = [
    {
      name: 'Volume ($)',
      data: [1200, 1800, 1500, 2200, 1900, 2500, 2100]
    },
    {
      name: 'Count',
      data: [15, 22, 18, 28, 24, 32, 26]
    }
  ]

  const statusDistributionOptions = {
    chart: {
      type: 'donut' as const,
      height: 300
    },
    labels: ['Completed', 'Pending', 'Failed', 'Refunded'],
    colors: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
    legend: {
      position: 'bottom' as const
    }
  }

  const statusDistributionSeries = [
    mockTransactions.filter(t => t.status === 'completed').length,
    mockTransactions.filter(t => t.status === 'pending').length,
    mockTransactions.filter(t => t.status === 'failed').length,
    mockTransactions.filter(t => t.status === 'refunded').length
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <HiOutlineCheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <HiOutlineClock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <HiOutlineXCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
        return <HiOutlineArrowPath className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
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
      ['Transaction ID', 'Vendor', 'Amount', 'Fee', 'Net Amount', 'Status', 'Type', 'Payment Method', 'Date'].join(','),
      ...filteredTransactions.map(t => [
        t.id,
        t.vendorName,
        t.amount.toFixed(2),
        t.fee.toFixed(2),
        t.netAmount.toFixed(2),
        t.status,
        t.type,
        t.paymentMethod,
        new Date(t.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage payment transactions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button onClick={handleExport} variant="plain">
            <HiOutlineDocumentArrowDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalVolume.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <HiOutlineCurrencyDollar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalFees.toFixed(2)}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {successRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <HiOutlineCheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockTransactions.filter(t => t.status === 'failed').length}
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
          <h3 className="text-lg font-semibold mb-4">Transaction Trends</h3>
          <Chart
            options={transactionTrendsOptions}
            series={transactionTrendsSeries}
            type="line"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <Chart
            options={statusDistributionOptions}
            series={statusDistributionSeries}
            type="donut"
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
                placeholder="Search transactions..."
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
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value as string })}
            >
              <Select value="all">All Status</Select>
              <Select value="completed">Completed</Select>
              <Select value="pending">Pending</Select>
              <Select value="failed">Failed</Select>
              <Select value="refunded">Refunded</Select>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value as string })}
            >
              <Select value="all">All Types</Select>
              <Select value="payment">Payment</Select>
              <Select value="refund">Refund</Select>
              <Select value="chargeback">Chargeback</Select>
              <Select value="adjustment">Adjustment</Select>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <Select
              value={filters.paymentMethod}
              onChange={(value) => setFilters({ ...filters, paymentMethod: value as string })}
            >
              <Select value="all">All Methods</Select>
              <Select value="card">Card</Select>
              <Select value="bank_transfer">Bank Transfer</Select>
              <Select value="digital_wallet">Digital Wallet</Select>
              <Select value="cash">Cash</Select>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <Select
              value={filters.dateRange}
              onChange={(value) => setFilters({ ...filters, dateRange: value as string })}
            >
              <Select value="7d">Last 7 days</Select>
              <Select value="30d">Last 30 days</Select>
              <Select value="90d">Last 90 days</Select>
              <Select value="1y">Last year</Select>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transactions</h3>
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Transaction</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Fee</th>
                <th className="px-6 py-3">Net Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{transaction.id}</div>
                      <div className="text-sm text-gray-500">{transaction.reference}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{transaction.vendorName}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">${transaction.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">${transaction.fee.toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold">${transaction.netAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <Badge className={getStatusBadgeClass(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{transaction.type}</td>
                  <td className="px-6 py-4 capitalize">{transaction.paymentMethod.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="plain"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <HiOutlineEye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Transaction Details Modal (simplified) */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Transaction Details</h3>
                <Button
                  variant="plain"
                  onClick={() => setSelectedTransaction(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.reference}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.vendorName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedTransaction.status)}
                      <Badge className={getStatusBadgeClass(selectedTransaction.status)}>
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                    <p className="text-sm text-gray-900 dark:text-white">${selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fee</label>
                    <p className="text-sm text-gray-900 dark:text-white">${selectedTransaction.fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Net Amount</label>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">${selectedTransaction.netAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.description}</p>
                </div>
                
                {selectedTransaction.failureReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Failure Reason</label>
                    <p className="text-sm text-red-600">{selectedTransaction.failureReason}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedTransaction.processedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Processed At</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.processedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
