import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lon: number;
  name?: string;
}

export interface IIrrigationEvent {
  date: Date;
  waterAmount: number; // mm
  duration: number; // minutes
  method: 'Drip' | 'Sprinkler' | 'Furrow' | 'Flood' | 'Manual';
  status: 'Pending' | 'Completed' | 'Skipped' | 'Adjusted';
  actualWaterUsed?: number; // mm
  notes?: string;
}

export interface IIrrigationSchedule extends Document {
  userId: Types.ObjectId;
  cropId: Types.ObjectId;
  location: ICoordinates;
  cropType: string;
  schedule: IIrrigationEvent[];
  currentStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity';
  soilType: 'Sandy' | 'Loamy' | 'Clay' | 'Silty' | 'Peaty' | 'Chalky' | 'Saline';
  efficiency: {
    drip: { efficiency: number; cost: string; suitability: string };
    sprinkler: { efficiency: number; cost: string; suitability: string };
    furrow: { efficiency: number; cost: string; suitability: string };
  };
  recommendations: string[];
  totalWaterUsed: number; // mm
  totalWaterSaved: number; // mm compared to traditional methods
  lastIrrigated: Date;
  nextIrrigation: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<ICoordinates>({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  name: { type: String }
});

const IrrigationEventSchema = new Schema<IIrrigationEvent>({
  date: { type: Date, required: true },
  waterAmount: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 0 },
  method: { 
    type: String, 
    required: true,
    enum: ['Drip', 'Sprinkler', 'Furrow', 'Flood', 'Manual']
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Skipped', 'Adjusted'],
    default: 'Pending'
  },
  actualWaterUsed: { type: Number, min: 0 },
  notes: { type: String }
});

const IrrigationScheduleSchema = new Schema<IIrrigationSchedule>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      index: true 
    },
    cropId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Crop',
      required: true,
      index: true 
    },
    location: { type: CoordinatesSchema, required: true, index: true },
    cropType: { 
      type: String, 
      required: true,
      index: true 
    },
    schedule: [IrrigationEventSchema],
    currentStage: {
      type: String,
      required: true,
      enum: ['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'],
      default: 'Germination'
    },
    soilType: {
      type: String,
      required: true,
      enum: ['Sandy', 'Loamy', 'Clay', 'Silty', 'Peaty', 'Chalky', 'Saline']
    },
    efficiency: {
      type: {
        drip: {
          efficiency: { type: Number, min: 0, max: 100 },
          cost: { type: String, enum: ['Low', 'Medium', 'High'] },
          suitability: { type: String }
        },
        sprinkler: {
          efficiency: { type: Number, min: 0, max: 100 },
          cost: { type: String, enum: ['Low', 'Medium', 'High'] },
          suitability: { type: String }
        },
        furrow: {
          efficiency: { type: Number, min: 0, max: 100 },
          cost: { type: String, enum: ['Low', 'Medium', 'High'] },
          suitability: { type: String }
        }
      },
      required: true
    },
    recommendations: [{ type: String }],
    totalWaterUsed: { type: Number, default: 0, min: 0 },
    totalWaterSaved: { type: Number, default: 0, min: 0 },
    lastIrrigated: { type: Date },
    nextIrrigation: { type: Date, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

// Indexes for common queries
IrrigationScheduleSchema.index({ 'location': '2dsphere' });
IrrigationScheduleSchema.index({ cropType: 1, currentStage: 1 });
IrrigationScheduleSchema.index({ 'schedule.status': 1, 'schedule.date': 1 });

// Pre-save hook to update nextIrrigation
IrrigationScheduleSchema.pre<IIrrigationSchedule>('save', function(next) {
  if (this.schedule && this.schedule.length > 0) {
    const nextEvent = this.schedule
      .filter(event => event.status === 'Pending')
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    
    if (nextEvent) {
      this.nextIrrigation = nextEvent.date;
    }
  }
  next();
});

export const IrrigationSchedule = mongoose.model<IIrrigationSchedule>(
  'IrrigationSchedule', 
  IrrigationScheduleSchema
);
