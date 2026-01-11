'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Workflow,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Target,
  MessageSquare,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function ProcessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0c29]" style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1 uppercase tracking-widest font-black">
                The Roadmap to Autonomy
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[0.9]">
                How We Build <br />
                <span className="text-cyan-400">Your Engine</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium">
                We don't just "install bots." We architect integrated ecosystems
                that replace manual chaos with autonomous consistency.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-12 px-4 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="space-y-12">
              {/* Step 1: Strategic Audit */}
              <ProcessStep
                number="01"
                title="Strategic Audit"
                subtitle="Identifying the Bottlenecks"
                description="We begin with a data-driven analysis of your current operations. Our AI audit engine maps your workflows and identifies the highest ROI opportunities for automation."
                icon={Search}
                color="cyan"
                features={[
                  "Workflow Mapping",
                  "ROI Projection",
                  "Bottleneck Identification",
                  "Technology Gap Analysis"
                ]}
              />

              {/* Step 2: Architecture Blueprint */}
              <ProcessStep
                number="02"
                title="Architecture Blueprint"
                subtitle="Designing the Ecosystem"
                description="Before a single line of code is written, we design the Blueprint. We select which of the 4 core pillars are needed to solve your specific scaling pain."
                icon={Workflow}
                color="purple"
                reversed
                features={[
                  "System Logic Design",
                  "Tool Integration Mapping",
                  "Pillar Alignment",
                  "Scalability Planning"
                ]}
              />

              {/* Step 3: Deployment */}
              <ProcessStep
                number="03"
                title="Autonomous Deployment"
                subtitle="Firing Up the Engines"
                description="Our engineers deploy your custom-configured pillars. Whether it's The Lead Machine or Voice AI, we handle 100% of the technical setup on your accounts."
                icon={Zap}
                color="blue"
                features={[
                  "Pillar Configuration",
                  "API Integrations",
                  "Security Hardening",
                  "Live Testing"
                ]}
              />

              {/* Step 4: Optimization */}
              <ProcessStep
                number="04"
                title="Care & Scale"
                subtitle="Continuous Evolution"
                description="Automation isn't 'set and forget.' We monitor your system's health daily, adjusting prompts and logic to ensure your engine runs at peak efficiency as you grow."
                icon={Shield}
                color="rose"
                reversed
                features={[
                  "Daily Health Monitoring",
                  "Prompt Optimization",
                  "Weekly Efficiency Audits",
                  "Unlimited Architectural Support"
                ]}
              />
            </div>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
                The <span className="text-cyan-400">4 Foundations</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium">Every process leads to the deployment of these core engines.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <PillarSummary
                name="The Lead Machine"
                icon={Target}
                desc="Outbound & Prospecting"
              />
              <PillarSummary
                name="Voice AI Agent"
                icon={MessageSquare}
                desc="Sales & Reception"
              />
              <PillarSummary
                name="Knowledge Engine"
                icon={BarChart3}
                desc="Private Intelligence"
              />
              <PillarSummary
                name="The Content Engine"
                icon={Users}
                desc="Autonomous Traffic"
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto rounded-[3rem] border border-cyan-500/30 bg-cyan-500/5 p-12 md:p-20 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-8">
              Ready to Start <br />
              <span className="text-cyan-400">Your Journey?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Stop wasting time on repetitive tasks. Let's architect a business that works while you sleep.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/custom">
                <Button size="xl" className="w-full sm:w-auto font-black bg-cyan-500 text-black hover:bg-cyan-400">
                  Analyze My Business
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/offers">
                <Button size="xl" variant="outline" className="w-full sm:w-auto font-black border-white/20 text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ProcessStep({ number, title, subtitle, description, icon: Icon, color, reversed, features }: any) {
  const colors = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/5 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: reversed ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}
    >
      <div className="flex-1 w-full">
        <div className={`p-10 rounded-[3rem] border ${colors[color as keyof typeof colors]} backdrop-blur-sm relative group`}>
          <div className="absolute top-0 left-0 p-8 text-8xl font-black italic opacity-5 select-none">{number}</div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400 mb-2">{subtitle}</h3>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-slate-400 mb-8 font-medium leading-relaxed">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300 font-bold">
                  <CheckCircle className="w-4 h-4 text-cyan-500 opacity-50" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-1 justify-center items-center">
        <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center text-4xl font-black italic text-white/10 select-none">
          {number}
        </div>
      </div>
    </motion.div>
  );
}

function PillarSummary({ name, icon: Icon, desc }: any) {
  return (
    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
      <Icon className="w-10 h-10 text-slate-600 group-hover:text-cyan-400 transition-colors mb-4" />
      <h4 className="text-lg font-black italic uppercase tracking-tight text-white mb-1">{name}</h4>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{desc}</p>
    </div>
  );
}
