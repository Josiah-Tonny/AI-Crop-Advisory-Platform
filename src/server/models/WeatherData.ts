import mongoose, { Document, Schema } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export interface IWeather extends Document {
  location: ICoordinates;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    rain?: {
      '1h'?: number;
      '3h'?: number;
    };
    snow?: {
      '1h'?: number;
      '3h'?: number;
    };
    clouds: number;
    visibility: number;
    sunrise: number;
    sunset: number;
    dt: number;
  };
  forecast: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    pressure: number;
    humidity: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    speed: number;
    deg: number;
    gust?: number;
    clouds: number;
    pop: number;
    rain?: number;
    snow?: number;
  }>;
  airQuality?: {
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<ICoordinates>({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  city: { type: String },
  country: { type: String }
});

const WeatherDataSchema = new Schema<IWeather>(
  {
    location: { type: CoordinatesSchema, required: true, index: true },
    current: { type: Schema.Types.Mixed, required: true },
    forecast: [{ type: Schema.Types.Mixed }],
    airQuality: { type: Schema.Types.Mixed },
    expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      index: { expires: 0 } // TTL index
    }
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
WeatherDataSchema.index({ 'location': '2dsphere' });

// Compound index for faster lookups
WeatherDataSchema.index({ 'location.lat': 1, 'location.lon': 1 }, { unique: true });

export const WeatherData = mongoose.model<IWeather>('WeatherData', WeatherDataSchema);
