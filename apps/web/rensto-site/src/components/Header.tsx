'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Zap,
  Workflow,
  BarChart3
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  // Don't render header on dashboard routes or service pages (they have their own headers)
  if (mounted) {
    const isDashboardRoute = currentPath.startsWith('/ortal-dashboard');
    const isServicePage = currentPath === '/' ||
      currentPath === '/marketplace' ||
      currentPath === '/custom' ||
      currentPath === '/subscriptions' ||
      currentPath === '/solutions';

    const isCustomLanding = currentPath.startsWith('/offer') || currentPath.startsWith('/onboarding');

    if (isDashboardRoute || isServicePage || isCustomLanding) {
      return null;
    }
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Process', href: '/process' },
    { name: 'Offers', href: '/offers' },
    { name: 'Contact', href: '/contact' },
  ];

  const businessApps = [
    { name: 'Admin Dashboard', href: '/admin', icon: Settings },
    { name: 'Customer Portal', href: '/demo-org', icon: Workflow },
    { name: 'Agent Management', href: '/admin/agents', icon: Zap },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/rensto-logo.png"
                  alt="Rensto Logo"
                  width={32}
                  height={32}
                  className="rensto-animate-glow"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.5))' }}
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                Rensto
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Temporarily disabled authentication for portal compatibility */}
            {/* Temporarily disabled authentication for portal compatibility */}
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/demo">
              <Button>Try Demo</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-slate-200">
              {/* Temporarily disabled authentication for portal compatibility */}
              <div className="space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button className="w-full justify-center">Try Demo</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
