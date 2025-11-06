import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApiService } from '@/services/mock/api-service'
import type { User, PaginationParams } from '@/stores/types'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
  permissions: () => [...userKeys.all, 'permissions'] as const,
}

// Hooks for Users
export function useUsers(params: PaginationParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApiService.getUsers(params),
    select: (data) => data.data,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApiService.getUserById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}

export function useUserRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => userApiService.getRoles(),
    select: (data) => data.data,
  })
}

export function useUserPermissions() {
  return useQuery({
    queryKey: userKeys.permissions(),
    queryFn: () => userApiService.getPermissions(),
    select: (data) => data.data,
  })
}

// Mutations for Users
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
      userApiService.createUser(userData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'User created successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to create user'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to create user
        </Notification>
      )
      console.error('Create user error:', error)
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) => 
      userApiService.updateUser(id, updates),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'User updated successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to update user'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update user
        </Notification>
      )
      console.error('Update user error:', error)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => userApiService.deleteUser(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'User deleted successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to delete user'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to delete user
        </Notification>
      )
      console.error('Delete user error:', error)
    },
  })
}