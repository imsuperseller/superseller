'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Rocket, Handshake, Headphones, Bot, Zap, ArrowRight, Shield, TrendingUp, Clock, Target } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';

const processSteps = [
  {
    stage: 'Step 1',
    title: 'Discovery & Plan',
    description: 'We learn exactly how you work today and design a simple plan to automate the boring parts.',
    duration: '1-2 days',
    deliverables: [
      'Your Time-Saving Report',
      'A clear Automation Path',
      'The system blueprints',
      'Anticipated ROI',
      'Start-to-finish dates'
    ],
    icon: Search,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    stage: 'Step 2',
    title: 'Design & Review',
    description: 'We show you exactly how the new system will look and get your "OK" before building.',
    duration: '1-2 days',
    deliverables: [
      'Simple process diagrams',
      'List of chosen tools',
      'Data safety map',
      'Security checklist',
      'Final sign-off'
    ],
    icon: CheckCircle2,
    color: 'from-green-500 to-emerald-500'
  },
  {
    stage: 'Step 3',
    title: 'Build & Launch',
    description: 'We handle the heavy lifting and get your system up and running fast.',
    duration: '2-3 days',
    deliverables: [
      'Finished working system',
      'Full stress testing',
      'Speed optimization',
      'Security check',
      'Live in your business'
    ],
    icon: Rocket,
    color: 'from-orange-500 to-red-500'
  },
  {
    stage: 'Step 4',
    title: 'Your Team Handover',
    description: 'We show you and your team exactly how to use it. No manuals needed.',
    duration: '1 day',
    deliverables: [
      'Simple video training',
      'How-to guide for admins',
      'Full documentation',
      'How to ask for help',
      'Ownership transfer'
    ],
    icon: Handshake,
    color: 'from-purple-500 to-pink-500'
  },
  {
    stage: 'Step 5',
    title: 'Care & Upgrades',
    description: 'We watch your system 24/7 to make sure it stays perfect as you grow.',
    duration: 'Ongoing',
    deliverables: [
      '24/7 Monitoring',
      'Monthly status check',
      'Continuous polishing',
      'New feature requests',
      'Instant expert support'
    ],
    icon: Headphones,
    color: 'from-indigo-500 to-blue-500'
  }
];

const wipLimits = [
  {
    title: 'Maximum 2 Concurrent Builds',
    description: 'We limit our active projects to ensure each client gets our full attention and expertise.',
    benefits: [
      'Faster delivery times',
      'Higher quality output',
      'Better communication',
      'Reduced risk of delays'
    ]
  },
  {
    title: 'Dedicated Project Manager',
    description: 'Every project has a dedicated PM who ensures smooth communication and timely delivery.',
    benefits: [
      'Single point of contact',
      'Regular progress updates',
      'Issue resolution',
      'Stakeholder coordination'
    ]
  },
  {
    title: 'Quality Gates',
    description: 'Each stage must pass quality checks before proceeding to the next phase.',
    benefits: [
      'Consistent quality',
      'Early issue detection',
      'Reduced rework',
      'Client satisfaction'
    ]
  }
];

