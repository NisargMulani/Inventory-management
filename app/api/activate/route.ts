import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Supplier from '@/lib/models/Supplier';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { type, id } = await request.json();
    
    let result;
    let message = '';
    
    switch (type) {
      case 'product':
        // Check if supplier is active before activating product
        const product = await Product.findById(id);
        if (!product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        
        const supplier = await Supplier.findOne({ name: product.supplier });
        if (supplier && supplier.status === 'inactive') {
          return NextResponse.json({ 
            error: 'Cannot activate product with inactive supplier',
            details: 'The supplier for this product is inactive. Please activate the supplier first.'
          }, { status: 400 });
        }
        
        result = await Product.findByIdAndUpdate(id, { status: 'active' }, { new: true });
        message = 'Product activated successfully';
        break;
        
      case 'category':
        result = await Category.findByIdAndUpdate(id, { status: 'active' }, { new: true });
        message = 'Category activated successfully';
        break;
        
      case 'supplier':
        result = await Supplier.findByIdAndUpdate(id, { status: 'active' }, { new: true });
        message = 'Supplier activated successfully';
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    console.log(`✅ ${message}:`, result._id);
    
    return NextResponse.json({ message, item: result });
  } catch (error) {
    console.error('❌ Error activating item:', error);
    return NextResponse.json({ 
      error: 'Failed to activate item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}