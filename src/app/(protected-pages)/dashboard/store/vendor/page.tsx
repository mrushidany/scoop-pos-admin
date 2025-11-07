
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
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface VendorContact {
  name: string
  email: string
  phone: string
  role: string
}

interface VendorDocument {
  id: string
  name: string
  type: 'business_license' | 'tax_certificate' | 'insurance' | 'contract' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
  expiryDate?: string
}

interface Vendor {
  id: string
  name: string
  businessType: 'manufacturer' | 'distributor' | 'supplier' | 'service_provider'
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'blacklisted'
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected'
  email: string
  phone: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contacts: VendorContact[]
  documents: VendorDocument[]
  taxId: string
  businessLicense: string
  paymentTerms: string
  creditLimit: number
  currentBalance: number
  totalOrders: number
  totalSpent: number
  rating: number
  notes?: string
  createdAt: string
  updatedAt: string
  lastOrderDate?: string
}

interface VendorFilters {
  status: string
  verificationStatus: string
  businessType: string
  search: string
}

export default function VendorPage() {
  const [filters, setFilters] = useState<VendorFilters>({
    status: 'all',
    verificationStatus: 'all',
    businessType: 'all',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const itemsPerPage = 10

  // Mock vendors data
  const mockVendors: Vendor[] = [
    {
      id: 'VEN-001',
      name: 'Global Tech Solutions',
      businessType: 'supplier',
      status: 'active',
      verificationStatus: 'verified',
      email: 'contact@globaltech.com',
      phone: '+1-555-0101',
      website: 'https://globaltech.com',
      address: {
        street: '123 Tech Park Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      },
      contacts: [
        {
          name: 'John Smith',
          email: 'john.smith@globaltech.com',
          phone: '+1-555-0102',
          role: 'Sales Manager'
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@globaltech.com',
          phone: '+1-555-0103',
          role: 'Account Manager'
        }
      ],
      documents: [
        {
          id: 'DOC-001',
          name: 'Business License',
          type: 'business_license',
          status: 'approved',
          uploadedAt: '2024-01-10T10:00:00Z',
          expiryDate: '2025-01-10T00:00:00Z'
        },
        {
          id: 'DOC-002',
          name: 'Tax Certificate',
          type: 'tax_certificate',
          status: 'approved',
          uploadedAt: '2024-01-10T10:30:00Z',
          expiryDate: '2024-12-31T00:00:00Z'
        }
      ],
      taxId: 'TAX-123456789',
      businessLicense: 'BL-987654321',
      paymentTerms: 'Net 30',
      creditLimit: 50000,
      currentBalance: 12500,
      totalOrders: 45,
      totalSpent: 125000,
      rating: 4.8,
      notes: 'Reliable supplier with excellent quality products',
      createdAt: '2023-06-15T09:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      lastOrderDate: '2024-01-15T10:00:00Z'
    },
    {
      id: 'VEN-002',
      name: 'Fresh Foods Distributors',
      businessType: 'distributor',
      status: 'active',
      verificationStatus: 'verified',
      email: 'orders@freshfoods.com',
      phone: '+1-555-0201',
      website: 'https://freshfoods.com',
      address: {
        street: '456 Market Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      contacts: [
        {
          name: 'Mike Wilson',
          email: 'mike.wilson@freshfoods.com',
          phone: '+1-555-0202',
          role: 'Distribution Manager'
        }
      ],
      documents: [
        {
          id: 'DOC-003',
          name: 'Food Safety Certificate',
          type: 'other',
          status: 'approved',
          uploadedAt: '2024-01-12T11:00:00Z',
          expiryDate: '2024-12-31T00:00:00Z'
        }
      ],
      taxId: 'TAX-987654321',
      businessLicense: 'BL-123456789',
      paymentTerms: 'Net 15',
      creditLimit: 25000,
      currentBalance: 8750,
      totalOrders: 32,
      totalSpent: 87500,
      rating: 4.5,
      createdAt: '2023-08-20T10:30:00Z',
      updatedAt: '2024-01-17T16:45:00Z',
      lastOrderDate: '2024-01-12T14:20:00Z'
    },
    {
      id: 'VEN-003',
      name: 'Manufacturing Plus',
      businessType: 'manufacturer',
      status: 'pending',
      verificationStatus: 'pending',
      email: 'info@mfgplus.com',
      phone: '+1-555-0301',
      address: {
        street: '789 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      contacts: [
        {
          name: 'Lisa Chen',
          email: 'lisa.chen@mfgplus.com',
          phone: '+1-555-0302',
          role: 'Operations Manager'
        }
      ],
      documents: [
        {
          id: 'DOC-004',
          name: 'Business Registration',
          type: 'business_license',
          status: 'pending',
          uploadedAt: '2024-01-18T09:00:00Z'
        }
      ],
      taxId: 'TAX-456789123',
      businessLicense: 'BL-654321987',
      paymentTerms: 'Net 45',
      creditLimit: 75000,
      currentBalance: 0,
      totalOrders: 0,
      totalSpent: 0,
      rating: 0,
      notes: 'New vendor pending verification',
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-18T09:00:00Z'
    },
    {
      id: 'VEN-004',
      name: 'Service Pro Solutions',
      businessType: 'service_provider',
      status: 'inactive',
      verificationStatus: 'verified',
      email: 'contact@servicepro.com',
      phone: '+1-555-0401',
      website: 'https://servicepro.com',
      address: {
        street: '321 Service Lane',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'USA'
      },
      contacts: [
        {
          name: 'David Brown',
          email: 'david.brown@servicepro.com',
          phone: '+1-555-0402',
          role: 'Service Director'
        }
      ],
      documents: [
        {
          id: 'DOC-005',
          name: 'Service License',
          type: 'business_license',
          status: 'approved',
          uploadedAt: '2023-12-01T10:00:00Z',
          expiryDate: '2024-12-01T00:00:00Z'
        }
      ],
      taxId: 'TAX-789123456',
      businessLicense: 'BL-321654987',
      paymentTerms: 'Net 30',
      creditLimit: 30000,
      currentBalance: 5000,
      totalOrders: 18,
      totalSpent: 45000,
      rating: 4.2,
      notes: 'Currently inactive due to capacity issues',
      createdAt: '2023-09-10T11:15:00Z',
      updatedAt: '2024-01-05T13:20:00Z',
      lastOrderDate: '2023-12-20T16:30:00Z'
    },
    {
      id: 'VEN-005',
      name: 'Quality Supplies Inc',
      businessType: 'supplier',
      status: 'suspended',
      verificationStatus: 'rejected',
      email: 'admin@qualitysupplies.com',
      phone: '+1-555-0501',
      address: {
        street: '654 Supply Road',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      contacts: [
        {
          name: 'Robert Taylor',
          email: 'robert.taylor@qualitysupplies.com',
          phone: '+1-555-0502',
          role: 'General Manager'
        }
      ],
      documents: [
        {
          id: 'DOC-006',
          name: 'Business License',
          type: 'business_license',
          status: 'rejected',
          uploadedAt: '2024-01-08T14:00:00Z'
        }
      ],
      taxId: 'TAX-321654987',
      businessLicense: 'BL-789456123',
      paymentTerms: 'Net 30',
      creditLimit: 20000,
      currentBalance: 15000,
      totalOrders: 12,
      totalSpent: 35000,
      rating: 2.8,
      notes: 'Suspended due to quality issues and failed verification',
      createdAt: '2023-11-05T08:45:00Z',
      updatedAt: '2024-01-08T15:30:00Z',
      lastOrderDate: '2024-01-05T11:15:00Z'
    }
  ]

  // Filter vendors based on current filters
  const filteredVendors = mockVendors.filter(vendor => {
    if (filters.status !== 'all' && vendor.status !== filters.status) return false
    if (filters.verificationStatus !== 'all' && vendor.verificationStatus !== filters.verificationStatus) return false
    if (filters.businessType !== 'all' && vendor.businessType !== filters.businessType) return false
    if (filters.search && !(
      vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.taxId.toLowerCase().includes(filters.search.toLowerCase())
    )) return false
    return true
  })

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage)

  // Analytics data
  const totalVendors = mockVendors.length
  const activeVendors = mockVendors.filter(v => v.status === 'active').length
  const verifiedVendors = mockVendors.filter(v => v.verificationStatus === 'verified').length
  const pendingVerification = mockVendors.filter(v => v.verificationStatus === 'pending').length

  // Chart data for vendor status distribution
  const statusDistributionOptions = {
    chart: {
      type: 'donut' as const,
      height: 300
    },
    labels: ['Active', 'Inactive', 'Pending', 'Suspended', 'Blacklisted'],
    colors: ['#10B981', '#6B7280', '#F59E0B', '#EF4444', '#7C2D12'],
    legend: {
      position: 'bottom' as const
    }
  }

  const statusDistributionSeries = [
    mockVendors.filter(v => v.status === 'active').length,
    mockVendors.filter(v => v.status === 'inactive').length,
    mockVendors.filter(v => v.status === 'pending').length,
    mockVendors.filter(v => v.status === 'suspended').length,
    mockVendors.filter(v => v.status === 'blacklisted').length
  ]

  // Verification status chart
  const verificationOptions = {
    chart: {
      type: 'bar' as const,
      height: 300,
      toolbar: { show: false }
    },
    xaxis: {
      categories: ['Unverified', 'Pending', 'Verified', 'Rejected']
    },
    colors: ['#10B981'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false
      }
    }
  }

  const verificationSeries = [{
    name: 'Vendors',
    data: [
      mockVendors.filter(v => v.verificationStatus === 'unverified').length,
      mockVendors.filter(v => v.verificationStatus === 'pending').length,
      mockVendors.filter(v => v.verificationStatus === 'verified').length,
      mockVendors.filter(v => v.verificationStatus === 'rejected').length
    ]
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
      case 'blacklisted':
        return 'bg-red-900 text-red-100'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerificationBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'unverified':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Vendor ID', 'Name', 'Business Type', 'Status', 'Verification', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Rating'].join(','),
      ...filteredVendors.map(v => [
        v.id,
        v.name,
        v.businessType,
        v.status,
        v.verificationStatus,
        v.email,
        v.phone,
        v.totalOrders.toString(),
        v.totalSpent.toFixed(2),
        v.rating.toString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Vendor Management</h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Manage vendor relationships, verification, and performance
          </p>
        </div>
        <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
          <Button onClick={handleExport} variant='plain'>
            <HiOutlineDocumentArrowDown className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <HiOutlinePlus className='h-4 w-4 mr-2' />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Total Vendors</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {totalVendors}
              </p>
            </div>
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
              <HiOutlineBuildingOffice2 className='h-6 w-6 text-blue-600' />
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Active Vendors</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {activeVendors}
              </p>
            </div>
            <div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <HiOutlineCheckCircle className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Verified Vendors</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {verifiedVendors}
              </p>
            </div>
            <div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
              <HiOutlineShieldCheck className='h-6 w-6 text-green-600' />
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Pending Verification</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {pendingVerification}
              </p>
            </div>
            <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
              <HiOutlineClock className='h-6 w-6 text-yellow-600' />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Vendor Status Distribution</h3>
          <Chart
            options={statusDistributionOptions}
            series={statusDistributionSeries}
            type='donut'
            height={300}
          />
        </Card>

        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Verification Status</h3>
          <Chart
            options={verificationOptions}
            series={verificationSeries}
            type='bar'
            height={300}
          />
        </Card>
      </div>

      {/* Filters */}
      <Card className='p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Search
            </label>
            <div className='relative'>
              <HiOutlineMagnifyingGlass className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Search vendors...'
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className='pl-10'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Status
            </label>
            <Select
              value={{ value: filters.status, label: filters.status === 'all' ? 'All Status' : filters.status }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, status: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'blacklisted', label: 'Blacklisted' }
              ]}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Verification Status
            </label>
            <Select
              value={{ value: filters.verificationStatus, label: filters.verificationStatus === 'all' ? 'All Verification' : filters.verificationStatus }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, verificationStatus: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Verification' },
                { value: 'unverified', label: 'Unverified' },
                { value: 'pending', label: 'Pending' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' }
              ]}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Business Type
            </label>
            <Select
              value={{ value: filters.businessType, label: filters.businessType === 'all' ? 'All Types' : filters.businessType.replace('_', ' ') }}
              onChange={(option: { value: string; label: string } | null) => setFilters({ ...filters, businessType: option?.value || 'all' })}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'manufacturer', label: 'Manufacturer' },
                { value: 'distributor', label: 'Distributor' },
                { value: 'supplier', label: 'Supplier' },
                { value: 'service_provider', label: 'Service Provider' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Vendors Table */}
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>Vendors</h3>
          <p className='text-sm text-gray-500'>
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredVendors.length)} of {filteredVendors.length} vendors
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
              <tr>
                <th className='px-6 py-3'>Vendor</th>
                <th className='px-6 py-3'>Business Type</th>
                <th className='px-6 py-3'>Status</th>
                <th className='px-6 py-3'>Verification</th>
                <th className='px-6 py-3'>Contact</th>
                <th className='px-6 py-3'>Orders</th>
                <th className='px-6 py-3'>Rating</th>
                <th className='px-6 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.map((vendor) => (
                <tr key={vendor.id} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'>
                  <td className='px-6 py-4'>
                    <div>
                      <div className='font-medium text-gray-900 dark:text-white'>{vendor.name}</div>
                      <div className='text-sm text-gray-500'>{vendor.id}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span className='text-sm text-gray-900 dark:text-white capitalize'>
                      {vendor.businessType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <Badge className={getStatusBadgeClass(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </td>
                  <td className='px-6 py-4'>
                    <Badge className={getVerificationBadgeClass(vendor.verificationStatus)}>
                      {vendor.verificationStatus}
                    </Badge>
                  </td>
                  <td className='px-6 py-4'>
                    <div>
                      <div className='text-sm text-gray-900 dark:text-white'>{vendor.email}</div>
                      <div className='text-sm text-gray-500'>{vendor.phone}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>{vendor.totalOrders}</div>
                      <div className='text-sm text-gray-500'>${vendor.totalSpent.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white mr-1'>
                        {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}
                      </span>
                      {vendor.rating > 0 && (
                        <div className='flex'>
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='plain'
                        size='sm'
                        onClick={() => setSelectedVendor(vendor)}
                      >
                        <HiOutlineEye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='plain'
                        size='sm'
                      >
                        <HiOutlinePencil className='h-4 w-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredVendors.length > itemsPerPage && (
          <div className='mt-6 flex justify-center'>
            <Pagination
              currentPage={currentPage}
              total={filteredVendors.length}
              pageSize={itemsPerPage}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold'>Vendor Details</h3>
                <Button
                  variant='plain'
                  onClick={() => setSelectedVendor(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Basic Information */}
                <div className='lg:col-span-2 space-y-6'>
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Basic Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Company Name</label>
                        <p className='text-lg font-semibold text-gray-900 dark:text-white'>{selectedVendor.name}</p>
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Business Type</label>
                        <p className='text-sm text-gray-900 dark:text-white capitalize'>
                          {selectedVendor.businessType.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Status</label>
                        <Badge className={getStatusBadgeClass(selectedVendor.status)}>
                          {selectedVendor.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Verification Status</label>
                        <Badge className={getVerificationBadgeClass(selectedVendor.verificationStatus)}>
                          {selectedVendor.verificationStatus}
                        </Badge>
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Tax ID</label>
                        <p className='text-sm text-gray-900 dark:text-white'>{selectedVendor.taxId}</p>
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Business License</label>
                        <p className='text-sm text-gray-900 dark:text-white'>{selectedVendor.businessLicense}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Contact Information</h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='flex items-center space-x-2'>
                        <HiOutlineEnvelope className='h-4 w-4 text-gray-400' />
                        <span className='text-sm text-gray-900 dark:text-white'>{selectedVendor.email}</span>
                      </div>
                      
                      <div className='flex items-center space-x-2'>
                        <HiOutlinePhone className='h-4 w-4 text-gray-400' />
                        <span className='text-sm text-gray-900 dark:text-white'>{selectedVendor.phone}</span>
                      </div>
                      
                      {selectedVendor.website && (
                        <div className='flex items-center space-x-2'>
                          <HiOutlineGlobeAlt className='h-4 w-4 text-gray-400' />
                          <a href={selectedVendor.website} target='_blank' rel='noopener noreferrer' className='text-sm text-blue-600 hover:underline'>
                            {selectedVendor.website}
                          </a>
                        </div>
                      )}
                      
                      <div className='flex items-start space-x-2'>
                        <HiOutlineMapPin className='h-4 w-4 text-gray-400 mt-0.5' />
                        <div className='text-sm text-gray-900 dark:text-white'>
                          <p>{selectedVendor.address.street}</p>
                          <p>{selectedVendor.address.city}, {selectedVendor.address.state} {selectedVendor.address.zipCode}</p>
                          <p>{selectedVendor.address.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Persons */}
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Contact Persons</h4>
                    <div className='space-y-3'>
                      {selectedVendor.contacts.map((contact, index) => (
                        <div key={index} className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>{contact.name}</p>
                              <p className='text-sm text-gray-500'>{contact.role}</p>
                            </div>
                            <div>
                              <p className='text-sm text-gray-900 dark:text-white'>{contact.email}</p>
                              <p className='text-sm text-gray-500'>{contact.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Documents */}
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Documents</h4>
                    <div className='space-y-3'>
                      {selectedVendor.documents.map((doc) => (
                        <div key={doc.id} className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                          <div className='flex items-center space-x-3'>
                            <HiOutlineDocumentText className='h-5 w-5 text-gray-400' />
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>{doc.name}</p>
                              <p className='text-sm text-gray-500 capitalize'>{doc.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <Badge className={getDocumentStatusBadgeClass(doc.status)}>
                              {doc.status}
                            </Badge>
                            {doc.expiryDate && (
                              <p className='text-xs text-gray-500 mt-1'>
                                Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedVendor.notes && (
                    <div>
                      <h4 className='text-md font-semibold mb-4'>Notes</h4>
                      <p className='text-sm text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        {selectedVendor.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Financial & Performance */}
                <div className='space-y-6'>
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Financial Information</h4>
                    <div className='space-y-4'>
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Payment Terms</label>
                        <p className='text-lg font-semibold text-gray-900 dark:text-white'>{selectedVendor.paymentTerms}</p>
                      </div>
                      
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Credit Limit</label>
                        <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                          ${selectedVendor.creditLimit.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Current Balance</label>
                        <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                          ${selectedVendor.currentBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Performance Metrics</h4>
                    <div className='space-y-4'>
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Total Orders</label>
                        <p className='text-lg font-semibold text-gray-900 dark:text-white'>{selectedVendor.totalOrders}</p>
                      </div>
                      
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Total Spent</label>
                        <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                          ${selectedVendor.totalSpent.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Rating</label>
                        <div className='flex items-center space-x-2'>
                          <span className='text-lg font-semibold text-gray-900 dark:text-white'>
                            {selectedVendor.rating > 0 ? selectedVendor.rating.toFixed(1) : 'N/A'}
                          </span>
                          {selectedVendor.rating > 0 && (
                            <div className='flex'>
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < Math.floor(selectedVendor.rating) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedVendor.lastOrderDate && (
                        <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Last Order</label>
                          <p className='text-sm text-gray-900 dark:text-white'>
                            {new Date(selectedVendor.lastOrderDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className='text-md font-semibold mb-4'>Timeline</h4>
                    <div className='space-y-3'>
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Created</label>
                        <p className='text-sm text-gray-900 dark:text-white'>
                          {new Date(selectedVendor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>Last Updated</label>
                        <p className='text-sm text-gray-900 dark:text-white'>
                          {new Date(selectedVendor.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='mt-6 flex justify-end space-x-3'>
                <Button variant='plain' onClick={() => setSelectedVendor(null)}>
                  Close
                </Button>
                <Button>
                  Edit Vendor
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Vendor Modal (simplified placeholder) */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='max-w-2xl w-full mx-4'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>Add New Vendor</h3>
                <Button
                  variant='plain'
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className='text-center py-8'>
                <HiOutlineUserGroup className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>Vendor registration form would be implemented here</p>
                <p className='text-sm text-gray-400 mt-2'>This would include company details, contact information, document upload, etc.</p>
              </div>
              
              <div className='flex justify-end space-x-3'>
                <Button variant='plain' onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Add Vendor
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
