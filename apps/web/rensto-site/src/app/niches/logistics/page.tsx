'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Truck,
    CheckCircle2,
    BarChart3,
    Clock,
    Globe,
    Package,
    Zap,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';

export default function LogisticsNichePage() {
    const faqData = {
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Can this track shipments across multiple carriers?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely. Our workflows integrate with ShipStation, AfterShip, and direct carrier APIs (FedEx, UPS, DHL) to provide a unified tracking dashboard.'
                }
            },
            {
                '@type': 'Question',
                name: 'How do you handle inventory sync between Shopify and my warehouse?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We build real-time n8n syncs that trigger whenever an order is placed or stock levels change, ensuring 99.9% inventory accuracy across all channels.'
                }
            }
        ]
    };

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rensto.com' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://rensto.com/niches' },
            { '@type': 'ListItem', position: 3, name: 'Logistics', item: 'https://rensto.com/niches/logistics' }
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
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                                    Supply Chain OS
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    Transparent <span className="text-purple-400">Logistics</span>
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    Eliminate manual data entry between your warehouse, carriers, and customers. Build an autonomous supply chain that scales with your order volume.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/contact?niche=logistics">
                                        <Button size="lg" className="h-14 px-8 font-bold" variant="renstoSecondary">
                                            Book Supply Audit
                                        </Button>
                                    </Link>
                                    <Link href="/marketplace?category=operations">
                                        <Button variant="outline" size="lg" className="border-slate-700 h-14 px-8">
                                            View Logistics Workflows
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full" />
                                <div className="relative bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Truck className="w-8 h-8 text-purple-400" />
                                            <div>
                                                <div className="font-bold">Automated Tracking</div>
                                                <div className="text-xs text-slate-500">Real-time carrier updates</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Package className="w-8 h-8 text-cyan-400" />
                                            <div>
                                                <div className="font-bold">Inventory Sync</div>
                                                <div className="text-xs text-slate-500">99.9% stock accuracy</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Globe className="w-8 h-8 text-emerald-400" />
                                            <div>
                                                <div className="font-bold">Global Visibility</div>
                                                <div className="text-xs text-slate-500">Unified ops dashboard</div>
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Core Logistics Use Cases</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <UseCaseCard
                                icon={Zap}
                                title="Carrier Routing"
                                desc="Automatically select the cheapest/fastest carrier based on destination and weight."
                            />
                            <UseCaseCard
                                icon={BarChart3}
                                title="Warehouse Sync"
                                desc="Instantly push new orders to your 3PL or warehouse WMS with zero delay."
                            />
                            <UseCaseCard
                                icon={ShieldCheck}
                                title="Loss Prevention"
                                desc="Automated alerts for delayed shipments or inventory discrepancies."
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
        <div className="p-8 bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
