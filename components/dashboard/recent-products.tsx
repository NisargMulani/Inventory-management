"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  createdAt: string;
}

interface RecentProductsProps {
  products: Product[];
}

export function RecentProducts({ products }: RecentProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant={product.quantity > 0 ? 'secondary' : 'destructive'}>
                    {product.quantity} in stock
                  </Badge>
                  <span className="text-sm font-medium">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {
                    product.createdAt && !isNaN(new Date(product.createdAt).getTime())
                    ? formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}