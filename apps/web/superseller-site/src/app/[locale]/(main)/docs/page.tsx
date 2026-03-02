'use client';

import { Link } from '@/i18n/navigation';
import { Book, Code, Users, Settings, Zap, Shield, FileText, HelpCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const documentationSections = [
  {
    title: 'Getting Started',
    icon: Book,
    items: [
      { title: 'Quick Start Guide', href: '/docs/getting-started', description: 'Set up your account in 5 minutes' },
      { title: 'Account Setup', href: '/docs/account-setup', description: 'Configure your organization and team' },
      { title: 'First Automation', href: '/docs/first-automation', description: 'Create your first business automation' },
      { title: 'Dashboard Overview', href: '/docs/dashboard', description: 'Navigate the main dashboard' },
    ]
  },
  {
    title: 'User Guides',
    icon: Users,
    items: [
      { title: 'Agent Management', href: '/docs/agents', description: 'Create and manage automation agents' },
      { title: 'Customer Management', href: '/docs/customers', description: 'Manage your customer database' },
      { title: 'Analytics & Reports', href: '/docs/analytics', description: 'Track performance and insights' },
      { title: 'File Management', href: '/docs/files', description: 'Upload and organize files' },
      { title: 'Search & Discovery', href: '/docs/search', description: 'Find information quickly' },
    ]
  },
  {
    title: 'API Documentation',
    icon: Code,
    items: [
      { title: 'Authentication', href: '/docs/api/auth', description: 'API authentication methods' },
      { title: 'Agents API', href: '/docs/api/agents', description: 'Manage agents programmatically' },
      { title: 'Customers API', href: '/docs/api/customers', description: 'Customer data operations' },
      { title: 'Files API', href: '/docs/api/files', description: 'File upload and management' },
      { title: 'Webhooks', href: '/docs/api/webhooks', description: 'Real-time event notifications' },
    ]
  },
  {
    title: 'Administration',
    icon: Settings,
    items: [
      { title: 'System Monitoring', href: '/docs/admin/monitoring', description: 'Monitor system health and performance' },
      { title: 'Backup Management', href: '/docs/admin/backup', description: 'Manage automated backups' },
      { title: 'User Management', href: '/docs/admin/users', description: 'Manage team members and permissions' },
      { title: 'Billing & Subscriptions', href: '/docs/admin/billing', description: 'Manage payments and plans' },
      { title: 'Security Settings', href: '/docs/admin/security', description: 'Configure security policies' },
    ]
  },
  {
    title: 'Performance',
    icon: Zap,
    items: [
      { title: 'Optimization Guide', href: '/docs/performance', description: 'Optimize your automation performance' },
      { title: 'Caching Strategies', href: '/docs/caching', description: 'Implement effective caching' },
      { title: 'Database Optimization', href: '/docs/database', description: 'Optimize database queries' },
      { title: 'CDN Configuration', href: '/docs/cdn', description: 'Set up content delivery networks' },
    ]
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { title: 'Security Best Practices', href: '/docs/security', description: 'Security guidelines and recommendations' },
      { title: 'Data Protection', href: '/docs/data-protection', description: 'GDPR and data privacy compliance' },
      { title: 'Access Control', href: '/docs/access-control', description: 'Role-based access management' },
      { title: 'Audit Logs', href: '/docs/audit-logs', description: 'Track system activities' },
    ]
  },
  {
    title: 'Troubleshooting',
    icon: HelpCircle,
    items: [
      { title: 'Common Issues', href: '/docs/troubleshooting', description: 'Solutions to common problems' },
      { title: 'Error Codes', href: '/docs/errors', description: 'Understanding error messages' },
      { title: 'Performance Issues', href: '/docs/performance-issues', description: 'Diagnose and fix performance problems' },
      { title: 'Contact Support', href: '/docs/support', description: 'Get help from our support team' },
    ]
  },
  {
    title: 'Resources',
    icon: FileText,
    items: [
      { title: 'API Reference', href: '/docs/api-reference', description: 'Complete API documentation' },
      { title: 'SDK Downloads', href: '/docs/sdk', description: 'Client libraries and SDKs' },
      { title: 'Code Examples', href: '/docs/examples', description: 'Sample code and integrations' },
      { title: 'Changelog', href: '/docs/changelog', description: 'Latest updates and features' },
    ]
  }
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--superseller-bg-primary)' }}>
      <Header />
      <main className="flex-grow">
        {/* Header */}
        <div className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--superseller-text-primary)' }}>
                Documentation
              </h1>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--superseller-text-secondary)' }}>
                Everything you need to know about SuperSeller AI Business System. From getting started to advanced features.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b" style={{ background: 'var(--superseller-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[var(--superseller-blue)] focus:border-transparent"
                />
                <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documentationSections.map((section) => (
              <div key={section.title} className="rounded-lg shadow-sm border p-6" style={{ background: 'var(--superseller-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="flex items-center mb-4">
                  <section.icon className="h-6 w-6 mr-3 text-[var(--superseller-blue)]" />
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--superseller-text-primary)' }}>{section.title}</h2>
                </div>

                <div className="space-y-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium transition-colors" style={{ color: 'var(--superseller-text-primary)' }}>
                            {item.title}
                          </h3>
                          <p className="text-xs mt-1" style={{ color: 'var(--superseller-text-secondary)' }}>{item.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[var(--superseller-blue)] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-16 rounded-lg shadow-sm border p-8" style={{ background: 'var(--superseller-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--superseller-text-primary)' }}>Quick Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/docs/getting-started"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Book className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">Quick Start</span>
              </Link>

              <Link
                href="/docs/api-reference"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Code className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">API Reference</span>
              </Link>

              <Link
                href="/docs/troubleshooting"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">Troubleshooting</span>
              </Link>

              <Link
                href="/docs/support"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">Support</span>
              </Link>
            </div>
          </div>

          {/* Getting Help */}
          <div className="mt-8 rounded-lg p-8" style={{ background: 'linear-gradient(to right, rgba(0, 242, 254, 0.05), rgba(79, 172, 254, 0.05))', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--superseller-text-primary)' }}>Need Help?</h2>
              <p className="mb-6" style={{ color: 'var(--superseller-text-secondary)' }}>
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs/support"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Link>

                <a
                  href="https://github.com/superseller/docs/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Report Issue
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
