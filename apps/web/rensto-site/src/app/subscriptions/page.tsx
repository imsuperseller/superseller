'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  Clock,
  BarChart3,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

export default function SubscriptionsPage() {
  const [selectedNiche, setSelectedNiche] = useState('');
  const [leadVolume, setLeadVolume] = useState('medium');
  const [crmIntegration, setCrmIntegration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const niches = [
    { id: 'hvac', name: 'HVAC', icon: '🔧', description: 'Heating, ventilation, and air conditioning contractors' },
    { id: 'roofer', name: 'Roofer', icon: '🏠', description: 'Roofing contractors and storm damage specialists' },
    { id: 'realtor', name: 'Real Estate', icon: '🏘️', description: 'Real estate agents and property managers' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', description: 'Insurance agents and brokers' },
    { id: 'locksmith', name: 'Locksmith', icon: '🔐', description: 'Locksmiths and security professionals' },
    { id: 'photographer', name: 'Photographer', icon: '📸', description: 'Photographers and visual content creators' }
  ];

  const leadVolumes = [
    { id: 'low', name: 'Low Volume', leads: '10-50/month', price: 199, description: 'Perfect for small businesses getting started' },
    { id: 'medium', name: 'Medium Volume', leads: '50-200/month', price: 499, description: 'Ideal for growing businesses', popular: true },
    { id: 'high', name: 'High Volume', leads: '200-500/month', price: 999, description: 'For established businesses with high demand' },
    { id: 'enterprise', name: 'Enterprise', leads: '500+/month', price: 1999, description: 'Custom solutions for large organizations' }
  ];

  const crmIntegrations = [
    { id: 'hubspot', name: 'HubSpot', logo: '🟠', description: 'Full integration with HubSpot CRM and marketing automation' },
    { id: 'salesforce', name: 'Salesforce', logo: '🔵', description: 'Seamless integration with Salesforce CRM' },
    { id: 'pipedrive', name: 'Pipedrive', logo: '🟢', description: 'Complete Pipedrive CRM integration' },
    { id: 'custom', name: 'Custom CRM', logo: '⚙️', description: 'Integration with your existing CRM system' }
  ];

  const features = [
    {
      title: 'Niche-Specific Lead Generation',
      description: 'Targeted lead generation for your specific industry and market',
      icon: Target,
      benefits: ['Industry-specific targeting', 'High-quality leads', 'Geographic filtering', 'Demographic targeting']
    },
    {
      title: 'Advanced Lead Scoring',
      description: 'AI-powered lead scoring to prioritize the most promising prospects',
      icon: TrendingUp,
      benefits: ['AI-powered scoring', 'Behavioral analysis', 'Conversion prediction', 'Priority ranking']
    },
    {
      title: 'CRM Integration',
      description: 'Seamless integration with your existing CRM system',
      icon: Users,
      benefits: ['Automatic lead import', 'Contact synchronization', 'Activity tracking', 'Pipeline management']
    },
    {
      title: 'Automated Follow-up',
      description: 'Automated email and SMS sequences to nurture leads',
      icon: Mail,
      benefits: ['Email sequences', 'SMS campaigns', 'Personalized content', 'Timing optimization']
    }
  ];

  const selectedLeadVolume = leadVolumes.find(vol => vol.id === leadVolume);

  // Handle Subscription Checkout
  const handleSubscriptionCheckout = async () => {
    if (!selectedNiche || !leadVolume || !crmIntegration) {
      alert('Please select all options: niche, lead volume, and CRM integration');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('https://api.rensto.com/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowType: 'subscription',
          subscriptionType: 'lead-gen',
          tier: leadVolume,
          customerEmail: '', // Stripe checkout will collect this
          metadata: {
            niche: selectedNiche,
            nicheName: niches.find(n => n.id === selectedNiche)?.name,
            crmIntegration,
            crmName: crmIntegrations.find(c => c.id === crmIntegration)?.name,
            leadVolume: selectedLeadVolume?.leads,
            monthlyPrice: selectedLeadVolume?.price
          }
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(`Error: ${data.error || 'Could not create checkout session'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing request. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'var(--rensto-bg-primary)', 
      color: 'var(--rensto-text-primary)',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
        style={{ 
          background: 'rgba(17, 13, 40, 0.98)',
          borderColor: 'rgba(254, 61, 81, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--rensto-gradient-primary)' }}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Subscriptions</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Home
              </Link>
              <Link 
                href="/marketplace" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Marketplace
              </Link>
              <Link 
                href="/custom" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Custom
              </Link>
              <Link 
                href="/solutions" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Solutions
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-2"
                style={{ 
                  borderColor: 'var(--rensto-primary)', 
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(254, 61, 81, 0.3) 0%, transparent 70%)'
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--rensto-accent-blue) 0%, var(--rensto-accent-cyan) 50%, var(--rensto-text-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Enhanced Hot Leads Service
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Get high-quality, niche-specific leads delivered directly to your CRM. 
              Our AI-powered system finds the best prospects for your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-primary)',
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                <Target className="w-5 h-5" />
                <span className="font-semibold">Niche-Specific</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-blue)',
                  color: 'var(--rensto-accent-blue)',
                  background: 'transparent'
                }}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">AI-Powered</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-cyan)',
                  color: 'var(--rensto-accent-cyan)',
                  background: 'transparent'
                }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">CRM Integrated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Niche Selection */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Choose Your Niche
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Select your industry to get leads specifically targeted for your business type.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setSelectedNiche(niche.id)}
                className="p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:-translate-y-1"
                style={
                  selectedNiche === niche.id
                    ? {
                        borderColor: 'var(--rensto-primary)',
                        background: 'var(--rensto-bg-card)',
                        boxShadow: 'var(--rensto-glow-primary)'
                      }
                    : {
                        borderColor: 'rgba(254, 61, 81, 0.2)',
                        background: 'var(--rensto-bg-card)',
                        boxShadow: 'var(--rensto-glow-accent)'
                      }
                }
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{niche.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {niche.name}
                    </h3>
                    <p style={{ color: 'var(--rensto-text-secondary)' }}>{niche.description}</p>
                  </div>
                </div>
                {selectedNiche === niche.id && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--rensto-primary)' }}>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Volume Selection */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Choose Your Lead Volume
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Select the volume that matches your business capacity and growth goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadVolumes.map((volume) => (
              <div
                key={volume.id}
                onClick={() => setLeadVolume(volume.id)}
                className="relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                style={
                  leadVolume === volume.id
                    ? {
                        borderColor: 'var(--rensto-primary)',
                        background: 'var(--rensto-bg-card)',
                        boxShadow: 'var(--rensto-glow-primary)'
                      }
                    : {
                        borderColor: 'rgba(254, 61, 81, 0.2)',
                        background: 'var(--rensto-bg-card)',
                        boxShadow: 'var(--rensto-glow-accent)'
                      }
                }
              >
                {volume.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span 
                      className="px-4 py-1 rounded-full text-sm font-bold text-white"
                      style={{ background: 'var(--rensto-gradient-primary)' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                    {volume.name}
                  </h3>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--rensto-primary)' }}>
                    ${volume.price}
                  </div>
                  <div className="text-sm mb-4" style={{ color: 'var(--rensto-text-secondary)' }}>
                    {volume.leads}
                  </div>
                  <p className="text-sm mb-6" style={{ color: 'var(--rensto-text-secondary)' }}>
                    {volume.description}
                  </p>
                  
                  {leadVolume === volume.id && (
                    <div className="flex items-center justify-center gap-2" style={{ color: 'var(--rensto-primary)' }}>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Selected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM Integration */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              CRM Integration
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Choose your CRM system for seamless lead delivery and management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crmIntegrations.map((crm) => (
              <button
                key={crm.id}
                onClick={() => setCrmIntegration(crm.id)}
                className="p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:-translate-y-1"
                style={
                  crmIntegration === crm.id
                    ? {
                        borderColor: 'var(--rensto-primary)',
                        background: 'var(--rensto-bg-card)',
                        boxShadow: 'var(--rensto-glow-primary)'
                      }
                    : {
                        borderColor: 'rgba(254, 61, 81, 0.2)',
                        background: 'var(--rensto-bg-card)',
                        boxShadow: 'var(--rensto-glow-accent)'
                      }
                }
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{crm.logo}</span>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {crm.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                      {crm.description}
                    </p>
                  </div>
                </div>
                {crmIntegration === crm.id && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--rensto-primary)' }}>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Powerful Features
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Our subscription service includes advanced features to maximize your lead generation success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="rounded-2xl p-8 border-2 transition-all hover:-translate-y-1"
                  style={{ 
                    background: 'var(--rensto-bg-card)',
                    borderColor: 'rgba(254, 61, 81, 0.3)',
                    boxShadow: 'var(--rensto-glow-accent)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--rensto-gradient-primary)' }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: 'var(--rensto-text-secondary)' }}>{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--rensto-accent-cyan)' }} />
                        <span style={{ color: 'var(--rensto-text-primary)' }}>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-2xl p-8 border-2"
              style={{ 
                background: 'var(--rensto-gradient-primary)',
                borderColor: 'rgba(254, 61, 81, 0.5)',
                boxShadow: 'var(--rensto-glow-primary)'
              }}
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 text-white">Your Subscription Summary</h2>
                <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Review your selected options and start your enhanced lead generation service.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Niche</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedNiche ? niches.find(n => n.id === selectedNiche)?.name : 'Not selected'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Volume</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedLeadVolume ? `${selectedLeadVolume.leads} - $${selectedLeadVolume.price}/month` : 'Not selected'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">CRM</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {crmIntegration ? crmIntegrations.find(c => c.id === crmIntegration)?.name : 'Not selected'}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold mb-4 text-white">
                  {selectedLeadVolume ? `$${selectedLeadVolume.price}/month` : 'Select options above'}
                </div>
                <p className="mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {selectedLeadVolume ? `Includes ${selectedLeadVolume.leads} of high-quality leads` : 'Choose your lead volume to see pricing'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="font-bold"
                    style={{ 
                      background: 'white',
                      color: 'var(--rensto-primary)'
                    }}
                    disabled={!selectedNiche || !leadVolume || !crmIntegration || isProcessing}
                    onClick={handleSubscriptionCheckout}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Processing...' : 'Start Subscription'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 font-bold"
                    style={{ 
                      borderColor: 'white',
                      color: 'white',
                      background: 'transparent'
                    }}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Speak with Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Why Choose Our Lead Service?
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Our enhanced lead generation service delivers better results than traditional lead providers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--rensto-gradient-primary)' }}
              >
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Higher Quality Leads
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Our AI-powered system identifies and delivers only the highest quality prospects for your business.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--rensto-gradient-secondary)' }}
              >
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Faster Delivery
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Get leads delivered to your CRM in real-time as they're identified and qualified.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--rensto-gradient-brand)' }}
              >
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Better ROI
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Higher conversion rates and better lead quality mean better return on your investment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 px-4 relative overflow-hidden"
        style={{ background: 'var(--rensto-bg-secondary)' }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(254, 61, 81, 0.4) 0%, transparent 70%)'
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
            Ready to Get Better Leads?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
            Start your enhanced lead generation service today and see the difference quality makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="font-bold"
              style={{ 
                background: 'var(--rensto-gradient-primary)',
                color: 'white',
                boxShadow: 'var(--rensto-glow-primary)'
              }}
              disabled={!selectedNiche || !leadVolume || !crmIntegration || isProcessing}
              onClick={handleSubscriptionCheckout}
            >
              <Users className="w-5 h-5 mr-2" />
              {isProcessing ? 'Processing...' : 'Start Subscription'}
            </Button>
            <Link href="/custom">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 font-bold"
                style={{ 
                  borderColor: 'var(--rensto-primary)',
                  color: 'var(--rensto-primary)',
                  background: 'transparent'
                }}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Get Custom Solution
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
