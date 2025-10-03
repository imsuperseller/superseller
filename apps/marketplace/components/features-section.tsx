'use client';

import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: EnvelopeIcon,
    title: 'AI-Powered Email Automation',
    description: 'Intelligent email routing with 6 AI personas for customer success, technical support, business development, marketing, operations, and finance.',
    color: 'primary'
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Business Process Automation',
    description: 'Complete automation of your core business processes including customer onboarding, project management, and lead nurturing.',
    color: 'secondary'
  },
  {
    icon: DocumentTextIcon,
    title: 'Content Generation & Marketing',
    description: 'Automated content creation for WordPress, social media, and email marketing with AI-powered generation and multi-language support.',
    color: 'accent'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Financial & Invoicing Automation',
    description: 'Complete financial automation with QuickBooks integration, automated billing, payment tracking, and multi-currency support.',
    color: 'highlight'
  },
  {
    icon: UsersIcon,
    title: 'Customer Onboarding & Management',
    description: 'End-to-end customer lifecycle management with lead capture, onboarding automation, and retention campaigns.',
    color: 'primary'
  },
  {
    icon: CogIcon,
    title: 'Technical Integration Packages',
    description: 'Complete technical solutions including n8n deployment, MCP server integration, and API integration hub.',
    color: 'secondary'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption, compliance ready, and comprehensive audit trails.',
    color: 'accent'
  },
  {
    icon: ChartBarIcon,
    title: 'Advanced Analytics',
    description: 'Comprehensive analytics and reporting with real-time dashboards, performance metrics, and business intelligence.',
    color: 'highlight'
  },
  {
    icon: ClockIcon,
    title: '24/7 Monitoring',
    description: 'Round-the-clock monitoring and support with automated alerts, performance tracking, and instant notifications.',
    color: 'primary'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Scalability',
    description: 'Built for global scale with multi-region deployment, CDN integration, and international compliance.',
    color: 'secondary'
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Intelligence',
    description: 'Advanced AI capabilities for intelligent automation, predictive analytics, and smart decision making.',
    color: 'accent'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Rapid Deployment',
    description: 'Get up and running in minutes with our streamlined deployment process and comprehensive setup guides.',
    color: 'highlight'
  }
];

const stats = [
  { number: '18', label: 'Automation Products', description: 'Proven workflows across 6 categories' },
  { number: '6', label: 'Product Categories', description: 'Comprehensive business automation' },
  { number: '4', label: 'Pricing Tiers', description: 'From starter to enterprise' },
  { number: '95%', label: 'Success Rate', description: 'Customer satisfaction guaranteed' }
];

export function FeaturesSection() {
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

  const getIconColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-primary-500 bg-primary-500/20';
      case 'secondary':
        return 'text-secondary-500 bg-secondary-500/20';
      case 'accent':
        return 'text-accent-500 bg-accent-500/20';
      case 'highlight':
        return 'text-highlight-500 bg-highlight-500/20';
      default:
        return 'text-white bg-dark-700';
    }
  };

  return (
    <section className="section-padding bg-dark-800/30">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Why Choose Rensto?</span>
          </h2>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Our automation platform is built on proven customer implementations, 
            ensuring high success rates and immediate ROI for your business.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-dark-300 text-sm">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card-hover ${getColorClasses(feature.color)}`}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg ${getIconColorClasses(feature.color)} mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-dark-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-highlight-500/20 rounded-2xl p-8 border border-primary-500/30"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-lg text-dark-300 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already using Rensto automation 
              to streamline their operations and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="btn-primary text-lg px-8 py-4 group">
                <span>Start Free Trial</span>
                <RocketLaunchIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-outline text-lg px-8 py-4">
                View All Products
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

