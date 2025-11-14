'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import { 
  Store, 
  Download, 
  Calendar, 
  Star, 
  Filter, 
  Search,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface Workflow {
  id: string;
  workflowId: string;
  name: string;
  category: string;
  description: string;
  downloadPrice: number;
  installPrice: number;
  downloadTier: string;
  installTier: string;
  complexity: string;
  setupTime: string;
  features: string[];
  targetMarket: string;
  n8nAffiliateLink: string;
  workflowJsonUrl: string;
  status: string;
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isProcessing, setIsProcessing] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workflows from API on component mount
  useEffect(() => {
    async function fetchWorkflows() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/marketplace/workflows?status=Active&limit=100');
        const data = await response.json();
        
        if (data.success && data.workflows) {
          setWorkflows(data.workflows);
        } else {
          setError(data.error || 'Failed to load workflows');
        }
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('Failed to load workflows. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkflows();
  }, []);

  // Extract unique categories from workflows
  const categories = [
    { id: 'all', name: 'All Templates', count: workflows.length },
    ...Array.from(new Set(workflows.map(w => w.category)))
      .filter(Boolean)
      .map(cat => ({
        id: cat.toLowerCase().replace(/\s+/g, '-'),
        name: cat,
        count: workflows.filter(w => w.category === cat).length
      }))
  ];

  // Map workflows to template format for compatibility
  const templates = workflows.map((workflow, index) => ({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description || 'Professional automation workflow',
    category: workflow.category?.toLowerCase().replace(/\s+/g, '-') || 'other',
    price: workflow.downloadPrice || 49,
    rating: 4.5 + (index % 5) * 0.1, // Mock rating based on index
    downloads: 100 + index * 50, // Mock downloads
    features: workflow.features || [],
    image: '/templates/default.jpg',
    popular: index < 3, // First 3 are popular
    installation: workflow.installPrice > 0,
    workflowId: workflow.workflowId,
    installPrice: workflow.installPrice,
    n8nAffiliateLink: workflow.n8nAffiliateLink
  }));

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      default:
        return b.downloads - a.downloads; // popular
    }
  });

  // Handle Stripe Checkout
  const handleCheckout = async (template: any, flowType: 'marketplace-template' | 'marketplace-install') => {
    setIsProcessing(true);

    try {
      // Determine tier based on price for marketplace-template
      let tier = 'simple';
      if (template.price >= 197) tier = 'complete';
      else if (template.price >= 97) tier = 'advanced';
      
      // Determine tier based on install price for marketplace-install
      if (flowType === 'marketplace-install') {
        if (template.installPrice >= 3500) tier = 'enterprise';
        else if (template.installPrice >= 1997) tier = 'system';
        else tier = 'template';
      }

      const response = await fetch('https://api.rensto.com/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowType,
          productId: template.id.toString(),
          tier: tier,
          customerEmail: '', // Stripe checkout will collect this
          metadata: {
            templateName: template.name,
            templateCategory: template.category,
            templatePrice: template.price,
            installPrice: template.installPrice,
            workflowId: template.workflowId || '',
            n8nAffiliateLink: template.n8nAffiliateLink || 'https://tinyurl.com/ym3awuke'
          }
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(`Error: ${data.error || 'Could not create checkout session'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing request. Please try again.');
      setIsProcessing(false);
    }
  };

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
              <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Marketplace</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Home
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
              <Button 
                variant="outline" 
                size="sm" 
                className="border-2"
                style={{ 
                  borderColor: 'var(--rensto-primary)', 
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 relative overflow-hidden">
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
              Automation Template Marketplace
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Download ready-made n8n templates or let us install them for you. 
              Choose from our curated collection of proven automation solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-blue)',
                  color: 'var(--rensto-accent-blue)',
                  background: 'transparent'
                }}
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Instant Download</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-primary)',
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Installation Service</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-cyan)',
                  color: 'var(--rensto-accent-cyan)',
                  background: 'transparent'
                }}
              >
                <Star className="w-5 h-5" />
                <span className="font-semibold">Proven Templates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section 
        className="py-8 px-4 border-b"
        style={{ 
          background: 'var(--rensto-bg-secondary)',
          borderColor: 'rgba(254, 61, 81, 0.2)'
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--rensto-text-muted)' }} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
                style={{
                  background: 'var(--rensto-bg-card)',
                  border: '1px solid rgba(254, 61, 81, 0.2)',
                  color: 'var(--rensto-text-primary)',
                  focusRingColor: 'var(--rensto-primary)'
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:-translate-y-0.5"
                  style={
                    selectedCategory === category.id
                      ? {
                          background: 'var(--rensto-gradient-primary)',
                          color: '#ffffff',
                          boxShadow: 'var(--rensto-glow-primary)'
                        }
                      : {
                          background: 'var(--rensto-bg-card)',
                          color: 'var(--rensto-text-secondary)',
                          border: '1px solid rgba(254, 61, 81, 0.2)'
                        }
                  }
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all"
              style={{
                background: 'var(--rensto-bg-card)',
                border: '1px solid rgba(254, 61, 81, 0.2)',
                color: 'var(--rensto-text-primary)'
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {isLoading && (
        <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
          <div className="container mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--rensto-primary)' }} />
            <p style={{ color: 'var(--rensto-text-secondary)' }}>Loading workflows...</p>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
          <div className="container mx-auto text-center">
            <div 
              className="rounded-lg p-6 max-w-md mx-auto border-2"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'var(--rensto-primary)'
              }}
            >
              <p className="mb-4" style={{ color: 'var(--rensto-primary)' }}>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-2"
                style={{
                  borderColor: 'var(--rensto-primary)',
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && (
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          {sortedTemplates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: 'var(--rensto-text-secondary)' }}>
                No workflows found matching your criteria.
              </p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{
                  background: 'var(--rensto-bg-card)',
                  borderColor: template.popular ? 'var(--rensto-primary)' : 'rgba(254, 61, 81, 0.2)',
                  boxShadow: template.popular ? 'var(--rensto-glow-primary)' : 'var(--rensto-glow-accent)'
                }}
              >
                {template.popular && (
                  <div 
                    className="px-4 py-2 text-center font-bold text-white"
                    style={{ background: 'var(--rensto-gradient-primary)' }}
                  >
                    🔥 Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-current" style={{ color: '#ffd700' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>
                        {template.rating}
                      </span>
                    </div>
                    <div className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                      {template.downloads} downloads
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                    {template.name}
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--rensto-text-secondary)' }}>
                    {template.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--rensto-accent-cyan)' }} />
                        <span className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold" style={{ color: 'var(--rensto-primary)' }}>
                      ${template.price}
                    </div>
                    <div className="flex items-center gap-2">
                      {template.installation && (
                        <span 
                          className="px-2 py-1 rounded text-xs font-medium border"
                          style={{
                            background: 'rgba(30, 174, 247, 0.2)',
                            color: 'var(--rensto-accent-blue)',
                            borderColor: 'var(--rensto-accent-blue)'
                          }}
                        >
                          Installation Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      className="w-full py-3 px-6 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      style={{
                        background: 'var(--rensto-gradient-primary)',
                        color: '#ffffff',
                        boxShadow: 'var(--rensto-glow-primary)'
                      }}
                      onClick={() => handleCheckout(template, 'marketplace-template')}
                      disabled={isProcessing}
                    >
                      <Download className="w-5 h-5" />
                      {isProcessing ? 'Processing...' : 'Download Template'}
                    </button>

                    {template.installation && (
                      <button
                        className="w-full py-3 px-6 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 border-2 hover:-translate-y-0.5"
                        style={{
                          borderColor: 'var(--rensto-accent-blue)',
                          color: 'var(--rensto-accent-blue)',
                          background: 'transparent'
                        }}
                        onClick={() => handleCheckout(template, 'marketplace-install')}
                        disabled={isProcessing}
                      >
                        <Calendar className="w-5 h-5" />
                        {isProcessing ? 'Processing...' : 'Book Installation'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
      )}

      {/* Installation Service */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div 
            className="rounded-2xl p-8 text-white border-2"
            style={{
              background: 'var(--rensto-gradient-secondary)',
              borderColor: 'var(--rensto-accent-cyan)',
              boxShadow: 'var(--rensto-glow-neon)'
            }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Need Help Installing?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Our experts can install and configure any template for you. 
                We'll handle the technical setup so you can focus on your business.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quick Setup</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Most installations completed within 24 hours</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Expert Support</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Dedicated support team for your installation</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quality Guarantee</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>100% satisfaction guarantee on all installations</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="px-6 py-3 rounded-lg font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{
                    background: '#ffffff',
                    color: 'var(--rensto-bg-primary)',
                    boxShadow: 'var(--rensto-glow-primary)'
                  }}
                >
                  <Calendar className="w-5 h-5" />
                  Book Installation Service
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-bold border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    background: 'transparent'
                  }}
                >
                  <Zap className="w-5 h-5" />
                  View Installation Packages
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Why Choose Our Templates?
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Our templates are built by automation experts and tested in real business environments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div 
              className="text-center rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(30, 174, 247, 0.3)',
                boxShadow: 'var(--rensto-glow-secondary)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(30, 174, 247, 0.2)' }}
              >
                <TrendingUp className="w-8 h-8" style={{ color: 'var(--rensto-accent-blue)' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Proven Results
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Every template has been tested and proven to deliver measurable business results.
              </p>
            </div>
            
            <div 
              className="text-center rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(254, 61, 81, 0.3)',
                boxShadow: 'var(--rensto-glow-primary)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(254, 61, 81, 0.2)' }}
              >
                <Zap className="w-8 h-8" style={{ color: 'var(--rensto-primary)' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Easy to Use
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Simple setup process with detailed documentation and video tutorials.
              </p>
            </div>
            
            <div 
              className="text-center rounded-xl p-6 border-2 transition-all hover:-translate-y-1"
              style={{
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(95, 251, 253, 0.3)',
                boxShadow: 'var(--rensto-glow-accent)'
              }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(95, 251, 253, 0.2)' }}
              >
                <Shield className="w-8 h-8" style={{ color: 'var(--rensto-accent-cyan)' }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Secure & Reliable
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Built with security best practices and designed for enterprise reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
            Ready to Automate Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
            Browse our template marketplace or get a custom solution designed specifically for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/custom">
              <button
                className="px-6 py-3 rounded-lg font-bold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                style={{
                  background: 'var(--rensto-gradient-secondary)',
                  color: '#ffffff',
                  boxShadow: 'var(--rensto-glow-secondary)'
                }}
              >
                Get Custom Solution
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button
              className="px-6 py-3 rounded-lg font-bold border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--rensto-primary)',
                color: 'var(--rensto-primary)',
                background: 'transparent'
              }}
            >
              <Store className="w-5 h-5" />
              Browse All Templates
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
