'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as framer from 'framer-motion';
const { motion } = framer;
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';
import { Check, Shield, Loader2, ArrowRight, Search, MessageSquare, Target, Workflow, HelpCircle, Users, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { NoiseTexture, GlowContainer } from '@/components/ui/premium';

const translations = {
  en: {
    title: <>Choose Your <br /><span className="gradient-text">Success Path</span></>,
    subtitle: "From strategic audits to ongoing ecosystem care. Designed for businesses that prioritize predictable scale.",
    guaranteeTitle: "The Rensto Success Guarantee",
    guaranteeText: "Measurable ROI or We Keep Working Until You See It.",
    qualifyTag: "Strategic Analysis",
    qualifyTitle: <>See if your business is ready for <span className="text-cyan-400">Scale.</span></>,
    qualifyText: "Before deploying an Ecosystem, we analyze your current business bottlenecks.",
    expert: "Institutional Standard",
    fixed: "Fixed-Fee",
    careTitle: <>Ongoing <span className="text-cyan-400">Scale Partnerships</span></>,
    careSubtitle: "Dedicated expert bandwidth to maintain and evolve your autonomous engine.",
    roiTitle: "The Rensto Wealth Impact Guarantee",
    roiText: <>We don&apos;t do regular &quot;trials&quot;. We work with serious founders. If we don&apos;t meet the specific ROI targets agreed upon in your Strategic Roadmap, we keep working—completely on our dime—until the system delivers exactly what we promised.</>,
    ctaTitle: "Not Sure Which Path is Right?",
    ctaText: "Let's discuss your targets and find the perfect automation infrastructure for your business.",
    scheduleCall: "Schedule Strategic Call",
    learnProcess: "Learn Our Methodology",
    products: [
      {
        name: 'Strategic Audit',
        price: 497,
        description: 'A deep strategic review of your current operations. We identify $25,000+ in annual efficiency leaks and map your path to scale.',
        features: ['Operational Bottleneck Audit', 'Business Architecture Review', 'High-Impact Automation Roadmap', 'Direct ROI Projections', 'Fixed-Price Implementation Plan'],
        cta: 'Activate My Audit',
        popular: false,
        icon: Search,
        workflowId: null
      },
      {
        name: 'The Lead Machine',
        price: 997,
        description: 'Autonomous outbound engine that sources leads, enriches data, and sends custom outreach at scale while you sleep.',
        features: ['Automated Lead Sourcing', 'AI Data Enrichment', 'Multi-Channel Outreach', 'Smart CRM Synchronization', 'Daily Performance Reports'],
        cta: 'Activate Lead Machine',
        popular: true,
        icon: Target,
        workflowId: 'call-audio-analysis'
      },
      {
        name: 'Voice AI Agent',
        price: 497,
        description: '24/7 autonomous receptionist and sales representative that manages calendars, answers messages, and handles bookings.',
        features: ['24/7 Voice & WhatsApp Response', 'Autonomous Appointment Booking', 'Live CRM Data Integration', 'Multi-Language Support', 'Lead Qualification Logic'],
        cta: 'Partner With My AI Agent',
        popular: false,
        icon: MessageSquare,
        workflowId: 'calendar-agent'
      },
      {
        name: 'Knowledge Engine',
        price: 1497,
        description: 'Private AI trained on your company data. A member of your team with the "perfect memory" of your best practices.',
        features: ['Live Data Source Sync', 'Private AI Knowledge Base', 'Internal Workflow Logic', 'Context-Aware Assistance', 'Enterprise-Grade Security'],
        cta: 'Activate Knowledge Engine',
        popular: false,
        icon: Workflow,
        workflowId: 'youtuber-cloner'
      },
      {
        name: 'The Content Engine',
        price: 1497,
        description: 'AI-powered content pipeline that handles research, ideation, and generation of high-authority content across all channels.',
        features: ['Content Research & Ideation', 'Automated Video/Image Generation', 'Multi-Channel Distribution', 'Authority Building Logic', 'Weekly Growth Reports'],
        cta: 'Activate The Engine',
        popular: false,
        icon: Users,
        workflowId: 'celebrity-selfie-generator'
      },
      {
        id: 'full-ecosystem',
        name: 'Full Ecosystem',
        price: 5497,
        description: 'All four pillars plus premium support, custom integrations, and a dedicated expert for end‑to‑end automation.',
        features: ['Lead Machine Engine', 'Voice AI Agent System', 'Knowledge Engine (RAG)', 'The Content Engine', 'Strategic Roadmap', 'Dedicated Automation Partner', '24/7 Priority Support'],
        cta: 'Activate Full Ecosystem',
        popular: true,
        icon: Zap,
        workflowId: null
      }
    ],
    carePlans: [
      {
        name: 'Starter Care',
        price: 497,
        period: 'month',
        description: 'Perfect for small teams needing monitoring',
        features: ['Monitor automations & Fix breaks', '1 monthly check-in (15 min)', 'Update FAQs & Responses', 'Basic performance report', '5 hours/mo included'],
        cta: 'Start Care Plan',
        popular: false
      },
      {
        name: 'Growth Care',
        price: 997,
        period: 'month',
        description: 'Our most popular plan for active scaling',
        features: ['Build 1-2 new automations/mo', 'Optimize flows & A/B test', 'Quarterly strategy call (1h)', 'CRM integration maintenance', '15 hours/mo included'],
        cta: 'Get Growth Care',
        popular: true
      },
      {
        name: 'Scale Care',
        price: 2497,
        period: 'month',
        description: 'A dedicated automation engineer for your team',
        features: ['Dedicated engineer (same person)', 'Build custom features on request', 'Weekly sync calls', 'Full analytics dashboard', 'Priority response (<4 hrs)'],
        cta: 'Get Scale Care',
        popular: false
      }
    ]
  }
};

const ZapIcon = Zap;

export function OffersPageContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations.en;

  const handleCheckout = async (productId: string, flowType: string) => {
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
          "text": "Yes, for our Automation Audit, we guarantee you'll identify $25,000+ in annual efficiency gains, or we will provide a 100% refund. Our sprint planning also includes a measurable impact guarantee."
        }
      },
      {
        "@type": "Question",
        "name": "What are the ongoing Care Plans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our Partnerships (Starter, Growth, and Scale) provide monthly support hours, system monitoring, performance optimization, and dedicated expert time to keep your ecosystems running perfectly."
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
    <div
      className="min-h-screen flex flex-col bg-[#0f0c29]"
      style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
    >
      {mounted && <NoiseTexture opacity={0.3} />}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[160px] rounded-full animate-pulse" />
      </div>

      {mounted && <AnimatedGridBackground />}
      {mounted && <Header />}
      <main className="flex-grow container mx-auto px-6 relative z-10 pt-12 pb-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <Badge className="mb-8 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2">
                <Target className="w-4 h-4 mr-2" />
                Special Automation Offers
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic mb-8">
                {t.title}
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                {t.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Success Guarantee Banner */}
        <section className="py-12 mb-32 bg-white/[0.02] border-y border-white/5 rounded-[4rem] px-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex items-center gap-6">
              <Shield className="w-12 h-12 text-cyan-400" />
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{t.guaranteeTitle}</h3>
                <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest">{t.guaranteeText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* One-Time Services */}
        <section id="one-time" className="mb-48">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.products.map((product, index) => {
              const Icon = product.icon;
              const isAudit = product.name === 'Automation Audit';
              const isEcosystem = product.name === 'Full Ecosystem';
              const productId = (product as any).id;

              const CardContent = (
                <div
                  id={productId === 'full-ecosystem' ? 'ecosystem' : undefined}
                  className={`relative p-8 rounded-[2.5rem] border h-full group transition-all duration-500 overflow-hidden flex flex-col ${isAudit ? 'bg-cyan-500/5 border-cyan-500/30 hover:bg-cyan-500/10' :
                    isEcosystem ? 'bg-[#fe3d51]/5 border-[#fe3d51]/30 hover:bg-[#fe3d51]/10' :
                      'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                    }`}>
                  {product.popular && (
                    <div className="absolute -top-1 right-12 px-6 py-2 rounded-b-2xl text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black z-20">
                      {t.expert}
                    </div>
                  )}

                  <div className="mb-10">
                    <div className="flex items-center gap-6 mb-8">
                      {Icon && <Icon className={`w-12 h-12 ${isAudit ? 'text-cyan-400' : isEcosystem ? 'text-[#fe3d51]' : 'text-white'}`} />}
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">{product.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-5xl font-black text-white">{formatCurrency(product.price)}</span>
                      <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t.fixed}</span>
                    </div>

                    <p className="text-slate-400 leading-relaxed font-semibold mb-8 group-hover:text-slate-300 transition-colors">
                      {product.description}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-12 flex-grow">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                        <span className="text-sm text-slate-300 font-bold tracking-wide">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="xl"
                    onClick={() => {
                      if (isAudit) {
                        handleCheckout('automation-audit', 'service-purchase');
                      } else if (isEcosystem) {
                        handleCheckout('full-ecosystem', 'service-purchase');
                      } else {
                        document.getElementById('qualify')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`w-full h-20 text-xl font-black rounded-2xl transition-all shadow-2xl ${isAudit ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:scale-[1.02]' :
                      isEcosystem ? 'bg-[#fe3d51] text-white hover:bg-[#ff4d61] hover:scale-[1.02]' :
                        'bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {loading === product.name.toLowerCase().replace(/\s+/g, '-') ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        {product.cta}
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    )}
                  </Button>
                </div>
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isAudit || isEcosystem || product.popular ? (
                    <GlowContainer className="h-full">
                      {CardContent}
                    </GlowContainer>
                  ) : CardContent}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Qualification Engine */}
        <section id="qualify" className="mb-48 p-16 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10">
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                <HelpCircle className="w-4 h-4" />
                {t.qualifyTag}
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                {t.qualifyTitle}
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                {t.qualifyText}
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <QualificationQuiz lang="en" />
            </div>
          </div>
        </section>

        {/* Care Plans */}
        <section id="care-plans" className="mb-48">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
              {t.careTitle}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              {t.careSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.carePlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <div className={`p-8 rounded-[2.5rem] border h-full group transition-all duration-500 flex flex-col ${plan.popular ? 'bg-cyan-500/5 border-cyan-500/30 hover:bg-cyan-500/10' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                  }`}>
                  <div className="mb-10">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">{plan.name}</h3>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-8">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{formatCurrency(plan.price)}</span>
                      <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-5 mb-12 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span className="text-sm text-slate-300 font-bold tracking-wide">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {getStripeLink(plan.name) ? (
                    <Link href={getStripeLink(plan.name)!} className="w-full">
                      <Button
                        size="xl"
                        className={`w-full h-20 text-xl font-black rounded-2xl transition-all ${plan.popular ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'bg-white/5 text-white hover:bg-white/10'
                          }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/contact" className="w-full">
                      <Button
                        size="xl"
                        className="w-full h-20 text-xl font-black rounded-2xl bg-[#fe3d51] text-white hover:bg-[#ff4d61]"
                      >
                        Schedule Discovery
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Guarantee Seal */}
        <section className="mb-48 text-center max-w-4xl mx-auto">
          <div className="p-20 rounded-[4rem] border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <Shield className="w-20 h-20 text-cyan-400 mx-auto mb-10" />
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8">{t.roiTitle}</h2>
            <p className="text-xl text-slate-400 leading-relaxed font-bold">
              {t.roiText}
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-32 p-16 rounded-[4rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 text-center space-y-12">
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            {t.ctaTitle}
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            {t.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="xl" className="w-full h-20 px-12 text-xl font-black rounded-2xl bg-[#fe3d51] text-white hover:bg-[#ff4d61] shadow-2xl">
                {t.scheduleCall}
              </Button>
            </Link>
            <Link href="/#process" className="w-full sm:w-auto">
              <Button size="xl" variant="ghost" className="w-full h-20 px-12 text-xl font-black rounded-2xl border border-white/10 text-white hover:bg-white/5">
                {t.learnProcess}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />

      {/* Email Capture Modal */}
      {
        showEmailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0a061e] border border-white/10 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl space-y-8"
            >
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Secure Your Spot</h3>
                <p className="text-slate-400 font-medium">
                  Enter your email to proceed to secure payment. We&apos;ll use this to deliver your {showEmailModal === 'automation-audit' ? 'Audit Report' : 'Sprint Blueprint'}.
                </p>
              </div>

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white font-bold focus:border-cyan-500 outline-none transition-all placeholder:text-white/20"
                autoFocus
              />

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowEmailModal(null)}
                  className="flex-1 h-16 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCheckout(showEmailModal, 'service-purchase')}
                  disabled={!email || !!loading}
                  className="flex-[2] h-16 rounded-2xl bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue to Payment'}
                </Button>
              </div>
            </motion.div>
          </div>
        )
      }
    </div>
  );
}

export default function OffersPage() {
  return <OffersPageContent />;
}

function getStripeLink(productName: string): string | undefined {
  const links = {
    'Strategic Audit': env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
    'The Lead Machine': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
    'The Content Engine': env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER,
    'Voice AI Agent': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
    'Knowledge Engine': env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
    'Full Ecosystem': env.NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM,
    'Starter Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER,
    'Growth Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH,
    'Scale Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE,
  };

  return links[productName as keyof typeof links];
}
