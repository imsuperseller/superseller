'use client';

import Link from 'next/link';
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';
import { Check, Star, Zap, Shield, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const products = [
  {
    name: 'Automation Audit',
    price: 499,
    description: 'I guarantee you\'ll identify $25,000+ in annual savings within 2 hours, or I\'ll refund 100%',
    features: [
      'Current process analysis',
      'Automation opportunities',
      'Implementation roadmap',
      'ROI projections',
      'Priority recommendations'
    ],
    cta: 'Get Audit',
    popular: false,
    icon: Shield
  },
  {
    name: 'Sprint Planning',
    price: 1500,
    description: 'I guarantee you\'ll see ROI within 60 days, or I\'ll continue working for free until you do',
    features: [
      'Detailed workflow design',
      'Technical architecture',
      'Implementation timeline',
      'Resource requirements',
      'Success metrics'
    ],
    cta: 'Start Sprint',
    popular: true,
    icon: Zap
  },
  {
    name: 'AI Content Engine',
    price: 1200,
    description: 'I guarantee 20% increase in organic traffic within 90 days, or I\'ll continue optimizing for free',
    features: [
      'Content generation workflows',
      'SEO optimization',
      'Publishing automation',
      'Performance tracking',
      'Content calendar'
    ],
    cta: 'Get Content Engine',
    popular: false,
    icon: Star
  },
  {
    name: 'Lead Intake Agent',
    price: 900,
    description: 'I guarantee 50% reduction in manual lead processing time within 30 days, or full refund plus $500 bonus',
    features: [
      'Form automation',
      'Lead scoring',
      'CRM integration',
      'Follow-up sequences',
      'Analytics dashboard'
    ],
    cta: 'Get Lead Agent',
    popular: false,
    icon: Users
  }
];

const carePlans = [
  {
    name: 'Starter Care',
    price: 750,
    period: 'month',
    description: '5 hours support + monitoring',
    features: [
      '5 hours monthly support',
      'System monitoring',
      'Basic troubleshooting',
      'Monthly reports',
      'Email support'
    ],
    cta: 'Start Care Plan',
    popular: false
  },
  {
    name: 'Growth Care',
    price: 1500,
    period: 'month',
    description: '10 hours + quarterly optimization',
    features: [
      '10 hours monthly support',
      'Performance optimization',
      'Quarterly reviews',
      'Priority support',
      'Workflow improvements'
    ],
    cta: 'Get Growth Care',
    popular: true
  },
  {
    name: 'Scale Care',
    price: 3000,
    period: 'month',
    description: '20 hours + dedicated automation engineer',
    features: [
      '20 hours monthly support',
      'Dedicated engineer',
      'Strategic planning',
      'Advanced analytics',
      'Custom development'
    ],
    cta: 'Get Scale Care',
    popular: false
  }
];

export default function OffersPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is included in the Rensto Automation Audit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Rensto Automation Audit includes a comprehensive process analysis, identification of specific automation opportunities, a detailed implementation roadmap, and direct ROI projections for your business."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer a satisfaction guarantee for your services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, for our Automation Audit, we guarantee you'll identify $25,000+ in annual savings within 2 hours, or we will provide a 100% refund. Our sprint planning also includes an ROI guarantee."
        }
      },
      {
        "@type": "Question",
        "name": "What are the ongoing Care Plans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our Care Plans (Starter, Growth, and Scale) provide monthly support hours, system monitoring, performance optimization, and dedicated engineering time to keep your automations running perfectly."
        }
      },
      {
        "@type": "Question",
        "name": "How do I know which automation plan is right for my business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend starting with our Automation Audit to identify high-impact opportunities, or scheduling a call with our team to discuss your specific business needs and scaling goals."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
      <Header />
      <main className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden" style={{ background: 'var(--rensto-bg-primary)' }}>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(254, 61, 81, 0.3) 0%, transparent 70%)'
            }}
          />
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Automation Path
            </h1>
            <p className="text-xl text-muted max-w-3xl mx-auto mb-8">
              From quick audits to comprehensive care plans, we have solutions that scale with your business needs.
            </p>
          </div>
        </section>

        {/* One-Time Services */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                One-Time Services
              </h2>
              <p className="text-xl text-muted max-w-2xl mx-auto">
                Get started with automation or tackle specific challenges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div
                  key={index}
                  id={product.name === 'Automation Audit' ? 'audit' : undefined}
                  className={`card relative group hover:scale-105 transition-transform duration-300 ${product.popular ? 'ring-2 ring-accent2' : ''
                    }`}
                >
                  {product.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent2 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <product.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {formatCurrency(product.price)}
                    </div>
                    <p className="text-muted">{product.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-accent1 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {getStripeLink(product.name) ? (
                    <Link
                      href={getStripeLink(product.name)!}
                      className="btn-primary w-full text-center block"
                    >
                      {product.cta}
                    </Link>
                  ) : (
                    <Link
                      href="/contact"
                      className="btn-secondary w-full text-center block"
                    >
                      Inquire Now
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Care Plans */}
        <section className="section bg-card/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ongoing Care Plans
              </h2>
              <p className="text-xl text-muted max-w-2xl mx-auto">
                Keep your automations running smoothly with ongoing support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {carePlans.map((plan, index) => (
                <div
                  key={index}
                  className={`card relative group hover:scale-105 transition-transform duration-300 ${plan.popular ? 'ring-2 ring-accent2' : ''
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent2 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {formatCurrency(plan.price)}/{plan.period}
                    </div>
                    <p className="text-muted">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-accent1 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {getStripeLink(plan.name) ? (
                    <Link
                      href={getStripeLink(plan.name)!}
                      className="btn-primary w-full text-center block"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <Link
                      href="/contact"
                      className="btn-secondary w-full text-center block"
                    >
                      Book a Call
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-gradient-to-r from-accent1/20 to-accent2/20">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Not Sure Which Option is Right?
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss your specific needs and find the perfect automation solution for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-4">
                Schedule a Call
              </Link>
              <Link href="/process" className="btn-secondary text-lg px-8 py-4">
                Learn Our Process
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function getStripeLink(productName: string): string | undefined {
  const links = {
    'Automation Audit': env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
    'Sprint Planning': env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
    'AI Content Engine': env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER,
    'Lead Intake Agent': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
    'Starter Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER,
    'Growth Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH,
    'Scale Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE,
  };

  return links[productName as keyof typeof links];
}
