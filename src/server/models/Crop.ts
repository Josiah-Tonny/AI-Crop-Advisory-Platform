import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  name: string;
  scientificName?: string;
  category: string;
  growthDuration: string;
  optimalTemp: string;
  rainfall: string;
  soilPH: string;
  plantingDepth: string;
  spacing: string;
  yield: string;
  profitability: string;
  marketDemand: string;
  diseases: string[];
  pests: string[];
  fertilizer: string;
  irrigation: string;
  harvesting: string;
  storage: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>(
  {
    name: { type: String, required: true, unique: true },
    scientificName: { type: String },
    category: { type: String, required: true, index: true },
    growthDuration: { type: String, required: true },
    optimalTemp: { type: String, required: true },
    rainfall: { type: String, required: true },
    soilPH: { type: String, required: true },
    plantingDepth: { type: String, required: true },
    spacing: { type: String, required: true },
    yield: { type: String, required: true },
    profitability: { type: String, required: true },
    marketDemand: { type: String, required: true },
    diseases: [{ type: String }],
    pests: [{ type: String }],
    fertilizer: { type: String, required: true },
    irrigation: { type: String, required: true },
    harvesting: { type: String, required: true },
    storage: { type: String, required: true },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

// Indexes for faster queries
CropSchema.index({ name: 'text', category: 1 });

export const Crop = mongoose.model<ICrop>('Crop', CropSchema);
