"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading, ContentLoading } from '@/components/ui/page-loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Package, 
  Tags, 
  Building2, 
  RotateCcw, 
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface InactiveProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  price: number;
  status: string;
  updatedAt: string;
}

interface InactiveCategory {
  _id: string;
  name: string;
  description?: string;
  status: string;
  updatedAt: string;
}

interface InactiveSupplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  updatedAt: string;
}

interface InactiveData {
  products: InactiveProduct[];
  categories: InactiveCategory[];
  suppliers: InactiveSupplier[];
}

export default function InactivePage() {
  const [data, setData] = useState<InactiveData>({ products: [], categories: [], suppliers: [] });
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      try {
        await fetchInactiveItems();
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
        fetchInactiveItems();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, pageLoading]);

  const fetchInactiveItems = async () => {
    try {
      if (!pageLoading) setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/inactive?${params}`);
      if (response.ok) {
        const inactiveData = await response.json();
        setData({
          products: inactiveData.products || [],
          categories: inactiveData.categories || [],
          suppliers: inactiveData.suppliers || []
        });
      } else {
        toast.error('Failed to fetch inactive items');
      }
    } catch (error) {
      console.error('Error fetching inactive items:', error);
      toast.error('Failed to fetch inactive items');
    } finally {
      if (!pageLoading) setLoading(false);
    }
  };

  const handleActivate = async (type: string, id: string, name: string) => {
    try {
      setActivating(id);
      const response = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${name} activated successfully`);
        fetchInactiveItems();
      } else {
        toast.error(result.error || `Failed to activate ${type}`);
        if (result.details) {
          toast.error(result.details);
        }
      }
    } catch (error) {
      console.error(`Error activating ${type}:`, error);
      toast.error(`Failed to activate ${type}`);
    } finally {
      setActivating(null);
    }
  };

  const getTabCounts = () => ({
    products: data.products.length,
    categories: data.categories.length,
    suppliers: data.suppliers.length
  });

  const counts = getTabCounts();

  // Show page loading spinner
  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Inactive Items" description="Manage and reactivate inactive products, categories, and suppliers" />
      
      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search inactive items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>Total Inactive: {counts.products + counts.categories + counts.suppliers}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products ({counts.products})</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tags className="h-4 w-4" />
              <span>Categories ({counts.categories})</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Suppliers ({counts.suppliers})</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            {loading ? (
              <ContentLoading title="Inactive Products" />
            ) : data.products.length > 0 ? (
              <div className="space-y-4">
                {data.products.map((product) => (
                  <Card key={product._id} className="transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Inactive
                            </Badge>
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
                              <span className="text-gray-500 dark:text-gray-400">Stock:</span>
                              <p className="font-medium dark:text-white">{product.quantity} units</p>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Deactivated {new Date(product.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleActivate('product', product._id, product.name)}
                          disabled={activating === product._id}
                          className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                        >
                          {activating === product._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                          <span>Activate</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inactive products</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No inactive products match your search' : 'All products are currently active'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            {loading ? (
              <ContentLoading title="Inactive Categories" />
            ) : data.categories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.categories.map((category) => (
                  <Card key={category._id} className="transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <Tags className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Inactive
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {category.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Deactivated {new Date(category.updatedAt).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleActivate('category', category._id, category.name)}
                          disabled={activating === category._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {activating === category._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inactive categories</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No inactive categories match your search' : 'All categories are currently active'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            {loading ? (
              <ContentLoading title="Inactive Suppliers" />
            ) : data.suppliers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.suppliers.map((supplier) => (
                  <Card key={supplier._id} className="transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <Building2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                              {supplier.name}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              Inactive
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {supplier.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                          <span className="line-clamp-2">{supplier.address}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Deactivated {new Date(supplier.updatedAt).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleActivate('supplier', supplier._id, supplier.name)}
                          disabled={activating === supplier._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {activating === supplier._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inactive suppliers</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No inactive suppliers match your search' : 'All suppliers are currently active'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}