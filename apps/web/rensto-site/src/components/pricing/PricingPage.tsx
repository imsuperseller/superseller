import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'default' | 'secondary' | 'outline';
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
    buttonText: 'Start Free Trial',
    buttonVariant: 'outline'
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
    buttonVariant: 'default',
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
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Choose Your Automation Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform your business with Rensto's universal automation platform. 
            No coding required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'shadow-lg'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600 text-lg">/month</span>
                </div>
                <CardDescription className="text-slate-600 text-lg">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
          <p className="text-sm text-slate-500">
            Need a custom solution? <a href="/contact" className="text-blue-600 hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
