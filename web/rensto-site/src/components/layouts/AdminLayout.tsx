'use client';

import { useState, useEffect } from 'react';
// Authentication temporarily disabled for development
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Menu,
  X,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { AdminNavigation, AdminNavigationMobile } from '@/components/navigation/AdminNavigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Mock session for development - replace with proper auth later
  const session = { user: { name: 'Admin User', email: 'admin@rensto.com' } };
  const status = 'authenticated';
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Handle client-side mounting and theme initialization
  useEffect(() => {
    setMounted(true);
    
    // Initialize theme from localStorage
    try {
      const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        
        // Apply theme to document
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Show loading while checking authentication
  // Temporarily disabled for testing
  // if (!mounted) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-slate-50">
  //       <div className="rensto-animate-glow rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
  //     </div>
  //   );
  // }

  // Temporarily disable authentication check for testing
  // if (status === 'unauthenticated') {
  //   router.push('/login');
  //   return null;
  // }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Implement theme persistence
    try {
      localStorage.setItem('admin-theme', newTheme);
      
      // Also update document class for immediate effect
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to persist theme:', error);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/Rensto Logo.png"
                alt="Rensto Logo"
                width={32}
                height={32}
                className="rensto-animate-glow"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))' }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin</h1>
              <p className="text-xs text-slate-500">System Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 px-4 py-6">
            <AdminNavigation />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search */}
            <div className="ml-4 flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-slate-400 hover:text-slate-600"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {session?.user?.name || 'Admin'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-slate-50 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile navigation */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75" />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/Rensto Logo.png"
                    alt="Rensto Logo"
                    width={32}
                    height={32}
                    className="rensto-animate-glow"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))' }}
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Admin</h1>
                  <p className="text-xs text-slate-500">System Management</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminNavigationMobile />
          </div>
        </div>
      )}
    </div>
  );
}
