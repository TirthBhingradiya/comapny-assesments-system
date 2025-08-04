'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline'
import { assetsAPI, Asset } from '@/lib/api'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import ErrorMessage from '@/app/components/ErrorMessage'
import Navigation from '@/app/components/Navigation'
import UserAssignmentModal from '@/app/components/UserAssignmentModal'
import { useAuth } from '@/app/components/AuthContext'
import toast from 'react-hot-toast'

interface AssetsResponse {
  assets: Asset[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    location: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const fetchAssets = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...filters
      }
      
      const response = await assetsAPI.getAll(params)
      const data: AssetsResponse = response.data
      
      setAssets(data.assets)
      setPagination(data.pagination)
    } catch (err: any) {
      setError('Failed to load assets')
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAssets(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      await assetsAPI.delete(id)
      toast.success('Asset deleted successfully')
      fetchAssets(pagination.currentPage)
    } catch (err: any) {
      toast.error('Failed to delete asset')
      console.error('Error deleting asset:', err)
    }
  }

  const handleAssignAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    setShowAssignmentModal(true)
  }

  const handleAssignToUser = async (userId: string) => {
    if (!selectedAsset) return

    try {
      await assetsAPI.assignToUser(selectedAsset._id, userId)
      toast.success('Asset assigned successfully')
      fetchAssets(pagination.currentPage)
    } catch (err: any) {
      toast.error('Failed to assign asset')
      console.error('Error assigning asset:', err)
    }
  }

  const handleReturnAsset = async (asset: Asset) => {
    if (!confirm('Are you sure you want to return this asset?')) return

    try {
      await assetsAPI.returnAsset(asset._id)
      toast.success('Asset returned successfully')
      fetchAssets(pagination.currentPage)
    } catch (err: any) {
      toast.error('Failed to return asset')
      console.error('Error returning asset:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'retired': return 'bg-gray-100 text-gray-800'
      case 'lost': return 'bg-red-100 text-red-800'
      case 'stolen': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading assets..." />
      </div>
    )
  }

  if (error && assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError(null)
            fetchAssets()
          }} 
        />
      </div>
    )
  }

  return (
    <Navigation>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'employee' 
              ? 'View your assigned assets and request support'
              : user?.role === 'manager'
              ? 'Manage assets in your department and assign to team members'
              : 'Manage and track all company assets'
            }
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => router.push('/assets/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Asset
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets by name, serial number, manufacturer..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-black focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 text-black py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="equipment">Equipment</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="software">Software</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                    <option value="lost">Lost</option>
                    <option value="stolen">Stolen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full border border-gray-300 text-black rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Assets ({pagination.totalItems})
            </h2>
            <p className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSpinner size="md" text="Loading..." />
          </div>
        ) : assets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No assets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        {asset.serialNumber && (
                          <div className="text-sm text-gray-500">SN: {asset.serialNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{asset.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${asset.currentValue?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-900">
                            {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                          </div>
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <button
                              onClick={() => handleReturnAsset(asset)}
                              className="text-red-600 hover:text-red-900"
                              title="Return Asset"
                            >
                              <ArrowUturnLeftIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Unassigned</span>
                          {(user?.role === 'admin' || user?.role === 'manager') && (
                            <button
                              onClick={() => handleAssignAsset(asset)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Assign Asset"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/assets/${asset._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                          <>
                            <button
                              onClick={() => router.push(`/assets/${asset._id}/edit`)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Asset"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Asset"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {user?.role === 'employee' && asset.status === 'maintenance' && (
                          <button
                            onClick={() => router.push(`/assets/${asset._id}/maintenance`)}
                            className="text-orange-600 hover:text-orange-900"
                            title="View Maintenance"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchAssets(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchAssets(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Assignment Modal */}
      {selectedAsset && (
        <UserAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedAsset(null)
          }}
          onAssign={handleAssignToUser}
          assetName={selectedAsset.name}
          currentUserRole={user?.role || ''}
          currentUserDepartment={user?.department || ''}
        />
      )}
    </Navigation>
  )
} 