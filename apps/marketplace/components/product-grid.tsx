'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CogIcon,
  StarIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const products = [
  // Email Automation Suite
  {
    id: 'ai-email-persona',
    name: 'AI-Powered Email Persona System',
    category: 'Email Automation',
    description: 'Intelligent email routing with 6 AI personas for customer success, technical support, business development, marketing, operations, and finance.',
    price: 197,
    complexity: 'Advanced',
    setupTime: '2-4 hours',
    rating: 4.9,
    icon: EnvelopeIcon,
    features: ['6 AI Personas', 'Intelligent Routing', 'Automated Responses', 'Customer Success'],
    color: 'primary'
  },
  {
    id: 'hebrew-email',
    name: 'Hebrew Email Automation',
    category: 'Email Automation',
    description: 'Hebrew-language email automation with RTL templates, emojis, and insurance industry-specific features.',
    price: 297,
    complexity: 'Intermediate',
    setupTime: '1-2 hours',
    rating: 4.8,
    icon: EnvelopeIcon,
    features: ['RTL Templates', 'Hebrew Responses', 'Insurance Specific', 'Family Profiles'],
    color: 'primary'
  },
  {
    id: 'multi-language-email',
    name: 'Multi-Language Email Support',
    category: 'Email Automation',
    description: 'Email automation supporting English, Hebrew, Spanish, and French with cultural context awareness.',
    price: 397,
    complexity: 'Advanced',
    setupTime: '3-5 hours',
    rating: 4.7,
    icon: EnvelopeIcon,
    features: ['4 Languages', 'Cultural Context', 'Industry Templates', 'Global Support'],
    color: 'primary'
  },
  
  // Business Process Automation
  {
    id: 'business-process',
    name: 'Complete Business Process Automation',
    category: 'Business Process',
    description: '4-core business process automation system including customer onboarding, project management, invoice processing, and lead nurturing.',
    price: 497,
    complexity: 'Advanced',
    setupTime: '4-6 hours',
    rating: 4.9,
    icon: BuildingOfficeIcon,
    features: ['4 Core Processes', 'Customer Onboarding', 'Project Management', 'Lead Nurturing'],
    color: 'secondary'
  },
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding Automation',
    category: 'Business Process',
    description: 'Streamlined customer setup and configuration with automated welcome sequences, account setup, and progress tracking.',
    price: 297,
    complexity: 'Intermediate',
    setupTime: '2-3 hours',
    rating: 4.8,
    icon: UsersIcon,
    features: ['Welcome Sequences', 'Account Setup', 'Progress Tracking', 'Integration Testing'],
    color: 'secondary'
  },
  {
    id: 'project-management',
    name: 'Project Management Automation',
    category: 'Business Process',
    description: 'Automated task assignment and progress tracking with deadline monitoring and team notifications.',
    price: 397,
    complexity: 'Intermediate',
    setupTime: '2-4 hours',
    rating: 4.7,
    icon: BuildingOfficeIcon,
    features: ['Task Assignment', 'Progress Monitoring', 'Deadline Tracking', 'Team Notifications'],
    color: 'secondary'
  },

  // Content Generation & Marketing
  {
    id: 'tax4us-content',
    name: 'Tax4Us Content Automation',
    category: 'Content Generation',
    description: 'Automated content generation for tax services with WordPress automation, social media posting, and SEO optimization.',
    price: 597,
    complexity: 'Advanced',
    setupTime: '3-5 hours',
    rating: 4.9,
    icon: DocumentTextIcon,
    features: ['WordPress Automation', 'Social Media', 'SEO Optimization', 'Client Communication'],
    color: 'accent'
  },
  {
    id: 'insurance-content',
    name: 'Insurance Content Generator',
    category: 'Content Generation',
    description: 'AI-powered insurance content generation with family profile generation, insurance recommendations, and Hebrew content.',
    price: 697,
    complexity: 'Advanced',
    setupTime: '4-6 hours',
    rating: 4.8,
    icon: DocumentTextIcon,
    features: ['Family Profiles', 'Insurance Recommendations', 'Hebrew Content', 'Document Generation'],
    color: 'accent'
  },
  {
    id: 'multi-platform-content',
    name: 'Multi-Platform Content Automation',
    category: 'Content Generation',
    description: 'Cross-platform content automation with WordPress, social media, email integration, AI content generation, and brand consistency.',
    price: 797,
    complexity: 'Advanced',
    setupTime: '5-8 hours',
    rating: 4.7,
    icon: DocumentTextIcon,
    features: ['Cross-Platform', 'AI Generation', 'Multi-Language', 'Brand Consistency'],
    color: 'accent'
  },

  // Financial & Invoicing Automation
  {
    id: 'quickbooks-integration',
    name: 'QuickBooks Integration Suite',
    category: 'Financial',
    description: 'Complete QuickBooks automation with invoice generation, payment tracking, expense management, and financial reporting.',
    price: 297,
    complexity: 'Intermediate',
    setupTime: '2-3 hours',
    rating: 4.8,
    icon: CurrencyDollarIcon,
    features: ['Invoice Generation', 'Payment Tracking', 'Expense Management', 'Financial Reporting'],
    color: 'highlight'
  },
  {
    id: 'automated-billing',
    name: 'Automated Billing System',
    category: 'Financial',
    description: 'End-to-end billing automation with recurring billing, payment reminders, late fee automation, and financial analytics.',
    price: 497,
    complexity: 'Advanced',
    setupTime: '3-4 hours',
    rating: 4.9,
    icon: CurrencyDollarIcon,
    features: ['Recurring Billing', 'Payment Reminders', 'Late Fee Automation', 'Financial Analytics'],
    color: 'highlight'
  },
  {
    id: 'multi-currency-financial',
    name: 'Multi-Currency Financial Automation',
    category: 'Financial',
    description: 'International financial automation with multi-currency support, exchange rate automation, and tax compliance.',
    price: 697,
    complexity: 'Advanced',
    setupTime: '4-6 hours',
    rating: 4.7,
    icon: CurrencyDollarIcon,
    features: ['Multi-Currency', 'Exchange Rates', 'International Payments', 'Tax Compliance'],
    color: 'highlight'
  },

  // Customer Onboarding & Management
  {
    id: 'customer-lifecycle',
    name: 'Complete Customer Lifecycle Management',
    category: 'Customer Management',
    description: 'End-to-end customer management with lead capture, onboarding automation, progress tracking, and retention campaigns.',
    price: 597,
    complexity: 'Advanced',
    setupTime: '4-6 hours',
    rating: 4.9,
    icon: UsersIcon,
    features: ['Lead Capture', 'Onboarding Automation', 'Progress Tracking', 'Retention Campaigns'],
    color: 'primary'
  },
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing Automation',
    category: 'Customer Management',
    description: 'Automated lead follow-up and conversion with email sequences, lead scoring, conversion tracking, and sales team notifications.',
    price: 397,
    complexity: 'Intermediate',
    setupTime: '2-3 hours',
    rating: 4.8,
    icon: UsersIcon,
    features: ['Email Sequences', 'Lead Scoring', 'Conversion Tracking', 'Sales Notifications'],
    color: 'primary'
  },
  {
    id: 'customer-support',
    name: 'Customer Support Automation',
    category: 'Customer Management',
    description: 'Automated customer support system with ticket routing, FAQ automation, escalation management, and satisfaction tracking.',
    price: 497,
    complexity: 'Intermediate',
    setupTime: '2-4 hours',
    rating: 4.7,
    icon: UsersIcon,
    features: ['Ticket Routing', 'FAQ Automation', 'Escalation Management', 'Satisfaction Tracking'],
    color: 'primary'
  },

  // Technical Integration Packages
  {
    id: 'n8n-deployment',
    name: 'n8n Deployment Package',
    category: 'Technical Integration',
    description: 'Complete n8n instance deployment with VPS deployment, SSL configuration, security hardening, and monitoring setup.',
    price: 797,
    complexity: 'Advanced',
    setupTime: '3-5 hours',
    rating: 4.9,
    icon: CogIcon,
    features: ['VPS Deployment', 'SSL Configuration', 'Security Hardening', 'Monitoring Setup'],
    color: 'secondary'
  },
  {
    id: 'mcp-integration',
    name: 'MCP Server Integration Suite',
    category: 'Technical Integration',
    description: 'Model Context Protocol server setup with Airtable, Notion, n8n MCP servers, and custom integrations.',
    price: 997,
    complexity: 'Advanced',
    setupTime: '4-6 hours',
    rating: 4.8,
    icon: CogIcon,
    features: ['Airtable MCP', 'Notion MCP', 'n8n MCP', 'Custom Integrations'],
    color: 'secondary'
  },
  {
    id: 'api-integration-hub',
    name: 'API Integration Hub',
    category: 'Technical Integration',
    description: 'Multi-service API integration platform with 50+ API integrations, webhook management, data transformation, and error handling.',
    price: 1197,
    complexity: 'Advanced',
    setupTime: '5-8 hours',
    rating: 4.7,
    icon: CogIcon,
    features: ['50+ APIs', 'Webhook Management', 'Data Transformation', 'Error Handling'],
    color: 'secondary'
  }
];

