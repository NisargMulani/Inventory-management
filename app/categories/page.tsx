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
import { CategoryForm } from '@/components/categories/category-form';
import { CategoryCardSkeleton } from '@/components/ui/loading-skeleton';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      try {
        await fetchCategories();
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
        fetchCategories();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, pageLoading]);

  const fetchCategories = async () => {
    try {
      if (!pageLoading) setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const filteredData = searchTerm
          ? data.filter((category: Category) =>
              category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              category.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : data;
        setCategories(filteredData);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      if (!pageLoading) setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setIsFormOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Category deleted successfully');
          fetchCategories();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  // Show page loading spinner
  if (pageLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Categories" description="Organize your products by categories" />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                onSubmit={handleSubmit}
                initialData={editingCategory || undefined}
                onCancel={() => setIsFormOpen(false)}
                isLoading={submitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <ContentLoading title="Categories" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category._id} className="group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-500 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </CardTitle>
                        <Badge 
                          variant={category.status === 'active' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {category.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:text-gray-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category._id)}
                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:text-gray-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No categories found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Category
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}