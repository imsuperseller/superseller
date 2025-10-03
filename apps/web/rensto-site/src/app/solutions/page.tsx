'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { 
  Package, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Star,
  Play
} from 'lucide-react';

export default function SolutionsPage() {
  const [selectedNiche, setSelectedNiche] = useState('');

  const niches = [
    {
      id: 'hvac',
      name: 'HVAC',
      icon: '🔧',
      description: 'Complete automation solutions for HVAC contractors',
      solutions: 5,
      price: 499,
      features: [
        'Lead scoring and prioritization',
        'Customer appointment scheduling',
        'Service call automation',
        'Invoice and payment processing',
        'Customer follow-up sequences'
      ],
      benefits: [
        'Increase lead conversion by 40%',
        'Reduce no-shows by 60%',
        'Automate 80% of routine tasks',
        'Improve customer satisfaction'
      ],
      popular: true
    },
    {
      id: 'roofer',
      name: 'Roofer',
      icon: '🏠',
      description: 'Storm damage and roofing contractor automation',
      solutions: 5,
      price: 599,
      features: [
        'Storm damage lead generation',
        'Insurance claim coordination',
        'Project management automation',
        'Customer communication system',
        'Weather-based scheduling'
      ],
      benefits: [
        'Capture storm damage leads faster',
        'Streamline insurance processes',
        'Improve project coordination',
        'Increase customer retention'
      ],
      popular: false
    },
    {
      id: 'realtor',
      name: 'Real Estate',
      icon: '🏘️',
      description: 'Real estate agent and property management automation',
      solutions: 5,
      price: 399,
      features: [
        'Lead nurturing sequences',
        'Property listing automation',
        'Client relationship management',
        'Market analysis automation',
        'Transaction coordination'
      ],
      benefits: [
        'Nurture leads 24/7',
        'Automate listing management',
        'Improve client relationships',
        'Increase closing rates'
      ],
      popular: false
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: '🛡️',
      description: 'Insurance agent and broker automation solutions',
      solutions: 5,
      price: 449,
      features: [
        'Quote generation automation',
        'Policy renewal reminders',
        'Claims processing automation',
        'Customer onboarding sequences',
        'Cross-selling automation'
      ],
      benefits: [
        'Generate quotes instantly',
        'Reduce policy lapses',
        'Improve customer service',
        'Increase policy sales'
      ],
      popular: false
    },
    {
      id: 'locksmith',
      name: 'Locksmith',
      icon: '🔐',
      description: 'Locksmith and security professional automation',
      solutions: 5,
      price: 349,
      features: [
        'Emergency call routing',
        'Service scheduling automation',
        'Customer verification system',
        'Invoice and payment processing',
        'Follow-up and review requests'
      ],
      benefits: [
        'Respond to emergencies faster',
        'Streamline service scheduling',
        'Improve customer experience',
        'Increase repeat business'
      ],
      popular: false
    },
    {
      id: 'photographer',
      name: 'Photographer',
      icon: '📸',
      description: 'Photography business automation solutions',
      solutions: 5,
      price: 299,
      features: [
        'Booking and scheduling system',
        'Client communication automation',
        'Gallery sharing and delivery',
        'Invoice and payment processing',
        'Review and testimonial collection'
      ],
      benefits: [
        'Streamline booking process',
        'Improve client experience',
        'Automate gallery delivery',
        'Increase client satisfaction'
      ],
      popular: false
    }
  ];

  const selectedNicheData = niches.find(niche => niche.id === selectedNiche);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Ready Solutions</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
              <Link href="/custom" className="text-gray-600 hover:text-gray-900 transition-colors">Custom</Link>
              <Link href="/subscriptions" className="text-gray-600 hover:text-gray-900 transition-colors">Subscriptions</Link>
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
              Niche-Specific <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Automation Packages</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete automation solutions designed specifically for your industry. 
              Each package includes 5 proven solutions with full implementation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Industry-Specific</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">5 Solutions Each</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Complete Packages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Niche Selection */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Industry</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select your industry to see the complete automation package designed for your business type.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setSelectedNiche(niche.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedNiche === niche.id
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                } ${niche.popular ? 'ring-2 ring-orange-500' : ''}`}
              >
                {niche.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{niche.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{niche.name}</h3>
                    <p className="text-gray-600">{niche.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">${niche.price}</div>
                  <div className="text-sm text-gray-600">{niche.solutions} solutions included</div>
                </div>
                
                <div className="space-y-2 mb-6">
                  {niche.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                  {niche.features.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{niche.features.length - 3} more features
                    </div>
                  )}
                </div>
                
                {selectedNiche === niche.id && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Niche Details */}
      {selectedNicheData && (
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-5xl">{selectedNicheData.icon}</span>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900">{selectedNicheData.name} Automation Package</h2>
                    <p className="text-xl text-gray-600">{selectedNicheData.description}</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">${selectedNicheData.price}</div>
                <p className="text-gray-600">Complete package with {selectedNicheData.solutions} solutions</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Features */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h3>
                  <div className="space-y-4">
                    {selectedNicheData.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">{feature}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Benefits */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Expected Results</h3>
                  <div className="space-y-4">
                    {selectedNicheData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <TrendingUp className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">{benefit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Package className="w-5 h-5 mr-2" />
                    Get This Package
                  </Button>
                  <Button size="lg" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your industry-specific automation package up and running in just a few simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Choose Your Package</h3>
              <p className="text-gray-600">
                Select the automation package designed specifically for your industry and business needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. Quick Setup</h3>
              <p className="text-gray-600">
                Our team handles the complete setup and configuration of all 5 automation solutions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Start Automating</h3>
              <p className="text-gray-600">
                Begin seeing results immediately with your fully configured automation system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how businesses in your industry have transformed with our automation packages.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              <p className="text-gray-700 mb-4">
                "The HVAC package increased our lead conversion by 40% and reduced our response time to just 2 minutes."
              </p>
              <div className="font-semibold text-gray-900">Mike Johnson</div>
              <div className="text-sm text-gray-600">HVAC Solutions Inc.</div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              <p className="text-gray-700 mb-4">
                "Our roofing business now captures storm damage leads automatically and coordinates with insurance companies seamlessly."
              </p>
              <div className="font-semibold text-gray-900">Sarah Martinez</div>
              <div className="text-sm text-gray-600">Storm Roofing Co.</div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              <p className="text-gray-700 mb-4">
                "The real estate package helped us nurture leads 24/7 and increased our closing rate by 35%."
              </p>
              <div className="font-semibold text-gray-900">David Chen</div>
              <div className="text-sm text-gray-600">Premier Realty Group</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Automate Your Industry?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose your industry package and start automating your business processes today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!selectedNiche}
            >
              <Package className="w-5 h-5 mr-2" />
              Get {selectedNicheData?.name} Package
            </Button>
            <Link href="/custom">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowRight className="w-5 h-5 mr-2" />
                Need Custom Solution?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
