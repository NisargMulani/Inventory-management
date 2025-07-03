"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading, ContentLoading } from '@/components/ui/page-loading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { SupplierCardSkeleton } from '@/components/ui/loading-skeleton';
import { Plus, Search, Edit, Trash2, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Supplier {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      try {
        await fetchSuppliers();
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
        fetchSuppliers();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, pageLoading]);

  const fetchSuppliers = async () => {
    try {
      if (!pageLoading) setLoading(true);
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        const filteredData = searchTerm
          ? data.filter((supplier: Supplier) =>
              supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              supplier.phone?.includes(searchTerm)
            )
          : data;
        setSuppliers(filteredData);
      } else {
        toast.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
    } finally {
      if (!pageLoading) setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const url = editingSupplier ? `/api/suppliers/${editingSupplier._id}` : '/api/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully');
        setIsFormOpen(false);
        setEditingSupplier(null);
        fetchSuppliers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save supplier');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplierId: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Supplier deleted successfully');
          fetchSuppliers();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete supplier');
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error('Failed to delete supplier');
      }
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const openAddDialog = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  // Show page loading spinner
  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Suppliers" description="Manage your supplier relationships" />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
              </DialogHeader>
              <SupplierForm
                onSubmit={handleSubmit}
                initialData={editingSupplier || undefined}
                onCancel={() => setIsFormOpen(false)}
                isLoading={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Suppliers Grid */}
        {loading ? (
          <ContentLoading title="Suppliers" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier._id} className="group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-green-500 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          {supplier.name}
                        </CardTitle>
                        <Badge 
                          variant={supplier.status === 'active' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {supplier.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(supplier)}
                        className="h-8 w-8 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900 dark:text-gray-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplier._id)}
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:text-gray-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Added {new Date(supplier.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && suppliers.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No suppliers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first supplier'}
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Supplier
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}