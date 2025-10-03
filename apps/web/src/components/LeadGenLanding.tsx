'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Target, Mail, Users, TrendingUp } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  businessDescription: string;
  targetLeads: string;
  pricingTier: 'basic' | 'professional' | 'enterprise';
}

const pricingTiers = {
  basic: {
    name: 'Basic',
    price: 19,
    leads: 10,
    features: ['10 Enriched Leads', 'Basic Research', 'Email Templates', 'CSV Export'],
    color: 'bg-blue-500',
    popular: false
  },
  professional: {
    name: 'Professional', 
    price: 49,
    leads: 100,
    features: ['100 Enriched Leads', 'Advanced Research', 'Personalized Messages', 'Voice Messages', 'CSV Export', 'Priority Support'],
    color: 'bg-purple-500',
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    leads: 500,
    features: ['500 Enriched Leads', 'Premium Research', 'AI-Powered Personalization', 'Voice Messages', 'CSV Export', 'Dedicated Support', 'Custom Integration'],
    color: 'bg-orange-500',
    popular: false
  }
};

export default function LeadGenLanding() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    businessDescription: '',
    targetLeads: '',
    pricingTier: 'professional'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create Stripe payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: pricingTiers[formData.pricingTier].price * 100 // Convert to cents
        })
      });

      if (!response.ok) throw new Error('Payment setup failed');

      const { clientSecret } = await response.json();

      // Redirect to Stripe Checkout or handle payment
      const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));
      
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({
        clientSecret,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cancel`
      });

      if (error) throw error;

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-gray-300 mb-4">
              Thank you for your submission. You'll receive your {pricingTiers[formData.pricingTier].leads} enriched leads in your email inbox within 5-10 minutes.
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Processing your leads...
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AI-Powered Lead Generation
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get personalized, enriched leads with AI-generated outreach messages. 
            No more manual research - we do the heavy lifting for you.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-2 text-white">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span>AI-Powered Research</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white">
              <Target className="w-6 h-6 text-red-400" />
              <span>Personalized Outreach</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white">
              <Mail className="w-6 h-6 text-blue-400" />
              <span>Ready-to-Send Messages</span>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(pricingTiers).map(([key, tier]) => (
            <Card 
              key={key}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                formData.pricingTier === key 
                  ? 'ring-2 ring-purple-500 shadow-2xl' 
                  : 'hover:shadow-xl'
              } ${tier.popular ? 'border-purple-500' : ''}`}
              onClick={() => handleInputChange('pricingTier', key)}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <div className="text-4xl font-bold text-purple-600">
                  ${tier.price}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <CardDescription>
                  {tier.leads} enriched leads with personalized outreach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get Your Leads Now</CardTitle>
            <CardDescription className="text-center">
              Fill out the form below and receive your enriched leads within minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tell us about your business</label>
                <Textarea
                  required
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  placeholder="I run an AI agency that specializes in social media automation. We help businesses save hundreds of hours by streamlining their online presence..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What type of leads are you searching for?</label>
                <Input
                  type="text"
                  required
                  value={formData.targetLeads}
                  onChange={(e) => handleInputChange('targetLeads', e.target.value)}
                  placeholder="real estate agents in San Francisco"
                />
              </div>

              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  There was an error processing your request. Please try again.
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Get My ${pricingTiers[formData.pricingTier].leads} Leads - $${pricingTiers[formData.pricingTier].price}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center mt-12 text-gray-300">
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>1000+ Leads Generated</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>95% Success Rate</span>
            </div>
          </div>
          <p className="text-sm">
            Your leads will be delivered within 5-10 minutes via email
          </p>
        </div>
      </div>
    </div>
  );
}
