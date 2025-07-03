"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function PageLoading() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-96 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while we fetch your data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ContentLoading({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading {title}...
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we fetch your data
        </p>
      </div>
    </div>
  );
}