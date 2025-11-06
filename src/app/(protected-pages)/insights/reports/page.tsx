
'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import {
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineDocumentArrowDown
} from 'react-icons/hi2'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  trend: 'up' | 'down'
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <HiOutlineArrowTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <HiOutlineArrowTrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d')

  // Mock data for metrics
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$124,563',
      change: 12.5,
      icon: <HiOutlineCurrencyDollar className="h-6 w-6 text-blue-600" />,
      trend: 'up' as const
    },
    {
      title: 'Total Orders',
      value: '1,847',
      change: 8.2,
      icon: <HiOutlineShoppingCart className="h-6 w-6 text-green-600" />,
      trend: 'up' as const
    },
    {
      title: 'Active Vendors',
      value: '342',
      change: -2.1,
      icon: <HiOutlineUsers className="h-6 w-6 text-purple-600" />,
      trend: 'down' as const
    },
    {
      title: 'Avg Order Value',
      value: '$67.45',
      change: 15.3,
      icon: <HiOutlineChartBar className="h-6 w-6 text-orange-600" />,
      trend: 'up' as const
    }
  ]

  // Chart configurations for ApexCharts
  const revenueChartOptions = {
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    colors: ['#3B82F6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1
      }
    }
  }

  const revenueChartSeries = [{
    name: 'Revenue',
    data: [65000, 59000, 80000, 81000, 56000, 55000, 70000, 85000, 90000, 95000, 110000, 124563]
  }]

  const ordersChartOptions = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colors: ['#22C55E']
  }

  const ordersChartSeries = [{
    name: 'Orders',
    data: [120, 190, 300, 500, 200, 300, 450]
  }]

  const vendorStatusOptions = {
    chart: {
      type: 'donut' as const,
      height: 350
    },
    labels: ['Active', 'Pending', 'Suspended', 'Inactive'],
    colors: ['#22C55E', '#FBD72B', '#EF4444', '#9CA3AF'],
    legend: {
      position: 'bottom' as const
    }
  }

  const vendorStatusSeries = [342, 45, 12, 28]

  const topProductsOptions = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
    },
    colors: ['#9333EA']
  }

  const topProductsSeries = [{
    name: 'Sales',
    data: [1200, 950, 800, 650, 500]
  }]

  const handleExportReport = () => {
    // Mock export functionality
    const reportData = {
      dateRange,
      metrics,
      timestamp: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `pos-admin-report-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select
            value={dateRange}
            onChange={(value) => setDateRange(value as string)}
            className="w-32"
          >
            <Select value="7d">Last 7 days</Select>
            <Select value="30d">Last 30 days</Select>
            <Select value="90d">Last 90 days</Select>
            <Select value="1y">Last year</Select>
          </Select>
          <Button onClick={handleExportReport} variant="plain">
            <HiOutlineDocumentArrowDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue">
        <Tabs.TabList className="grid w-full grid-cols-4">
          <Tabs.TabNav value="revenue">Revenue Trends</Tabs.TabNav>
          <Tabs.TabNav value="orders">Order Analytics</Tabs.TabNav>
          <Tabs.TabNav value="vendors">Vendor Status</Tabs.TabNav>
          <Tabs.TabNav value="products">Top Products</Tabs.TabNav>
        </Tabs.TabList>

        <Tabs.TabContent value="revenue">
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
              <Chart
                options={revenueChartOptions}
                series={revenueChartSeries}
                type="area"
                height={350}
              />
            </div>
          </Card>
        </Tabs.TabContent>

        <Tabs.TabContent value="orders">
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Order Distribution</h3>
              <Chart
                options={ordersChartOptions}
                series={ordersChartSeries}
                type="bar"
                height={350}
              />
            </div>
          </Card>
        </Tabs.TabContent>

        <Tabs.TabContent value="vendors">
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vendor Status Distribution</h3>
              <div className="flex justify-center">
                <Chart
                  options={vendorStatusOptions}
                  series={vendorStatusSeries}
                  type="donut"
                  height={350}
                />
              </div>
            </div>
          </Card>
        </Tabs.TabContent>

        <Tabs.TabContent value="products">
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
              <Chart
                options={topProductsOptions}
                series={topProductsSeries}
                type="bar"
                height={350}
              />
            </div>
          </Card>
        </Tabs.TabContent>
      </Tabs>

      {/* Detailed Reports Table */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Vendor</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'TXN-001', vendor: 'Vendor A', amount: '$245.00', status: 'completed', date: '2024-01-15' },
                  { id: 'TXN-002', vendor: 'Vendor B', amount: '$189.50', status: 'pending', date: '2024-01-15' },
                  { id: 'TXN-003', vendor: 'Vendor C', amount: '$567.25', status: 'completed', date: '2024-01-14' },
                  { id: 'TXN-004', vendor: 'Vendor D', amount: '$123.75', status: 'failed', date: '2024-01-14' },
                  { id: 'TXN-005', vendor: 'Vendor E', amount: '$890.00', status: 'completed', date: '2024-01-13' }
                ].map((transaction) => (
                  <tr key={transaction.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4">{transaction.vendor}</td>
                    <td className="px-6 py-4 font-semibold">{transaction.amount}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
