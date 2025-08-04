import mongoose, { Schema } from 'mongoose';

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

const AssetSchema = new Schema<IAsset>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['equipment', 'furniture', 'electronics', 'vehicle', 'software', 'other']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    index: true
  },
  model: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'maintenance', 'retired', 'lost', 'stolen'],
    default: 'active'
  },
  condition: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  warrantyExpiry: {
    type: Date
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    performedBy: {
      type: String,
      required: true
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
AssetSchema.index({ name: 1 });
AssetSchema.index({ type: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ assignedTo: 1 });
AssetSchema.index({ location: 1 });
AssetSchema.index({ tags: 1 });

export default mongoose.model<IAsset>('Asset', AssetSchema); 