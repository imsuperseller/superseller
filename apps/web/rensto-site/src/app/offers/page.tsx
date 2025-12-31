'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';
import { Check, Star, Zap, Shield, Users, Loader2, ArrowRight, TrendingUp, Clock, Bot, Rocket, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';

const SearchIcon = Search;

const products = [
  {
    name: 'Automation Audit',
    price: 497,
    description: 'A deep architectural review of your current systems. We identify $25,000+ in annual efficiency leaks—guaranteed.',
    features: [
      'Operational Bottleneck Audit',
      'System Architecture Review',
      'High-Impact Automation Map',
      'Direct ROI Projections',
      'Fixed-Price Implementation Plan'
    ],
    cta: 'Get My Audit',
    popular: false,
    icon: SearchIcon
  },
  {
    name: 'Blueprint Session',
    price: 1497,
    description: 'A comprehensive technical blueprint with full timeline, tech stack, and a ready-to-sign implementation contract.',
    features: [
      'Full Logical Flowcharts',
      'Tool Stack Selection',
      'Data Integration Mapping',
      'Security & Compliance Check',
      'Sprint Deployment Schedule'
    ],
    cta: 'Get My Blueprint',
    popular: true,
    icon: Zap
  },
  {
    name: 'AI Revenue Engine',
    price: 1497,
    description: 'Autonomous content and marketing systems designed to scale your reach without increasing headcount.',
    features: [
      'Multi-Channel Content Agent',
      'SEO & Authority Automation',
      'Lead Magnet Deployment',
      'Automatic Social Distribution',
      'Weekly Attribution Reporting'
    ],
    cta: 'Deploy Revenue Engine',
    popular: false,
    icon: TrendingUp
  },
  {
    name: 'Auto-Secretary',
    price: 997,
    description: 'Stop wasting half your day on leads. Cut manual work by 50% in 30 days, or get your money back.',
    features: [
      'Auto-filling forms',
      'Smart lead sorting',
      'Syncs with your tools',
      'Automatic follow-ups',
      'Your simple dashboard'
    ],
    cta: 'Hire My Auto-Secretary',
    popular: false,
    icon: Users
  }
];

const carePlans = [
  {
    name: 'Starter Care',
    price: 497,
    period: 'month',
    description: 'Perfect for small teams needing monitoring',
    features: [
      '5 hours of expert help',
      '24/7 system watch',
      'We fix it before it breaks',
      'Monthly status updates',
      'Direct email access'
    ],
    cta: 'Start Care Plan',
    popular: false
  },
  {
    name: 'Growth Care',
    price: 997,
    period: 'month',
    description: 'Our most popular plan for active scaling',
    features: [
      '15 hours of expert help',
      'Continuous optimizations',
      'Quarterly strategy reviews',
      'Priority fast-lane support',
      'Constant system upgrades'
    ],
    cta: 'Get Growth Care',
    popular: true
  },
  {
    name: 'Scale Care',
    price: 2497,
    period: 'month',
    description: 'A dedicated automation engineer for your team',
    features: [
      '40 hours of expert help',
      'Your own dedicated engineer',
      'Full strategic planning',
      'Complete deep-dive stats',
      'Unlimited custom features'
    ],
    cta: 'Get Scale Care',
    popular: false
  }
];

export default function OffersPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);

  const handleCheckout = async (productId: string, flowType: string) => {
    // If we don't have an email yet, show the modal first
    if (!email && !showEmailModal) {
      setShowEmailModal(productId);
      return;
    }

    setLoading(productId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowType,
          productId,
          customerEmail: email,
          tier: 'standard'
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data.error);
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };
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
        <section className="py-24 px-4 relative overflow-hidden min-h-[60vh] flex items-center">
          <AnimatedGridBackground />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                Choose Your <br />
                <span className="gradient-text">Automation Path</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                From deep architectural audits to ongoing systems care.
                Built for businesses that prioritize efficiency and scale.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Success Guarantee Banner */}
        <section className="py-12 bg-[#0d0922] border-y border-white/5">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">The Rensto Success Guarantee</h3>
                <p className="text-slate-500 text-sm">Measurable ROI or We Keep Building Until You See It.</p>
              </div>
            </div>
          </div>
        </section>

        {/* One-Time Services */}
        <section id="one-time" className="py-24 px-4 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={index}
                  id={product.name === 'Automation Audit' ? 'audit' : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${product.popular
                    ? 'border-cyan-500 bg-cyan-500/[0.03] shadow-[0_0_40px_rgba(6,182,212,0.1)]'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                    }`}
                >
                  {product.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
                      style={{ background: 'var(--rensto-gradient-primary)', color: 'white' }}>
                      Enterprise Standard
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-white">{formatCurrency(product.price)}</span>
                      <span className="text-slate-500 text-xs uppercase tracking-widest">Fixed</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">{product.description}</p>
                  </div>

                  <ul className="space-y-3 mb-10 flex-grow">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                        <span className="text-xs text-slate-300 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="xl"
                    onClick={() => {
                      const id = product.name.toLowerCase().replace(/\s+/g, '-');
                      handleCheckout(id, 'service-purchase');
                    }}
                    variant={product.popular ? 'renstoPrimary' : 'renstoSecondary'}
                    disabled={loading === product.name.toLowerCase().replace(/\s+/g, '-')}
                    className="w-full font-bold h-14"
                  >
                    {loading === product.name.toLowerCase().replace(/\s+/g, '-') ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {product.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Care Plans */}
        <section id="care-plans" className="py-24 px-4 relative bg-[#0d0922]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Ongoing <span className="text-cyan-400">Scale Plans</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Dedicated engineering bandwidth to maintain and evolve your automation engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {carePlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-10 rounded-[2.5rem] border transition-all duration-300 flex flex-col h-full ${plan.popular
                    ? 'border-cyan-500 bg-cyan-500/[0.05] shadow-[0_0_50px_rgba(6,182,212,0.15)] scale-105 z-10'
                    : 'border-white/5 bg-white/[0.03]'
                    }`}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-widest">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{formatCurrency(plan.price)}</span>
                      <span className="text-slate-500 text-sm">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-cyan-400" />
                        </div>
                        <span className="text-sm text-slate-300 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {getStripeLink(plan.name) ? (
                    <Link href={getStripeLink(plan.name)!} className="w-full">
                      <Button
                        size="xl"
                        variant={plan.popular ? 'renstoPrimary' : 'renstoSecondary'}
                        className="w-full font-bold h-16 rounded-2xl"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/contact" className="w-full">
                      <Button
                        size="xl"
                        variant="renstoNeon"
                        className="w-full font-bold h-16 rounded-2xl"
                      >
                        Schedule Discovery
                      </Button>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Seal */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="p-12 rounded-[3rem] border border-cyan-500/30 bg-cyan-500/[0.02] relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
              <Shield className="w-16 h-16 text-cyan-500 mx-auto mb-8" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Rensto ROI Guarantee</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                We don&apos;t do regular &quot;trials&quot;. We work with serious founders.
                If we don&apos;t meet the specific ROI targets agreed upon in your Blueprint,
                we keep working—completely on our dime—until the system delivers exactly what we promised.
              </p>
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
              <Button asChild size="xl" variant="renstoPrimary">
                <Link href="/contact">
                  Schedule a Call
                </Link>
              </Button>
              <Button asChild size="xl" variant="renstoSecondary">
                <Link href="/process">
                  Learn Our Process
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Email Capture Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#110d28] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">Secure Your Spot</h3>
            <p className="text-gray-400 mb-6">
              Enter your email to proceed to secure payment. We&apos;ll use this to deliver your {showEmailModal === 'automation-audit' ? 'Audit Report' : 'Sprint Blueprint'}.
            </p>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white focus:border-red-500/50 outline-none transition-all"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowEmailModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCheckout(showEmailModal, 'service-purchase')}
                disabled={!email || !!loading}
                className="flex-1 font-bold"
                style={{ background: 'var(--rensto-gradient-primary)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}
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
