import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Vendor, VendorStatus, VerificationStatus } from './types'

interface VendorState {
  // State
  vendors: Vendor[]
  selectedVendor: Vendor | null
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
    status: VendorStatus | ''
    verificationStatus: VerificationStatus | ''
    businessType: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  onboardingData: {
    currentVendorId: string | null
    currentStep: number
    formData: Record<string, any>
  }

  // Actions
  setVendors: (vendors: Vendor[]) => void
  setSelectedVendor: (vendor: Vendor | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (pagination: Partial<VendorState['pagination']>) => void
  setFilters: (filters: Partial<VendorState['filters']>) => void
  setOnboardingData: (data: Partial<VendorState['onboardingData']>) => void
  
  // Vendor CRUD operations
  addVendor: (vendor: Vendor) => void
  updateVendor: (id: string, updates: Partial<Vendor>) => void
  removeVendor: (id: string) => void
  
  // Vendor operations
  approveVendor: (id: string) => void
  rejectVendor: (id: string, reason: string) => void
  suspendVendor: (id: string, reason: string) => void
  activateVendor: (id: string) => void
  updateVerificationStatus: (id: string, status: VerificationStatus) => void
  updateOnboardingProgress: (id: string, step: number, completedSteps: string[]) => void
  
  // Utility functions
  getVendorById: (id: string) => Vendor | undefined
  getFilteredVendors: () => Vendor[]
  getVendorsByStatus: (status: VendorStatus) => Vendor[]
  getVendorsByVerificationStatus: (status: VerificationStatus) => Vendor[]
  getPendingVendors: () => Vendor[]
  getActiveVendors: () => Vendor[]
  resetFilters: () => void
  clearError: () => void
  resetOnboarding: () => void
}

const initialFilters = {
  search: '',
  status: '' as VendorStatus | '',
  verificationStatus: '' as VerificationStatus | '',
  businessType: '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
}

const initialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const initialOnboardingData = {
  currentVendorId: null,
  currentStep: 1,
  formData: {},
}

export const useVendorStore = create<VendorState>()(devtools(
  (set, get) => ({
      // Initial state
      vendors: [],
      selectedVendor: null,
      loading: false,
      error: null,
      pagination: initialPagination,
      filters: initialFilters,
      onboardingData: initialOnboardingData,

      // Basic setters
      setVendors: (vendors) => set({ vendors }),
      setSelectedVendor: (selectedVendor) => set({ selectedVendor }),
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
      setOnboardingData: (data) => 
        set((state) => ({ 
          onboardingData: { ...state.onboardingData, ...data } 
        })),

      // Vendor CRUD operations
      addVendor: (vendor) => 
        set((state) => ({ 
          vendors: [vendor, ...state.vendors] 
        })),
      
      updateVendor: (id, updates) => 
        set((state) => ({
          vendors: state.vendors.map((vendor) => 
            vendor.id === id ? { ...vendor, ...updates } : vendor
          ),
          selectedVendor: state.selectedVendor?.id === id 
            ? { ...state.selectedVendor, ...updates } 
            : state.selectedVendor,
        })),
      
      removeVendor: (id) => 
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== id),
          selectedVendor: state.selectedVendor?.id === id ? null : state.selectedVendor,
        })),

      // Vendor operations
      approveVendor: (id) => {
        const { updateVendor } = get()
        updateVendor(id, { 
          status: 'active', 
          verificationStatus: 'verified',
          updatedAt: new Date().toISOString()
        })
      },
      
      rejectVendor: (id, reason) => {
        const { updateVendor } = get()
        updateVendor(id, { 
          status: 'inactive', 
          verificationStatus: 'rejected',
          updatedAt: new Date().toISOString()
        })
      },
      
      suspendVendor: (id, reason) => {
        const { updateVendor } = get()
        updateVendor(id, { 
          status: 'suspended',
          updatedAt: new Date().toISOString()
        })
      },
      
      activateVendor: (id) => {
        const { updateVendor } = get()
        updateVendor(id, { 
          status: 'active',
          updatedAt: new Date().toISOString()
        })
      },
      
      updateVerificationStatus: (id, verificationStatus) => {
        const { updateVendor } = get()
        updateVendor(id, { 
          verificationStatus,
          updatedAt: new Date().toISOString()
        })
      },
      
      updateOnboardingProgress: (id, step, completedSteps) => {
        const { updateVendor } = get()
        const totalSteps = 5 // Assuming 5 onboarding steps
        updateVendor(id, {
          onboardingProgress: {
            currentStep: step,
            totalSteps,
            completedSteps,
            isCompleted: completedSteps.length === totalSteps
          },
          updatedAt: new Date().toISOString()
        })
      },

      // Utility functions
      getVendorById: (id) => {
        const { vendors } = get()
        return vendors.find((vendor) => vendor.id === id)
      },
      
      getFilteredVendors: () => {
        const { vendors, filters } = get()
        let filtered = [...vendors]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            (vendor) =>
              vendor.businessName.toLowerCase().includes(searchLower) ||
              vendor.contactEmail.toLowerCase().includes(searchLower) ||
              vendor.businessType.toLowerCase().includes(searchLower)
          )
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter((vendor) => vendor.status === filters.status)
        }

        // Apply verification status filter
        if (filters.verificationStatus) {
          filtered = filtered.filter((vendor) => vendor.verificationStatus === filters.verificationStatus)
        }

        // Apply business type filter
        if (filters.businessType) {
          filtered = filtered.filter((vendor) => vendor.businessType === filters.businessType)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof Vendor] as string
          const bValue = b[filters.sortBy as keyof Vendor] as string
          
          if (filters.sortOrder === 'asc') {
            return aValue.localeCompare(bValue)
          } else {
            return bValue.localeCompare(aValue)
          }
        })

        return filtered
      },
      
      getVendorsByStatus: (status) => {
        const { vendors } = get()
        return vendors.filter((vendor) => vendor.status === status)
      },
      
      getVendorsByVerificationStatus: (status) => {
        const { vendors } = get()
        return vendors.filter((vendor) => vendor.verificationStatus === status)
      },
      
      getPendingVendors: () => {
        const { getVendorsByVerificationStatus } = get()
        return getVendorsByVerificationStatus('pending')
      },
      
      getActiveVendors: () => {
        const { getVendorsByStatus } = get()
        return getVendorsByStatus('active')
      },
      
      resetFilters: () => set({ filters: initialFilters }),
      clearError: () => set({ error: null }),
      resetOnboarding: () => set({ onboardingData: initialOnboardingData }),
  }),
  {
    name: 'vendor-store',
  }
))