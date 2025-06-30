import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    });
    const outOfStockProducts = await Product.countDocuments({ quantity: 0 });
    
    const totalValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);
    
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name sku quantity price createdAt');
    
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue: totalValue[0]?.total || 0,
      recentProducts,
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ServerSelectionError')) {
        return NextResponse.json({ 
          error: 'Database connection failed. Please ensure MongoDB is running and accessible.',
          details: 'Configure MONGODB_URI in your .env.local file with a valid MongoDB connection string.'
        }, { status: 503 });
      }
      
      if (error.message.includes('MongoDB connection string is not configured')) {
        return NextResponse.json({ 
          error: 'Database not configured',
          details: error.message
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: 'An unexpected error occurred while connecting to the database.'
    }, { status: 500 });
  }
}