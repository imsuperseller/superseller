'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
        const response = await fetch('/api/marketplace/workflows?status=✅ Active&limit=100');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Marketplace</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/custom" className="text-gray-600 hover:text-gray-900 transition-colors">Custom</Link>
              <Link href="/subscriptions" className="text-gray-600 hover:text-gray-900 transition-colors">Subscriptions</Link>
              <Link href="/solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Solutions</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Automation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Template Marketplace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Download ready-made n8n templates or let us install them for you. 
              Choose from our curated collection of proven automation solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Download className="w-5 h-5" />
                <span className="font-semibold">Instant Download</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Installation Service</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Proven Templates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading workflows...</p>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {sortedTemplates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No workflows found matching your criteria.</p>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {template.popular && (
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 text-center font-semibold">
                    🔥 Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">{template.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">{template.downloads} downloads</div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>

                  <div className="space-y-2 mb-6">
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-gray-900">${template.price}</div>
                    <div className="flex items-center gap-2">
                      {template.installation && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Installation Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleCheckout(template, 'marketplace-template')}
                      disabled={isProcessing}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {isProcessing ? 'Processing...' : 'Download Template'}
                    </Button>

                    {template.installation && (
                      <Button
                        variant="outline"
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleCheckout(template, 'marketplace-install')}
                        disabled={isProcessing}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Processing...' : 'Book Installation'}
                      </Button>
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
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
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
                  <p className="text-blue-100">Most installations completed within 24 hours</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Expert Support</h3>
                  <p className="text-blue-100">Dedicated support team for your installation</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Quality Guarantee</h3>
                  <p className="text-blue-100">100% satisfaction guarantee on all installations</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Installation Service
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Zap className="w-5 h-5 mr-2" />
                  View Installation Packages
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Templates?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our templates are built by automation experts and tested in real business environments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Proven Results</h3>
              <p className="text-gray-600">
                Every template has been tested and proven to deliver measurable business results.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Easy to Use</h3>
              <p className="text-gray-600">
                Simple setup process with detailed documentation and video tutorials.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600">
                Built with security best practices and designed for enterprise reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Automate Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse our template marketplace or get a custom solution designed specifically for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/custom">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Get Custom Solution
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <Store className="w-5 h-5 mr-2" />
              Browse All Templates
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
