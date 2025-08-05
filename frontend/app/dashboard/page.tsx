'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { assetsAPI, usersAPI } from '@/lib/api'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import ErrorMessage from '@/app/components/ErrorMessage'
import Navigation from '@/app/components/Navigation'
import { useAuth } from '@/app/components/AuthContext'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalAssets: number
  totalUsers: number
  totalValue: number
  assetsInMaintenance: number
  recentAssets: any[]
  recentUsers: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  const userString = localStorage.getItem("user") ?? '{}';
  const userRole = JSON.parse(userString);

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use different endpoints based on user role
      let usersResponse
      if (user?.role === 'admin' || user?.role === 'manager') {
        // Admins and managers can see full user list
        usersResponse = await usersAPI.getAll({ limit: 5 })
      } else {
        // Regular users see basic user list
        usersResponse = await usersAPI.getBasicList()
      }

      const [assetsResponse, statsResponse] = await Promise.all([
        assetsAPI.getAll({ limit: 5 }),
        assetsAPI.getStats()
      ])

      // Check if we got fallback data (API unavailable)
      if (statsResponse.data.totalAssets === 0 && statsResponse.data.totalUsers === 0) {
        setApiAvailable(false)
        toast('Backend API is currently unavailable. Showing demo data.', {
          icon: '⚠️',
          duration: 5000
        })
      }

      setStats({
        totalAssets: statsResponse.data.totalAssets || 0,
        totalUsers: statsResponse.data.totalUsers || 0,
        totalValue: statsResponse.data.totalValue || 0,
        assetsInMaintenance: statsResponse.data.assetsInMaintenance || 0,
        recentAssets: assetsResponse.data.assets || [],
        recentUsers: usersResponse.data.users || []
      })
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      
      // Set fallback data if API is completely unavailable
      setStats({
        totalAssets: 0,
        totalUsers: 0,
        totalValue: 0,
        assetsInMaintenance: 0,
        recentAssets: [],
        recentUsers: []
      })
      setApiAvailable(false)
      setError('Backend API is currently unavailable. Please try again later.')
      toast.error('Unable to connect to server. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setLoading(true)
            setError(null)
            fetchDashboardData()
          }} 
        />
      </div>
    )
  }

  return (
    <Navigation>
      {/* API Status Warning */}
      {!apiAvailable && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Backend API Unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  The backend server is currently unavailable. You're viewing demo data. 
                  Please ensure your backend is running and accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'employee' 
              ? 'View your assigned assets and request support'
              : user?.role === 'manager'
              ? 'Manage your team and department assets'
              : 'Manage all company assets and users'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {(user?.role === 'admin' || user?.role === 'manager') && apiAvailable && (
            <button
              onClick={() => router.push('/assets/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Asset
            </button>
          )}
          {user?.role === 'admin' && apiAvailable && (
            <button
              onClick={() => router.push('/users/new')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
          {user?.role === 'manager' && apiAvailable && (
            <button
              onClick={() => router.push('/team')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              View Team
            </button>
          )}
        </div>
      </div>

      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Assets
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalAssets.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalUsers.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Value
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${stats?.totalValue.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Maintenance
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.assetsInMaintenance.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Assets */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Assets
                </h3>
                {apiAvailable && (
                  <button
                    onClick={() => router.push('/assets')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {!stats?.recentAssets || stats.recentAssets.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {apiAvailable ? 'No recent assets' : 'Demo mode - no assets available'}
                  </p>
                ) : (
                  stats.recentAssets.map((asset: any) => (
                    <div key={asset._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-500">{asset.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${asset.currentValue?.toLocaleString() || '0'}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800' :
                          asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          {userRole?.role !== "employee" && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Users
                  </h3>
                  {apiAvailable && (
                    <button
                      onClick={() => router.push('/users')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      View all
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {apiAvailable ? 'No recent users' : 'Demo mode - no users available'}
                    </p>
                  ) : (
                    stats.recentUsers.map((user: any) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{user.department}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {apiAvailable && (
                <button
                  onClick={() => router.push('/assets')}
                  className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {user?.role === 'employee' ? 'View Assets' : 'Manage Assets'}
                  </span>
                </button>
              )}
              {user?.role === 'admin' && apiAvailable && (
                <button
                  onClick={() => router.push('/users')}
                  className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <UsersIcon className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Manage Users</span>
                </button>
              )}
              {user?.role === 'manager' && apiAvailable && (
                <button
                  onClick={() => router.push('/team')}
                  className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <UsersIcon className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">View Team</span>
                </button>
              )}
              {apiAvailable && (
                <button
                  onClick={() => router.push('/reports')}
                  className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">View Reports</span>
                </button>
              )}
              {apiAvailable && (
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Settings</span>
                </button>
              )}
            </div>
            {!apiAvailable && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Actions are disabled while backend is unavailable
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Navigation>
  )
} 