import mongoose, { Document, Schema } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lon: number;
  address?: string;
}

export interface ISoilAnalysis extends Document {
  location: ICoordinates;
  ph: number;
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  organicMatter: number; // %
  moisture: number; // %
  temperature: number; // °C
  salinity: number; // dS/m
  texture?: {
    sand: number; // %
    silt: number; // %
    clay: number; // %
    texturalClass?: string; // e.g., 'Loam', 'Sandy Loam'
  };
  micronutrients?: {
    calcium: number; // ppm
    magnesium: number; // ppm
    sulfur: number; // ppm
    iron: number; // ppm
    manganese: number; // ppm
    zinc: number; // ppm
    copper: number; // ppm
    boron: number; // ppm
    molybdenum: number; // ppm
  };
  contaminants?: {
    lead: number; // ppm
    cadmium: number; // ppm
    arsenic: number; // ppm
    mercury: number; // ppm
  };
  recommendations: string[];
  healthScore: number;
  cropType?: string;
  analysisDate: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<ICoordinates>({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  address: { type: String }
});

const TextureSchema = new Schema({
  sand: { type: Number, min: 0, max: 100 },
  silt: { type: Number, min: 0, max: 100 },
  clay: { type: Number, min: 0, max: 100 },
  texturalClass: { type: String }
});

const MicronutrientsSchema = new Schema({
  calcium: { type: Number, min: 0 },
  magnesium: { type: Number, min: 0 },
  sulfur: { type: Number, min: 0 },
  iron: { type: Number, min: 0 },
  manganese: { type: Number, min: 0 },
  zinc: { type: Number, min: 0 },
  copper: { type: Number, min: 0 },
  boron: { type: Number, min: 0 },
  molybdenum: { type: Number, min: 0 }
});

const ContaminantsSchema = new Schema({
  lead: { type: Number, min: 0 },
  cadmium: { type: Number, min: 0 },
  arsenic: { type: Number, min: 0 },
  mercury: { type: Number, min: 0 }
});

const SoilAnalysisSchema = new Schema<ISoilAnalysis>(
  {
    location: { type: CoordinatesSchema, required: true, index: true },
    ph: { type: Number, required: true, min: 0, max: 14 },
    nitrogen: { type: Number, required: true, min: 0 },
    phosphorus: { type: Number, required: true, min: 0 },
    potassium: { type: Number, required: true, min: 0 },
    organicMatter: { type: Number, required: true, min: 0, max: 100 },
    moisture: { type: Number, required: true, min: 0, max: 100 },
    temperature: { type: Number, required: true },
    salinity: { type: Number, required: true, min: 0 },
    texture: { type: TextureSchema },
    micronutrients: { type: MicronutrientsSchema },
    contaminants: { type: ContaminantsSchema },
    recommendations: [{ type: String }],
    healthScore: { type: Number, required: true, min: 0, max: 100 },
    cropType: { type: String },
    analysisDate: { type: Date, default: Date.now },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      index: { expires: 0 } // TTL index
    }
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
SoilAnalysisSchema.index({ 'location': '2dsphere' });

// Compound index for common query patterns
SoilAnalysisSchema.index({ 'location.lat': 1, 'location.lon': 1 });
SoilAnalysisSchema.index({ analysisDate: -1 });
SoilAnalysisSchema.index({ cropType: 1, analysisDate: -1 });

export const SoilAnalysis = mongoose.model<ISoilAnalysis>('SoilAnalysis', SoilAnalysisSchema);
