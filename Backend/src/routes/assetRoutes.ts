import express from 'express';
import { auth } from '../middleware/auth';
import Asset from '../models/Asset';
import { upload } from '../middleware/upload';

const router = express.Router();

// Get all assets with filtering and pagination
router.get('/', auth, async (req, res) => {
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
    // if (req.user.role === 'employee') {
    //   // Employees can only see assets in their department or unassigned assets
    //   filter.$or = [
    //     { location: { $regex: req.user.department, $options: 'i' } },
    //     { assignedTo: null },
    //     { assignedTo: req.user._id }
    //   ];
    // }

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
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email employeeId department');
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Create new asset (admin and manager only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Check if user has permission to create assets
    // if (!['admin', 'manager'].includes(req.user.role)) {
    //   return res.status(403).json({ error: 'Access denied. Only admins and managers can create assets.' });
    // }

    const assetData = {
      ...req.body,
      purchaseDate: new Date(req.body.purchaseDate),
      purchasePrice: Number(req.body.purchasePrice),
      currentValue: Number(req.body.currentValue),
      warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined
    };

    if (req.files) {
      assetData.images = (req.files as Express.Multer.File[]).map(file => file.filename);
    }

    const asset = new Asset(assetData);
    await asset.save();
    
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create asset' });
  }
});

// Update asset (admin and manager only)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Check if user has permission to update assets
    // if (!['admin', 'manager'].includes(req.user.role)) {
    //   return res.status(403).json({ error: 'Access denied. Only admins and managers can update assets.' });
    // }

    const updateData = {
      ...req.body,
      purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
      purchasePrice: req.body.purchasePrice ? Number(req.body.purchasePrice) : undefined,
      currentValue: req.body.currentValue ? Number(req.body.currentValue) : undefined,
      warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined
    };

    if (req.files) {
      updateData.images = (req.files as Express.Multer.File[]).map(file => file.filename);
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
  } catch (error) {
    res.status(400).json({ error: 'Failed to update asset' });
  }
});

// Delete asset (admin and manager only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user has permission to delete assets
    // if (!['admin', 'manager'].includes(req.user.role)) {
    //   return res.status(403).json({ error: 'Access denied. Only admins and managers can delete assets.' });
    // }

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
router.post('/:id/maintenance', auth, async (req, res) => {
  try {
    const { date, description, cost, performedBy } = req.body;
    
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

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
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const activeAssets = await Asset.countDocuments({ status: 'active' });
    const maintenanceAssets = await Asset.countDocuments({ status: 'maintenance' });
    const retiredAssets = await Asset.countDocuments({ status: 'retired' });
    
    const totalValue = await Asset.aggregate([
      { $group: { _id: null, total: { $sum: '$currentValue' } } }
    ]);

    const assetsByType = await Asset.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const assetsByCondition = await Asset.aggregate([
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

export default router; 