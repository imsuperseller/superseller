'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import { NICHES } from '@/data/niches';

const CONTACT_WHATSAPP = '12144362102';

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();

  if (!mounted) {
    return null;
  }

  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'The Crew', href: '/crew' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Contact', href: '/contact' },
    ],
    industries: NICHES.map((n) => ({ name: n.name, href: `/${n.slug}` })),
    business: [
      { name: 'Client Login', href: '/login' },
      { name: 'Get Started', href: '/pricing' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Terms of Service', href: '/legal/terms' },
    ],
    social: [
      {
        name: 'Facebook',
        href: 'https://www.facebook.com/SuperSellerAgencyAI',
        icon: Facebook,
      },
      {
        name: 'Instagram',
        href: 'https://www.instagram.com/superseller.agency/',
        icon: Instagram,
      },
      {
        name: 'TikTok',
        href: 'https://www.tiktok.com/@superseller09',
        icon: () => (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
          </svg>
        ),
      },
      {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/company/42727872/',
        icon: Linkedin,
      },
      {
        name: 'X',
        href: 'https://x.com/iamsuperseller',
        icon: Twitter,
      },
      {
        name: 'WhatsApp',
        href: `https://wa.me/${CONTACT_WHATSAPP}?text=Hi%20SuperSeller AI%2C%20I'm%20interested%20in%20your%20AI%20crew.`,
        icon: MessageCircle,
      },
    ],
  };

  return (
    <footer
      className="text-white border-t border-white/5"
      style={{ background: 'var(--superseller-bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/superseller-logo.webp"
                  alt="SuperSeller AI"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter:
                      'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))',
                  }}
                  priority
                />
              </div>
              <span className="text-xl font-bold">SuperSeller AI</span>
            </div>
            <p className="text-[var(--superseller-text-secondary)] mb-4 max-w-md leading-relaxed">
              Six AI agents that produce videos, answer calls, generate leads,
              and run your business — starting at $79/mo.
            </p>
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[var(--superseller-text-muted)] hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--superseller-text-secondary)] hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] mb-4">
              Industries
            </h3>
            <ul className="space-y-3">
              {navigation.industries.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--superseller-text-secondary)] hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Access */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] mb-4">
              Client Access
            </h3>
            <ul className="space-y-3">
              {navigation.business.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--superseller-text-secondary)] hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[var(--superseller-text-muted)] hover:text-white transition-colors text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-[var(--superseller-text-muted)] text-sm">
              &copy; {currentYear} SuperSeller AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
