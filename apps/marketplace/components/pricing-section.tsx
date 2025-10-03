'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const pricingTiers = [
  {
    name: 'Starter',
    price: { monthly: 97, yearly: 990 },
    description: 'Perfect for small businesses and freelancers',
    features: [
      'Basic email automation',
      'Simple business processes',
      'Community support',
      'Up to 1,000 contacts',
      'Basic templates',
      'Email support'
    ],
    limitations: [
      'Limited integrations',
      'Basic analytics',
      'Standard templates only'
    ],
    popular: false,
    color: 'primary'
  },
  {
    name: 'Professional',
    price: { monthly: 297, yearly: 3029 },
    description: 'Ideal for growing businesses and agencies',
    features: [
      '6-persona email system',
      'Complete business automation',
      'Priority email support',
      'Up to 10,000 contacts',
      'Advanced templates',
      'Monthly optimization calls',
      'Custom integrations',
      'Advanced analytics'
    ],
    limitations: [
      'Limited custom development',
      'Standard deployment options'
    ],
    popular: true,
    color: 'accent'
  },
  {
    name: 'Enterprise',
    price: { monthly: 797, yearly: 8129 },
    description: 'For large businesses and high-volume operations',
    features: [
      'All products included',
      'Multi-language support',
      'White-label options',
      'Unlimited contacts',
      'Custom templates',
      'Dedicated account manager',
      'Weekly optimization calls',
      'Custom development',
      'Advanced integrations',
      'Priority support'
    ],
    limitations: [],
    popular: false,
    color: 'secondary'
  },
  {
    name: 'Custom Enterprise',
    price: { monthly: 2997, yearly: 30569 },
    description: 'Fortune 500 and large enterprise solutions',
    features: [
      'Custom development',
      'Industry-specific solutions',
      'Multi-tenant architecture',
      'Unlimited everything',
      '24/7 phone support',
      'Custom training programs',
      'Dedicated infrastructure',
      'SLA guarantees',
      'On-premise deployment',
      'Custom integrations'
    ],
    limitations: [],
    popular: false,
    color: 'highlight'
  }
];

const deploymentPackages = [
  {
    name: 'Self-Service',
    price: 0,
    description: 'Download and set up yourself',
    features: [
      'Downloadable files',
      'Setup guides',
      'Video tutorials',
      'Community support'
    ],
    setupTime: '2-8 hours',
    successRate: '85%',
    color: 'primary'
  },
  {
    name: 'Assisted Setup',
    price: 297,
    description: 'We help you get started',
    features: [
      'Everything in Self-Service',
      '2-hour consultation',
      'Testing and validation',
      '7-day optimization',
      'Priority email support'
    ],
    setupTime: '1-2 hours',
    successRate: '95%',
    color: 'accent'
  },
  {
    name: 'Full Service',
    price: 797,
    description: 'We do everything for you',
    features: [
      'Everything in Assisted Setup',
      'Complete deployment',
      'Training sessions',
      '30-day optimization',
      'Dedicated support'
    ],
    setupTime: '0 hours',
    successRate: '99%',
    color: 'secondary'
  },
  {
    name: 'White-Label',
    price: 1497,
    description: 'Custom branded solution',
    features: [
      'Everything in Full Service',
      'Custom branding',
      'Reseller training',
      'Revenue sharing',
      'Dedicated account manager'
    ],
    setupTime: '0 hours',
    successRate: '100%',
    color: 'highlight'
  }
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showDeploymentPackages, setShowDeploymentPackages] = useState(false);

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

  const getButtonClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'accent':
        return 'btn-accent';
      case 'highlight':
        return 'bg-highlight-500 hover:bg-highlight-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-highlight-500 focus:ring-offset-2 focus:ring-offset-dark-900';
      default:
        return 'btn-primary';
    }
  };

  return (
    <section className="section-padding bg-dark-800/30">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Simple, Transparent Pricing</span>
          </h2>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include our core automation features 
            with different levels of support and customization.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-dark-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white' : 'text-dark-400'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="bg-primary-500 text-white text-sm px-3 py-1 rounded-full">
                Save 15%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative card-hover ${getColorClasses(tier.color)} ${
                tier.popular ? 'ring-2 ring-accent-500 scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-dark-300 mb-4">{tier.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold gradient-text">
                    ${billingCycle === 'monthly' ? tier.price.monthly : Math.floor(tier.price.yearly / 12)}
                  </span>
                  <span className="text-dark-300">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-dark-400">
                    Billed annually (${tier.price.yearly})
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-3">
                    <CheckIcon className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-dark-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full ${getButtonClasses(tier.color)} group`}>
                <span>Get Started</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Deployment Packages Toggle */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowDeploymentPackages(!showDeploymentPackages)}
            className="btn-outline text-lg px-8 py-4 group"
          >
            <SparklesIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            <span>View Deployment Packages</span>
          </button>
        </div>

        {/* Deployment Packages */}
        {showDeploymentPackages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                <span className="gradient-text">Deployment Packages</span>
              </h3>
              <p className="text-lg text-dark-300 max-w-2xl mx-auto">
                Choose how you want to deploy your automation solutions. 
                From self-service to fully managed deployment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {deploymentPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`card-hover ${getColorClasses(pkg.color)}`}
                >
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">{pkg.name}</h4>
                    <p className="text-dark-300 mb-4">{pkg.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold gradient-text">
                        {pkg.price === 0 ? 'Free' : `$${pkg.price}`}
                      </span>
                    </div>
                    <div className="text-sm text-dark-400 space-y-1">
                      <p>Setup: {pkg.setupTime}</p>
                      <p>Success Rate: {pkg.successRate}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-8">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-2">
                        <CheckIcon className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-dark-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full ${getButtonClasses(pkg.color)} group`}>
                    <span>Choose Package</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-dark-300">
                Yes, you can upgrade or downgrade your plan at any time. 
                Changes take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-dark-300">
                We accept all major credit cards, PayPal, and bank transfers 
                for enterprise customers.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-dark-300">
                Yes, all plans come with a 14-day free trial. 
                No credit card required to start.
              </p>
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white mb-2">
                What support do you provide?
              </h4>
              <p className="text-dark-300">
                Support ranges from community forums to 24/7 phone support, 
                depending on your plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

