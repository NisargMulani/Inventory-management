import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Supplier from '@/lib/models/Supplier';

export async function GET() {
  try {
    console.log('🚀 Dashboard API called');
    
    // Test connection first
    await dbConnect();
    console.log('📊 Database connected, fetching dashboard data...');
    
    // Get accurate counts with proper filtering
    const totalProducts = await Product.countDocuments({ status: 'active' });
    console.log(`📦 Total active products found: ${totalProducts}`);
    
    const lowStockProducts = await Product.countDocuments({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minQuantity'] },
      quantity: { $gt: 0 }
    });
    console.log(`⚠️ Low stock products: ${lowStockProducts}`);
    
    const outOfStockProducts = await Product.countDocuments({ 
      status: 'active',
      quantity: 0 
    });
    console.log(`❌ Out of stock products: ${outOfStockProducts}`);
    
    const totalValue = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);
    console.log(`💰 Total inventory value: $${totalValue[0]?.total || 0}`);
    
    const recentProducts = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name sku quantity price createdAt');
    console.log(`📋 Recent products found: ${recentProducts.length}`);
    
    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    console.log(`📊 Category stats: ${categoryStats.length} categories`);
    
    // Get inactive counts for additional insights
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
    const inactiveCategories = await Category.countDocuments({ status: 'inactive' });
    const inactiveSuppliers = await Supplier.countDocuments({ status: 'inactive' });
    
    const dashboardData = {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue: totalValue[0]?.total || 0,
      recentProducts,
      categoryStats,
      inactiveItems: {
        products: inactiveProducts,
        categories: inactiveCategories,
        suppliers: inactiveSuppliers
      }
    };
    
    console.log('✅ Dashboard data fetched successfully');
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ServerSelectionError')) {
        return NextResponse.json({ 
          error: 'Database connection failed',
          details: 'Unable to connect to MongoDB Atlas. Please check your connection string and network.',
          suggestions: [
            'Verify your MongoDB Atlas cluster is running',
            'Check if your IP address is whitelisted',
            'Ensure your internet connection is stable',
            'Verify the connection string is correct'
          ]
        }, { status: 503 });
      }
      
      if (error.message.includes('MongoDB connection string is not configured')) {
        return NextResponse.json({ 
          error: 'Database not configured',
          details: error.message
        }, { status: 500 });
      }
      
      if (error.message.includes('Authentication failed')) {
        return NextResponse.json({ 
          error: 'Database authentication failed',
          details: 'Please check your MongoDB username and password in the connection string.'
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: 'An unexpected error occurred while connecting to the database.',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}