import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProduct extends Document {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: mongoose.Types.ObjectId[];
  images: string[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema(
  {
    product_id: {
      required: true,
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Category',
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    averageRating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProduct>('Product', productSchema);
