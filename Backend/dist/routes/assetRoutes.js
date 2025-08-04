"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Asset_1 = __importDefault(require("../models/Asset"));
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// Get all assets with filtering and pagination
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, location, assignedTo, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        if (location)
            filter.location = { $regex: location, $options: 'i' };
        if (assignedTo)
            filter.assignedTo = assignedTo;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { serialNumber: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const assets = await Asset_1.default.find(filter)
            .populate('assignedTo', 'firstName lastName email employeeId')
            .sort(sort)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Asset_1.default.countDocuments(filter);
        res.json({
            assets,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});
// Get single asset
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const asset = await Asset_1.default.findById(req.params.id)
            .populate('assignedTo', 'firstName lastName email employeeId department');
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.json(asset);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch asset' });
    }
});
// Create new asset
router.post('/', auth_1.auth, upload_1.upload.array('images', 5), async (req, res) => {
    try {
        const assetData = {
            ...req.body,
            purchaseDate: new Date(req.body.purchaseDate),
            purchasePrice: Number(req.body.purchasePrice),
            currentValue: Number(req.body.currentValue),
            warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined
        };
        if (req.files) {
            assetData.images = req.files.map(file => file.filename);
        }
        const asset = new Asset_1.default(assetData);
        await asset.save();
        res.status(201).json(asset);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create asset' });
    }
});
// Update asset
router.put('/:id', auth_1.auth, upload_1.upload.array('images', 5), async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
            purchasePrice: req.body.purchasePrice ? Number(req.body.purchasePrice) : undefined,
            currentValue: req.body.currentValue ? Number(req.body.currentValue) : undefined,
            warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined
        };
        if (req.files) {
            updateData.images = req.files.map(file => file.filename);
        }
        const asset = await Asset_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.json(asset);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update asset' });
    }
});
// Delete asset
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const asset = await Asset_1.default.findByIdAndDelete(req.params.id);
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.json({ message: 'Asset deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});
// Add maintenance record
router.post('/:id/maintenance', auth_1.auth, async (req, res) => {
    try {
        const { date, description, cost, performedBy } = req.body;
        const asset = await Asset_1.default.findById(req.params.id);
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
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to add maintenance record' });
    }
});
// Get asset statistics
router.get('/stats/overview', auth_1.auth, async (req, res) => {
    try {
        const totalAssets = await Asset_1.default.countDocuments();
        const activeAssets = await Asset_1.default.countDocuments({ status: 'active' });
        const maintenanceAssets = await Asset_1.default.countDocuments({ status: 'maintenance' });
        const retiredAssets = await Asset_1.default.countDocuments({ status: 'retired' });
        const totalValue = await Asset_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$currentValue' } } }
        ]);
        const assetsByType = await Asset_1.default.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);
        const assetsByCondition = await Asset_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
exports.default = router;
//# sourceMappingURL=assetRoutes.js.map