const categories = [
  'All',
  'Email Automation',
  'Business Process',
  'Content Generation',
  'Financial',
  'Customer Management',
  'Technical Integration'
];

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const filteredProducts = products
    .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'border-primary-500/30 bg-primary-500/10';
      case 'secondary':
        return 'border-secondary-500/30 bg-secondary-500/10';
      case 'accent':
        return 'border-accent-500/30 bg-accent-500/10';
      case 'highlight':
        return 'border-highlight-500/30 bg-highlight-500/10';
      default:
        return 'border-dark-700 bg-dark-800';
    }
  };

  return (
    <section className="section-padding bg-dark-800/50">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Our Automation Products</span>
          </h2>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Choose from 18 proven automation products across 6 categories, 
            all derived from real customer implementations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-4 lg:space-y-0">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="flex items-center space-x-4">
            <span className="text-dark-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card-hover ${getColorClasses(product.color)}`}
            >
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${getColorClasses(product.color)}`}>
                    <product.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-primary-500">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-white">{product.rating}</span>
                </div>
              </div>

              {/* Product Info */}
              <h3 className="text-xl font-bold text-white mb-3">{product.name}</h3>
              <p className="text-dark-300 mb-4 line-clamp-3">{product.description}</p>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {product.features.slice(0, 2).map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                  {product.features.length > 2 && (
                    <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-md">
                      +{product.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Product Meta */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 text-sm text-dark-300">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{product.setupTime}</span>
                  </div>
                  <span className="px-2 py-1 bg-dark-700 rounded-md text-xs">
                    {product.complexity}
                  </span>
                </div>
                <div className="text-2xl font-bold gradient-text">
                  ${product.price}
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href={`/products/${product.id}`}
                className="btn-primary w-full group"
              >
                <span>View Details</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="text-center mt-16">
          <Link href="/products" className="btn-outline text-lg px-8 py-4">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

