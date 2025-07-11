"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentProducts } from '@/components/dashboard/recent-products';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

interface DashboardData {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  recentProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    createdAt: string;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="Dashboard" description="Overview of your inventory" />
        <div className="p-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="Dashboard" description="Overview of your inventory" />
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header title="Dashboard" description="Overview of your inventory" />
      <div className="p-6 space-y-6">
        <StatsCards stats={data} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <RecentProducts products={data.recentProducts} />
          <CategoryChart data={data.categoryStats} />
        </div>
      </div>
    </div>
  );
}