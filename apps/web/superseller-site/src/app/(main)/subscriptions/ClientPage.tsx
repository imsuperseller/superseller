'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
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
  Calendar,
  Crown,
  Sparkles
} from 'lucide-react';
import { TypeformButton } from '@/components/TypeformEmbed';

export default function SubscriptionsPage() {
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState('lead-gen');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [leadVolume, setLeadVolume] = useState('medium');
  const [crmIntegration, setCrmIntegration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gatekeeper qualification state
  const [isQualified, setIsQualified] = useState(false);
  const [qualificationStep, setQualificationStep] = useState(0);
  const [qualificationAnswers, setQualificationAnswers] = useState<Record<string, string>>({});

  // ... (maintain existing logic)

  // Gatekeeper qualification questions
  const qualificationQuestions = [
    {
      id: 'sales_process',
      question: 'Do you have a sales team or process in place to handle incoming leads?',
      hint: 'We need to know leads will actually be followed up',
      options: [
        { value: 'yes_team', label: 'Yes, dedicated sales team', score: 3 },
        { value: 'yes_myself', label: 'Yes, I handle sales myself', score: 2 },
        { value: 'building', label: 'Building one now', score: 1 },
        { value: 'no', label: 'No sales process yet', score: 0 }
      ]
    },
    {
      id: 'budget',
      question: 'What\'s your monthly marketing/lead gen budget?',
      hint: 'This helps us recommend the right tier',
      options: [
        { value: 'under_500', label: 'Under $500/month', score: 1 },
        { value: '500_1000', label: '$500 - $1,000/month', score: 2 },
        { value: '1000_plus', label: '$1,000+/month', score: 3 },
        { value: 'flexible', label: 'Flexible for right ROI', score: 3 }
      ]
    },
    {
      id: 'crm_status',
      question: 'Are you currently using a CRM to manage leads?',
      hint: 'CRM integration is required for our service',
      options: [
        { value: 'yes_active', label: 'Yes, actively using one', score: 3 },
        { value: 'yes_basic', label: 'Yes, but barely use it', score: 2 },
        { value: 'no_planning', label: 'No, but planning to get one', score: 1 },
        { value: 'no', label: 'No, and no plans to', score: 0 }
      ]
    }
  ];

  const calculateReadinessScore = () => {
    let total = 0;
    qualificationQuestions.forEach(q => {
      const answer = qualificationAnswers[q.id];
      const option = q.options.find(o => o.value === answer);
      if (option) total += option.score;
    });
    return total;
  };

  const getReadinessMessage = (score: number) => {
    if (score >= 7) return { tier: 'high', message: 'You\'re a great fit for our premium plans.', color: 'text-cyan-400' };
    if (score >= 4) return { tier: 'medium', message: 'You\'re ready to get started. We recommend starting with our Medium tier.', color: 'text-orange-400' };
    return { tier: 'low', message: 'You might need to build some foundations first. Consider our Starter plan.', color: 'text-slate-400' };
  };

  const handleQualificationAnswer = (questionId: string, value: string) => {
    setQualificationAnswers(prev => ({ ...prev, [questionId]: value }));
    if (qualificationStep < qualificationQuestions.length - 1) {
      setQualificationStep(prev => prev + 1);
    } else {
      // Finished all questions
      setIsQualified(true);
    }
  };

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
    { id: 'team', name: 'Team', leads: '500+/month', price: 1999, description: 'Custom solutions for large organizations' }
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
      const response = await fetch('https://api.superseller.agency/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowType: 'subscription',
          subscriptionType: selectedSubscriptionType,
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
    <div
      className="min-h-screen flex flex-col bg-[#0f0c29]"
      style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
    >
      {mounted && <NoiseTexture opacity={0.03} />}
      {mounted && <AnimatedGridBackground />}
      <Header />
      <main className="flex-grow">

        {/* Qualification Gate */}
        {!isQualified && (
          <section className="py-24 px-4 relative overflow-hidden min-h-[80vh] flex items-center">
            <div className="container mx-auto text-center relative z-10 transition-all duration-500">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                {/* Pullback Badge */}
                <Badge className="mb-8 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Limited capacity available
                </Badge>

                <h2 className="text-4xl md:text-5xl font-black mb-6 text-white italic uppercase tracking-tighter">
                  Scalable AI Automation <br />
                  <span className="text-cyan-400">& Operational SaaS</span>
                </h2>

                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
                  We transform manual business workflows into streamlined AI automation subscriptions.
                  Effortlessly scale your lead generation and customer support systems.
                  <span className="block mt-4 text-slate-500 text-sm">
                    Answer 3 questions to see if you qualify.
                  </span>
                </p>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-center gap-2 mb-4">
                    {qualificationQuestions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-16 rounded-full transition-all duration-300 ${i <= qualificationStep ? 'bg-cyan-500' : 'bg-white/10'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    Question {qualificationStep + 1} of {qualificationQuestions.length}
                  </p>
                </div>

                {/* Current Question */}
                <motion.div
                  key={qualificationStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-[2rem] p-8 md:p-12 mb-8 bg-white/[0.03] border border-white/10 backdrop-blur-sm"
                >
                  <h2 className="text-3xl font-bold mb-3 text-white">
                    {qualificationQuestions[qualificationStep].question}
                  </h2>
                  <p className="text-slate-400 mb-8 font-medium">
                    {qualificationQuestions[qualificationStep].hint}
                  </p>

                  <div className="grid gap-4">
                    {qualificationQuestions[qualificationStep].options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleQualificationAnswer(qualificationQuestions[qualificationStep].id, option.value)}
                        className={`w-full py-5 px-8 rounded-xl text-left transition-all duration-300 border-2 group ${qualificationAnswers[qualificationQuestions[qualificationStep].id] === option.value
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                          : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10 hover:border-white/10'
                          }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-semibold text-lg">{option.label}</span>
                          {qualificationAnswers[qualificationQuestions[qualificationStep].id] === option.value && (
                            <CheckCircle className="w-5 h-5 text-cyan-400" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <p className="text-xs text-slate-500">
                  🔒 Your answers help us recommend the right plan
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Show readiness result and continue to pricing */}
        {isQualified && (
          <>
            {/* Hero Section */}
            <section className="py-20 px-4 relative overflow-hidden">
              <div className="container mx-auto text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-4xl mx-auto"
                >
                  {/* Readiness Result Banner */}
                  <div className={`rounded-xl p-6 mb-8 inline-block backdrop-blur-md border ${calculateReadinessScore() >= 7 ? 'bg-cyan-500/10 border-cyan-500/30' :
                    calculateReadinessScore() >= 4 ? 'bg-orange-500/10 border-orange-500/30' :
                      'bg-white/5 border-white/10'
                    }`}>
                    <p className={`font-bold mb-1 ${calculateReadinessScore() >= 7 ? 'text-cyan-400' :
                      calculateReadinessScore() >= 4 ? 'text-orange-400' :
                        'text-slate-400'
                      }`}>
                      ✓ Qualified — Score: {calculateReadinessScore()}/9
                    </p>
                    <p className="text-slate-300">
                      {getReadinessMessage(calculateReadinessScore()).message}
                    </p>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-black mb-6 text-white uppercase italic tracking-tighter">
                    Choose Your <span className="text-cyan-400">Plan</span>
                  </h1>
                  <p className="text-xl mb-12 max-w-3xl mx-auto text-slate-400 font-medium">
                    Based on your answers, you&apos;re ready for automated lead generation.
                    <span className="block mt-2 text-slate-500">
                      Only accepting 5 new clients per niche this month.
                    </span>
                  </p>

                  {/* Subscription Type Tabs */}
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {[
                      { id: 'all-access', label: '👑 All-Access Pass', primary: true },
                      { id: 'lead-gen', label: '🎯 The Lead Machine', primary: true },
                      { id: 'voice-ai', label: '� Voice AI Agent', primary: true },
                      { id: 'knowledge-engine', label: '🧠 Knowledge Engine', primary: true },
                      { id: 'content-engine', label: '🎬 The Content Engine', primary: true }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedSubscriptionType(tab.id)}
                        className={`
                          px-6 py-4 rounded-xl font-bold transition-all duration-300 border-2
                          ${selectedSubscriptionType === tab.id
                            ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-105'
                            : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:border-white/10 hover:text-white'}
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <Badge className="bg-white/5 border-white/10 text-slate-300 font-medium px-4 py-2">
                      <Target className="w-4 h-4 mr-2 text-cyan-400" />
                      Niche-Specific
                    </Badge>
                    <Badge className="bg-white/5 border-white/10 text-slate-300 font-medium px-4 py-2">
                      <TrendingUp className="w-4 h-4 mr-2 text-cyan-400" />
                      AI-Powered
                    </Badge>
                    <Badge className="bg-white/5 border-white/10 text-slate-300 font-medium px-4 py-2">
                      <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
                      CRM Integrated
                    </Badge>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Cost Comparison Strip */}
            {selectedSubscriptionType === 'lead-gen' && (
              <section className="py-12 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-12 text-white">
                      Traditional Lead Gen <span className="text-slate-500">vs</span> SuperSeller AI
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                      {/* Traditional */}
                      <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-10">
                        <h3 className="text-2xl font-bold mb-8 text-slate-400">Traditional Methods</h3>
                        <div className="space-y-6 mb-6">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">💰</div>
                            <div>
                              <div className="font-bold text-xl text-white">$50 - $200 per lead</div>
                              <div className="text-slate-500 font-medium">Cold calling, ads, agencies</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">⏰</div>
                            <div>
                              <div className="font-bold text-xl text-white">20-40 hours/week</div>
                              <div className="text-slate-500 font-medium">Manual research & outreach</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">📉</div>
                            <div>
                              <div className="font-bold text-xl text-white">10-20% conversion</div>
                              <div className="text-slate-500 font-medium">Low-quality leads</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SuperSeller AI */}
                      <div className="rounded-[2.5rem] border border-cyan-500/30 bg-cyan-500/5 p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                          <Badge className="bg-cyan-500 text-black font-black">WINNER</Badge>
                        </div>
                        <h3 className="text-2xl font-bold mb-8 text-white">Automated Lead Generation</h3>
                        <div className="space-y-6 mb-8">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">💵</div>
                            <div>
                              <div className="font-bold text-xl text-cyan-400">$3 - $7 per lead</div>
                              <div className="text-cyan-500/70 font-medium">AI-powered, automated</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">⚡</div>
                            <div>
                              <div className="font-bold text-xl text-cyan-400">0 hours/week</div>
                              <div className="text-cyan-500/70 font-medium">Fully automated</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-3xl shrink-0">📈</div>
                            <div>
                              <div className="font-bold text-xl text-cyan-400">40-60% conversion</div>
                              <div className="text-cyan-500/70 font-medium">Pre-qualified, targeted leads</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                          <div className="text-3xl font-black text-cyan-400 mb-1">Save 85-95%</div>
                          <div className="text-cyan-200 font-medium">vs traditional methods</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Lead Sources Showcase */}
            {selectedSubscriptionType === 'lead-gen' && (
              <section className="py-12 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-12 text-white">
                      Where We Get Your <span className="text-cyan-400">Leads</span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { name: 'LinkedIn', icon: '💼', description: 'Professional network scraping & outreach' },
                        { name: 'Google Maps', icon: '🗺️', description: 'Local business discovery & contact' },
                        { name: 'Facebook Groups', icon: '👥', description: 'Community engagement & lead capture' },
                        { name: 'Apify Data', icon: '🤖', description: 'AI-powered data enrichment' }
                      ].map((source, index) => (
                        <div
                          key={index}
                          className="rounded-[2.5rem] bg-white/[0.03] border border-white/5 p-8 text-center hover:bg-white/[0.05] transition-all duration-300"
                        >
                          <div className="text-5xl mb-6">{source.icon}</div>
                          <h3 className="text-xl font-bold mb-3 text-white">
                            {source.name}
                          </h3>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed">
                            {source.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Credibility Bar */}
            {selectedSubscriptionType === 'lead-gen' && (
              <section className="py-8 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-5xl mx-auto">
                    <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-10">
                      <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                        <div>
                          <div className="text-4xl md:text-5xl font-black mb-2 text-white">
                            12,000+
                          </div>
                          <div className="text-slate-400 font-medium">Leads Generated Monthly</div>
                        </div>
                        <div className="pt-8 md:pt-0">
                          <div className="text-4xl md:text-5xl font-black mb-2 text-cyan-400">
                            92%
                          </div>
                          <div className="text-slate-400 font-medium">Email Deliverability Rate</div>
                        </div>
                        <div className="pt-8 md:pt-0">
                          <div className="text-4xl md:text-5xl font-black mb-2 text-cyan-400">
                            40-60%
                          </div>
                          <div className="text-slate-400 font-medium">Average Conversion Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Voice AI Agent Subscription */}
            {selectedSubscriptionType === 'voice-ai' && (
              <section className="py-16 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                      Voice & <span className="text-cyan-400">WhatsApp Agent</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                      Your 24/7 autonomous receptionist and sales representative. Handles calls and messages via Voice and WhatsApp.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
                    {/* The Full OS Card */}
                    <div className="rounded-[2.5rem] p-10 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all relative group">
                      <div className="absolute top-0 right-0 p-4">
                        <Badge className="bg-cyan-500 text-black font-black">RECOMMENDED</Badge>
                      </div>
                      <h3 className="text-3xl font-black mb-4 text-white uppercase italic tracking-tight">WhatsApp OS Base</h3>
                      <div className="text-6xl font-black mb-2 text-white">$249<span className="text-xl text-slate-400 font-medium ml-2">/mo</span></div>
                      <div className="text-sm mb-8 text-cyan-400 font-bold tracking-wide uppercase">+ $499 setup (one-time)</div>

                      <ul className="space-y-4 mb-10">
                        {[
                          'Professional Agent Construction',
                          'Real-time CRM Integration',
                          'Advanced Lead Qualification Logic',
                          'Media Messaging Capability',
                          'Calendar Booking Automation',
                          'Human-in-the-loop Handover'
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 flex-shrink-0 text-cyan-400" />
                            <span className="text-slate-300 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link href="/whatsapp">
                        <Button className="w-full h-14 text-lg font-bold bg-cyan-500 text-black hover:bg-cyan-400 rounded-xl">
                          Build Your System
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Why WhatsApp Section */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                            <Zap size={24} />
                          </div>
                          <h4 className="font-bold text-xl text-white">Instant Response</h4>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium">Leads who receive a response in under 5 minutes are 100x more likely to convert. Our AI responds in seconds.</p>
                      </div>

                      <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Users size={24} />
                          </div>
                          <h4 className="font-bold text-xl text-white">Massive Reach</h4>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium">WhatsApp has a 98% open rate compared to 20% for email. Meet your customers where they actually are.</p>
                      </div>

                      <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                            <BarChart3 size={24} />
                          </div>
                          <h4 className="font-bold text-xl text-white">Zero Leakage</h4>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium">Direct pipe into your CRM. Every conversation is logged, every lead is tracked, nothing falls through the cracks.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Subscription Type Content */}
            {selectedSubscriptionType === 'lead-gen' && (
              <>
                {/* Niche Selection - Lead Generation */}
                <section className="py-16 px-4 relative">
                  <div className="container mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                        Choose Your <span className="text-cyan-400">Niche</span>
                      </h2>
                      <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                        Select your industry to get leads specifically targeted for your business type.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {niches.map((niche) => (
                        <button
                          key={niche.id}
                          onClick={() => setSelectedNiche(niche.id)}
                          className={`
                            p-8 rounded-[2rem] border transition-all duration-300 text-left hover:-translate-y-1 relative group
                            ${selectedNiche === niche.id
                              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
                          `}
                        >
                          <div className="flex items-start gap-6 mb-4">
                            <span className="text-4xl">{niche.icon}</span>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                {niche.name}
                              </h3>
                              <p className="text-slate-400 text-sm font-medium leading-relaxed">{niche.description}</p>
                            </div>
                          </div>
                          {selectedNiche === niche.id && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle className="w-6 h-6 text-cyan-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Lead Volume Selection */}
                <section className="py-16 px-4 relative">
                  <div className="container mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                        Choose Your <span className="text-cyan-400">Lead Volume</span>
                      </h2>
                      <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                        Select the volume that matches your business capacity and growth goals.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {leadVolumes.map((volume) => (
                        <div
                          key={volume.id}
                          onClick={() => setLeadVolume(volume.id)}
                          className={`
                            relative p-8 rounded-[2.5rem] border transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col h-full
                            ${leadVolume === volume.id
                              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
                          `}
                        >
                          {volume.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                              <Badge className="bg-cyan-500 text-black font-black uppercase tracking-widest text-xs">Most Popular</Badge>
                            </div>
                          )}

                          <div className="text-center flex-grow flex flex-col">
                            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">
                              {volume.name}
                            </h3>
                            <div className="text-4xl font-black mb-2 text-cyan-400">
                              ${volume.price}
                            </div>
                            <div className="text-sm mb-6 text-cyan-200 font-bold uppercase tracking-wide">
                              {volume.leads}
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                              {volume.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-white/5 w-full">
                              {leadVolume === volume.id ? (
                                <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Selected</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 font-bold text-sm">Select Plan</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* CRM Integration */}
                <section className="py-16 px-4 relative">
                  <div className="container mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                        CRM <span className="text-cyan-400">Integration</span>
                      </h2>
                      <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                        Choose your CRM system for seamless lead delivery and management.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {crmIntegrations.map((crm) => (
                        <button
                          key={crm.id}
                          onClick={() => setCrmIntegration(crm.id)}
                          className={`
                            p-8 rounded-[2rem] border transition-all duration-300 text-left hover:-translate-y-1 relative group h-full
                            ${crmIntegration === crm.id
                              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
                          `}
                        >
                          <div className="flex flex-col items-center text-center gap-4">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{crm.logo}</span>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">
                                {crm.name}
                              </h3>
                              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                {crm.description}
                              </p>
                            </div>
                          </div>
                          {crmIntegration === crm.id && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle className="w-6 h-6 text-cyan-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Features Included */}
                <section className="py-16 px-4 relative">
                  <div className="container mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                        Everything You <span className="text-cyan-400">Get</span>
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                      {features.map((feature, i) => (
                        <div
                          key={i}
                          className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-start gap-6">
                            <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 text-cyan-400 flex-shrink-0">
                              <feature.icon className="w-8 h-8" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                              <p className="text-slate-400 mb-6 font-medium leading-relaxed">{feature.description}</p>
                              <ul className="space-y-3">
                                {feature.benefits.map((benefit, j) => (
                                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Pricing Summary */}
                <section className="py-16 px-4 relative">
                  <div className="container mx-auto max-w-2xl">
                    <div className="rounded-[2.5rem] p-10 border border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                        <Crown className="w-32 h-32 text-cyan-400" />
                      </div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tight text-white mb-8">Summary</h3>

                      <div className="space-y-6 mb-8 text-lg">
                        <div className="flex justify-between items-center text-slate-300 pb-4 border-b border-white/10">
                          <span className="font-medium">Niche</span>
                          <span className="font-bold text-white">{niches.find(n => n.id === selectedNiche)?.name || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300 pb-4 border-b border-white/10">
                          <span className="font-medium">Lead Volume</span>
                          <span className="font-bold text-white">{selectedLeadVolume?.name || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300 pb-4 border-b border-white/10">
                          <span className="font-medium">CRM</span>
                          <span className="font-bold text-white">{crmIntegrations.find(c => c.id === crmIntegration)?.name || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                          <span className="text-2xl font-bold text-white">Total</span>
                          <span className="text-4xl font-black text-cyan-400">
                            ${selectedLeadVolume?.price || 0}<span className="text-lg text-slate-400 font-medium">/mo</span>
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleSubscriptionCheckout}
                        disabled={!selectedNiche || !leadVolume || !crmIntegration || isProcessing}
                        className="w-full py-8 text-xl font-bold rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Subscribe Now <ArrowRight className="w-6 h-6" />
                          </span>
                        )}
                      </Button>
                      <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                        30-day money-back guarantee • Cancel anytime
                      </p>
                    </div>
                  </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 px-4 relative">
                  <div className="container mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                        Why Choose Our <span className="text-cyan-400">Service?</span>
                      </h2>
                      <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                        Our enhanced lead generation service delivers better results than traditional lead providers.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center">
                      {[
                        { icon: BarChart3, title: 'Higher Quality Leads', desc: 'Our AI-powered system identifies and delivers only the highest quality prospects for your business.' },
                        { icon: Zap, title: 'Faster Delivery', desc: 'Get leads delivered to your CRM in real-time as they\'re identified and qualified.' },
                        { icon: Shield, title: 'Better ROI', desc: 'Higher conversion rates and better lead quality mean better return on your investment.' }
                      ].map((benefit, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-cyan-500/20 text-cyan-400">
                            <benefit.icon className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold mb-4 text-white">{benefit.title}</h3>
                          <p className="text-slate-400 leading-relaxed font-medium">
                            {benefit.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

              </>
            )}

            {/* Knowledge Engine Subscription */}
            {selectedSubscriptionType === 'knowledge-engine' && (
              <section className="py-16 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                      Knowledge <span className="text-cyan-400">Engine (RAG)</span>
                    </h2>
                    <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                      Connect AI to your company data. A private intelligence system that knows your best practices, projects, and internal logic.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    {[
                      { id: 'starter', name: 'Starter', data: '1 Data Source', price: 1497, features: ['Internal Knowledge Base', 'Basic Data Sync', 'Process Logic Mapping', 'Standard Support'] },
                      { id: 'pro', name: 'Growth', data: 'Multi-Source', price: 2997, popular: true, features: ['Automated CRM Sync', 'Advanced Decision Logic', 'Team Member Context', 'Priority Engineering'] },
                      { id: 'team', name: 'Team', data: 'Full Org Sync', price: 4997, features: ['White-label Internal Tool', 'Custom Workflow Sync', 'Dedicated Knowledge Engineer', '24/7 Priority Support'] }
                    ].map((tier) => (
                      <div
                        key={tier.id}
                        className={`
                            rounded-[2.5rem] p-8 border hover:-translate-y-1 transition-all duration-300 relative
                            ${tier.popular
                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
                        `}
                      >
                        {tier.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                            <Badge className="bg-cyan-500 text-black font-black uppercase tracking-widest text-xs">Most Popular</Badge>
                          </div>
                        )}

                        <div className="flex flex-col h-full">
                          <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">{tier.name}</h3>
                          <div className="text-4xl font-black text-cyan-400 mb-2">${tier.price}<span className="text-lg text-slate-500 ml-1">/mo</span></div>
                          <div className="text-sm font-bold text-cyan-200 uppercase tracking-wide mb-8">{tier.data}</div>

                          <ul className="space-y-4 mb-8 text-left flex-grow">
                            {tier.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                                <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            className={`w-full py-6 text-lg font-bold rounded-xl ${tier.popular ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            onClick={() => {
                              window.location.href = `/api/stripe/checkout?flowType=subscription&subscriptionType=knowledge-engine&tier=${tier.id}`;
                            }}
                          >
                            Get Started
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Removed Social Tab */}

            {/* The Content Engine Subscription */}
            {selectedSubscriptionType === 'content-engine' && (
              <section className="py-16 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                      The <span className="text-cyan-400">Content Engine</span>
                    </h2>
                    <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                      AI-powered content research, ideation, and generation pipeline for multi-channel dominance.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    {[
                      { id: 'basic', name: 'Starter', assets: '10 assets/month', price: 997, features: ['Content Ideation Logic', 'AI Video Generation', 'Social Media Copywriting', 'Weekly Growth Plan'] },
                      { id: 'professional', name: 'Pro', assets: '50 assets/month', price: 1997, popular: true, features: ['Advanced Video Pipeline', 'Multi-Channel Distribution', 'Custom Brand Voices', 'Topic Authority Analysis', 'Priority Production'] },
                      { id: 'team', name: 'Scale', assets: 'Unlimited', price: 3997, features: ['Full Content Agency Box', 'White-label Production', 'Custom AI Model Training', 'Dedicated Creative Lead', 'Unlimited Revisions'] }
                    ].map((tier) => (
                      <div
                        key={tier.id}
                        className={`
                            rounded-[2.5rem] p-8 border hover:-translate-y-1 transition-all duration-300 relative
                            ${tier.popular
                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}
                        `}
                      >
                        {tier.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                            <Badge className="bg-cyan-500 text-black font-black uppercase tracking-widest text-xs">Most Popular</Badge>
                          </div>
                        )}

                        <div className="flex flex-col h-full">
                          <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">{tier.name}</h3>
                          <div className="text-4xl font-black text-cyan-400 mb-2">${tier.price}<span className="text-lg text-slate-500 ml-1">/mo</span></div>
                          <div className="text-sm font-bold text-cyan-200 uppercase tracking-wide mb-8">{tier.assets}</div>

                          <ul className="space-y-4 mb-8 text-left flex-grow">
                            {tier.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                                <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            className={`w-full py-6 text-lg font-bold rounded-xl ${tier.popular ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            onClick={() => {
                              window.location.href = `/api/stripe/checkout?flowType=subscription&subscriptionType=content-engine&tier=${tier.id}`;
                            }}
                          >
                            Get Started
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* All-Access Pass Subscription */}
            {selectedSubscriptionType === 'all-access' && (
              <section className="py-16 px-4 relative">
                <div className="container mx-auto">
                  <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                      All-Access <span className="text-cyan-400">Pass</span>
                    </h2>
                    <h3 className="text-xl md:text-2xl font-bold text-cyan-200 mb-4 tracking-wide uppercase">Fractional Automation Dept</h3>
                    <p className="text-xl max-w-3xl mx-auto text-slate-400 font-medium">
                      Unlimited access to our entire marketplace, weekly "Model Optimizer" audits, and priority architectural support.
                    </p>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <div className="rounded-[3rem] p-10 border border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] hover:shadow-[0_0_80px_rgba(6,182,212,0.2)] transition-shadow duration-500">
                      <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                        <Crown className="w-48 h-48 text-cyan-400" />
                      </div>

                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Badge className="bg-cyan-500 text-black font-black uppercase tracking-widest text-sm px-6 py-2 shadow-lg">Best Value</Badge>
                      </div>

                      <div className="relative z-10">
                        <div className="text-center mb-10">
                          <h3 className="text-4xl font-black italic uppercase tracking-tight text-white mb-4">Growth Care Plan</h3>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-7xl font-black text-cyan-400">$997</span>
                            <span className="text-xl font-bold text-slate-500 self-end mb-4">/mo</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-12 max-w-2xl mx-auto">
                          {[
                            'Unlimited Artifact Downloads',
                            'Weekly AI Model Efficiency Audits',
                            'Priority Setup Assistance',
                            'Early Access to New Niches',
                            'Quarterly Architecture Reviews',
                            'Private Developer Discord',
                            'Zero Licensing Markups',
                            'White-Label Rights (Templates)'
                          ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="bg-cyan-500/20 p-2 rounded-full">
                                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                              </div>
                              <span className="text-slate-200 font-medium text-lg">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className="w-full h-20 rounded-2xl text-2xl font-black uppercase tracking-wide bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-[1.02] transition-all duration-300"
                          onClick={() => {
                            window.location.href = `/api/stripe/checkout?flowType=subscription&subscriptionType=all-access&tier=monthly`;
                          }}
                        >
                          Subscribe to All-Access
                          <ArrowRight className="ml-3 w-8 h-8" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Video Generation Merged into Content Engine */}

            {/* Lead Gen Specific Sections */}
            {selectedSubscriptionType === 'lead-gen' && (
              <>
                {/* FREE Leads Sample Section */}
                <section className="py-24 px-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none" />
                  <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block px-6 py-2 rounded-full mb-8 bg-cyan-500/10 border border-cyan-500/30">
                      <span className="text-sm font-black uppercase tracking-widest text-cyan-400">
                        🎯 Try Before You Buy
                      </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-8">
                      Get 50 <span className="text-cyan-400">FREE</span> Sample Leads
                    </h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto text-slate-300 font-medium">
                      Prove our lead quality before you buy. No credit card required. See the quality for yourself.
                    </p>

                    <div className="flex justify-center">
                      <TypeformButton
                        formId="xXJi0Jbm"
                        className="px-10 py-5 text-xl rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center gap-3"
                      >
                        <Target className="w-6 h-6" />
                        Get My FREE 50 Leads
                        <ArrowRight className="w-6 h-6" />
                      </TypeformButton>
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 px-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
                  <div className="container mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-8">
                      Ready to Get <span className="text-cyan-400">Better Leads?</span>
                    </h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto text-slate-300 font-medium">
                      Start your enhanced lead generation service today and see the difference quality makes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                      <Button
                        size="lg"
                        className="h-16 px-10 text-xl font-bold rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]"
                        disabled={!selectedNiche || !leadVolume || !crmIntegration || isProcessing}
                        onClick={handleSubscriptionCheckout}
                      >
                        <Users className="w-6 h-6 mr-3" />
                        {isProcessing ? 'Processing...' : 'Start Subscription'}
                      </Button>
                      <Link href="/custom">
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-16 px-10 text-xl font-bold rounded-xl border-2 border-white/20 hover:border-cyan-400 text-white hover:text-cyan-400 hover:bg-cyan-950/30"
                        >
                          <ArrowRight className="w-6 h-6 mr-3" />
                          Get Custom Solution
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
