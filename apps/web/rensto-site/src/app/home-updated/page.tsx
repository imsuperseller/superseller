'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Store, 
  Mic, 
  Users, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Zap,
  Target,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function HomeUpdatedPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const serviceTypes = [
    {
      id: 'marketplace',
      name: 'Ready-Made Solutions',
      description: 'Pre-built tools that work right out of the box',
      icon: Store,
      features: [
        'Download and use immediately',
        'We install it for you',
        'Do it yourself option',
        'See what others say',
        'Book help when you need it',
        'Installation tracking'
      ],
      pricing: 'From $29/template',
      cta: 'Browse Templates',
      href: '/marketplace',
      color: 'blue',
      popular: false
    },
    {
      id: 'custom',
      name: 'Personal Help',
      description: 'We build exactly what you need for your business',
      icon: Mic,
      features: [
        'Free phone call to understand your needs',
        'Custom plan just for you',
        'We do all the technical stuff',
        'We manage the whole project',
        'We\'re here when you need us',
        'Ongoing support'
      ],
      pricing: 'Free consultation',
      cta: 'Book Free Consultation',
      href: '/custom',
      color: 'green',
      popular: true
    },
    {
      id: 'subscriptions',
      name: 'Lead Generation',
      description: 'We find and deliver qualified customers to you',
      icon: Users,
      features: [
        'Pick your ideal customer type',
        'Choose how many leads you want',
        'Connects to your existing systems',
        'We score leads by quality',
        'See how well it\'s working',
        'Performance analytics'
      ],
      pricing: 'From $97/month',
      cta: 'Start Subscription',
      href: '/subscriptions',
      color: 'purple',
      popular: false
    },
    {
      id: 'solutions',
      name: 'Industry Packages',
      description: 'Everything you need for your specific business type',
      icon: Package,
      features: [
        'Made for your industry',
        '5 tools per package',
        'Everything included',
        'Buy individual tools or the whole package',
        'Works immediately',
        'Quick deployment'
      ],
      pricing: 'Industry pricing',
      cta: 'Explore Solutions',
      href: '/solutions',
      color: 'orange',
      popular: false
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Smart Suggestions',
      description: 'We learn what works best for your business and suggest improvements. Like having a smart assistant that gets better over time.'
    },
    {
      icon: Target,
      title: 'No Tech Skills Needed',
      description: 'If you can click and drag, you can use our tools. No programming or technical knowledge required.'
    },
    {
      icon: TrendingUp,
      title: 'Grows With You',
      description: 'Start small and add more as your business grows. You only pay for what you use.'
    },
    {
      icon: Shield,
      title: 'Fair Pricing',
      description: 'Prices that make sense for small businesses. You\'ll save more money than you spend.'
    },
    {
      icon: Clock,
      title: 'Works Right Away',
      description: 'Set up in minutes, not months. Start saving time and money immediately.'
    },
    {
      icon: Star,
      title: 'Works With Everything',
      description: 'One place for all your business needs. Works with whatever tools you already use.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '$97',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 1,000 tasks per month',
        '5 ready-made tools',
        'Works with 5 popular apps',
        'Email help when you need it',
        'We set it up for you'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$197',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 10,000 tasks per month',
        '15 ready-made tools',
        'Works with 15 popular apps',
        'Priority help when you need it',
        'Professional setup',
        'Monthly check-in calls'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$497',
      description: 'For large organizations',
      features: [
        'Unlimited tasks',
        'Unlimited tools',
        'Works with any app',
        'Your own support person',
        'Custom branding',
        'Custom tools just for you',
        'Detailed reports'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Make Your Business Run Itself
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stop doing the same boring tasks over and over. Let Rensto handle the repetitive stuff so you can focus on what actually makes you money. No tech skills needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/lead-generator.html">Start Free Trial</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Service Types Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Help Your Business</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Pick what works best for you. We have ready-made solutions, custom help, or you can do it yourself. Whatever you're comfortable with.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {serviceTypes.map((service) => (
                <div
                  key={service.id}
                  className={`relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    service.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <service.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="text-2xl font-bold text-blue-600 mb-4">{service.pricing}</div>
                    
                    <ul className="text-left space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button className="w-full" asChild>
                      <Link href={service.href}>{service.cta}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Rensto?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We make business automation simple. No confusing tech stuff. Just tell us what you want to happen, and we make it work.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
            
            {/* Stats Bar */}
            <div className="mt-16 bg-blue-600 rounded-xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">4,000+</div>
                  <div className="text-blue-100">Happy Customers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">$470K</div>
                  <div className="text-blue-100">Monthly Revenue</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">10x</div>
                  <div className="text-blue-100">Time Saved</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Pick the plan that works for your business. No hidden fees, no surprises.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-4">{plan.price}</div>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <ul className="text-left space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/lead-generator.html">Get Started</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Stop Doing Boring Tasks?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses already saving time and money with Rensto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/lead-generator.html">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/marketplace">Browse Marketplace</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
