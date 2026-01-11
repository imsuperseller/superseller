'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, Zap, Users, Crown } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Form validation schema
const leadEnrichmentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  businessInfo: z.string().min(10, 'Please provide more details about your business'),
  searchQuery: z.string().min(5, 'Please provide a more specific search query'),
  tier: z.enum(['basic', 'professional', 'enterprise'])
});

type LeadEnrichmentForm = z.infer<typeof leadEnrichmentSchema>;

// Pricing tiers configuration
const PRICING_TIERS = {
  basic: {
    name: 'Basic',
    price: 99,
    leads: 10,
    features: ['Basic AI enrichment', 'Email delivery', 'CSV export', '5-10 min processing'],
    icon: Users,
    color: 'bg-blue-500',
    popular: false
  },
  professional: {
    name: 'Professional',
    price: 499,
    leads: 100,
    features: ['Advanced AI enrichment', 'Personalized outreach', 'Voice messages', 'Email delivery', 'CSV export', 'Priority processing'],
    icon: Zap,
    color: 'bg-purple-500',
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    price: 1999,
    leads: 500,
    features: ['Premium AI enrichment', 'Personalized outreach', 'Voice messages', 'Custom integration', 'Priority support', 'API access'],
    icon: Crown,
    color: 'bg-gold-500',
    popular: false
  }
};

export default function LeadEnrichmentPage() {
  const [selectedTier, setSelectedTier] = useState<keyof typeof PRICING_TIERS>('professional');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<LeadEnrichmentForm>({
    resolver: zodResolver(leadEnrichmentSchema),
    defaultValues: {
      tier: 'professional'
    }
  });

  const onSubmit = async (data: LeadEnrichmentForm) => {
    setIsSubmitting(true);
    
    try {
      // Submit to n8n webhook
      const response = await fetch('http://172.245.56.50:5678/webhook/lead-enrichment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tier: selectedTier,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const result = await response.json();
      
      setIsSuccess(true);
      toast.success('Your lead enrichment request has been submitted!');
      
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-gray-300 mb-4">
              Your lead enrichment is processing. You'll receive your enriched leads via email within 5-10 minutes.
            </p>
            <Button 
              onClick={() => setIsSuccess(false)}
              className="w-full"
            >
              Submit Another Request
            </Button>
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
            AI-Powered Lead Enrichment
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your business with AI-powered virtual workers that actually work. 
            Get enriched leads with personalized outreach messages in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Pricing Tiers */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
            {Object.entries(PRICING_TIERS).map(([key, tier]) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === key;
              
              return (
                <Card 
                  key={key}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-purple-500 bg-purple-900/20' 
                      : 'hover:bg-white/5'
                  } ${tier.popular ? 'border-purple-500' : ''}`}
                  onClick={() => setSelectedTier(key as keyof typeof PRICING_TIERS)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${tier.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white">{tier.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {tier.leads} leads per month
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${tier.price}</div>
                        <div className="text-sm text-gray-400">/month</div>
                      </div>
                    </div>
                    {tier.popular && (
                      <Badge className="w-fit bg-purple-500 text-white">
                        Most Popular
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Lead Enrichment Form */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Get Your Enriched Leads</CardTitle>
              <CardDescription className="text-gray-300">
                Fill out the form below and receive your AI-enriched leads within 5-10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      First Name *
                    </label>
                    <Input
                      {...register('firstName')}
                      placeholder="John"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Last Name *
                    </label>
                    <Input
                      {...register('lastName')}
                      placeholder="Doe"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="john@company.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tell us about your business *
                  </label>
                  <Textarea
                    {...register('businessInfo')}
                    placeholder="I run an AI agency that specializes in social media automation. We help businesses save hundreds of hours by streamlining their online presence..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                  />
                  {errors.businessInfo && (
                    <p className="text-red-400 text-sm mt-1">{errors.businessInfo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What type of leads are you searching for? *
                  </label>
                  <Input
                    {...register('searchQuery')}
                    placeholder="real estate agents in San Francisco"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  {errors.searchQuery && (
                    <p className="text-red-400 text-sm mt-1">{errors.searchQuery.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Your Request...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get My Enriched Leads - ${PRICING_TIERS[selectedTier].price}
                    </>
                  )}
                </Button>

                <p className="text-sm text-gray-400 text-center">
                  You'll receive your enriched leads via email within 5-10 minutes.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Why Choose Our AI Lead Enrichment?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-300">
                Advanced AI analyzes profiles and generates personalized outreach messages
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional Quality</h3>
              <p className="text-gray-300">
                Enterprise-grade system with 99.9% uptime and professional data handling
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
              <p className="text-gray-300">
                Get your enriched leads and personalized messages in minutes, not days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
