import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Supplier from '@/lib/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Products API called');
    await dbConnect();
    console.log('📊 Database connected for products');
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    } else {
      // Default to active products only
      query.status = 'active';
    }
    
    const skip = (page - 1) * limit;
    
    console.log('🔍 Query:', query);
    console.log('📄 Pagination:', { page, limit, skip });
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    console.log(`📦 Found ${products.length} products out of ${total} total`);
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating new product');
    await dbConnect();
    
    const body = await request.json();
    console.log('📝 Product data:', body);
    
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
    
    // Check if supplier is active
    const supplier = await Supplier.findOne({ name: body.supplier });
    if (supplier && supplier.status === 'inactive') {
      return NextResponse.json({ 
        error: 'Cannot create product with inactive supplier',
        details: 'The selected supplier is inactive. Please activate the supplier first or choose a different supplier.'
      }, { status: 400 });
    }
    
    const productData = {
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
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 400 }
      );
    }
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product created successfully:', product._id);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    
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
    
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}