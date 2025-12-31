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
  MessageCircle,
  Brain,
  Globe,
  Phone
} from 'lucide-react';

const CONTACT_PHONE = "14699299314"; // Rensto Voice number

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Handle client-side state for path-dependent logic (if UI needs it later)
  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  // Main navigation links - localized
  const isHebrew = currentPath === '/he';

  const navigation = isHebrew ? [
    { name: 'דף הבית', href: '/he' },
    { name: 'תהליך', href: '/process' }, // Could add Hebrew versions of these pages later if needed
    { name: 'תחומי התמחות', href: '/niches' },
    { name: 'חנות פתרונות', href: '/marketplace' },
    { name: 'הצעות מחיר', href: '/offers' },
    { name: 'צור קשר', href: '/contact' },
  ] : [
    { name: 'Home', href: '/' },
    { name: 'Process', href: '/process' },
    { name: 'Industry Hub', href: '/niches' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Offers', href: '/offers' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
      dir={isHebrew ? 'rtl' : 'ltr'}
      style={{
        background: 'rgba(17, 13, 40, 0.98)',
        borderColor: 'rgba(254, 61, 81, 0.3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href={isHebrew ? "/he" : "/"} className="flex items-center gap-3">
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
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex items-center gap-2 text-sm font-medium text-rensto-cyan hover:text-white transition-colors"
            >
              <span>Call: +1 (469) 929-9314</span>
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
                {isHebrew ? 'בואו נתחיל' : 'Get Started'}
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
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-white/10 px-2">
              <Link href="/custom">
                <Button className="w-full justify-center font-bold h-12" style={{
                  background: 'linear-gradient(135deg, #FE3D51 0%, #FF6B7D 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(254, 61, 81, 0.4)'
                }}>
                  {isHebrew ? 'בואו נתחיל' : 'Get Started'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
