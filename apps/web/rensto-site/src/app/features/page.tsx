'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Users, 
  Database, 
  Shield, 
  BarChart3, 
  Bot, 
  Workflow, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Globe,
  Lock
} from 'lucide-react';

const features = [
  {
    category: 'Automation',
    title: 'Visual Workflow Builder',
    description: 'Create complex automations with our intuitive drag-and-drop interface. No coding required.',
    icon: <Workflow className="w-8 h-8" />,
    benefits: [
      'Drag-and-drop interface',
      'Pre-built templates',
      'Conditional logic',
      'Error handling'
    ],
    color: 'blue'
  },
  {
    category: 'AI Integration',
    title: 'AI-Powered Automation',
    description: 'Leverage artificial intelligence to suggest optimizations and automate complex decision-making.',
    icon: <Bot className="w-8 h-8" />,
    benefits: [
      'Smart suggestions',
      'Natural language processing',
      'Predictive analytics',
      'Auto-optimization'
    ],
    color: 'purple'
  },
  {
    category: 'Integrations',
    title: '100+ App Integrations',
    description: 'Connect with all your favorite business tools and services seamlessly.',
    icon: <Globe className="w-8 h-8" />,
    benefits: [
      'CRM integrations',
      'Email marketing',
      'Project management',
      'Accounting software'
    ],
    color: 'green'
  },
  {
    category: 'Analytics',
    title: 'Advanced Analytics',
    description: 'Track performance, identify bottlenecks, and optimize your workflows with detailed insights.',
    icon: <BarChart3 className="w-8 h-8" />,
    benefits: [
      'Real-time monitoring',
      'Performance metrics',
      'Usage analytics',
      'Custom dashboards'
    ],
    color: 'orange'
  },
  {
    category: 'Security',
    title: 'Enterprise Security',
    description: 'Bank-level security with SOC 2 compliance, encryption, and advanced access controls.',
    icon: <Shield className="w-8 h-8" />,
    benefits: [
      'SOC 2 compliance',
      'End-to-end encryption',
      'Role-based access',
      'Audit logs'
    ],
    color: 'red'
  },
  {
    category: 'Collaboration',
    title: 'Team Collaboration',
    description: 'Work together with your team on complex automations and share best practices.',
    icon: <Users className="w-8 h-8" />,
    benefits: [
      'Team workspaces',
      'Version control',
      'Comment system',
      'Permission management'
    ],
    color: 'indigo'
  }
];

const useCases = [
  {
    industry: 'E-commerce',
    title: 'Order Processing Automation',
    description: 'Automatically process orders, update inventory, and send customer notifications.',
    icon: <Zap className="w-6 h-6" />,
    benefits: [
      'Reduce manual work by 80%',
      'Faster order processing',
      'Fewer errors',
      'Better customer experience'
    ]
  },
  {
    industry: 'Marketing',
    title: 'Lead Nurturing Campaigns',
    description: 'Automate lead scoring, follow-up sequences, and personalized email campaigns.',
    icon: <Target className="w-6 h-6" />,
    benefits: [
      'Higher conversion rates',
      'Consistent follow-up',
      'Personalized messaging',
      'Scalable campaigns'
    ]
  },
  {
    industry: 'Sales',
    title: 'CRM Data Management',
    description: 'Automatically sync data between systems, update records, and track customer interactions.',
    icon: <Database className="w-6 h-6" />,
    benefits: [
      'Clean, accurate data',
      'Real-time updates',
      'Reduced data entry',
      'Better insights'
    ]
  },
  {
    industry: 'HR',
    title: 'Employee Onboarding',
    description: 'Streamline new hire processes with automated workflows and task assignments.',
    icon: <Users className="w-6 h-6" />,
    benefits: [
      'Faster onboarding',
      'Consistent processes',
      'Reduced paperwork',
      'Better employee experience'
    ]
  }
];

const stats = [
  { number: '10x', label: 'Faster Processing' },
  { number: '80%', label: 'Less Manual Work' },
  { number: '99.9%', label: 'Uptime Guarantee' },
  { number: '24/7', label: 'Customer Support' }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful Features for Modern Businesses
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to automate your business processes, from simple workflows to complex AI-powered automations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg bg-${feature.color}-100 flex items-center justify-center text-${feature.color}-600 mb-4`}>
                    {feature.icon}
                  </div>
                  <Badge variant="outline" className="w-fit mb-2">{feature.category}</Badge>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Industry Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {useCase.icon}
                    </div>
                    <div>
                      <Badge variant="outline">{useCase.industry}</Badge>
                      <CardTitle className="text-xl mt-2">{useCase.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Security & Compliance</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">SOC 2 Compliant</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security standards</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-gray-600">Your data is always protected</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">99.9% Uptime</h3>
              <p className="text-sm text-gray-600">Reliable service you can count on</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start automating today with our 14-day free trial
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
