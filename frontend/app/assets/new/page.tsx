'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { assetsAPI } from '@/lib/api'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import Navigation from '@/app/components/Navigation'
import { useAuth } from '@/app/components/AuthContext'
import toast from 'react-hot-toast'

interface AssetFormData {
  name: string
  type: string
  category: string
  serialNumber: string
  model: string
  manufacturer: string
  purchaseDate: string
  purchasePrice: string
  currentValue: string
  location: string
  assignedTo: string
  status: string
  condition: string
  warrantyExpiry: string
  notes: string
  tags: string
}

export default function NewAssetPage() {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: '',
    category: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    location: '',
    assignedTo: '',
    status: 'active',
    condition: 'good',
    warrantyExpiry: '',
    notes: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<AssetFormData>>({})
  const router = useRouter()
  const { user } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof AssetFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<AssetFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Asset name is required'
    if (!formData.type) newErrors.type = 'Asset type is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required'
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Valid purchase price is required'
    }
    if (!formData.currentValue || parseFloat(formData.currentValue) <= 0) {
      newErrors.currentValue = 'Valid current value is required'
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const assetData: any = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        currentValue: parseFloat(formData.currentValue),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        warrantyExpiry: formData.warrantyExpiry || undefined
      }

      // Only include assignedTo if it's a valid value
      if (formData.assignedTo && formData.assignedTo.trim() !== '') {
        assetData.assignedTo = formData.assignedTo
      }

      await assetsAPI.create(assetData)
      toast.success('Asset created successfully')
      router.push('/assets')
    } catch (err: any) {
      console.error('Error creating asset:', err)
      console.error('Error response:', err.response?.data)
      
      if (err.response?.data?.validationErrors) {
        const validationErrors = err.response.data.validationErrors
        validationErrors.forEach((error: any) => {
          toast.error(`${error.field}: ${error.message}`)
        })
      } else {
        toast.error(err.response?.data?.error || 'Failed to create asset')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Navigation>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Asset</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new asset record for your company inventory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2  text-black focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter asset name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 text-black focus:border-blue-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select type</option>
                    <option value="equipment">Equipment</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="software">Software</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Office Equipment, IT Hardware"
                  />
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter serial number"
                  />
                </div>
              </div>
            </div>

            {/* Manufacturer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manufacturer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter manufacturer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter model number"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 text-black focus:border-blue-500 ${
                      errors.purchaseDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.purchaseDate && <p className="mt-1 text-sm text-red-600">{errors.purchaseDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full border rounded-md pl-8 pr-3 py-2 focus:ring-blue-500 text-black focus:border-blue-500 ${
                        errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="currentValue"
                      value={formData.currentValue}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full border rounded-md pl-8 pr-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500 ${
                        errors.currentValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.currentValue && <p className="mt-1 text-sm text-red-600">{errors.currentValue}</p>}
                </div>
              </div>
            </div>

            {/* Location and Assignment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 text-black focus:border-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Building A, Floor 2, Room 201"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 text-black py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Employee ID or name"
                  />
                </div>
              </div>
            </div>

            {/* Status and Condition */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Condition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md  text-black px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                    <option value="lost">Lost</option>
                    <option value="stolen">Stolen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    name="warrantyExpiry"
                    value={formData.warrantyExpiry}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about the asset..."
                />
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
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating...</span>
                </div>
              ) : (
                'Create Asset'
              )}
            </button>
          </div>
        </form>
      </div>
    </Navigation>
  )
} 