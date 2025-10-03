import React from 'react';

// Modern DevLink component structure
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
        {/* Basic Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Basic Plan</h3>
            <div className="price">
              <span className="amount">$97</span>
              <span className="period">/month</span>
            </div>
            <p>Perfect for small businesses getting started with automation</p>
          </div>
          
          <div className="card-content">
            <ul className="features">
              <li><span className="checkmark">✓</span> 100 interactions per month</li>
              <li><span className="checkmark">✓</span> 5 workflow templates</li>
              <li><span className="checkmark">✓</span> 1 user account</li>
              <li><span className="checkmark">✓</span> 1,000 API calls</li>
              <li><span className="checkmark">✓</span> 1GB storage</li>
              <li><span className="checkmark">✓</span> 3 integrations</li>
              <li><span className="checkmark">✓</span> Email support</li>
              <li><span className="checkmark">✓</span> Basic analytics</li>
            </ul>
            
            <button className="cta-button secondary">
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Professional Plan - Most Popular */}
        <div className="pricing-card popular">
          <div className="popular-badge">Most Popular</div>
          <div className="card-header">
            <h3>Professional Plan</h3>
            <div className="price">
              <span className="amount">$197</span>
              <span className="period">/month</span>
            </div>
            <p>Ideal for growing businesses with advanced automation needs</p>
          </div>
          
          <div className="card-content">
            <ul className="features">
              <li><span className="checkmark">✓</span> 500 interactions per month</li>
              <li><span className="checkmark">✓</span> 20 workflow templates</li>
              <li><span className="checkmark">✓</span> 5 user accounts</li>
              <li><span className="checkmark">✓</span> 5,000 API calls</li>
              <li><span className="checkmark">✓</span> 10GB storage</li>
              <li><span className="checkmark">✓</span> 10 integrations</li>
              <li><span className="checkmark">✓</span> Priority support</li>
              <li><span className="checkmark">✓</span> Advanced analytics</li>
              <li><span className="checkmark">✓</span> AI-powered suggestions</li>
              <li><span className="checkmark">✓</span> Custom workflows</li>
            </ul>
            
            <button className="cta-button primary">
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card">
          <div className="card-header">
            <h3>Enterprise Plan</h3>
            <div className="price">
              <span className="amount">$497</span>
              <span className="period">/month</span>
            </div>
            <p>Complete solution for large organizations with complex needs</p>
          </div>
          
          <div className="card-content">
            <ul className="features">
              <li><span className="checkmark">✓</span> Unlimited interactions</li>
              <li><span className="checkmark">✓</span> Unlimited templates</li>
              <li><span className="checkmark">✓</span> Unlimited users</li>
              <li><span className="checkmark">✓</span> Unlimited API calls</li>
              <li><span className="checkmark">✓</span> Unlimited storage</li>
              <li><span className="checkmark">✓</span> Unlimited integrations</li>
              <li><span className="checkmark">✓</span> Dedicated support</li>
              <li><span className="checkmark">✓</span> Advanced analytics</li>
              <li><span className="checkmark">✓</span> AI-powered automation</li>
              <li><span className="checkmark">✓</span> White-label options</li>
              <li><span className="checkmark">✓</span> Custom integrations</li>
              <li><span className="checkmark">✓</span> Dedicated account manager</li>
              <li><span className="checkmark">✓</span> SLA guarantee</li>
            </ul>
            
            <button className="cta-button secondary">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        <p>All plans include 14-day free trial • No setup fees • Cancel anytime</p>
        <p>Need a custom solution? <a href="/contact">Contact our sales team</a></p>
      </div>
    </div>
  );
}
