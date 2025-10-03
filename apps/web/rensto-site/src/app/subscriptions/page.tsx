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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Subscriptions</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
              <Link href="/custom" className="text-gray-600 hover:text-gray-900 transition-colors">Custom</Link>
              <Link href="/solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Solutions</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Enhanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Hot Leads Service</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get high-quality, niche-specific leads delivered directly to your CRM. 
              Our AI-powered system finds the best prospects for your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Niche-Specific</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">CRM Integrated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Niche Selection */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Niche</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select your industry to get leads specifically targeted for your business type.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setSelectedNiche(niche.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedNiche === niche.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{niche.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{niche.name}</h3>
                    <p className="text-gray-600">{niche.description}</p>
                  </div>
                </div>
                {selectedNiche === niche.id && (
                  <div className="flex items-center gap-2 text-purple-600">
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
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Lead Volume</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the volume that matches your business capacity and growth goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadVolumes.map((volume) => (
              <div
                key={volume.id}
                onClick={() => setLeadVolume(volume.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  leadVolume === volume.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                } ${volume.popular ? 'ring-2 ring-purple-500' : ''}`}
              >
                {volume.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{volume.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">${volume.price}</div>
                  <div className="text-sm text-gray-600 mb-4">{volume.leads}</div>
                  <p className="text-gray-600 text-sm mb-6">{volume.description}</p>
                  
                  {leadVolume === volume.id && (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
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
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">CRM Integration</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your CRM system for seamless lead delivery and management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crmIntegrations.map((crm) => (
              <button
                key={crm.id}
                onClick={() => setCrmIntegration(crm.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  crmIntegration === crm.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{crm.logo}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{crm.name}</h3>
                    <p className="text-gray-600 text-sm">{crm.description}</p>
                  </div>
                </div>
                {crmIntegration === crm.id && (
                  <div className="flex items-center gap-2 text-purple-600">
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our subscription service includes advanced features to maximize your lead generation success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
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
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4">Your Subscription Summary</h2>
                <p className="text-xl text-purple-100">
                  Review your selected options and start your enhanced lead generation service.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Niche</h3>
                  <p className="text-purple-100">
                    {selectedNiche ? niches.find(n => n.id === selectedNiche)?.name : 'Not selected'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Volume</h3>
                  <p className="text-purple-100">
                    {selectedLeadVolume ? `${selectedLeadVolume.leads} - $${selectedLeadVolume.price}/month` : 'Not selected'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">CRM</h3>
                  <p className="text-purple-100">
                    {crmIntegration ? crmIntegrations.find(c => c.id === crmIntegration)?.name : 'Not selected'}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold mb-4">
                  {selectedLeadVolume ? `$${selectedLeadVolume.price}/month` : 'Select options above'}
                </div>
                <p className="text-purple-100 mb-8">
                  {selectedLeadVolume ? `Includes ${selectedLeadVolume.leads} of high-quality leads` : 'Choose your lead volume to see pricing'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50"
                    disabled={!selectedNiche || !leadVolume || !crmIntegration}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Start Subscription
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Lead Service?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our enhanced lead generation service delivers better results than traditional lead providers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Higher Quality Leads</h3>
              <p className="text-gray-600">
                Our AI-powered system identifies and delivers only the highest quality prospects for your business.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Faster Delivery</h3>
              <p className="text-gray-600">
                Get leads delivered to your CRM in real-time as they're identified and qualified.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Better ROI</h3>
              <p className="text-gray-600">
                Higher conversion rates and better lead quality mean better return on your investment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Better Leads?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your enhanced lead generation service today and see the difference quality makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!selectedNiche || !leadVolume || !crmIntegration}
            >
              <Users className="w-5 h-5 mr-2" />
              Start Subscription
            </Button>
            <Link href="/custom">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
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
