'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Stethoscope,
    CheckCircle2,
    Heart,
    Calendar,
    ShieldCheck,
    Activity,
    Zap,
    Phone
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';

export default function HealthcareNichePage() {
    const faqData = {
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Is your AI HIPAA compliant?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We architect solutions using HIPAA-compliant API providers and secure on-premise or private cloud infrastructure to ensure PHI remains protected.'
                }
            },
            {
                '@type': 'Question',
                name: 'Can this replace medical receptionists?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'It augments them. AI handles routine scheduling and basic inquiries, allowing your staff to focus on patient care and complex coordination.'
                }
            }
        ]
    };

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rensto.com' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://rensto.com/niches' },
            { '@type': 'ListItem', position: 3, name: 'Healthcare', item: 'https://rensto.com/niches/healthcare' }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <AnimatedGridBackground />
            <Header />
            <Schema type="FAQPage" data={faqData} />
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 px-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                                    Healthcare Automation Framework
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    Seamless <span className="text-emerald-400">Patient Care</span>
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    Eliminate administrative bottlenecks. Automate scheduling, patient intake, and follow-ups with secure, HIPAA-ready AI agents.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/contact?niche=healthcare">
                                        <Button size="lg" className="h-14 px-8 font-bold" variant="renstoSecondary">
                                            Book Medical Audit
                                        </Button>
                                    </Link>
                                    <Link href="/marketplace?category=sales">
                                        <Button variant="outline" size="lg" className="border-slate-700 h-14 px-8">
                                            View Clinical Workflows
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
                                <div className="relative bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Calendar className="w-8 h-8 text-emerald-400" />
                                            <div>
                                                <div className="font-bold">Smart Scheduling</div>
                                                <div className="text-xs text-slate-500">Real-time EHR Integration</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Activity className="w-8 h-8 text-cyan-400" />
                                            <div>
                                                <div className="font-bold">Follow-up Automation</div>
                                                <div className="text-xs text-slate-500">Post-Op & Medication Joys</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                            <div>
                                                <div className="font-bold">Data Privacy First</div>
                                                <div className="text-xs text-slate-500">Encrypted PHI Handling</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="py-24 px-6 bg-[#0a061e]/50">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Core Healthcare Use Cases</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <UseCaseCard
                                icon={Phone}
                                title="AI Receptionist"
                                desc="Handle high-volume patient calls and texts for booking and triage."
                            />
                            <UseCaseCard
                                icon={Heart}
                                title="Patient Onboarding"
                                desc="Automated digital forms that sync directly with your medical CRM."
                            />
                            <UseCaseCard
                                icon={Zap}
                                title="Lab Result Sync"
                                desc="Instantly alert patients via secure channels when results are ready."
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

function UseCaseCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-8 bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
