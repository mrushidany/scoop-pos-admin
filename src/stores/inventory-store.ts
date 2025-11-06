import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Product, ProductCategory, ProductStatus } from './types'

interface InventoryState {
  // State
  products: Product[]
  categories: ProductCategory[]
  selectedProduct: Product | null
  selectedCategory: ProductCategory | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    search: string
    category: string
    status: ProductStatus | ''
    vendor: string
    lowStock: boolean
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  stockAlerts: {
    lowStockProducts: Product[]
    outOfStockProducts: Product[]
    alertsEnabled: boolean
  }

  // Actions
  setProducts: (products: Product[]) => void
  setCategories: (categories: ProductCategory[]) => void
  setSelectedProduct: (product: Product | null) => void
  setSelectedCategory: (category: ProductCategory | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (pagination: Partial<InventoryState['pagination']>) => void
  setFilters: (filters: Partial<InventoryState['filters']>) => void
  setStockAlerts: (alerts: Partial<InventoryState['stockAlerts']>) => void
  
  // Product CRUD operations
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  removeProduct: (id: string) => void
  
  // Category CRUD operations
  addCategory: (category: ProductCategory) => void
  updateCategory: (id: string, updates: Partial<ProductCategory>) => void
  removeCategory: (id: string) => void
  
  // Stock management
  updateStock: (productId: string, quantity: number) => void
  adjustStock: (productId: string, adjustment: number) => void
  setStockLevels: (productId: string, minLevel: number, maxLevel: number) => void
  
  // Utility functions
  getProductById: (id: string) => Product | undefined
  getCategoryById: (id: string) => ProductCategory | undefined
  getFilteredProducts: () => Product[]
  getProductsByCategory: (categoryId: string) => Product[]
  getProductsByVendor: (vendorId: string) => Product[]
  getProductsByStatus: (status: ProductStatus) => Product[]
  getLowStockProducts: () => Product[]
  getOutOfStockProducts: () => Product[]
  updateStockAlerts: () => void
  resetFilters: () => void
  clearError: () => void
}

const initialFilters = {
  search: '',
  category: '',
  status: '' as ProductStatus | '',
  vendor: '',
  lowStock: false,
  sortBy: 'name',
  sortOrder: 'asc' as const,
}

const initialPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
}

const initialStockAlerts = {
  lowStockProducts: [],
  outOfStockProducts: [],
  alertsEnabled: true,
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      products: [],
      categories: [],
      selectedProduct: null,
      selectedCategory: null,
      loading: false,
      error: null,
      pagination: initialPagination,
      filters: initialFilters,
      stockAlerts: initialStockAlerts,

      // Basic setters
      setProducts: (products) => {
        set({ products })
        get().updateStockAlerts()
      },
      setCategories: (categories) => set({ categories }),
      setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => 
        set((state) => ({ 
          pagination: { ...state.pagination, ...pagination } 
        })),
      setFilters: (filters) => 
        set((state) => ({ 
          filters: { ...state.filters, ...filters } 
        })),
      setStockAlerts: (alerts) => 
        set((state) => ({ 
          stockAlerts: { ...state.stockAlerts, ...alerts } 
        })),

      // Product CRUD operations
      addProduct: (product) => {
        set((state) => ({ 
          products: [product, ...state.products] 
        }))
        get().updateStockAlerts()
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) => 
            product.id === id ? { ...product, ...updates } : product
          ),
          selectedProduct: state.selectedProduct?.id === id 
            ? { ...state.selectedProduct, ...updates } 
            : state.selectedProduct,
        }))
        get().updateStockAlerts()
      },
      
      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        }))
        get().updateStockAlerts()
      },

      // Category CRUD operations
      addCategory: (category) => 
        set((state) => ({ 
          categories: [category, ...state.categories] 
        })),
      
      updateCategory: (id, updates) => 
        set((state) => ({
          categories: state.categories.map((category) => 
            category.id === id ? { ...category, ...updates } : category
          ),
          selectedCategory: state.selectedCategory?.id === id 
            ? { ...state.selectedCategory, ...updates } 
            : state.selectedCategory,
        })),
      
      removeCategory: (id) => 
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          selectedCategory: state.selectedCategory?.id === id ? null : state.selectedCategory,
        })),

      // Stock management
      updateStock: (productId, quantity) => {
        get().updateProduct(productId, { quantity })
      },
      
      adjustStock: (productId, adjustment) => {
        const product = get().getProductById(productId)
        if (product) {
          const newQuantity = Math.max(0, product.quantity + adjustment)
          get().updateProduct(productId, { 
            quantity: newQuantity,
            updatedAt: new Date().toISOString()
          })
        }
      },
      
      setStockLevels: (productId, minLevel, maxLevel) => {
        get().updateProduct(productId, { 
          minStockLevel: minLevel,
          maxStockLevel: maxLevel
        })
      },

      // Utility functions
      getProductById: (id) => {
        const { products } = get()
        return products.find((product) => product.id === id)
      },
      
      getCategoryById: (id) => {
        const { categories } = get()
        return categories.find((category) => category.id === id)
      },
      
      getFilteredProducts: () => {
        const { products, filters } = get()
        let filtered = [...products]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter((product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.sku.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          )
        }

        // Apply category filter
        if (filters.category) {
          filtered = filtered.filter((product) => product.categoryId === filters.category)
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter((product) => product.status === filters.status)
        }

        // Apply vendor filter
        if (filters.vendor) {
          filtered = filtered.filter((product) => product.vendorId === filters.vendor)
        }

        // Apply low stock filter
        if (filters.lowStock) {
          filtered = filtered.filter((product) => product.quantity <= product.minStockLevel)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: string | number
          let bValue: string | number
          
          switch (filters.sortBy) {
            case 'name':
              aValue = a.name
              bValue = b.name
              break
            case 'price':
              aValue = a.price
              bValue = b.price
              break
            case 'quantity':
              aValue = a.quantity
              bValue = b.quantity
              break
            case 'createdAt':
              aValue = a.createdAt
              bValue = b.createdAt
              break
            case 'updatedAt':
              aValue = a.updatedAt
              bValue = b.updatedAt
              break
            default:
              aValue = a.name
              bValue = b.name
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return filters.sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue)
          }
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        return filtered
      },
      
      getProductsByCategory: (categoryId) => {
        const { products } = get()
        return products.filter((product) => product.categoryId === categoryId)
      },
      
      getProductsByVendor: (vendorId) => {
        const { products } = get()
        return products.filter((product) => product.vendorId === vendorId)
      },
      
      getProductsByStatus: (status) => {
        const { products } = get()
        return products.filter((product) => product.status === status)
      },
      
      getLowStockProducts: () => {
        const { products } = get()
        return products.filter((product) => 
          product.quantity <= product.minStockLevel && product.quantity > 0
        )
      },
      
      getOutOfStockProducts: () => {
        const { products } = get()
        return products.filter((product) => product.quantity === 0)
      },
      
      updateStockAlerts: () => {
        const lowStockProducts = get().getLowStockProducts()
        const outOfStockProducts = get().getOutOfStockProducts()
        
        set((state) => ({
          stockAlerts: {
            ...state.stockAlerts,
            lowStockProducts,
            outOfStockProducts
          }
        }))
      },
      
      resetFilters: () => set({ filters: initialFilters }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'inventory-store',
    }
  )
)