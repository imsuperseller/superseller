'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  FileText,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  User,
  ExternalLink,
  Download,
  Settings,
  Zap,
  Database,
  CreditCard,
  Phone,
  Shield,
  Key,
  Workflow,
  Bot
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  referralLinks?: {
    name: string;
    url: string;
    description: string;
  }[];
  installationSteps?: string[];
  credentials?: {
    name: string;
    description: string;
    required: boolean;
  }[];
}

export default function KnowledgebasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'all',
    'installation',
    'integrations',
    'workflows',
    'api-docs',
    'troubleshooting',
    'best-practices',
    'templates',
    'agents',
    'billing'
  ];

  const mockDocuments: Document[] = [
    {
      id: '1',
      title: 'n8n Installation & Setup Guide',
      content: 'Complete guide to installing and configuring n8n for automation workflows. Includes self-hosted and cloud deployment options.',
      category: 'installation',
      tags: ['n8n', 'installation', 'automation', 'workflows'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      version: 2,
      referralLinks: [
        {
          name: 'n8n Cloud (Recommended)',
          url: 'https://n8n.io/cloud',
          description: 'Hosted n8n with automatic updates and scaling'
        },
        {
          name: 'n8n Self-Hosted',
          url: 'https://docs.n8n.io/hosting/',
          description: 'Self-hosted installation guide'
        },
        {
          name: 'Docker Installation',
          url: 'https://docs.n8n.io/hosting/installation/docker/',
          description: 'Docker-based n8n setup'
        }
      ],
      installationSteps: [
        '1. Choose deployment method (Cloud vs Self-hosted)',
        '2. Set up n8n instance with proper authentication',
        '3. Configure webhook endpoints for agent integration',
        '4. Set up environment variables for API keys',
        '5. Test workflow execution and monitoring',
        '6. Configure backup and recovery procedures'
      ],
      credentials: [
        { name: 'n8n API Key', description: 'For programmatic access', required: true },
        { name: 'Webhook URLs', description: 'For agent integration', required: true },
        { name: 'Database Connection', description: 'PostgreSQL/MySQL for data persistence', required: true }
      ]
    },
    {
      id: '2',
      title: 'Apify Web Scraping Setup',
      content: 'Configure Apify for web scraping and data extraction. Includes API setup, actor deployment, and data processing.',
      category: 'installation',
      tags: ['apify', 'web-scraping', 'data-extraction', 'api'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      version: 1,
      referralLinks: [
        {
          name: 'Apify Platform',
          url: 'https://apify.com',
          description: 'Main Apify platform for web scraping'
        },
        {
          name: 'Apify Actors',
          url: 'https://apify.com/store',
          description: 'Pre-built scraping actors and tools'
        },
        {
          name: 'Apify API Documentation',
          url: 'https://docs.apify.com/api/v2',
          description: 'Complete API reference'
        }
      ],
      installationSteps: [
        '1. Create Apify account and verify email',
        '2. Generate API token for programmatic access',
        '3. Choose appropriate actors for your use case',
        '4. Configure actor settings and input parameters',
        '5. Set up webhook notifications for completion',
        '6. Test data extraction and format validation'
      ],
      credentials: [
        { name: 'Apify API Token', description: 'For API access and authentication', required: true },
        { name: 'Webhook URL', description: 'For completion notifications', required: false },
        { name: 'Actor Configuration', description: 'Input parameters and settings', required: true }
      ]
    },
    {
      id: '3',
      title: 'Stripe Payment Integration',
      content: 'Complete Stripe integration for payment processing, subscription management, and billing automation.',
      category: 'integrations',
      tags: ['stripe', 'payments', 'billing', 'subscriptions'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12'),
      version: 3,
      referralLinks: [
        {
          name: 'Stripe Dashboard',
          url: 'https://dashboard.stripe.com',
          description: 'Main Stripe dashboard for account management'
        },
        {
          name: 'Stripe API Documentation',
          url: 'https://stripe.com/docs/api',
          description: 'Complete API reference and guides'
        },
        {
          name: 'Stripe Webhooks',
          url: 'https://stripe.com/docs/webhooks',
          description: 'Webhook setup for real-time events'
        }
      ],
      installationSteps: [
        '1. Create Stripe account and verify business details',
        '2. Generate API keys (publishable and secret)',
        '3. Configure webhook endpoints for event handling',
        '4. Set up payment methods and subscription plans',
        '5. Implement payment processing in your application',
        '6. Test payment flows and error handling'
      ],
      credentials: [
        { name: 'Stripe Publishable Key', description: 'Public key for client-side integration', required: true },
        { name: 'Stripe Secret Key', description: 'Private key for server-side operations', required: true },
        { name: 'Webhook Secret', description: 'For webhook signature verification', required: true }
      ]
    },
    {
      id: '4',
      title: 'MongoDB Database Setup',
      content: 'Configure MongoDB for data storage, user management, and real-time data synchronization.',
      category: 'installation',
      tags: ['mongodb', 'database', 'data-storage', 'nosql'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-15'),
      version: 2,
      referralLinks: [
        {
          name: 'MongoDB Atlas',
          url: 'https://cloud.mongodb.com',
          description: 'Cloud-hosted MongoDB with automatic scaling'
        },
        {
          name: 'MongoDB Documentation',
          url: 'https://docs.mongodb.com',
          description: 'Complete MongoDB documentation'
        },
        {
          name: 'MongoDB Compass',
          url: 'https://www.mongodb.com/products/compass',
          description: 'GUI for MongoDB database management'
        }
      ],
      installationSteps: [
        '1. Choose MongoDB deployment (Atlas vs Self-hosted)',
        '2. Create database and user accounts',
        '3. Configure network access and security',
        '4. Set up connection strings and authentication',
        '5. Create collections and indexes for performance',
        '6. Configure backup and monitoring'
      ],
      credentials: [
        { name: 'MongoDB Connection String', description: 'Database connection URL', required: true },
        { name: 'Database Username', description: 'Database user credentials', required: true },
        { name: 'Database Password', description: 'Database user password', required: true }
      ]
    },
    {
      id: '5',
      title: 'AI Chat Agent Configuration',
      content: 'Set up AI chat agents for customer support, lead qualification, and automated conversations.',
      category: 'agents',
      tags: ['ai', 'chat', 'customer-support', 'automation'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19'),
      version: 1,
      referralLinks: [
        {
          name: 'OpenAI API',
          url: 'https://platform.openai.com',
          description: 'GPT models for AI chat functionality'
        },
        {
          name: 'Anthropic Claude',
          url: 'https://console.anthropic.com',
          description: 'Alternative AI model for chat agents'
        }
      ],
      installationSteps: [
        '1. Choose AI provider and create account',
        '2. Generate API keys for model access',
        '3. Configure chat agent personality and responses',
        '4. Set up conversation flow and routing',
        '5. Integrate with customer portal and CRM',
        '6. Test conversation quality and response accuracy'
      ],
      credentials: [
        { name: 'AI API Key', description: 'For AI model access', required: true },
        { name: 'Model Configuration', description: 'AI model settings and parameters', required: true },
        { name: 'Webhook URL', description: 'For conversation events', required: false }
      ]
    },
    {
      id: '6',
      title: 'Voice Agent Setup (Twilio)',
      content: 'Configure voice agents for phone call automation, sales calls, and voice-based customer interactions.',
      category: 'agents',
      tags: ['voice', 'twilio', 'phone-calls', 'sales-automation'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-21'),
      version: 1,
      referralLinks: [
        {
          name: 'Twilio Console',
          url: 'https://console.twilio.com',
          description: 'Main Twilio dashboard for account management'
        },
        {
          name: 'Twilio Voice API',
          url: 'https://www.twilio.com/voice',
          description: 'Voice API documentation and guides'
        },
        {
          name: 'Twilio Phone Numbers',
          url: 'https://www.twilio.com/phone-numbers',
          description: 'Purchase and manage phone numbers'
        }
      ],
      installationSteps: [
        '1. Create Twilio account and verify phone number',
        '2. Purchase phone numbers for voice calls',
        '3. Generate API credentials (Account SID and Auth Token)',
        '4. Configure webhook endpoints for call events',
        '5. Set up voice agent scripts and responses',
        '6. Test call quality and response accuracy'
      ],
      credentials: [
        { name: 'Twilio Account SID', description: 'Account identifier', required: true },
        { name: 'Twilio Auth Token', description: 'Authentication token', required: true },
        { name: 'Phone Numbers', description: 'Twilio phone numbers for calls', required: true }
      ]
    },
    {
      id: '7',
      title: 'Customer Portal Agent Management',
      content: 'Manage customer-specific agents, track progress, and handle agent lifecycle from deployment to retirement.',
      category: 'agents',
      tags: ['customer-portal', 'agent-management', 'lifecycle', 'monitoring'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-22'),
      version: 1,
      referralLinks: [
        {
          name: 'Rensto Admin Dashboard',
          url: '/admin/agents',
          description: 'Admin dashboard for agent management'
        },
        {
          name: 'Customer Portal',
          url: '/portal',
          description: 'Customer portal for agent monitoring'
        }
      ],
      installationSteps: [
        '1. Access admin dashboard for agent management',
        '2. Create customer-specific agent configurations',
        '3. Deploy agents with proper permissions',
        '4. Monitor agent performance and metrics',
        '5. Handle agent updates and maintenance',
        '6. Manage agent retirement and data cleanup'
      ],
      credentials: [
        { name: 'Admin Access', description: 'Admin dashboard credentials', required: true },
        { name: 'Customer Portal Access', description: 'Customer portal credentials', required: true },
        { name: 'Agent API Keys', description: 'For agent communication', required: true }
      ]
    },
    {
      id: '8',
      title: 'Workflow Optimization Guide',
      content: 'Best practices for optimizing n8n workflows, improving performance, and ensuring reliability.',
      category: 'best-practices',
      tags: ['workflows', 'optimization', 'performance', 'reliability'],
      author: 'Shai Friedman',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-23'),
      version: 1,
      referralLinks: [
        {
          name: 'n8n Best Practices',
          url: 'https://docs.n8n.io/workflows/best-practices/',
          description: 'Official n8n workflow best practices'
        },
        {
          name: 'n8n Performance Guide',
          url: 'https://docs.n8n.io/hosting/performance/',
          description: 'Performance optimization guide'
        }
      ],
      installationSteps: [
        '1. Analyze workflow performance bottlenecks',
        '2. Optimize node configurations and settings',
        '3. Implement proper error handling and retries',
        '4. Set up monitoring and alerting',
        '5. Configure backup and recovery procedures',
        '6. Test workflow reliability and scalability'
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setDocuments(mockDocuments);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateDocument = () => {
    // Create a new document with default values
    const newDocument = {
      id: `doc-${Date.now()}`,
      title: 'New Document',
      content: 'Start writing your document here...',
      category: selectedCategory || 'general',
      tags: [],
      author: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      views: 0,
      helpful: 0,
      notHelpful: 0
    };

    // Add to documents list
    setDocuments(prev => [newDocument, ...prev]);

    // TODO: Send API request to backend
    // const response = await fetch('/api/knowledgebase/documents', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newDocument)
    // });

    console.log('Created new document:', newDocument.id);
    alert('New document created! You can now edit it.');
  };

  const handleEditDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      alert('Document not found');
      return;
    }

    // TODO: Navigate to edit page or open modal
    // For now, show alert with document info
    alert(`Editing: ${document.title}\nCategory: ${document.category}\nLast updated: ${document.updatedAt}`);

    console.log('Edit document:', id);
  };

  const handleDeleteDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      alert('Document not found');
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    // Remove from local state
    setDocuments(prev => prev.filter(doc => doc.id !== id));

    // TODO: Send API request to backend
    // const response = await fetch(`/api/knowledgebase/documents/${id}`, {
    //   method: 'DELETE'
    // });

    console.log('Deleted document:', id);
    alert('Document deleted successfully!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'installation': return <Download className="h-4 w-4" />;
      case 'integrations': return <Zap className="h-4 w-4" />;
      case 'workflows': return <Workflow className="h-4 w-4" />;
      case 'agents': return <Bot className="h-4 w-4" />;
      case 'billing': return <CreditCard className="h-4 w-4" />;
      case 'api-docs': return <Database className="h-4 w-4" />;
      case 'troubleshooting': return <Settings className="h-4 w-4" />;
      case 'best-practices': return <Shield className="h-4 w-4" />;
      case 'templates': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="rensto-animate-glow rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600 mt-2">Complete setup guides, integration docs, and best practices</p>
          </div>
          <Button onClick={handleCreateDocument} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize flex items-center gap-2"
              >
                {getCategoryIcon(category)}
                {category.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDocument(doc.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-3 w-3" />
                  {doc.author}
                  <Calendar className="h-3 w-3 ml-2" />
                  {doc.updatedAt.toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{doc.content}</p>

                {/* Referral Links */}
                {doc.referralLinks && doc.referralLinks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      Quick Links
                    </h4>
                    <div className="space-y-1">
                      {doc.referralLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs style={{ color: 'var(--rensto-blue)' }} hover:style={{ color: 'var(--rensto-blue)' }} underline"
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Installation Steps */}
                {doc.installationSteps && doc.installationSteps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Download className="h-3 w-3" />
                      Setup Steps
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {doc.installationSteps.slice(0, 3).map((step, index) => (
                        <div key={index} className="truncate">{step}</div>
                      ))}
                      {doc.installationSteps.length > 3 && (
                        <div className="style={{ color: 'var(--rensto-blue)' }}">+{doc.installationSteps.length - 3} more steps</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Required Credentials */}
                {doc.credentials && doc.credentials.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      Required Credentials
                    </h4>
                    <div className="space-y-1">
                      {doc.credentials.map((cred, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <span className={`w-2 h-2 rounded-full ${cred.required ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                          <span className="text-gray-600">{cred.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="capitalize flex items-center gap-1">
                    {getCategoryIcon(doc.category)}
                    {doc.category.replace('-', ' ')}
                  </span>
                  <span>v{doc.version}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first document'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button onClick={handleCreateDocument}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
