'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Scale,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    Clock,
    ShieldCheck,
    Zap,
    BarChart3
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

export default function LegalNichePage() {
    const faqData = {
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Is AI Law Firm automation ethical?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely. AI automation handles administrative and process-heavy tasks, while human lawyers remain in control of all legal judgment and strategy.'
                }
            },
            {
                '@type': 'Question',
                name: 'How secure is our client data?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We use enterprise-grade encryption and can architect solutions that keep data within your own secure private subnets.'
                }
            }
        ]
    };

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://superseller.agency' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://superseller.agency/niches' },
            { '@type': 'ListItem', position: 3, name: 'Legal', item: 'https://superseller.agency/niches/legal' }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--superseller-bg-primary)' }}>
            <AnimatedGridBackground />
            <Header />
            <Schema type="FAQPage" data={faqData} />
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 px-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                                    Tools for Law Firms
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    The "No-Leads-Lost" <span className="text-blue-400">Law Firm</span>
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    Automatic client booking, document assembly, and billing. Let your team focus on the case while our AI handles the paperwork.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/contact?niche=legal">
                                        <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-8 font-bold">
                                            Book Legal Audit
                                        </Button>
                                    </Link>
                                    <Link href="/marketplace?category=operations">
                                        <Button variant="outline" size="lg" className="border-slate-700 h-14 px-8">
                                            View Workflows
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                                <div className="relative bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Clock className="w-8 h-8 text-blue-400" />
                                            <div>
                                                <div className="font-bold">40+ Hours Saved</div>
                                                <div className="text-xs text-slate-500">Per Partner Monthly</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <MessageSquare className="w-8 h-8 text-cyan-400" />
                                            <div>
                                                <div className="font-bold">Instant Client Intake</div>
                                                <div className="text-xs text-slate-500">Via 24/7 AI Receptionist</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                            <div>
                                                <div className="font-bold">Compliant Storage</div>
                                                <div className="text-xs text-slate-500">Automated Doc Archives</div>
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Core Legal Use Cases</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <UseCaseCard
                                icon={Zap}
                                title="Automatic Intake"
                                desc="Get new clients via WhatsApp or Web, and sync them to your law software instantly."
                            />
                            <UseCaseCard
                                icon={Scale}
                                title="Instant Documents"
                                desc="Generate contracts and legal papers automatically using pro templates."
                            />
                            <UseCaseCard
                                icon={BarChart3}
                                title="Simple Billing"
                                desc="Track time and bill clients automatically without typing a single invoice."
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
        <div className="p-8 bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl space-y-4 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
