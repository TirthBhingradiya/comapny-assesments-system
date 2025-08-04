'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { assetsAPI, Asset } from '@/lib/api'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import Navigation from '@/app/components/Navigation'
import { useAuth } from '@/app/components/AuthContext'
import toast from 'react-hot-toast'

interface MaintenanceFormData {
  date: string
  description: string
  cost: string
  performedBy: string
}

export default function MaintenancePage() {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [formData, setFormData] = useState<MaintenanceFormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '',
    performedBy: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<MaintenanceFormData>>({})
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof MaintenanceFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<MaintenanceFormData> = {}

    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.cost || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Valid cost is required'
    }
    if (!formData.performedBy.trim()) newErrors.performedBy = 'Performed by is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      const maintenanceData = {
        ...formData,
        cost: parseFloat(formData.cost)
      }

      await assetsAPI.addMaintenance(assetId, maintenanceData)
      toast.success('Maintenance record added successfully')
      router.push(`/assets/${assetId}`)
    } catch (err: any) {
      console.error('Error adding maintenance record:', err)
      toast.error(err.response?.data?.error || 'Failed to add maintenance record')
    } finally {
      setSaving(false)
    }
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add Maintenance Record</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new maintenance record for {asset.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Asset Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Asset Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Asset Name</p>
                  <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{asset.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Serial Number</p>
                  <p className="text-sm font-medium text-gray-900">{asset.serialNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{asset.location}</p>
                </div>
              </div>
            </div>

            {/* Maintenance Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe the maintenance work performed..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full border rounded-md pl-8 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.cost ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Performed By *
                    </label>
                    <input
                      type="text"
                      name="performedBy"
                      value={formData.performedBy}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.performedBy ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Name of person or company"
                    />
                    {errors.performedBy && <p className="mt-1 text-sm text-red-600">{errors.performedBy}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Adding...</span>
                </div>
              ) : (
                'Add Maintenance Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </Navigation>
  )
} 