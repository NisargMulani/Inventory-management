import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function POST() {
  try {
    console.log('🚀 Low Stock Notification API called');
    await dbConnect();
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    }).select('name sku quantity minQuantity supplier');
    
    if (lowStockProducts.length === 0) {
      return NextResponse.json({ 
        message: 'No low stock items found',
        count: 0 
      });
    }
    
    // Simulate sending email notification
    const emailContent = `
Low Stock Alert - ${new Date().toLocaleDateString()}
=============================================

The following items are running low on stock:

${lowStockProducts.map(product => 
  `• ${product.name} (SKU: ${product.sku})
    Current Stock: ${product.quantity}
    Minimum Required: ${product.minQuantity}
    Supplier: ${product.supplier}
    Shortage: ${product.minQuantity - product.quantity} units
`).join('\n')}

Please reorder these items as soon as possible.

---
Inventory Management System
    `;
    
    console.log('📧 Low Stock Email Notification:');
    console.log(emailContent);
    
    // In a real app, you would send this via email service like SendGrid, Nodemailer, etc.
    // For demo purposes, we'll just log it and return success
    
    return NextResponse.json({ 
      message: 'Low stock notification sent successfully',
      count: lowStockProducts.length,
      products: lowStockProducts.map(p => ({
        name: p.name,
        sku: p.sku,
        currentStock: p.quantity,
        minStock: p.minQuantity,
        shortage: p.minQuantity - p.quantity
      }))
    });
  } catch (error) {
    console.error('❌ Error sending low stock notification:', error);
    return NextResponse.json({ 
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}