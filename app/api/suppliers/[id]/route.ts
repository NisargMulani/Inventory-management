import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';
import Product from '@/lib/models/Product';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const supplier = await Supplier.findById(params.id);
    
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const supplier = await Supplier.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    
    // If supplier is being deactivated, deactivate all its products
    if (body.status === 'inactive') {
      await Product.updateMany(
        { supplier: supplier.name },
        { status: 'inactive' }
      );
      console.log(`🔄 Deactivated all products for supplier: ${supplier.name}`);
    }
    
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const supplier = await Supplier.findByIdAndDelete(params.id);
    
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
  }
}