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
  BarChart3,
  MessageCircle
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Handle client-side state for path-dependent logic (if UI needs it later)
  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Process', href: '/process' },
    { name: 'Industry Hub', href: '/niches' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Demos', href: '/demos' },
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
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
      style={{
        background: 'rgba(17, 13, 40, 0.98)',
        borderColor: 'rgba(254, 61, 81, 0.3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/rensto-logo.webp"
                  alt="Rensto - AI-Powered Business Automation"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                  }}
                  priority
                />
              </div>
              <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                Rensto
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <Link
            href="/whatsapp"
            className="text-green-400 hover:text-green-300 transition-colors font-medium flex items-center gap-1.5"
          >
            WhatsApp OS
            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30 animate-pulse">New</span>
          </Link>
          <Link
            href="/custom"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Custom Solutions
          </Link>
          <Link
            href="/pricing"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/subscriptions"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Managed Plans
          </Link>
          <Link
            href="/niches"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Industry Hub
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => {
                // We'll use a global event or context for this in a real app, 
                // but for now let's assume the widget is always present and listens for a custom "open-rensto-support" event
                window.dispatchEvent(new CustomEvent('open-rensto-support'));
              }}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Support Agent
            </button>
            <a
              href="https://wa.me/1234567890?text=Hi%20Rensto%2C%20I'm%20interested%20in%20automating%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <Link href="/custom">
              <Button
                size="sm"
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FE3D51 0%, #FF6B7D 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(254, 61, 81, 0.4)'
                }}
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10"
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
          <div className="md:hidden border-t border-white/10 bg-[#110d28]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/whatsapp"
                className="block px-3 py-2 text-base font-medium text-green-400 hover:bg-white/5 rounded-md flex justify-between items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                WhatsApp OS
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">New</span>
              </Link>
              <Link
                href="/custom"
                className="block px-3 py-2 text-base font-medium text-cyan-400 hover:bg-white/5 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Custom Solutions
              </Link>
              <Link
                href="/subscriptions"
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Subscriptions
              </Link>
              <Link
                href="/niches"
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Industry Packages
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-white/10 px-2">
              <Link href="/custom">
                <Button className="w-full justify-center font-bold" style={{
                  background: 'linear-gradient(135deg, #FE3D51 0%, #FF6B7D 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(254, 61, 81, 0.4)'
                }}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
