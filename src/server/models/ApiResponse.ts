import mongoose, { Document, Schema } from 'mongoose';

export interface IApiResponse extends Document {
  endpoint: string;
  params: Record<string, any>;
  response: any;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApiResponseSchema = new Schema<IApiResponse>(
  {
    endpoint: { type: String, required: true, index: true },
    params: { type: Schema.Types.Mixed, default: {} },
    response: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, index: { expires: '30d' } } // Auto-delete after 30 days
  },
  { timestamps: true }
);

// Compound index for faster lookups
ApiResponseSchema.index({ endpoint: 1, params: 1 });

export const ApiResponse = mongoose.model<IApiResponse>('ApiResponse', ApiResponseSchema);
