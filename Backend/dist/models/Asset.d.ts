import mongoose from 'mongoose';
export interface IAsset {
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
declare const _default: mongoose.Model<IAsset, {}, {}, {}, mongoose.Document<unknown, {}, IAsset> & IAsset & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
