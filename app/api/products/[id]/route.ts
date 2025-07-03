import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.sku || !body.category || !body.supplier) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, category, supplier' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const quantity = Number(body.quantity);
    const minQuantity = Number(body.minQuantity);
    const price = Number(body.price);
    const cost = Number(body.cost);

    if (isNaN(quantity) || isNaN(minQuantity) || isNaN(price) || isNaN(cost)) {
      return NextResponse.json(
        { error: 'Quantity, minQuantity, price, and cost must be valid numbers' },
        { status: 400 }
      );
    }

    if (quantity < 0 || minQuantity < 0 || price < 0 || cost < 0) {
      return NextResponse.json(
        { error: 'Quantity, minQuantity, price, and cost must be non-negative' },
        { status: 400 }
      );
    }
    
    const updateData = {
      name: body.name.trim(),
      description: body.description?.trim() || '',
      sku: body.sku.trim(),
      category: body.category.trim(),
      supplier: body.supplier.trim(),
      quantity: quantity,
      minQuantity: minQuantity,
      price: price,
      cost: cost,
      imageUrl: body.imageUrl?.trim() || '',
      status: body.status || 'active',
    };
    
    // Check if SKU already exists for other products
    const existingProduct = await Product.findOne({ 
      sku: updateData.sku,
      _id: { $ne: params.id }
    });
    
    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 400 }
      );
    }
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'A product with this SKU already exists' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid product data provided' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}