import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button-enhanced';
import { Check, Zap, Shield, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  gradient: string;
  icon: any;
}

const tiers: PricingTier[] = [
  {
    id: 'individual',
    name: 'Individual Blueprint',
    price: '$29',
    period: 'starting',
    description: 'Perfect for single-purpose automation needs. High ROI blueprints for specific tasks.',
    features: [
      'Sanitized n8n JSON Template',
      'Step-by-step Setup Guide',
      'Environment Variable Sheet',
      '30-Day Technical Support',
      'Lifetime Updates for Template',
      'Private Community Access'
    ],
    cta: 'Browse Marketplace',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    icon: Zap
  },
  {
    id: 'all-access',
    name: 'All-Access Pass',
    price: '$497',
    period: '/month',
    description: 'Your own fractional automation department. Unlimited blueprints and state-of-the-art updates.',
    features: [
      'Unlimited Marketplace Downloads',
      'Weekly automated "Model Audits"',
      'Priority Implementation Support',
      'Exclusive Beta Workflow Access',
      'Custom Workflow Discovery Calls',
      'Strategic ROI Reports'
    ],
    cta: 'Become a Partner',
    highlighted: true,
    gradient: 'from-[#fe3d51]/20 to-purple-600/20',
    icon: Crown
  },
  {
    id: 'enterprise',
    name: 'Bespoke Architecture',
    price: 'Custom',
    period: 'setup',
    description: 'For companies requiring full-cycle architecture mapping and deep system integration.',
    features: [
      'Full Site Audit & Mapping',
      'Bespoke n8n Development',
      'Multi-Service Orchestration',
      'On-premise Deployment options',
      'SLA-Backed Performance',
      'Dedicated Account Architect'
    ],
    cta: 'Book Discovery Call',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    icon: Shield
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#110d28] text-white selection:bg-[#fe3d51] selection:text-white flex flex-col pt-16">
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-24 space-y-8">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
            Monetization Tiering
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tighter">
            Architected for <span className="italic text-glow text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Unfair Scale</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Choose between individual blueprints for precision fixes or the All-Access Pass for comprehensive business-wide transformation.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`group relative p-8 rounded-[3rem] bg-[#1a1438]/40 border border-slate-700/50 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] ${tier.highlighted ? 'border-[#fe3d51]/40 shadow-[0_0_50px_rgba(254,61,81,0.1)]' : 'hover:border-white/20'
                }`}
            >
              {/* Blur Background */}
              <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${tier.gradient} blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity`} />

              <div className="relative z-10 space-y-8 h-full flex flex-col">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl bg-white/5 border border-white/10`}>
                    <tier.icon className={`w-8 h-8 ${tier.highlighted ? 'text-[#fe3d51]' : 'text-cyan-400'}`} />
                  </div>
                  {tier.highlighted && (
                    <Badge className="bg-[#fe3d51] text-white border-none py-1 px-4 text-[10px] font-bold uppercase tracking-widest">
                      Most Scalable
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-bold">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold">{tier.price}</span>
                    <span className="text-slate-500 text-sm italic">{tier.period}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="flex-grow space-y-4">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${tier.highlighted ? 'bg-[#fe3d51]/20' : 'bg-cyan-500/20'}`}>
                        <Check className={`w-2.5 h-2.5 ${tier.highlighted ? 'text-[#fe3d51]' : 'text-cyan-400'}`} />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={tier.id === 'individual' ? '/marketplace' : tier.id === 'all-access' ? '/subscriptions' : '/contact'} className="block">
                  <Button
                    className={`w-full h-16 rounded-2xl text-lg font-bold group-hover:gap-4 transition-all ${tier.highlighted
                        ? 'bg-[#fe3d51] text-white hover:bg-[#ff4d61]'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                  >
                    {tier.cta} <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-32 text-center space-y-8 max-w-2xl mx-auto p-12 rounded-[3.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5">
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h2 className="text-3xl font-bold italic">The Rensto ROI Guarantee</h2>
          <p className="text-slate-400">
            If our frameworks don't save you at least 20 human-hours in the first 30 days, we'll refund your subscription and provide a free architectural audit.
          </p>
        </div>
      </div>
    </div>
  );
}
