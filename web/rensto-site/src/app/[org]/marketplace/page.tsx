'use client';

import { useState } from 'react';
import {
  Search,
  Star,
  Download,
  Eye,
  ShoppingCart,
  Grid,
  List,
} from 'lucide-react';
import StripeCheckout from '@/components/StripeCheckout';

interface MarketplacePageProps {
  params: Promise<{ org: string }>;
}

// Mock marketplace data
const mockProducts = [
  {
    id: 'template-1',
    name: 'Lead Qualification Agent',
    description:
      'Automated lead qualification and scoring with AI-powered insights',
    price: 99.0,
    currency: 'USD',
    category: 'Sales',
    complexity: 'Intermediate',
    rating: 4.8,
    downloads: 1247,
    tags: ['leads', 'automation', 'sales', 'ai'],
    features: [
      'AI-powered scoring',
      'CRM integration',
      'Email automation',
      'Analytics dashboard',
    ],
    image: '/api/placeholder/300/200',
  },
  {
    id: 'template-2',
    name: 'Invoice Processing Bot',
    description: 'Automated invoice processing and payment tracking',
    price: 149.0,
    currency: 'USD',
    category: 'Finance',
    complexity: 'Advanced',
    rating: 4.9,
    downloads: 892,
    tags: ['finance', 'invoices', 'automation', 'accounting'],
    features: [
      'OCR processing',
      'Payment tracking',
      'QuickBooks sync',
      'Fraud detection',
    ],
    image: '/api/placeholder/300/200',
  },
  {
    id: 'template-3',
    name: 'Customer Support Assistant',
    description:
      'AI-powered customer support with ticket routing and response automation',
    price: 199.0,
    currency: 'USD',
    category: 'Support',
    complexity: 'Advanced',
    rating: 4.7,
    downloads: 567,
    tags: ['support', 'ai', 'automation', 'customer-service'],
    features: [
      'Ticket routing',
      'AI responses',
      'Knowledge base',
      'SLA tracking',
    ],
    image: '/api/placeholder/300/200',
  },
  {
    id: 'subscription-1',
    name: 'Pro Automation Suite',
    description:
      'Complete automation platform with unlimited agents and priority support',
    price: 299.0,
    currency: 'USD',
    category: 'Subscription',
    complexity: 'All Levels',
    rating: 4.9,
    downloads: 2341,
    tags: ['pro', 'unlimited', 'support', 'enterprise'],
    features: [
      'Unlimited agents',
      'Priority support',
      'Advanced analytics',
      'White-label options',
    ],
    image: '/api/placeholder/300/200',
  },
  {
    id: 'template-4',
    name: 'Social Media Manager',
    description: 'Automated social media posting and engagement tracking',
    price: 79.0,
    currency: 'USD',
    category: 'Marketing',
    complexity: 'Beginner',
    rating: 4.6,
    downloads: 1892,
    tags: ['social-media', 'marketing', 'automation', 'engagement'],
    features: [
      'Multi-platform posting',
      'Engagement tracking',
      'Content scheduling',
      'Analytics',
    ],
    image: '/api/placeholder/300/200',
  },
  {
    id: 'template-5',
    name: 'Data Migration Tool',
    description:
      'Automated data migration between different platforms and databases',
    price: 179.0,
    currency: 'USD',
    category: 'Data',
    complexity: 'Advanced',
    rating: 4.8,
    downloads: 445,
    tags: ['data', 'migration', 'automation', 'etl'],
    features: [
      'Multi-platform support',
      'Data validation',
      'Error handling',
      'Progress tracking',
    ],
    image: '/api/placeholder/300/200',
  },
];

const categories = [
  'All',
  'Sales',
  'Finance',
  'Support',
  'Marketing',
  'Data',
  'Subscription',
];

const complexities = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function MarketplacePage({
  params: _params,
}: MarketplacePageProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="mt-2 text-gray-600">
            Discover and purchase automation templates and tools for your
            organization.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity Filter */}
            <div className="sm:w-48">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {complexities.map(complexity => (
                  <option key={complexity} value={complexity}>
                    {complexity}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button className="px-3 py-2 bg-blue-600 text-white rounded-l-lg">
                <Grid className="h-4 w-4" />
              </button>
              <button className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-sm">Product Image</div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <span className="text-2xl font-bold style={{ color: 'var(--rensto-blue)' }}">
                    ${product.price}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    <span>{product.downloads}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 style={{ color: 'var(--rensto-blue)' }} text-xs rounded-full">
                    {product.complexity}
                  </span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Key Features:
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Purchase {selectedProduct.name}
                  </h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <StripeCheckout
                  productId={selectedProduct.id}
                  productName={selectedProduct.name}
                  price={selectedProduct.price}
                  currency={selectedProduct.currency}
                  onSuccess={sessionId => {
                    console.log('Payment successful:', sessionId);
                    setSelectedProduct(null);
                  }}
                  onCancel={() => setSelectedProduct(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
