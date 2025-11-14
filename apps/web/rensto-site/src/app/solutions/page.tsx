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
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Handle Ready Solutions Checkout
  const handleCheckout = async (nicheData: typeof niches[0] | undefined) => {
    if (!nicheData) {
      alert('Please select a niche package first');
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
          flowType: 'ready-solutions',
          productId: nicheData.id,
          tier: 'starter', // Ready Solutions use starter tier
          customerEmail: '', // Stripe checkout will collect this
          metadata: {
            nicheId: nicheData.id,
            nicheName: nicheData.name,
            packagePrice: nicheData.price,
            solutionsCount: nicheData.solutions
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
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Ready Solutions</span>
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
                href="/subscriptions" 
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Subscriptions
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
              Niche-Specific Automation Packages
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Complete automation solutions designed specifically for your industry. 
              Each package includes 5 proven solutions with full implementation.
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
                <span className="font-semibold">Industry-Specific</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-blue)',
                  color: 'var(--rensto-accent-blue)',
                  background: 'transparent'
                }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">5 Solutions Each</span>
              </div>
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{ 
                  borderColor: 'var(--rensto-accent-cyan)',
                  color: 'var(--rensto-accent-cyan)',
                  background: 'transparent'
                }}
              >
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Complete Packages</span>
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
              Choose Your Industry
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Select your industry to see the complete automation package designed for your business type.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setSelectedNiche(niche.id)}
                className="relative p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:-translate-y-1"
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
                {niche.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span 
                      className="px-4 py-1 rounded-full text-sm font-bold text-white"
                      style={{ background: 'var(--rensto-gradient-primary)' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{niche.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {niche.name}
                    </h3>
                    <p style={{ color: 'var(--rensto-text-secondary)' }}>{niche.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--rensto-primary)' }}>
                    ${niche.price}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                    {niche.solutions} solutions included
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  {niche.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--rensto-accent-cyan)' }} />
                      <span className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>{feature}</span>
                    </div>
                  ))}
                  {niche.features.length > 3 && (
                    <div className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                      +{niche.features.length - 3} more features
                    </div>
                  )}
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

      {/* Selected Niche Details */}
      {selectedNicheData && (
        <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-5xl">{selectedNicheData.icon}</span>
                  <div>
                    <h2 className="text-4xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {selectedNicheData.name} Automation Package
                    </h2>
                    <p className="text-xl" style={{ color: 'var(--rensto-text-secondary)' }}>
                      {selectedNicheData.description}
                    </p>
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--rensto-primary)' }}>
                  ${selectedNicheData.price}
                </div>
                <p style={{ color: 'var(--rensto-text-secondary)' }}>
                  Complete package with {selectedNicheData.solutions} solutions
                </p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Features */}
                <div>
                  <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--rensto-text-primary)' }}>
                    What's Included
                  </h3>
                  <div className="space-y-4">
                    {selectedNicheData.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--rensto-accent-cyan)' }} />
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>{feature}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Benefits */}
                <div>
                  <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--rensto-text-primary)' }}>
                    Expected Results
                  </h3>
                  <div className="space-y-4">
                    {selectedNicheData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <TrendingUp className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: 'var(--rensto-primary)' }} />
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>{benefit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="font-bold"
                    style={{ 
                      background: 'var(--rensto-gradient-primary)',
                      color: 'white',
                      boxShadow: 'var(--rensto-glow-primary)'
                    }}
                    onClick={() => handleCheckout(selectedNicheData)}
                    disabled={isProcessing}
                  >
                    <Package className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Processing...' : 'Get This Package'}
                  </Button>
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
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              How It Works
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              Get your industry-specific automation package up and running in just a few simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--rensto-gradient-primary)' }}
              >
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                1. Choose Your Package
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Select the automation package designed specifically for your industry and business needs.
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
                2. Quick Setup
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Our team handles the complete setup and configuration of all 5 automation solutions.
              </p>
            </div>
            
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--rensto-gradient-brand)' }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                3. Start Automating
              </h3>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Begin seeing results immediately with your fully configured automation system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Success Stories
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
              See how businesses in your industry have transformed with our automation packages.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div 
              className="rounded-2xl p-6 border-2"
              style={{ 
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(254, 61, 81, 0.3)',
                boxShadow: 'var(--rensto-glow-accent)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" style={{ color: '#fbbf24' }} fill="currentColor" />
                ))}
              </div>
              <p className="mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                "The HVAC package increased our lead conversion by 40% and reduced our response time to just 2 minutes."
              </p>
              <div className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Mike Johnson</div>
              <div className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>HVAC Solutions Inc.</div>
            </div>
            
            <div 
              className="rounded-2xl p-6 border-2"
              style={{ 
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(254, 61, 81, 0.3)',
                boxShadow: 'var(--rensto-glow-accent)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" style={{ color: '#fbbf24' }} fill="currentColor" />
                ))}
              </div>
              <p className="mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                "Our roofing business now captures storm damage leads automatically and coordinates with insurance companies seamlessly."
              </p>
              <div className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>Sarah Martinez</div>
              <div className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>Storm Roofing Co.</div>
            </div>
            
            <div 
              className="rounded-2xl p-6 border-2"
              style={{ 
                background: 'var(--rensto-bg-card)',
                borderColor: 'rgba(254, 61, 81, 0.3)',
                boxShadow: 'var(--rensto-glow-accent)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" style={{ color: '#fbbf24' }} fill="currentColor" />
                ))}
              </div>
              <p className="mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                "The real estate package helped us nurture leads 24/7 and increased our closing rate by 35%."
              </p>
              <div className="font-semibold" style={{ color: 'var(--rensto-text-primary)' }}>David Chen</div>
              <div className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>Premier Realty Group</div>
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
            Ready to Automate Your Industry?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
            Choose your industry package and start automating your business processes today.
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
              disabled={!selectedNiche || isProcessing}
              onClick={() => handleCheckout(selectedNicheData)}
            >
              <Package className="w-5 h-5 mr-2" />
              {isProcessing ? 'Processing...' : `Get ${selectedNicheData?.name} Package`}
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
                Need Custom Solution?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

