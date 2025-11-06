import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApiService } from '@/services/mock/api-service'
import type { PaginationParams } from '@/stores/types'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

// Query keys for inventory
export const inventoryKeys = {
  all: ['inventory'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  product: (id: string) => [...inventoryKeys.products(), id] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
}

// Products queries
export const useProducts = (params?: PaginationParams) => {
  const defaultParams = { page: 1, limit: 10 }
  return useQuery({
    queryKey: [...inventoryKeys.products(), params],
    queryFn: () => inventoryApiService.getProducts(params || defaultParams),
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.product(id),
    queryFn: () => inventoryApiService.getProductById(id),
    enabled: !!id,
  })
}

export const useProductCategories = () => {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: () => inventoryApiService.getCategories(),
  })
}

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryApiService.getLowStockProducts(),
  })
}

// Product mutations
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      inventoryApiService.updateProductStock(productId, quantity),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
      
      if (response.success) {
        toast.push(
          <Notification title="Success" type="success">
            {response.message || 'Product stock updated successfully'}
          </Notification>
        )
      } else {
        toast.push(
          <Notification title="Error" type="danger">
            {response.error || 'Failed to update product stock'}
          </Notification>
        )
      }
    },
    onError: (error) => {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to update product stock
        </Notification>
      )
      console.error('Update product stock error:', error)
    },
  })
}