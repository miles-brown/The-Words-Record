/**
 * Admin Analytics Page
 * Real-time analytics dashboard for admin monitoring
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import Head from 'next/head'

interface AnalyticsData {
  pageViews: {
    today: number
    week: number
    month: number
    trend: number
  }
  userActivity: {
    activeUsers: number
    newUsers: number
    returningUsers: number
  }
  topPages: Array<{
    path: string
    views: number
    avgTime: string
  }>
  contentMetrics: {
    totalCases: number
    totalStatements: number
    totalPeople: number
    totalOrganizations: number
  }
  searchTerms: Array<{
    term: string
    count: number
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const router = useRouter()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Simulated data for now - replace with actual API call
      setTimeout(() => {
        setData({
          pageViews: {
            today: 1234,
            week: 8567,
            month: 34892,
            trend: 12.5
          },
          userActivity: {
            activeUsers: 342,
            newUsers: 89,
            returningUsers: 253
          },
          topPages: [
            { path: '/cases', views: 4532, avgTime: '2:45' },
            { path: '/people', views: 3421, avgTime: '1:32' },
            { path: '/statements', views: 2987, avgTime: '3:12' },
            { path: '/organizations', views: 1876, avgTime: '2:05' },
            { path: '/about', views: 1243, avgTime: '0:58' }
          ],
          contentMetrics: {
            totalCases: 128,
            totalStatements: 1942,
            totalPeople: 304,
            totalOrganizations: 71
          },
          searchTerms: [
            { term: 'climate change', count: 234 },
            { term: 'policy statement', count: 189 },
            { term: 'government response', count: 156 },
            { term: 'recent cases', count: 145 },
            { term: 'public opinion', count: 98 }
          ]
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Analytics - TWR Admin</title>
      </Head>

      <AdminLayout title="Analytics">
        <div className="max-w-7xl mx-auto">
          {/* Header with time range selector */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1">Monitor site performance and user engagement</p>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Page Views Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data?.pageViews.today.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    ↑ {data?.pageViews.trend}% from yesterday
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data?.userActivity.activeUsers}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Real-time
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">New Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data?.userActivity.newUsers}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This week
                  </p>
                </div>
                <div className="text-3xl">🆕</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Returning Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data?.userActivity.returningUsers}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This week
                  </p>
                </div>
                <div className="text-3xl">🔄</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h2>
              <div className="space-y-3">
                {data?.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{page.path}</p>
                      <p className="text-sm text-gray-500">Avg. time: {page.avgTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Search Terms */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Terms</h2>
              <div className="space-y-3">
                {data?.searchTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{term.term}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {term.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 font-medium">Total Cases</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {data?.contentMetrics.totalCases}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">Total People</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {data?.contentMetrics.totalPeople}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">Statements</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {data?.contentMetrics.totalStatements}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Organizations</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {data?.contentMetrics.totalOrganizations}
                  </p>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Direct</span>
                    <span className="text-sm font-bold text-gray-900">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Search</span>
                    <span className="text-sm font-bold text-gray-900">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Social</span>
                    <span className="text-sm font-bold text-gray-900">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Referral</span>
                    <span className="text-sm font-bold text-gray-900">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}