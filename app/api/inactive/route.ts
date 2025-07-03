import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Supplier from '@/lib/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Inactive items API called');
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'products', 'categories', 'suppliers'
    const search = searchParams.get('search');
    
    let query: any = { status: 'inactive' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
      
      // Add additional search fields based on type
      if (type === 'products') {
        query.$or.push(
          { sku: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { supplier: { $regex: search, $options: 'i' } }
        );
      } else if (type === 'suppliers') {
        query.$or.push(
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        );
      }
    }
    
   let data: {
  products?: any[];
  categories?: any[];
  suppliers?: any[];} = {};

    
    if (!type || type === 'products') {
      const products = await Product.find(query).sort({ updatedAt: -1 });
      data = { ...data, products };
    }
    
    if (!type || type === 'categories') {
      const categories = await Category.find(query).sort({ updatedAt: -1 });
      data = { ...data, categories };
    }
    
    if (!type || type === 'suppliers') {
      const suppliers = await Supplier.find(query).sort({ updatedAt: -1 });
      data = { ...data, suppliers };
    }
    
    const summary = Object.entries(data).map(
    ([key, value]) => `${key}: ${value?.length || 0}`);
    console.log("📦 Found inactive items:", summary);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching inactive items:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch inactive items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}