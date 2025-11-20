'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import { 
  Store, 
  Mic, 
  Users, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Zap,
  Target,
  Shield,
  Clock,
  TrendingUp,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const serviceTypes = [
    {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Download n8n templates or let us install them for you',
      icon: Store,
      features: [
        'Template downloads',
        'Installation services', 
        'Self-service options',
        'User reviews',
        'Service booking',
        'Installation tracking'
      ],
      pricing: 'From $29/template',
      cta: 'Browse Templates',
      href: '/marketplace',
      gradient: 'primary',
      popular: false
    },
    {
      id: 'custom',
      name: 'Tailored Solutions',
      description: 'Free voice AI consultation builds your tailored automation plan',
      icon: Mic,
      features: [
        'Voice AI consultation',
        'Tailored business plans',
        'Technical implementation',
        'Project management',
        'Quality assurance',
        'Ongoing support'
      ],
      pricing: 'Free consultation',
      cta: 'Book Free Consultation',
      href: '/custom',
      gradient: 'secondary',
      popular: true
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      description: 'Enhanced hot leads service with CRM integration',
      icon: Users,
      features: [
        'Niche selection',
        'Lead volume control',
        'CRM integration',
        'Lead scoring',
        'Automated follow-up',
        'Performance analytics'
      ],
      pricing: 'From $199/month',
      cta: 'Start Subscription',
      href: '/subscriptions',
      gradient: 'primary',
      popular: false
    },
    {
      id: 'solutions',
      name: 'Industry Packages',
      description: 'Niche-specific automation packages for your industry',
      icon: Package,
      features: [
        'Industry-specific solutions',
        '5 solutions per niche',
        'Complete packages',
        'Quick deployment',
        'Industry expertise',
        'Proven results'
      ],
      pricing: 'From $499/package',
      cta: 'Browse Solutions',
      href: '/solutions',
      gradient: 'secondary',
      popular: false
    }
  ];

  const niches = [
    { name: 'HVAC', icon: '🔧', solutions: 5 },
    { name: 'Roofer', icon: '🏠', solutions: 5 },
    { name: 'Realtor', icon: '🏘️', solutions: 5 },
    { name: 'Insurance', icon: '🛡️', solutions: 5 },
    { name: 'Locksmith', icon: '🔐', solutions: 5 },
    { name: 'Photographer', icon: '📸', solutions: 5 }
  ];

  return (
    <div className="min-h-screen" style={{ 
      background: 'var(--rensto-bg-primary)', 
      color: 'var(--rensto-text-primary)',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
        style={{ 
          background: 'rgba(17, 13, 40, 0.98)',
          borderColor: 'rgba(254, 61, 81, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10">
                <Image
                  src="/rensto-logo.png"
                  alt="Rensto Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                  }}
                  priority
                />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Rensto</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/marketplace" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Marketplace
              </Link>
              <Link 
                href="/custom" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Custom
              </Link>
              <Link 
                href="/subscriptions" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Subscriptions
              </Link>
              <Link 
                href="/solutions" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Solutions
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-2" style={{ 
                borderColor: 'var(--rensto-primary)', 
                color: 'var(--rensto-primary)',
                background: 'transparent'
              }}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(254, 61, 81, 0.3) 0%, transparent 70%)'
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--rensto-accent-blue) 0%, var(--rensto-accent-cyan) 50%, var(--rensto-text-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Choose Your Automation Path
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Four distinct ways to transform your business with AI-powered automation. 
              From ready-made solutions to custom development.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {serviceTypes.map((service) => (
                <span
                  key={service.id}
                  className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all hover:scale-105"
                  style={{ 
                    borderColor: service.gradient === 'primary' ? 'var(--rensto-primary)' : 'var(--rensto-accent-blue)',
                    color: service.gradient === 'primary' ? 'var(--rensto-primary)' : 'var(--rensto-accent-blue)',
                    background: 'transparent'
                  }}
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Type Cards */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceTypes.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className="relative rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{
                    background: 'var(--rensto-bg-card)',
                    borderColor: service.popular ? 'var(--rensto-primary)' : 'rgba(254, 61, 81, 0.2)',
                    boxShadow: selectedService === service.id ? 'var(--rensto-glow-primary)' : 'var(--rensto-glow-accent)'
                  }}
                  onMouseEnter={() => setSelectedService(service.id)}
                  onMouseLeave={() => setSelectedService(null)}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span 
                        className="px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 text-white"
                        style={{ background: 'var(--rensto-gradient-primary)' }}
                      >
                        <Star className="w-4 h-4" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                      style={{ 
                        background: service.gradient === 'primary' 
                          ? 'var(--rensto-gradient-primary)' 
                          : 'var(--rensto-gradient-secondary)'
                      }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                      {service.name}
                    </h3>
                    <p className="mb-4" style={{ color: 'var(--rensto-text-secondary)' }}>
                      {service.description}
                    </p>
                    <div className="text-lg font-semibold mb-4" style={{ color: 'var(--rensto-primary)' }}>
                      {service.pricing}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--rensto-accent-cyan)' }} />
                        <span style={{ color: 'var(--rensto-text-secondary)' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={service.href}>
                    <button 
                      className="w-full py-3 px-6 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      style={{
                        background: service.gradient === 'primary' 
                          ? 'var(--rensto-gradient-primary)' 
                          : 'var(--rensto-gradient-secondary)',
                        color: '#ffffff',
                        boxShadow: service.gradient === 'primary' 
                          ? 'var(--rensto-glow-primary)' 
                          : 'var(--rensto-glow-secondary)'
                      }}
                    >
                      {service.cta}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Niche Solutions Preview */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Industry-Specific Solutions
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Ready-made automation packages tailored for your industry. 
              Each niche includes 5 proven solutions with complete implementation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche, index) => (
              <div 
                key={index} 
                className="rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-2"
                style={{
                  background: 'var(--rensto-bg-card)',
                  borderColor: 'rgba(254, 61, 81, 0.2)'
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{niche.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {niche.name}
                    </h3>
                    <p style={{ color: 'var(--rensto-text-secondary)' }}>
                      {niche.solutions} solutions available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                  <Target className="w-4 h-4" />
                  <span>Industry-specific</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/solutions">
              <Button 
                size="lg" 
                className="font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--rensto-gradient-brand)',
                  color: '#ffffff',
                  boxShadow: 'var(--rensto-glow-primary)'
                }}
              >
                Explore All Solutions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Usage-Based Pricing */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
            Usage-Based Pricing
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
            Pay only for what you use beyond your plan limits. No surprises, no hidden fees.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div 
              className="rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(30, 174, 247, 0.3)',
                boxShadow: 'var(--rensto-glow-secondary)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(30, 174, 247, 0.2)' }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--rensto-accent-blue)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                Transparent Pricing
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                See exactly what you're paying for with detailed usage reports.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(254, 61, 81, 0.3)',
                boxShadow: 'var(--rensto-glow-primary)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(254, 61, 81, 0.2)' }}
              >
                <Shield className="w-6 h-6" style={{ color: 'var(--rensto-primary)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                No Hidden Fees
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                All pricing is upfront and transparent. No surprise charges.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(95, 251, 253, 0.3)',
                boxShadow: 'var(--rensto-glow-accent)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(95, 251, 253, 0.2)' }}
              >
                <Clock className="w-6 h-6" style={{ color: 'var(--rensto-accent-cyan)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                Flexible Billing
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Scale up or down based on your actual usage and needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 px-4"
        style={{ background: 'var(--rensto-bg-primary)' }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
            Start with a free consultation or explore our marketplace. 
            Choose the path that's right for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/custom">
              <Button 
                size="lg" 
                className="font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--rensto-gradient-secondary)',
                  color: '#ffffff',
                  boxShadow: 'var(--rensto-glow-secondary)'
                }}
              >
                Book Free Consultation
                <Mic className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button 
                size="lg" 
                variant="outline" 
                className="font-bold border-2 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: 'var(--rensto-primary)',
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                Browse Templates
                <Store className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 px-4 border-t"
        style={{ 
          background: 'var(--rensto-bg-primary)',
          borderColor: 'rgba(254, 61, 81, 0.2)'
        }}
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/rensto-logo.png"
                    alt="Rensto Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                    }}
                    priority
                  />
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                  Rensto
                </span>
              </div>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Universal Automation Platform for Business Operations
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Services
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/marketplace" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/custom" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Tailored Solutions
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/subscriptions" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Subscriptions
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/solutions" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Industry Packages
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/docs" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/support" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div 
            className="border-t mt-8 pt-8"
            style={{ borderColor: 'rgba(254, 61, 81, 0.2)' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="https://facebook.com/myrensto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </Link>
                <Link
                  href="https://instagram.com/myrensto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/rensto-llc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </Link>
              </div>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                © 2025 Rensto. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
