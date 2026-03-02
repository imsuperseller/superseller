'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import { Menu, X, ChevronDown } from 'lucide-react';
import { NICHES } from '@/data/niches';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const t = useTranslations('nav');

  const navigation = [
    { name: t('home'), href: '/' as const },
    { name: t('crew'), href: '/crew' as const },
    { name: t('pricing'), href: '/pricing' as const },
    { name: t('contact'), href: '/contact' as const },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300"
      style={{
        background: 'rgba(10, 10, 10, 0.65)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/superseller-logo.webp"
                  alt="SuperSeller AI"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter:
                      'drop-shadow(0 0 8px rgba(244, 121, 32, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))',
                  }}
                  priority
                />
              </div>
              <span className="text-2xl font-bold text-white">SuperSeller AI</span>
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

            {/* Industries dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIndustriesOpen(true)}
              onMouseLeave={() => setIndustriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
                {t('industries')}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {industriesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="rounded-xl border border-white/10 bg-[#0d1b2e]/95 backdrop-blur-xl p-2 min-w-[180px] shadow-xl">
                    {NICHES.map((niche) => (
                      <Link
                        key={niche.slug}
                        href={`/${niche.slug}` as any}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {niche.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTA + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/pricing">
              <Button
                size="sm"
                className="font-bold cursor-pointer text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #F47920 0%, #f79d4e 100%)',
                  boxShadow: '0 0 20px rgba(244, 121, 32, 0.4)',
                }}
              >
                {t('hireCrew')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 cursor-pointer"
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
          <div className="md:hidden border-t border-white/10 bg-[#0d1b2e]">
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

              {/* Industries in mobile */}
              <div className="px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                  {t('industries')}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {NICHES.map((niche) => (
                    <Link
                      key={niche.slug}
                      href={`/${niche.slug}` as any}
                      className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {niche.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 pb-3 border-t border-white/10 px-2 space-y-3">
              <Link href="/pricing">
                <Button
                  className="w-full justify-center font-bold h-12 cursor-pointer text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #F47920 0%, #f79d4e 100%)',
                    boxShadow: '0 0 20px rgba(244, 121, 32, 0.4)',
                  }}
                >
                  {t('hireCrew')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
