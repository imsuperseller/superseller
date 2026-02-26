import { Metadata } from 'next';
import { CheckCircle, ArrowRight, Play, Users, Settings, Zap } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Getting Started - SuperSeller AI Business System',
  description: 'Quick start guide for SuperSeller AI Business System',
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--superseller-bg-primary)' }}>
      <Header />
      <main className="flex-grow">
        {/* Header */}
        <div className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--superseller-text-primary)' }}>
                Getting Started
              </h1>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--superseller-text-secondary)' }}>
                Get up and running with SuperSeller AI Business System in just 5 minutes. Follow this guide to set up your account and create your first automation.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Steps */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg shadow-sm border p-8 mb-8" style={{ background: 'var(--superseller-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--superseller-text-primary)' }}>Quick Start Guide</h2>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.title} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--superseller-cyan)' }}>
                      <span className="font-semibold">{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <step.icon className="h-5 w-5 mr-2" style={{ color: 'var(--superseller-blue)' }} />
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--superseller-text-primary)' }}>{step.title}</h3>
                    </div>
                    <p className="mb-3" style={{ color: 'var(--superseller-text-secondary)' }}>{step.description}</p>

                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Key Features */}
          <div className="rounded-lg shadow-sm border p-8 mb-8" style={{ background: 'var(--superseller-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--superseller-text-primary)' }}>Key Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="border rounded-lg p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--superseller-text-primary)' }}>{feature.title}</h3>
                  <p className="mb-4" style={{ color: 'var(--superseller-text-secondary)' }}>{feature.description}</p>

                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-lg p-8" style={{ background: 'linear-gradient(to right, rgba(0, 242, 254, 0.05), rgba(79, 172, 254, 0.05))', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--superseller-text-primary)' }}>What&apos;s Next?</h2>
            <p className="mb-6" style={{ color: 'var(--superseller-text-secondary)' }}>
              Now that you&apos;re familiar with the basics, explore these resources to get the most out of SuperSeller AI:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/docs/agents"
                className="block p-4 rounded-lg border border-white/10 hover:border-[var(--superseller-blue)]/50 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--superseller-text-primary)' }}>Agent Management</h3>
                <p className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>Learn how to create and manage automation agents</p>
              </Link>

              <Link
                href="/docs/analytics"
                className="block p-4 rounded-lg border border-white/10 hover:border-[var(--superseller-blue)]/50 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--superseller-text-primary)' }}>Analytics Guide</h3>
                <p className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>Understand your data and get actionable insights</p>
              </Link>

              <Link
                href="/docs/api-reference"
                className="block p-4 rounded-lg border border-white/10 hover:border-[var(--superseller-blue)]/50 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--superseller-text-primary)' }}>API Reference</h3>
                <p className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>Integrate SuperSeller AI with your existing systems</p>
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="mt-8 rounded-lg shadow-sm border p-8" style={{ background: 'var(--superseller-bg-card)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--superseller-text-primary)' }}>Need Help?</h2>
              <p className="mb-6" style={{ color: 'var(--superseller-text-secondary)' }}>
                Our support team is here to help you get the most out of SuperSeller AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs/support"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                >
                  Contact Support
                </Link>

                <Link
                  href="/docs/troubleshooting"
                  className="inline-flex items-center px-6 py-3 border border-white/10 text-base font-medium rounded-md text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Troubleshooting Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
