import express, { Request } from 'express';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth';
import Asset from '../models/Asset';
import { upload } from '../middleware/upload';
import { IUser } from '../models/User';

// Extend the Request interface to include user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Validation function for assignedTo field
const validateAssignedTo = (assignedTo: any): mongoose.Types.ObjectId | null => {
  if (!assignedTo || assignedTo.trim() === '') {
    return null;
  }
  
  // Check if it's a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(assignedTo)) {
    return new mongoose.Types.ObjectId(assignedTo);
  }
  
  throw new Error('Invalid assignedTo ID format');
};

// Get all assets with filtering and pagination
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      location,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = {};

    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see their own assigned assets
      filter.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      // Managers can see assets in their department and unassigned assets
      filter.$or = [
        { location: { $regex: req.user.department, $options: 'i' } },
        { assignedTo: null },
        { assignedTo: { $exists: true } }
      ];
    }
    // Admins can see all assets (no additional filtering)

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const assets = await Asset.find(filter)
      .populate('assignedTo', 'firstName lastName email employeeId')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Asset.countDocuments(filter);

    res.json({
      assets,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get single asset
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email employeeId department');
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Role-based access control
    if (req.user.role === 'employee') {
      // Employees can only view their own assigned assets
      if (asset.assignedTo?._id?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only view your assigned assets.' });
      }
    }

    // Admins can view all assets
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Create new asset (admin and manager only)
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to create assets
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only admins and managers can create assets.' });
    }

    const assetData: any = {
      ...req.body,
      purchaseDate: new Date(req.body.purchaseDate),
      purchasePrice: Number(req.body.purchasePrice),
      currentValue: Number(req.body.currentValue),
      warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map((tag: string) => tag.trim())) : []
    };

    // Handle assignedTo field properly with validation
    try {
      assetData.assignedTo = validateAssignedTo(req.body.assignedTo);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid assignedTo ID format' });
    }

    const asset = new Asset(assetData);
    await asset.save();
    
    res.status(201).json(asset);
  } catch (error: any) {
    console.error('Error creating asset:', error);
    console.error('Request body:', req.body);
    res.status(400).json({ 
      error: 'Failed to create asset',
      details: error.message,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
});

// Update asset (admin and manager only)
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to update assets
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only admins and managers can update assets.' });
    }

    const updateData: any = {
      ...req.body,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
      purchasePrice: req.body.purchasePrice ? Number(req.body.purchasePrice) : undefined,
      currentValue: req.body.currentValue ? Number(req.body.currentValue) : undefined,
      warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map((tag: string) => tag.trim())) : []
    };

    // Handle assignedTo field properly with validation
    try {
      updateData.assignedTo = validateAssignedTo(req.body.assignedTo);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid assignedTo ID format' });
    }

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset);
  } catch (error: any) {
    console.error('Error updating asset:', error);
    res.status(400).json({ 
      error: 'Failed to update asset',
      details: error.message 
    });
  }
});

