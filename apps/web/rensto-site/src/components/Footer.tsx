'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Zap,
  Workflow,
  Settings,
  BarChart3,
  Bot,
  MessageCircle,
  Brain
} from 'lucide-react';

const CONTACT_PHONE = "12144362102"; // Rensto WhatsApp number

const companyDesc = "Transform your business with AI-powered automation agents. Create, activate, and manage intelligent automations that scale your operations.";
const navTitle = "Navigation";
const clientTitle = "Client Access";
const legalTitle = "Legal";
const rights = "All rights reserved.";
const contact = "Contact";
const aiSupport = "AI Support Agent";
const links = {
  home: "Home",
  marketplace: "Marketplace",
  custom: "Custom Solutions",
  offers: "Offers",
  niches: "Industry Hub",
  login: "Client Dashboard",
  control: "Admin Control",
  privacy: "Privacy Policy",
  terms: "Terms of Service"
};

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
      { name: links.home, href: '/' },
      { name: links.marketplace, href: '/marketplace' },
      { name: links.custom, href: '/custom' },
      { name: links.offers, href: '/offers' },
      { name: links.niches, href: '/niches' },
    ],
    business: [
      { name: links.login, href: '/login', icon: Workflow },
    ],
    legal: [
      { name: links.privacy, href: '/legal/privacy' },
      { name: links.terms, href: '/legal/terms' },
    ],
    social: [
      {
        name: 'Facebook',
        href: 'https://www.facebook.com/myrensto',
        icon: Facebook,
      },
      {
        name: 'Instagram',
        href: 'https://www.instagram.com/myrensto',
        icon: Instagram,
      },
      {
        name: 'TikTok',
        href: 'https://www.tiktok.com/@myrensto',
        icon: () => (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
          </svg>
        ),
      },
      {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/company/108865969',
        icon: Linkedin,
      },
      {
        name: 'X',
        href: 'https://x.com/myrensto',
        icon: Twitter,
      },
      {
        name: 'WhatsApp',
        href: `https://wa.me/${CONTACT_PHONE}?text=Hi%20Rensto%2C%20I'm%20interested%20in%20automating%20my%20business.`,
        icon: MessageCircle,
      },
    ],
  };

  return (
    <footer className="text-white border-t border-white/5" style={{ background: 'var(--rensto-bg-primary)' }}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
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
              <span className="text-xl font-bold font-sans">Rensto</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md font-sans leading-relaxed">
              {companyDesc}
            </p>
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase mb-4 font-sans">
              {navTitle}
            </h3>
            <ul className="space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white transition-colors font-sans"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Apps */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase mb-4 font-sans">
              {clientTitle}
            </h3>
            <ul className="space-y-3">
              {navigation.business.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center text-slate-300 hover:text-white transition-colors font-sans"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-rensto-support'))}
                  className="flex items-center text-slate-300 hover:text-white transition-colors text-sm font-sans"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {aiSupport}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {navigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-sans"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-slate-400 text-sm font-sans">
              © {currentYear} Rensto. {rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
