import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    supplier: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    minQuantity: { type: Number, required: true, default: 5 },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    imageUrl: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);