// Delete asset (admin and manager only)
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to delete assets
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only admins and managers can delete assets.' });
    }

    const asset = await Asset.findByIdAndDelete(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// Add maintenance record
router.post('/:id/maintenance', auth, async (req: AuthRequest, res) => {
  try {
    const { date, description, cost, performedBy } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Role-based access control for maintenance
    if (req.user.role === 'employee') {
      // Employees can only add maintenance records to their assigned assets
      if (asset.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only add maintenance records to your assigned assets.' });
      }
    } else if (req.user.role === 'manager') {
      // Managers can add maintenance records to assets in their department
      const isInDepartment = asset.location.toLowerCase().includes(req.user.department.toLowerCase());
      if (!isInDepartment) {
        return res.status(403).json({ error: 'Access denied. You can only add maintenance records to assets in your department.' });
      }
    }
    // Admins can add maintenance records to any asset

    asset.maintenanceHistory.push({
      date: new Date(date),
      description,
      cost: Number(cost),
      performedBy
    });

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add maintenance record' });
  }
});

// Get asset statistics
router.get('/stats/overview', auth, async (req: AuthRequest, res) => {
  try {
    let filter = {};
    
    // Role-based filtering for statistics
    if (req.user.role === 'employee') {
      // Employees only see statistics for their assigned assets
      filter = { assignedTo: req.user._id };
    } else if (req.user.role === 'manager') {
      // Managers see statistics for their department
      filter = { location: { $regex: req.user.department, $options: 'i' } };
    }
    // Admins see all statistics (no filter)

    const totalAssets = await Asset.countDocuments(filter);
    const activeAssets = await Asset.countDocuments({ ...filter, status: 'active' });
    const maintenanceAssets = await Asset.countDocuments({ ...filter, status: 'maintenance' });
    const retiredAssets = await Asset.countDocuments({ ...filter, status: 'retired' });
    
    const totalValue = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$currentValue' } } }
    ]);

    const assetsByType = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const assetsByCondition = await Asset.aggregate([
      { $match: filter },
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    res.json({
      totalAssets,
      activeAssets,
      maintenanceAssets,
      retiredAssets,
      totalValue: totalValue[0]?.total || 0,
      assetsByType,
      assetsByCondition
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Assign asset to user (manager and admin only)
router.post('/:id/assign', auth, async (req: AuthRequest, res) => {
  try {
    const { assignedTo } = req.body;
    
    // Check if user has permission to assign assets
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only managers and admins can assign assets.' });
    }

    const asset = await Asset.findById(req.params.id);
    console.log("assests ",asset);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Manager can only assign assets in their department
    // if (req.user.role === 'manager') {
    //   console.log("request user role",req.user);
    //   const isInDepartment = asset.location.toLowerCase().includes(req.user.department.toLowerCase());
    //   console.log("is in department",isInDepartment);
    //   if (!isInDepartment) {
    //     return res.status(403).json({ error: 'Access denied. You can only assign assets in your department.' });
    //   }
    // }

    // Validate assignedTo
    try {
      const validatedAssignedTo = validateAssignedTo(assignedTo);
      asset.assignedTo = validatedAssignedTo as any;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid assignedTo ID format' });
    }

    await asset.save();
    
    const populatedAsset = await Asset.findById(asset._id)
      .populate('assignedTo', 'firstName lastName email employeeId department');
    
    res.json(populatedAsset);
  } catch (error) {
    res.status(400).json({ error: 'Failed to assign asset' });
  }
});

// Return asset (manager and admin only)
router.post('/:id/return', auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to return assets
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only managers and admins can return assets.' });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Manager can only return assets in their department
    if (req.user.role === 'manager') {
      const isInDepartment = asset.location.toLowerCase().includes(req.user.department.toLowerCase());
      if (!isInDepartment) {
        return res.status(403).json({ error: 'Access denied. You can only return assets in your department.' });
      }
    }

    // Set assignedTo to null (unassign)
    asset.assignedTo = null as any;
    await asset.save();
    
    const populatedAsset = await Asset.findById(asset._id)
      .populate('assignedTo', 'firstName lastName email employeeId department');
    
    res.json(populatedAsset);
  } catch (error) {
    res.status(400).json({ error: 'Failed to return asset' });
  }
});

// Get asset assignment history (manager and admin only)
router.get('/:id/history', auth, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to view history
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Only managers and admins can view asset history.' });
    }

    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email employeeId department');
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Manager can only view history for assets in their department
    if (req.user.role === 'manager') {
      const isInDepartment = asset.location.toLowerCase().includes(req.user.department.toLowerCase());
      if (!isInDepartment) {
        return res.status(403).json({ error: 'Access denied. You can only view history for assets in your department.' });
      }
    }

    // For now, return the asset with its current assignment
    // In a real system, you'd have a separate history collection
    res.json({
      asset,
      history: [
        {
          date: asset.updatedAt,
          action: asset.assignedTo ? 'Assigned' : 'Unassigned',
          user: asset.assignedTo ? `${(asset.assignedTo as unknown as IUser).firstName} ${(asset.assignedTo as unknown as IUser).lastName}` : 'None'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset history' });
  }
});

export default router; 