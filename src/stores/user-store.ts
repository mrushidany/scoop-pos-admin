import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, UserRole, Permission } from './types'

interface UserState {
  // State
  users: User[]
  roles: UserRole[]
  permissions: Permission[]
  selectedUser: User | null
  selectedRole: UserRole | null
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
    role: string
    status: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }

  // Actions
  setUsers: (users: User[]) => void
  setRoles: (roles: UserRole[]) => void
  setPermissions: (permissions: Permission[]) => void
  setSelectedUser: (user: User | null) => void
  setSelectedRole: (role: UserRole | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPagination: (pagination: Partial<UserState['pagination']>) => void
  setFilters: (filters: Partial<UserState['filters']>) => void
  
  // User CRUD operations
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  removeUser: (id: string) => void
  
  // Role CRUD operations
  addRole: (role: UserRole) => void
  updateRole: (id: string, updates: Partial<UserRole>) => void
  removeRole: (id: string) => void
  
  // Utility functions
  getUserById: (id: string) => User | undefined
  getRoleById: (id: string) => UserRole | undefined
  getFilteredUsers: () => User[]
  resetFilters: () => void
  clearError: () => void
}

const initialFilters = {
  search: '',
  role: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
}

const initialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export const useUserStore = create<UserState>()(devtools(
  (set, get) => ({
      // Initial state
      users: [],
      roles: [],
      permissions: [],
      selectedUser: null,
      selectedRole: null,
      loading: false,
      error: null,
      pagination: initialPagination,
      filters: initialFilters,

      // Basic setters
      setUsers: (users) => set({ users }),
      setRoles: (roles) => set({ roles }),
      setPermissions: (permissions) => set({ permissions }),
      setSelectedUser: (selectedUser) => set({ selectedUser }),
      setSelectedRole: (selectedRole) => set({ selectedRole }),
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

      // User CRUD operations
      addUser: (user) => 
        set((state) => ({ 
          users: [user, ...state.users] 
        })),
      
      updateUser: (id, updates) => 
        set((state) => ({
          users: state.users.map((user) => 
            user.id === id ? { ...user, ...updates } : user
          ),
          selectedUser: state.selectedUser?.id === id 
            ? { ...state.selectedUser, ...updates } 
            : state.selectedUser,
        })),
      
      removeUser: (id) => 
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        })),

      // Role CRUD operations
      addRole: (role) => 
        set((state) => ({ 
          roles: [role, ...state.roles] 
        })),
      
      updateRole: (id, updates) => 
        set((state) => ({
          roles: state.roles.map((role) => 
            role.id === id ? { ...role, ...updates } : role
          ),
          selectedRole: state.selectedRole?.id === id 
            ? { ...state.selectedRole, ...updates } 
            : state.selectedRole,
        })),
      
      removeRole: (id) => 
        set((state) => ({
          roles: state.roles.filter((role) => role.id !== id),
          selectedRole: state.selectedRole?.id === id ? null : state.selectedRole,
        })),

      // Utility functions
      getUserById: (id) => {
        const { users } = get()
        return users.find((user) => user.id === id)
      },
      
      getRoleById: (id) => {
        const { roles } = get()
        return roles.find((role) => role.id === id)
      },
      
      getFilteredUsers: () => {
        const { users, filters } = get()
        let filtered = [...users]

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filtered = filtered.filter(
            (user) =>
              user.firstName.toLowerCase().includes(searchLower) ||
              user.lastName.toLowerCase().includes(searchLower) ||
              user.email.toLowerCase().includes(searchLower)
          )
        }

        // Apply role filter
        if (filters.role) {
          filtered = filtered.filter((user) => user.role.name === filters.role)
        }

        // Apply status filter
        if (filters.status) {
          filtered = filtered.filter((user) => user.status === filters.status)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof User] as string
          const bValue = b[filters.sortBy as keyof User] as string
          
          if (filters.sortOrder === 'asc') {
            return aValue.localeCompare(bValue)
          } else {
            return bValue.localeCompare(aValue)
          }
        })

        return filtered
      },
      
      resetFilters: () => set({ filters: initialFilters }),
      clearError: () => set({ error: null }),
  }),
  {
    name: 'user-store',
  }
))