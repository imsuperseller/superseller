import { Metadata } from 'next';
import { CheckCircle, ArrowRight, Play, Users, Settings, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Getting Started - Rensto Business System',
  description: 'Quick start guide for Rensto Business System',
  alternates: {
    canonical: '/docs/getting-started',
  },
};

const steps = [
  {
    title: 'Create Your Account',
    description: 'Sign up and set up your organization',
    icon: Users,
    details: [
      'Visit the signup page and create your account',
      'Enter your organization details',
      'Choose your subscription plan',
      'Verify your email address'
    ]
  },
  {
    title: 'Configure Your Workspace',
    description: 'Set up your team and permissions',
    icon: Settings,
    details: [
      'Invite team members to your organization',
      'Set up role-based access control',
      'Configure your workspace settings',
      'Customize your dashboard layout'
    ]
  },
  {
    title: 'Create Your First Agent',
    description: 'Build your first automation',
    icon: Play,
    details: [
      'Navigate to the Agents section',
      'Choose an agent template or create custom',
      'Configure the agent parameters',
      'Test and activate your agent'
    ]
  },
  {
    title: 'Connect Data Sources',
    description: 'Integrate your existing systems',
    icon: Zap,
    details: [
      'Add your CRM, email, or other data sources',
      'Configure API credentials securely',
      'Test the connections',
      'Set up data synchronization'
    ]
  }
];

const features = [
  {
    title: 'Agent Management',
    description: 'Create and manage automation agents',
    benefits: ['Automate repetitive tasks', 'Scale your operations', 'Reduce manual errors']
  },
  {
    title: 'Customer Management',
    description: 'Centralize customer data and interactions',
    benefits: ['360-degree customer view', 'Track customer journeys', 'Improve customer service']
  },
  {
    title: 'Analytics & Insights',
    description: 'Get actionable business intelligence',
    benefits: ['Real-time performance metrics', 'Predictive analytics', 'Custom reports']
  },
  {
    title: 'File Management',
    description: 'Organize and secure your documents',
    benefits: ['Secure file storage', 'Version control', 'Easy collaboration']
  }
];

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Getting Started
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get up and running with Rensto Business System in just 5 minutes. Follow this guide to set up your account and create your first automation.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="style={{ color: 'var(--rensto-blue)' }} font-semibold">{index + 1}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <step.icon className="h-5 w-5 style={{ color: 'var(--rensto-blue)' }} mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-3">{step.description}</p>

                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What&apos;s Next?</h2>
          <p className="text-gray-600 mb-6">
            Now that you&apos;re familiar with the basics, explore these resources to get the most out of Rensto:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/docs/agents"
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Agent Management</h3>
              <p className="text-sm text-gray-600">Learn how to create and manage automation agents</p>
            </Link>

            <Link
              href="/docs/analytics"
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Analytics Guide</h3>
              <p className="text-sm text-gray-600">Understand your data and get actionable insights</p>
            </Link>

            <Link
              href="/docs/api-reference"
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">API Reference</h3>
              <p className="text-sm text-gray-600">Integrate Rensto with your existing systems</p>
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of Rensto.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/docs/support"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>

              <Link
                href="/docs/troubleshooting"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Troubleshooting Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