export default function ProcessPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does the automation deployment process take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our rapid deployment model typically takes between 7 to 10 days from discovery to production, ensuring a high-quality automation system is delivered quickly."
        }
      },
      {
        "@type": "Question",
        "name": "What are the stages of your automation process?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our proven 5-stage process includes: 1. Discovery & Planning, 2. Design & Approval, 3. Build & Deploy, 4. Training & Handover, and 5. Care & Optimization."
        }
      },
      {
        "@type": "Question",
        "name": "What are WIP limits and why do you use them?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Work-in-Progress (WIP) limits mean we maximum 2 concurrent builds at any time. This ensures each client gets our full expertise, resulting in faster delivery and higher quality output."
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
        <section className="py-24 px-4 relative overflow-hidden min-h-[70vh] flex items-center">
          <AnimatedGridBackground />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Precision Engineering for Business Systems</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                How We Deliver in <br />
                <span className="gradient-text">Days, Not Months</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                Our architecture-first approach with strict WIP limits ensures your automation
                is high-performing, secure, and ready for production in record time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" variant="renstoSecondary" onClick={() => document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore Our Process
                </Button>
                <Link href="/offers">
                  <Button size="xl" variant="renstoPrimary">
                    View Systems <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Process Timeline */}
        <section id="steps" className="py-24 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Architectural <span className="text-cyan-400">Lifecyle</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                A non-linear thinking process applied to a linear execution framework.
              </p>
            </div>

            <div className="space-y-24 relative">
              {/* Vertical line through timeline */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/20 to-transparent md:-translate-x-1/2" />

              {processSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Visual Node */}
                  <div className="md:w-1/2 flex justify-center md:justify-end md:group-odd:justify-start">
                    <div className={`relative p-8 rounded-3xl border transition-all duration-500 group hover:-translate-y-2 ${index % 2 === 1 ? 'md:text-right' : 'md:text-left'} w-full max-w-md`}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.05)'
                      }}>
                      <div className={`absolute -top-10 ${index % 2 === 1 ? 'right-8' : 'left-8'} w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} p-[1px]`}>
                        <div className="w-full h-full rounded-2xl bg-[#0a061e] flex items-center justify-center">
                          <step.icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="mt-8">
                        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400/60 mb-2 block">{step.stage}</span>
                        <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">{step.description}</p>

                        <div className={`flex flex-wrap gap-2 ${index % 2 === 1 ? 'justify-end' : 'justify-start'}`}>
                          {step.deliverables.slice(0, 3).map((d, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full border-4 border-[#0a061e] bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-10 -translate-x-1/2" />

                  {/* Placeholder for balance */}
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WIP Limits & Engineering Rigor */}
        <section className="py-24 px-4 relative bg-[#0d0922]">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                <span className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block">Zero-Fluff Engagement</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Maximum 2 Concurrent Builds. <br />
                  <span className="text-slate-500">No Compromise.</span>
                </h2>
                <p className="text-xl text-slate-400 mb-8">
                  We don&apos;t run a factory. We run an architecture firm. By strictly limiting our
                  work-in-progress, we ensure your system is polished, battle-tested, and live
                  while others are still drafting proposals.
                </p>
                <div className="space-y-4">
                  {[
                    "Faster delivery (7-10 days to production)",
                    "Direct access to lead systems architects",
                    "Deep infrastructure integration",
                    "Zero communication lag"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 grid grid-cols-2 gap-4">
                {wipLimits.map((limit, i) => (
                  <div key={i} className={`p-6 rounded-2xl border border-white/5 bg-white/[0.02] ${i === 0 ? 'col-span-2' : ''}`}>
                    <h4 className="text-white font-bold mb-2">{limit.title}</h4>
                    <p className="text-xs text-slate-500">{limit.description.slice(0, 80)}...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Deployment Speed', value: '3-7 Days', icon: Rocket, color: 'text-cyan-400' },
                { label: 'Weekly Hours Reclaimed', value: '10+', icon: Clock, color: 'text-blue-400' },
                { label: 'Manual Task Reduction', value: '90%', icon: Zap, color: 'text-yellow-400' },
                { label: 'Uptime Guarantee', value: '99.9%', icon: Shield, color: 'text-emerald-400' }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] text-center"
                >
                  <metric.icon className={`w-10 h-10 mx-auto mb-6 ${metric.color}`} />
                  <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative bg-gradient-to-b from-transparent to-cyan-500/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to <span className="gradient-text">Architect Your Future</span>?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join the elite businesses running on Rensto intelligence.
              Our slots are extremely limited.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" variant="renstoPrimary">
                <Link href="/offers">
                  View Systems & Pricing
                </Link>
              </Button>
              <Button asChild size="xl" variant="renstoSecondary">
                <Link href="/contact">
                  Chat with an Architect
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div >
  );
}
