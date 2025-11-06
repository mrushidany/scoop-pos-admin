import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApiService } from '@/services/mock/api-service'
import type { Order, PaginationParams } from '@/stores/types'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// Query keys for orders
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  vendor: (vendorId: string) => [...orderKeys.all, 'vendor', vendorId] as const,
  status: (status: string) => [...orderKeys.all, 'status', status] as const,
}

// Order queries
export const useOrders = (params?: PaginationParams) => {
  const defaultParams = { page: 1, limit: 10, ...params }
  return useQuery({
    queryKey: orderKeys.list(defaultParams),
    queryFn: () => orderApiService.getOrders(defaultParams),
  })
}

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApiService.getOrderById(id),
    enabled: !!id,
  })
}

export const useVendorOrders = (vendorId: string, params?: PaginationParams) => {
  const defaultParams = { page: 1, limit: 10, ...params }
  return useQuery({
    queryKey: [...orderKeys.vendor(vendorId), defaultParams],
    queryFn: () => orderApiService.getOrders(defaultParams),
    enabled: !!vendorId,
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        data: data.data?.data.filter((order: Order) => order.vendorId === vendorId) || []
      }
    })
  })
}

export const useOrdersByStatus = (status: string, params?: PaginationParams) => {
  const defaultParams = { page: 1, limit: 10, ...params }
  return useQuery({
    queryKey: [...orderKeys.status(status), defaultParams],
    queryFn: () => orderApiService.getOrders(defaultParams),
    enabled: !!status,
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        data: data.data?.data.filter((order: Order) => order.status === status) || []
      }
    })
  })
}

// Order mutations
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) =>
      orderApiService.createOrder(orderData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Order created successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to create order'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to create order
        </Notification>
      )
      console.error('Create order error:', error)
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      orderApiService.updateOrderStatus(orderId, status),
    onSuccess: (response, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Order status updated successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to update order status'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update order status
        </Notification>
      )
      console.error('Update order status error:', error)
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) =>
      orderApiService.cancelOrder(orderId),
    onSuccess: (response, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Order cancelled successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to cancel order'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to cancel order
        </Notification>
      )
      console.error('Cancel order error:', error)
    },
  })
}