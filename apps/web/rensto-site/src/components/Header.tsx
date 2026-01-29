'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import {
  Menu,
  X,
  Phone
} from 'lucide-react';

const CONTACT_PHONE = "14699299314"; // Rensto Voice number

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Personnel', href: '/#team' },
    { name: 'Applets', href: '/#applets' },
    { name: 'Process', href: '/process' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300"
      style={{
        background: 'rgba(10, 10, 10, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
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
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-cyan-500/10 border border-cyan-500/30 text-rensto-cyan hover:bg-cyan-500/20 transition-all"
              style={{ direction: 'ltr' }}
              title="Call our AI Voice Agent"
            >
              <Phone className="w-4 h-4" />
              <span>+1 (469) 929-9314</span>
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
                <span>Get Started</span>
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
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-white/10 px-2 space-y-3">
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-rensto-cyan font-bold"
              >
                <Phone className="w-5 h-5" />
                <span>Call AI Agent</span>
              </a>
              <Link href="/custom">
                <Button className="w-full justify-center font-bold h-12" style={{
                  background: 'linear-gradient(135deg, #FE3D51 0%, #FF6B7D 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(254, 61, 81, 0.4)'
                }}>
                  <span>Activate Engine</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
