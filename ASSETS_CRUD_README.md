# Assets CRUD Operations - Implementation Guide

## Overview

This document describes the complete CRUD (Create, Read, Update, Delete) operations for assets that have been implemented in the Company Assets Management System.

## Frontend Implementation

### Pages Created

1. **Assets List Page** (`/frontend/app/assets/page.tsx`)
   - Displays all assets in a table format
   - Advanced filtering and search capabilities
   - Pagination support
   - Role-based access control (admin/manager can delete)
   - Status and condition indicators with color coding

2. **Add New Asset Page** (`/frontend/app/assets/new/page.tsx`)
   - Comprehensive form with all asset fields
   - Form validation with error handling
   - Organized sections for different types of information
   - Real-time error feedback

3. **Asset Detail Page** (`/frontend/app/assets/[id]/page.tsx`)
   - Complete asset information display
   - Maintenance history section
   - Quick actions sidebar
   - Role-based edit/delete buttons

4. **Edit Asset Page** (`/frontend/app/assets/[id]/edit/page.tsx`)
   - Pre-filled form with existing asset data
   - Same validation as create form
   - Update functionality with success feedback

5. **Add Maintenance Record Page** (`/frontend/app/assets/[id]/maintenance/page.tsx`)
   - Form to add maintenance records
   - Asset information display for context
   - Cost tracking and performer information

### Features Implemented

#### Asset Management
- ✅ Create new assets with comprehensive information
- ✅ View asset details with maintenance history
- ✅ Edit existing assets
- ✅ Delete assets (admin/manager only)
- ✅ Search and filter assets
- ✅ Pagination for large asset lists

#### Asset Information Fields
- **Basic Information**: Name, Type, Category, Serial Number
- **Manufacturer Details**: Manufacturer, Model
- **Financial Information**: Purchase Date, Purchase Price, Current Value
- **Location & Assignment**: Location, Assigned To
- **Status & Condition**: Status, Condition
- **Additional Information**: Warranty Expiry, Tags, Notes

#### Maintenance Tracking
- ✅ Add maintenance records to assets
- ✅ Track maintenance costs
- ✅ Record maintenance performers
- ✅ View maintenance history

#### User Interface Features
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback
- ✅ Form validation with real-time feedback
- ✅ Role-based access control
- ✅ Color-coded status and condition indicators

## Backend Implementation

### API Endpoints

The backend already includes all necessary endpoints:

```
GET    /api/assets              - Get all assets with filtering/pagination
GET    /api/assets/:id          - Get single asset
POST   /api/assets              - Create new asset
PUT    /api/assets/:id          - Update asset
DELETE /api/assets/:id          - Delete asset
POST   /api/assets/:id/maintenance - Add maintenance record
GET    /api/assets/stats/overview - Get asset statistics
```

### Asset Model

The Asset model includes all necessary fields:

```typescript
interface IAsset {
  name: string;
  type: 'equipment' | 'furniture' | 'electronics' | 'vehicle' | 'software' | 'other';
  category: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  location: string;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'active' | 'maintenance' | 'retired' | 'lost' | 'stolen';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  warrantyExpiry?: Date;
  maintenanceHistory: Array<{
    date: Date;
    description: string;
    cost: number;
    performedBy: string;
  }>;
  notes?: string;
  images?: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Instructions

### For Users

1. **Viewing Assets**
   - Navigate to `/assets` to see all assets
   - Use search and filters to find specific assets
   - Click on an asset to view detailed information

2. **Creating Assets** (Admin/Manager)
   - Click "Add Asset" button from assets list or dashboard
   - Fill in required fields (marked with *)
   - Submit the form to create the asset

3. **Editing Assets** (Admin/Manager)
   - From asset detail page, click "Edit" button
   - Modify the information as needed
   - Save changes

4. **Adding Maintenance Records** (Admin/Manager)
   - From asset detail page, click "Add Maintenance"
   - Fill in maintenance details
   - Submit to add the record

5. **Deleting Assets** (Admin/Manager)
   - From asset detail page, click "Delete" button
   - Confirm the deletion

### For Developers

#### Frontend API Integration

The frontend uses the `assetsAPI` object from `/lib/api.ts`:

```typescript
// Get all assets
const response = await assetsAPI.getAll({ page: 1, limit: 10, search: 'laptop' });

// Get single asset
const asset = await assetsAPI.getById(assetId);

// Create asset
const newAsset = await assetsAPI.create(assetData);

// Update asset
const updatedAsset = await assetsAPI.update(assetId, updateData);

// Delete asset
await assetsAPI.delete(assetId);

// Add maintenance record
await assetsAPI.addMaintenance(assetId, maintenanceData);
```

#### Styling and Components

The implementation uses:
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **React Hot Toast** for notifications
- **Custom components** for loading states and error handling

## Security Features

- **Role-based Access Control**: Only admins and managers can create, edit, and delete assets
- **Authentication Required**: All asset operations require valid authentication
- **Input Validation**: Both frontend and backend validation
- **Error Handling**: Comprehensive error handling and user feedback

## Testing

### Sample Data

The system includes sample assets for testing:

- MacBook Pro 16" (Electronics)
- Dell XPS 15 (Electronics)
- iPhone 15 Pro (Electronics)
- Samsung 4K Monitor (Electronics)
- HP LaserJet Pro (Equipment)
- iPad Pro 12.9" (Electronics)
- Microsoft Surface Pro (Electronics)
- Logitech MX Master 3 (Electronics)

### Test Credentials

```
Admin: admin@company.com / admin123
Manager: manager@company.com / manager123
Employee: employee@company.com / employee123
```

## File Structure

```
frontend/app/assets/
├── page.tsx                    # Assets list page
├── new/
│   └── page.tsx               # Add new asset page
└── [id]/
    ├── page.tsx               # Asset detail page
    ├── edit/
    │   └── page.tsx           # Edit asset page
    └── maintenance/
        └── page.tsx           # Add maintenance page
```

## Future Enhancements

Potential improvements for the assets system:

1. **Image Upload**: Add support for asset images
2. **Bulk Operations**: Import/export assets via CSV
3. **Asset QR Codes**: Generate QR codes for physical asset tracking
4. **Maintenance Scheduling**: Automated maintenance reminders
5. **Asset Depreciation**: Automatic value depreciation calculations
6. **Advanced Reporting**: Detailed asset analytics and reports
7. **Asset Transfers**: Track asset transfers between users/departments
8. **Audit Trail**: Complete history of all asset changes

## Troubleshooting

### Common Issues

1. **Assets not loading**: Check backend connection and authentication
2. **Form validation errors**: Ensure all required fields are filled
3. **Permission denied**: Verify user role has appropriate permissions
4. **Date format issues**: Ensure dates are in YYYY-MM-DD format

### Debug Information

- Check browser console for frontend errors
- Check backend logs for API errors
- Verify MongoDB connection and data integrity
- Ensure all environment variables are set correctly 