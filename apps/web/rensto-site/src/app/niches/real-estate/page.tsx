'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Home,
    CheckCircle2,
    MapPin,
    Calendar,
    Key,
    Users,
    Zap,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';

export default function RealEstateNichePage() {
    const faqData = {
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Can this integrate with my CRM like Follow Up Boss or Zillow?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, our n8n-based architecture integrates with 400+ apps, including Follow Up Boss, Zillow, Salesforce, and HubSpot, ensuring zero lead leakage.'
                }
            },
            {
                '@type': 'Question',
                name: 'How does the AI qualify leads?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The AI uses natural language processing to ask qualifying questions regarding budget, timeline, and location, then scores them for your agents.'
                }
            }
        ]
    };

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rensto.com' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://rensto.com/niches' },
            { '@type': 'ListItem', position: 3, name: 'Real Estate', item: 'https://rensto.com/niches/real-estate' }
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
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                                    Real Estate Growth Stack
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    Closer <span className="text-orange-400">Faster</span>
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    Automate lead qualification, property tour scheduling, and contract signatures. Turn your agency into a 24/7 lead-converting machine.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/contact?niche=real-estate">
                                        <Button size="lg" className="h-14 px-8 font-bold" variant="renstoPrimary">
                                            Book Pipeline Audit
                                        </Button>
                                    </Link>
                                    <Link href="/marketplace?category=sales">
                                        <Button variant="outline" size="lg" className="border-slate-700 h-14 px-8">
                                            Explore RE Workflows
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full" />
                                <div className="relative bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Users className="w-8 h-8 text-orange-400" />
                                            <div>
                                                <div className="font-bold">24/7 Lead Response</div>
                                                <div className="text-xs text-slate-500">Under 2-minute response time</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Calendar className="w-8 h-8 text-cyan-400" />
                                            <div>
                                                <div className="font-bold">Auto-Tour Booking</div>
                                                <div className="text-xs text-slate-500">Sync with Agent Calendars</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <DollarSign className="w-8 h-8 text-emerald-400" />
                                            <div>
                                                <div className="font-bold">Contract Automation</div>
                                                <div className="text-xs text-slate-500">DocuSign & Dropbox Sync</div>
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Core Real Estate Use Cases</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <UseCaseCard
                                icon={Zap}
                                title="Lead Sifting AI"
                                desc="Instantly qualify inbound Zillow leads and route hot ones to your top agents."
                            />
                            <UseCaseCard
                                icon={MapPin}
                                title="Property Updates"
                                desc="Automated WhatsApp alerts to buyers when properties matching their criteria hit the market."
                            />
                            <UseCaseCard
                                icon={Key}
                                title="Close Management"
                                desc="Automated checklists and document reminders for escrow and closing teams."
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
        <div className="p-8 bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl space-y-4 hover:border-orange-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
