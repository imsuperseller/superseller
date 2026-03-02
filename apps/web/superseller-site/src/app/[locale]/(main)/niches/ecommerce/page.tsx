'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    ShoppingBag,
    CheckCircle2,
    RefreshCcw,
    Star,
    MessageSquare,
    Package,
    Zap,
    TrendingUp
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

export default function EcommerceNichePage() {
    const faqData = {
        mainEntity: [
            {
                '@type': 'Question',
                name: 'How do you handle review automation?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our AI workflows detect when a customer receives their order and automatically sends a personalized WhatsApp or Email request for a review, filtering for positive sentiment.'
                }
            },
            {
                '@type': 'Question',
                name: 'Can this sync with multiple marketplaces like Amazon and eBay?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. We use n8n to build multi-channel inventory and order syncs, ensuring your stock levels are accurate across Shopify, Amazon, eBay, and more.'
                }
            }
        ]
    };

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://superseller.agency' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://superseller.agency/niches' },
            { '@type': 'ListItem', position: 3, name: 'E-commerce', item: 'https://superseller.agency/niches/ecommerce' }
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
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="container mx-auto max-w-6xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                                    E-commerce Acceleration
                                </Badge>
                                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                                    Scale Your <span className="text-pink-400">Store</span>
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    Automate the grunt work of online retail. From review generation to multi-channel inventory sync, build a store that runs while you sleep.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/contact?niche=ecommerce">
                                        <Button size="lg" className="h-14 px-8 font-bold" variant="supersellerPrimary">
                                            Book Store Audit
                                        </Button>
                                    </Link>
                                    <Link href="/marketplace?category=sales">
                                        <Button variant="outline" size="lg" className="border-slate-700 h-14 px-8">
                                            View E-com Workflows
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500/20 blur-[100px] rounded-full" />
                                <div className="relative bg-[#1a1438]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <TrendingUp className="w-8 h-8 text-pink-400" />
                                            <div>
                                                <div className="font-bold">Conversion AI</div>
                                                <div className="text-xs text-slate-500">24/7 Sales Assistance</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Star className="w-8 h-8 text-cyan-400" />
                                            <div>
                                                <div className="font-bold">Review Velocity</div>
                                                <div className="text-xs text-slate-500">Automated Social Proof</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <RefreshCcw className="w-8 h-8 text-emerald-400" />
                                            <div>
                                                <div className="font-bold">Inventory Sync</div>
                                                <div className="text-xs text-slate-500">Shopify, Amazon & More</div>
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Core E-commerce Use Cases</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <UseCaseCard
                                icon={Zap}
                                title="Abandoned Cart AI"
                                desc="Hyper-personalized WhatsApp recovery flows that actually convert."
                            />
                            <UseCaseCard
                                icon={MessageSquare}
                                title="Review Generation"
                                desc="Automatically request reviews from happy customers post-delivery."
                            />
                            <UseCaseCard
                                icon={Package}
                                title="Unified Inventory"
                                desc="Prevent overselling with real-time sync between all your sales channels."
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
        <div className="p-8 bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl space-y-4 hover:border-pink-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
