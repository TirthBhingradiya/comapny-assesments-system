"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AssetSchema = new mongoose_1.Schema({
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
        sparse: true
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
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.model('Asset', AssetSchema);
//# sourceMappingURL=Asset.js.map