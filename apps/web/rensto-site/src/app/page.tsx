'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  TrendingUp
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
      color: 'blue',
      popular: false
    },
    {
      id: 'custom',
      name: 'Custom Solutions',
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
      color: 'green',
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
      color: 'purple',
      popular: false
    },
    {
      id: 'solutions',
      name: 'Ready Solutions',
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
      color: 'orange',
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

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getButtonClasses = (color: string, popular: boolean) => {
    const baseClasses = 'w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2';
    
    if (popular) {
      return `${baseClasses} bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`;
    }
    
    const buttonColors = {
      blue: 'bg-blue-600 text-white hover:bg-blue-700',
      green: 'bg-green-600 text-white hover:bg-green-700',
      purple: 'bg-purple-600 text-white hover:bg-purple-700',
      orange: 'bg-orange-600 text-white hover:bg-orange-700'
    };
    
    return `${baseClasses} ${buttonColors[color as keyof typeof buttonColors] || buttonColors.blue}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Rensto</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
              <Link href="/custom" className="text-gray-600 hover:text-gray-900 transition-colors">Custom</Link>
              <Link href="/subscriptions" className="text-gray-600 hover:text-gray-900 transition-colors">Subscriptions</Link>
              <Link href="/solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Solutions</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">Admin</Link>
              <Button variant="outline" size="sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Automation Path</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Four distinct ways to transform your business with AI-powered automation. 
              From ready-made solutions to custom development.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {serviceTypes.map((service) => (
                <span
                  key={service.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getColorClasses(service.color)}`}
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Type Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceTypes.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    service.popular ? 'border-green-200 shadow-lg' : 'border-gray-200'
                  } ${selectedService === service.id ? 'ring-2 ring-blue-500' : ''}`}
                  onMouseEnter={() => setSelectedService(service.id)}
                  onMouseLeave={() => setSelectedService(null)}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${getColorClasses(service.color)} flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="text-lg font-semibold text-gray-900 mb-4">{service.pricing}</div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={service.href}>
                    <button className={getButtonClasses(service.color, service.popular)}>
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
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Industry-Specific Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready-made automation packages tailored for your industry. 
              Each niche includes 5 proven solutions with complete implementation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{niche.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{niche.name}</h3>
                    <p className="text-gray-600">{niche.solutions} solutions available</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>Industry-specific</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/solutions">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Explore All Solutions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Usage-Based Pricing */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Usage-Based Pricing</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Pay only for what you use beyond your plan limits. No surprises, no hidden fees.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">See exactly what you're paying for with detailed usage reports.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Hidden Fees</h3>
              <p className="text-gray-600">All pricing is upfront and transparent. No surprise charges.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Billing</h3>
              <p className="text-gray-600">Scale up or down based on your actual usage and needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with a free consultation or explore our marketplace. 
            Choose the path that's right for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/custom">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Book Free Consultation
                <Mic className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Browse Templates
                <Store className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Rensto</span>
              </div>
              <p className="text-gray-600">Universal Automation Platform for Business Operations</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link href="/marketplace" className="text-gray-600 hover:text-gray-900">Marketplace</Link></li>
                <li><Link href="/custom" className="text-gray-600 hover:text-gray-900">Custom Solutions</Link></li>
                <li><Link href="/subscriptions" className="text-gray-600 hover:text-gray-900">Subscriptions</Link></li>
                <li><Link href="/solutions" className="text-gray-600 hover:text-gray-900">Ready Solutions</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-600 hover:text-gray-900">Documentation</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-gray-900">Support</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Admin</h3>
              <ul className="space-y-2">
                <li><Link href="/admin" className="text-gray-600 hover:text-gray-900">Admin Dashboard</Link></li>
                <li><Link href="/admin/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link></li>
                <li><Link href="/admin/settings" className="text-gray-600 hover:text-gray-900">Settings</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">© 2025 Rensto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}