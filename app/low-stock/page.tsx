"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading, ContentLoading } from '@/components/ui/page-loading';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { AlertTriangle, Package, Search, RefreshCw, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  minQuantity: number;
  price: number;
  status: 'active' | 'inactive';
}

export default function LowStockPage() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      try {
        await fetchLowStockProducts();
      } catch (error) {
        console.error('Error initializing page:', error);
      } finally {
        setPageLoading(false);
      }
    };

    initializePage();
  }, []);

  useEffect(() => {
    if (!pageLoading) {
      const timeoutId = setTimeout(() => {
        fetchLowStockProducts();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, pageLoading]);

  const fetchLowStockProducts = async () => {
    try {
      if (!pageLoading) setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Filter products that are low stock or out of stock
        const lowStockProducts = data.products.filter((product: LowStockProduct) => 
          product.quantity <= product.minQuantity
        );
        setProducts(lowStockProducts);
      } else {
        toast.error('Failed to fetch low stock products');
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      toast.error('Failed to fetch low stock products');
    } finally {
      if (!pageLoading) setLoading(false);
    }
  };

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, color: 'text-red-600' };
    } else if (quantity <= minQuantity) {
      return { label: 'Low Stock', variant: 'default' as const, color: 'text-orange-600' };
    }
    return { label: 'In Stock', variant: 'secondary' as const, color: 'text-green-600' };
  };

  const getUrgencyLevel = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'Critical';
    if (quantity <= minQuantity / 2) return 'High';
    return 'Medium';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;

  // Show page loading spinner
  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Low Stock Alert" description="Monitor and manage inventory levels" />
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-red-500 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Immediate action required</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Low Stock</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Needs restocking soon</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Requiring attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Refresh */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search low stock products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <Button 
            onClick={fetchLowStockProducts} 
            variant="outline"
            className="flex items-center space-x-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Products List */}
        {loading ? (
          <ContentLoading title="Low Stock Products" />
        ) : products.length > 0 ? (
          <div className="space-y-4">
            {products
              .sort((a, b) => {
                // Sort by urgency: out of stock first, then by quantity ascending
                if (a.quantity === 0 && b.quantity > 0) return -1;
                if (b.quantity === 0 && a.quantity > 0) return 1;
                return a.quantity - b.quantity;
              })
              .map((product) => {
                const stockStatus = getStockStatus(product.quantity, product.minQuantity);
                const urgency = getUrgencyLevel(product.quantity, product.minQuantity);
                
                return (
                  <Card key={product._id} className="transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {product.name}
                                </h3>
                                <Badge 
                                  variant={stockStatus.variant}
                                  className="flex items-center space-x-1"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{stockStatus.label}</span>
                                </Badge>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(urgency)}`}>
                                  {urgency} Priority
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                                  <p className="font-medium dark:text-white">{product.sku}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                  <p className="font-medium dark:text-white">{product.category}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
                                  <p className="font-medium dark:text-white">{product.supplier}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Price:</span>
                                  <p className="font-medium dark:text-white">${product.price.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Stock</div>
                            <div className={`text-2xl font-bold ${stockStatus.color}`}>
                              {product.quantity}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Min Required</div>
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                              {product.minQuantity}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Shortage</div>
                            <div className="text-2xl font-bold text-red-600">
                              {Math.max(0, product.minQuantity - product.quantity)}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All stock levels are healthy!</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'No low stock products match your search criteria' 
                : 'All products are currently above their minimum stock levels'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}