import React from 'react'
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/DataTable/DataTable'
import { Badge, Avatar, Button } from '@/components/ui'
import { PiEyeBold, PiPencilBold, PiTrashBold, PiStorefrontBold, PiCheckCircleBold, PiXCircleBold } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import type { Vendor } from '@/stores/types'

interface VendorManagementProps {
  onCreateVendor?: () => void
  onEditVendor?: (vendor: Vendor) => void
  onDeleteVendor?: (vendor: Vendor) => void
  onViewVendor?: (vendor: Vendor) => void
  onApproveVendor?: (vendor: Vendor) => void
  onRejectVendor?: (vendor: Vendor) => void
}

export const VendorManagement: React.FC<VendorManagementProps> = ({
  onCreateVendor,
  onEditVendor,
  onDeleteVendor,
  onViewVendor,
  onApproveVendor,
  onRejectVendor,
}) => {
  const router = useRouter()

  // Define table columns
  const columns: DataTableColumn<Vendor>[] = [
    {
      key: 'logo',
      title: '',
      width: 60,
      render: (_, record) => (
        <Avatar
          size="sm"
          alt={record.businessName}
          className="h-8 w-8"
        >
          {record.businessName.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      key: 'businessInfo',
      title: 'Business',
      dataIndex: 'businessName',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {record.contactEmail}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {record.businessType}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {record.contactEmail}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {record.contactPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'businessType',
      title: 'Business Type',
      dataIndex: 'businessType',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          {value}
        </Badge>
      ),
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
            icon: PiCheckCircleBold,
          },
          pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            icon: null,
          },
          suspended: {
            label: 'Suspended',
            className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            icon: PiXCircleBold,
          },
          inactive: {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            icon: PiXCircleBold,
          },
        }
        
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending
        const Icon = config.icon
        
        return (
          <Badge className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            {Icon && <Icon className="h-3 w-3" />}
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: 'location',
      title: 'Location',
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-gray-100">
            {record.address?.city}, {record.address?.state}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {record.address?.country}
          </div>
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      title: 'Verification',
      dataIndex: 'verificationStatus',
      sortable: true,
      filterable: true,
      render: (value) => {
        const verificationConfig = {
          verified: {
            label: 'Verified',
            className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            icon: PiCheckCircleBold,
          },
          pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            icon: null,
          },
          under_review: {
            label: 'Under Review',
            className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            icon: null,
          },
          rejected: {
            label: 'Rejected',
            className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            icon: PiXCircleBold,
          },
        }
        
        const config = verificationConfig[value as keyof typeof verificationConfig] || verificationConfig.pending
        const Icon = config.icon
        
        return (
          <Badge className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            {Icon && <Icon className="h-3 w-3" />}
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: 'commissionRate',
      title: 'Commission',
      dataIndex: 'commissionRate',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {(value * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'joinedDate',
      title: 'Joined',
      dataIndex: 'createdAt',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  // Define table actions
  const actions: DataTableAction<Vendor>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: PiEyeBold,
      onClick: (vendor) => {
        if (onViewVendor) {
          onViewVendor(vendor)
        } else {
          router.push(`/vendors/${vendor.id}`)
        }
      },
    },
    {
      key: 'approve',
      label: 'Approve Vendor',
      icon: PiCheckCircleBold,
      variant: 'solid',
      onClick: (vendor) => {
        if (onApproveVendor) {
          onApproveVendor(vendor)
        }
      },
      hidden: (vendor) => vendor.verificationStatus !== 'pending' && vendor.verificationStatus !== 'under_review',
    },
    {
      key: 'reject',
      label: 'Reject Vendor',
      icon: PiXCircleBold,
      variant: 'plain',
      onClick: (vendor) => {
        if (onRejectVendor) {
          onRejectVendor(vendor)
        }
      },
      hidden: (vendor) => vendor.verificationStatus !== 'pending' && vendor.verificationStatus !== 'under_review',
    },
    {
      key: 'edit',
      label: 'Edit Vendor',
      icon: PiPencilBold,
      onClick: (vendor) => {
        if (onEditVendor) {
          onEditVendor(vendor)
        } else {
          router.push(`/vendors/${vendor.id}/edit`)
        }
      },
      hidden: (vendor) => vendor.verificationStatus === 'pending' || vendor.verificationStatus === 'rejected',
    },
    {
      key: 'delete',
      label: 'Delete Vendor',
      icon: PiTrashBold,
      variant: 'plain',
      onClick: (vendor) => {
        if (onDeleteVendor) {
          onDeleteVendor(vendor)
        }
      },
      disabled: (vendor) => vendor.status === 'active',
    },
  ]

  // Handle data export
  const handleExport = (vendors: Vendor[]) => {
    const csvData = vendors.map(vendor => ({
      'Business Name': vendor.businessName,
      'Business Type': vendor.businessType,
      'Email': vendor.contactEmail,
      'Phone': vendor.contactPhone,
      'Verification Status': vendor.verificationStatus,
      'Status': vendor.status,
      'City': vendor.address?.city || '',
      'State': vendor.address?.state || '',
      'Country': vendor.address?.country || '',
      'Commission Rate': `${(vendor.commissionRate * 100).toFixed(1)}%`,
      'Tax ID': vendor.taxId || 'N/A',
      'Joined Date': new Date(vendor.createdAt).toLocaleString(),
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
    link.setAttribute('download', `vendors-export-${new Date().toISOString().split('T')[0]}.csv`)
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
            Vendor Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage vendor partnerships, approvals, and business relationships
          </p>
        </div>
        
        {onCreateVendor && (
          <Button onClick={onCreateVendor} className="flex items-center gap-2">
            <PiStorefrontBold className="h-4 w-4" />
            Add Vendor
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        module="vendors"
        columns={columns}
        actions={actions}
        title="Vendors"
        description="Search and filter vendors by business name, category, status, location, rating, and more"
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
          filters: {
            status: ['active', 'pending'], // Show active and pending by default
          },
        }}
        emptyStateMessage="No vendors found"
        emptyStateDescription="Start building your vendor network by adding your first business partner"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
      />
    </div>
  )
}

export default VendorManagement