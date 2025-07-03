"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading, ContentLoading } from '@/components/ui/page-loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/products/product-form';
import { ProductCardSkeleton } from '@/components/ui/loading-skeleton';
import { Plus, Search, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Supplier {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchSuppliers()
        ]);
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
      fetchProducts();
    }
  }, [searchTerm, selectedCategory, pageLoading]);

  const fetchProducts = async () => {
    try {
      if (!pageLoading) setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      if (!pageLoading) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setIsFormOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Product deleted successfully');
          fetchProducts();
        } else {
          toast.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const getProductImage = (product: Product) => {
    if (product.imageUrl) {
      return product.imageUrl;
    }
    // Return a placeholder image from Pexels based on product category
    const categoryImages: { [key: string]: string } = {
      'Electronics': 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=300',
      'Clothing': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=300',
      'Food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      'Books': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
      'Sports': 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=300',
      'Home': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300',
    };
    
    return categoryImages[product.category] || 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=300';
  };

  // Show page loading spinner
  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Products" description="Manage your product inventory" />
      
      <div className="p-6 space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                onSubmit={handleSubmit}
                initialData={editingProduct || undefined}
                categories={categories}
                suppliers={suppliers}
                isLoading={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {loading ? (
          <ContentLoading title="Products" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product._id} className="transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 group">
                <CardHeader className="pb-3">
                  
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-1
                    00 dark:bg-gray-700 group">
                        {/* Buttons only visible on hover */}
                        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="dark:text-gray-100 dark:bg-neutral-900 dark:hover:text-white bg-white/80 hover:bg-white p-1 rounded-full"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product._id)}
                            className="dark:text-gray-100 dark:bg-neutral-900 dark:hover:text-white bg-white/80 hover:bg-white p-1 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Product image */}
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg?auto=compress&cs=tinysrgb&w=300';
                          }}
                        />
                      </div>
                    
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                      <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">{product.category}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                      <Badge
                        variant={
                          product.quantity === 0
                            ? 'destructive'
                            : product.quantity <= product.minQuantity
                            ? 'default'
                            : 'secondary'
                        }
                        className={product.quantity === 0 ? '' : product.quantity <= product.minQuantity ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 'dark:bg-gray-700 dark:text-gray-300'}
                      >
                        {product.quantity} units
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="font-semibold dark:text-white">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Supplier:</span>
                      <span className="text-sm dark:text-gray-300">{product.supplier}</span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
            </p>
            {!searchTerm && !selectedCategory && (
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}