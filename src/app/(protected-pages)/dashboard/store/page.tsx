
'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import SearchAndFilter from '@/components/shared/SearchAndFilter/SearchAndFilter'
import { useInventoryStore } from '@/stores'
import type { AdvancedSearchParams } from '@/services/search-service'
import type { Product, ProductStatus } from '@/stores/types'
import {
  HiOutlineDocumentArrowDown,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineExclamationTriangle,
  HiOutlineArchiveBox,
  HiOutlineCube,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2'

export default function StorePage() {
  const {
    setFilters,
  } = useInventoryStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const itemsPerPage = 10

  // Handle search and filter changes
  const handleSearch = (params: AdvancedSearchParams) => {
    setFilters({
      search: params.search || '',
      status: (typeof params.filters?.status === 'string' ? params.filters.status as ProductStatus | '' : '') || '',
      category: (typeof params.filters?.category === 'string' ? params.filters.category : '') || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    })
    
    setCurrentPage(params.page || 1)
  }

  // Mock inventory data - aligned with Product type
  const mockProducts: Product[] = [
    {
      id: 'PRD-001',
      name: 'Premium Coffee Beans',
      sku: 'COF-001',
      categoryId: 'CAT-001',
      description: 'High-quality arabica coffee beans',
      price: 24.99,
      costPrice: 15.00,
      quantity: 150,
      minStockLevel: 50,
      maxStockLevel: 500,
      status: 'active',
      vendorId: 'VND-001',
      images: [],
      attributes: [],
      variants: [],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'PRD-002',
      name: 'Organic Apples',
      sku: 'FRT-002',
      categoryId: 'CAT-002',
      description: 'Organic red apples from local farms',
      price: 3.99,
      costPrice: 2.50,
      quantity: 25,
      minStockLevel: 30,
      maxStockLevel: 200,
      status: 'active',
      vendorId: 'VND-002',
      images: [],
      attributes: [],
      variants: [],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'PRD-003',
      name: 'Wireless Headphones',
      sku: 'ELC-003',
      categoryId: 'CAT-003',
      description: 'Bluetooth wireless headphones with noise cancellation',
      price: 199.99,
      costPrice: 120.00,
      quantity: 45,
      minStockLevel: 20,
      maxStockLevel: 100,
      status: 'active',
      vendorId: 'VND-003',
      images: [],
      attributes: [],
      variants: [],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'PRD-004',
      name: 'Classic Novel Collection',
      sku: 'BOK-004',
      categoryId: 'CAT-004',
      description: 'Collection of 10 classic novels',
      price: 89.99,
      costPrice: 55.00,
      quantity: 8,
      minStockLevel: 15,
      maxStockLevel: 50,
      status: 'active',
      vendorId: 'VND-004',
      images: [],
      attributes: [],
      variants: [],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'PRD-005',
      name: 'Vintage T-Shirt',
      sku: 'CLT-005',
      categoryId: 'CAT-005',
      description: 'Vintage style cotton t-shirt',
      price: 29.99,
      costPrice: 18.00,
      quantity: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      status: 'out_of_stock',
      vendorId: 'VND-005',
      images: [],
      attributes: [],
      variants: [],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ]

  // Use mock data for now
  const displayProducts = mockProducts

  // Pagination
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = displayProducts.slice(startIndex, endIndex)

  // Stock status helpers
  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return 'Out of Stock'
    if (product.quantity <= product.minStockLevel) return 'Low Stock'
    return 'In Stock'
  }

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'SKU', 'Category', 'Stock', 'Price', 'Status'].join(','),
      ...displayProducts.map(product => [
        product.name,
        product.sku,
        product.categoryId,
        product.quantity,
        `$${product.price}`,
        product.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate inventory metrics
  const totalProducts = displayProducts.length
  const lowStockProducts = displayProducts.filter(p => p.quantity <= p.minStockLevel && p.quantity > 0).length
  const outOfStockProducts = displayProducts.filter(p => p.quantity === 0).length
  const totalValue = displayProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Inventory Management</h1>
          <p className='text-gray-600 mt-1'>Manage your product inventory and stock levels</p>
        </div>
        <div className='flex space-x-3'>
          <Button onClick={handleExport} variant='default'>
            <HiOutlineDocumentArrowDown className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <HiOutlinePlus className='h-4 w-4 mr-2' />
            Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <HiOutlineCube className='h-6 w-6 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Products</p>
              <p className='text-2xl font-bold text-gray-900'>{totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 rounded-lg'>
              <HiOutlineExclamationTriangle className='h-6 w-6 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Low Stock</p>
              <p className='text-2xl font-bold text-gray-900'>{lowStockProducts}</p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-red-100 rounded-lg'>
              <HiOutlineArchiveBox className='h-6 w-6 text-red-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Out of Stock</p>
              <p className='text-2xl font-bold text-gray-900'>{outOfStockProducts}</p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <HiOutlineChartBarSquare className='h-6 w-6 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Value</p>
              <p className='text-2xl font-bold text-gray-900'>${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='p-6'>
        <SearchAndFilter
          module='inventory'
          onSearch={handleSearch}
          placeholder='Search products by name or SKU...'
        />
      </Card>

      {/* Products Table */}
      <Card>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  SKU
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Stock
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {currentProducts.map((product) => (
                <tr key={product.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        <div className='h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center'>
                          <HiOutlineCube className='h-5 w-5 text-gray-500' />
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>{product.name}</div>
                        <div className='text-sm text-gray-500'>{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {product.sku}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <Badge>{product.categoryId}</Badge>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center space-x-2'>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.quantity <= product.minStockLevel ? 'bg-red-100 text-red-800' :
                        product.quantity <= product.minStockLevel * 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity} units
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    ${product.price}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <Badge>
                      {getStockStatus(product)}
                    </Badge>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <Button
                        variant='plain'
                        size='sm'
                        onClick={() => setSelectedProduct(product)}
                      >
                        <HiOutlineEye className='h-4 w-4' />
                      </Button>
                      <Button variant='plain' size='sm'>
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
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200'>
            <Pagination
              currentPage={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>Product Details</h2>
              <Button
                variant='plain'
                size='sm'
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </Button>
            </div>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Product Name</label>
                <p className='text-sm text-gray-900'>{selectedProduct.name}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>SKU</label>
                <p className='text-sm text-gray-900'>{selectedProduct.sku}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                <p className='text-sm text-gray-900'>{selectedProduct.description}</p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Category</label>
                  <p className='text-sm text-gray-900'>{selectedProduct.categoryId}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                  <p className='text-sm text-gray-900'>{selectedProduct.status}</p>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Current Stock</label>
                  <p className='text-sm text-gray-900'>{selectedProduct.quantity} units</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Min Stock</label>
                  <p className='text-sm text-gray-900'>{selectedProduct.minStockLevel} units</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Max Stock</label>
                  <p className='text-sm text-gray-900'>{selectedProduct.maxStockLevel} units</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
                  <p className='text-sm text-gray-900'>${selectedProduct.price}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Cost Price</label>
                  <p className='text-sm text-gray-900'>${selectedProduct.costPrice}</p>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vendor ID</label>
                <p className='text-sm text-gray-900'>{selectedProduct.vendorId}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Last Updated</label>
                <p className='text-sm text-gray-900'>
                  {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>Add New Product</h2>
              <Button
                variant='plain'
                size='sm'
                onClick={() => setShowAddModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className='space-y-4'>
              <p className='text-gray-600'>Add product functionality would be implemented here.</p>
              <div className='flex justify-end space-x-3'>
                <Button variant='plain' onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddModal(false)}>
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
