import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

export interface IUser extends Document {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    user_id: { type: String, required: true, unique: true, default: uuid },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    refreshToken: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>('User', UserSchema);
