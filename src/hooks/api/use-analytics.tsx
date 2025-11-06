import { useQuery } from '@tanstack/react-query'
import { analyticsApiService } from '@/services/mock/api-service'

// Query keys for analytics
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  revenue: () => [...analyticsKeys.all, 'revenue'] as const,
  revenueChart: (period: string) => [...analyticsKeys.revenue(), 'chart', period] as const,
}

// Analytics queries
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsApiService.getDashboardMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useRevenueChart = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: analyticsKeys.revenueChart(period),
    queryFn: () => analyticsApiService.getRevenueChartData(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Export analytics data (placeholder for future implementation)
export const useExportAnalytics = () => {
  return {
    exportDashboardData: async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
      try {
        // Get dashboard metrics
        const response = await analyticsApiService.getDashboardMetrics()
        if (response.success && response.data) {
          // Convert to CSV format (basic implementation)
          const csvData = `Metric,Value\nTotal Revenue,${response.data.totalRevenue}\nTotal Orders,${response.data.totalOrders}\nTotal Vendors,${response.data.totalVendors}\nTotal Products,${response.data.totalProducts}`
          
          // Create download link
          const blob = new Blob([csvData], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `dashboard-analytics.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          return { success: true }
        }
        return { success: false, error: response.error }
      } catch (error) {
        console.error('Export analytics error:', error)
        return { success: false, error: 'Failed to export analytics data' }
      }
    },
    
    exportRevenueReport: async (period: 'week' | 'month' | 'year', format: 'csv' | 'excel' | 'pdf' = 'csv') => {
      try {
        // Get revenue chart data
        const response = await analyticsApiService.getRevenueChartData(period)
        if (response.success && response.data) {
          // Convert to CSV format (basic implementation)
          const csvData = `Period,Revenue\n${response.data.map((item: { label: string; value: number }) => `${item.label},${item.value}`).join('\n')}`
          
          // Create download link
          const blob = new Blob([csvData], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `revenue-report-${period}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          return { success: true }
        }
        return { success: false, error: response.error }
      } catch (error) {
        console.error('Export revenue report error:', error)
        return { success: false, error: 'Failed to export revenue report' }
      }
    }
  }
}