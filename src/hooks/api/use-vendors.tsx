import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApiService } from '@/services/mock/api-service'
import type { Vendor, PaginationParams } from '@/stores/types'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// Query Keys
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
}

// Hooks for Vendors
export function useVendors(params: PaginationParams) {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => vendorApiService.getVendors(params),
    select: (data) => data.data,
  })
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorApiService.getVendorById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}

// Mutations for Vendors
export function useCreateVendor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => 
      vendorApiService.createVendor(vendorData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Vendor created successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to create vendor'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to create vendor
        </Notification>
      )
      console.error('Create vendor error:', error)
    },
  })
}

export function useUpdateVendor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Vendor> }) => 
      vendorApiService.updateVendor(id, updates),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) })
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Vendor updated successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to update vendor'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update vendor
        </Notification>
      )
      console.error('Update vendor error:', error)
    },
  })
}

export function useDeleteVendor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => vendorApiService.deleteVendor(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Vendor deleted successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to delete vendor'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to delete vendor
        </Notification>
      )
      console.error('Delete vendor error:', error)
    },
  })
}

export function useApproveVendor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => vendorApiService.approveVendor(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) })
        toast.push(
          <Notification title="Success" type="success">
            Vendor approved successfully
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to approve vendor'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to approve vendor
        </Notification>
      )
      console.error('Approve vendor error:', error)
    },
  })
}

export function useRejectVendor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      vendorApiService.rejectVendor(id, reason),
    onSuccess: (response, { id }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() })
        queryClient.invalidateQueries({ queryKey: vendorKeys.detail(id) })
        toast.push(
          <Notification title="Success" type="success">
            Vendor rejected successfully
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to reject vendor'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to reject vendor
        </Notification>
      )
      console.error('Reject vendor error:', error)
    },
  })
}