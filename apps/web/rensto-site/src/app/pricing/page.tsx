'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Users, Database, Shield } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '$97',
    period: '/month',
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
    limitations: [
      'Limited to 1 user',
      'Basic support only',
      'Standard templates only'
    ],
    popular: false,
    cta: 'Start Free Trial',
    color: 'border-gray-200'
  },
  {
    name: 'Professional',
    price: '$197',
    period: '/month',
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
    limitations: [
      'Limited to 5 users',
      'No white-label options'
    ],
    popular: true,
    cta: 'Start Free Trial',
    color: 'border-blue-500'
  },
  {
    name: 'Enterprise',
    price: '$497',
    period: '/month',
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
    limitations: [],
    popular: false,
    cta: 'Contact Sales',
    color: 'border-purple-500'
  }
];

const usagePricing = [
  {
    name: 'API Calls',
    price: '$0.01',
    unit: 'per call',
    description: 'Additional API calls beyond your plan limit'
  },
  {
    name: 'Data Processing',
    price: '$0.10',
    unit: 'per GB',
    description: 'Data processing and storage beyond your plan limit'
  },
  {
    name: 'Custom Integrations',
    price: '$500',
    unit: 'per integration',
    description: 'Custom third-party integrations and connectors'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include our core automation features with no hidden fees.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Limitations:</h4>
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <div key={limitationIndex} className="flex items-start gap-3">
                        <span className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0">×</span>
                        <span className="text-sm text-gray-600">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage-Based Pricing */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Usage-Based Pricing</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Pay only for what you use beyond your plan limits. No surprises, no hidden fees.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {usagePricing.map((item, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {item.price}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{item.unit}</div>
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">All Plans Include</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Workflow Automation</h3>
              <p className="text-sm text-gray-600">Automate repetitive tasks with visual workflows</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">Share workflows and collaborate with your team</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Data Integration</h3>
              <p className="text-sm text-gray-600">Connect with 100+ popular business tools</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-gray-600">Bank-level security and compliance</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses already automating with Rensto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
