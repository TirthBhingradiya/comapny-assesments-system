import React from 'react'
import {
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  DeviceTabletIcon,
  CpuChipIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface Asset {
  _id: string
  name: string
  type: string
  status: string
  condition: string
  currentValue: number
  location: string
  assignedTo?: {
    firstName: string
    lastName: string
    employeeId: string
  }
}

interface AssetCardProps {
  asset: Asset
  onView?: (asset: Asset) => void
  onEdit?: (asset: Asset) => void
  onDelete?: (asset: Asset) => void
}

const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return BuildingOfficeIcon
      case 'electronics': return ComputerDesktopIcon
      case 'vehicle': return TruckIcon
      case 'furniture': return WrenchScrewdriverIcon
      case 'software': return CpuChipIcon
      default: return DeviceTabletIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'maintenance': return 'status-maintenance'
      case 'retired': return 'status-retired'
      case 'lost': return 'status-lost'
      case 'stolen': return 'status-stolen'
      default: return 'status-active'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'condition-excellent'
      case 'good': return 'condition-good'
      case 'fair': return 'condition-fair'
      case 'poor': return 'condition-poor'
      default: return 'condition-good'
    }
  }

  const TypeIcon = getTypeIcon(asset.type)

  return (
    <div className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
            <TypeIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {asset.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{asset.type}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`status-badge ${getStatusColor(asset.status)}`}>
            {asset.status}
          </span>
          <span className={`status-badge ${getConditionColor(asset.condition)}`}>
            {asset.condition}
          </span>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Value:</span>
          <span className="font-medium text-green-600">
            ${asset.currentValue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Location:</span>
          <span className="font-medium">{asset.location}</span>
        </div>
        {asset.assignedTo && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Assigned to:</span>
            <span className="font-medium">
              {asset.assignedTo.firstName} {asset.assignedTo.lastName}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={() => onView(asset)}
            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            title="View details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(asset)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit asset"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(asset)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete asset"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export { AssetCard } 