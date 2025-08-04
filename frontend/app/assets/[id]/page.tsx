'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { assetsAPI, Asset } from '@/lib/api'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import ErrorMessage from '@/app/components/ErrorMessage'
import Navigation from '@/app/components/Navigation'
import { useAuth } from '@/app/components/AuthContext'
import toast from 'react-hot-toast'

interface MaintenanceRecord {
  date: string
  description: string
  cost: number
  performedBy: string
}

export default function AssetDetailPage() {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const assetId = params.id as string

  const fetchAsset = async () => {
    try {
      setLoading(true)
      const response = await assetsAPI.getById(assetId)
      setAsset(response.data)
    } catch (err: any) {
      setError('Failed to load asset details')
      console.error('Error fetching asset:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (assetId) {
      fetchAsset()
    }
  }, [assetId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return
    }

    try {
      await assetsAPI.delete(assetId)
      toast.success('Asset deleted successfully')
      router.push('/assets')
    } catch (err: any) {
      toast.error('Failed to delete asset')
      console.error('Error deleting asset:', err)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading asset details..." />
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error || 'Asset not found'} 
          onRetry={() => {
            setError(null)
            fetchAsset()
          }} 
        />
      </div>
    )
  }

  return (
    <Navigation>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Assets
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {asset.type} • {asset.category}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <>
                  <button
                    onClick={() => router.push(`/assets/${assetId}/edit`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Asset Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Asset Name</h3>
                    <p className="text-sm text-gray-900">{asset.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Type</h3>
                    <p className="text-sm text-gray-900 capitalize">{asset.type}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
                    <p className="text-sm text-gray-900">{asset.category}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Condition</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Serial Number</h3>
                    <p className="text-sm text-gray-900">{asset.serialNumber || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturer Information */}
            {(asset.manufacturer || asset.model) && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Manufacturer Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {asset.manufacturer && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Manufacturer</h3>
                        <p className="text-sm text-gray-900">{asset.manufacturer}</p>
                      </div>
                    )}
                    
                    {asset.model && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Model</h3>
                        <p className="text-sm text-gray-900">{asset.model}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Financial Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Financial Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Purchase Date</h3>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{formatDate(asset.purchaseDate)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Purchase Price</h3>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">${asset.purchasePrice?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Current Value</h3>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">${asset.currentValue?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location and Assignment */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Location & Assignment</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{asset.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {asset.assignedTo ? (
                        <p className="text-sm text-gray-900">
                          {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Unassigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Maintenance History</h2>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                      onClick={() => router.push(`/assets/${assetId}/maintenance`)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Record
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {asset.maintenanceHistory.map((record: MaintenanceRecord, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(record.date)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">${record.cost.toLocaleString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                        <p className="text-xs text-gray-500">Performed by: {record.performedBy}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No maintenance records found</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {asset.notes && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Notes</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Asset ID</h3>
                  <p className="text-sm text-gray-900 font-mono">{asset._id}</p>
                </div>
                
                {asset.warrantyExpiry && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Warranty Expiry</h3>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{formatDate(asset.warrantyExpiry)}</p>
                    </div>
                  </div>
                )}
                
                {asset.tags && asset.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="text-sm text-gray-900">{formatDate(asset.createdAt || '')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <p className="text-sm text-gray-900">{formatDate(asset.updatedAt || '')}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => router.push(`/assets/${assetId}/edit`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Asset
                </button>
                
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button
                    onClick={() => router.push(`/assets/${assetId}/maintenance`)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Maintenance
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  )
} 