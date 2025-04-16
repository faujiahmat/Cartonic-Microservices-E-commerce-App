import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IReview extends Document {
  reviewId: string; // UUID
  productId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updateAt: Date;
}

const reviewSchema = new Schema(
  {
    reviewId: { type: String, required: true, unique: true, default: uuidv4 },
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IReview>('Review', reviewSchema.index({ productId: 1 }));
