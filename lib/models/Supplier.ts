import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);