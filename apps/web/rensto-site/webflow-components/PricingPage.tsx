import React from 'react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 97,
    description: 'Perfect for small businesses getting started with automation',
    features: [
      '100 interactions per month',
      '5 workflow templates',
      '1 user account',
      '1,000 API calls',
      '1GB storage',
      '3 integrations',
      'Email support',
      'Basic analytics'
    ],
    buttonText: 'Start Free Trial'
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 197,
    description: 'Ideal for growing businesses with advanced automation needs',
    features: [
      '500 interactions per month',
      '20 workflow templates',
      '5 user accounts',
      '5,000 API calls',
      '10GB storage',
      '10 integrations',
      'Priority support',
      'Advanced analytics',
      'AI-powered suggestions',
      'Custom workflows'
    ],
    buttonText: 'Start Free Trial',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 497,
    description: 'Complete solution for large organizations with complex needs',
    features: [
      'Unlimited interactions',
      'Unlimited templates',
      'Unlimited users',
      'Unlimited API calls',
      'Unlimited storage',
      'Unlimited integrations',
      'Dedicated support',
      'Advanced analytics',
      'AI-powered automation',
      'White-label options',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee'
    ],
    buttonText: 'Contact Sales'
  }
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Choose Your Automation Plan</h1>
        <p>Transform your business with Rensto's universal automation platform. No coding required.</p>
      </div>

      {/* Pricing Cards */}
      <div className="pricing-cards">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && (
              <div className="popular-badge">Most Popular</div>
            )}
            
            <div className="card-header">
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">${plan.price}</span>
                <span className="period">/month</span>
              </div>
              <p>{plan.description}</p>
            </div>
            
            <div className="card-content">
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className={`cta-button ${plan.popular ? 'primary' : 'secondary'}`}>
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        <p>All plans include 14-day free trial • No setup fees • Cancel anytime</p>
        <p>Need a custom solution? <a href="/contact">Contact our sales team</a></p>
      </div>
    </div>
  );
}
