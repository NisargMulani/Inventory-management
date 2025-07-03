"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Search, Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b  dark:bg-gray-800 dark:border-gray-700 px-6 sticky top-0 z-50 bg-white shadow">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search products..."
            className="w-64 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative dark:text-gray-300 dark:hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="dark:text-gray-300 dark:hover:text-white">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
            <DropdownMenuLabel className="dark:text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:border-gray-700" />
            <DropdownMenuItem className="dark:text-gray-300 dark:hover:text-white">Profile</DropdownMenuItem>
            <DropdownMenuItem className="dark:text-gray-300 dark:hover:text-white">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="dark:border-gray-700" />
            <DropdownMenuItem className="dark:text-gray-300 dark:hover:text-white">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}