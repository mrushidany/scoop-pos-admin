import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionApiService } from '@/services/mock/api-service'
import type { Transaction, PaginationParams } from '@/stores/types'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// Query keys for transactions
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  vendor: (vendorId: string) => [...transactionKeys.all, 'vendor', vendorId] as const,
}

// Transaction queries
export const useTransactions = (params?: PaginationParams) => {
  const defaultParams = { page: 1, limit: 10, ...params }
  return useQuery({
    queryKey: transactionKeys.list(defaultParams),
    queryFn: () => transactionApiService.getTransactions(defaultParams),
  })
}

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionApiService.getTransactionById(id),
    enabled: !!id,
  })
}

export const useVendorTransactions = (vendorId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: transactionKeys.vendor(vendorId),
    queryFn: () => transactionApiService.getTransactionsByVendor(vendorId),
    enabled: !!vendorId,
  })
}

// Transaction mutations
export const useProcessTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      transactionApiService.processTransaction(transactionData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Transaction processed successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to process transaction'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to process transaction
        </Notification>
      )
      console.error('Process transaction error:', error)
    },
  })
}

export const useRefundTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ transactionId, amount }: { transactionId: string; amount?: number }) =>
      transactionApiService.refundTransaction(transactionId, amount),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Transaction refunded successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to refund transaction'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to refund transaction
        </Notification>
      )
      console.error('Refund transaction error:', error)
    },
  })
}