'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Zap,
    TrendingUp,
    Users,
    MessageCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';

export default function CaseStudyPage() {
    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rensto.com' },
            { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://rensto.com/case-studies' },
            { '@type': 'ListItem', position: 3, name: 'WhatsApp Automation', item: 'https://rensto.com/case-studies/whatsapp-automation' }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>
            <AnimatedGridBackground />
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow">
                {/* Case Study Hero */}
                <section className="py-24 px-6 border-b border-white/5">
                    <div className="container mx-auto max-w-4xl space-y-8 text-center">
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                            E-commerce Case Study
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Scaling Customer Support to <span className="text-green-400">10k+ Chats/Mo</span> Without Extra Staff
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            How a high-growth retail brand used Rensto's WhatsApp Router to automate 70% of inquiries and increase sales by 22%.
                        </p>
                        <div className="flex items-center justify-center gap-12 pt-8">
                            <Result icon={TrendingUp} value="+22%" label="Revenue Growth" />
                            <Result icon={Clock} value="-85%" label="Response Time" />
                            <Result icon={Users} value="0" label="New Hires" />
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-24 px-6">
                    <div className="container mx-auto max-w-3xl space-y-16">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">The Challenge</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                As "Organic Glow" scaled their advertising, their WhatsApp Business account was flooded with over 1,000 messages daily. Their support team of two was buried, leading to 24-hour response delays and missed sales opportunities.
                            </p>
                        </div>

                        <div className="p-12 rounded-[2.5rem] bg-[#1a1438]/60 border border-white/10 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px]" />
                            <h2 className="text-3xl font-bold">The Rensto Architecture</h2>
                            <div className="space-y-6">
                                <Step
                                    number="1"
                                    title="Intelligent Triage"
                                    desc="We deployed an n8n workflow that categorizes incoming WA messages via GPT-4o into 'Support', 'Sales', or 'Feedback'."
                                />
                                <Step
                                    number="2"
                                    title="Self-Service Resolution"
                                    desc="Common questions about order status and shipping were routed to a secure API sync with their Shopify store, resolving them instantly."
                                />
                                <Step
                                    number="3"
                                    title="Priority Routing"
                                    desc="High-intent sales inquiries were instantly pushed to the team's dashboard with full customer context."
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">The Results</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <HighlightCard
                                    title="2 Minute Response"
                                    desc="Average response time dropped from 24 hours to under 2 minutes for 90% of inquiries."
                                />
                                <HighlightCard
                                    title="Automated Sales"
                                    desc="AI agents handled product recommendations during off-hours, closing sales overnight."
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="p-12 rounded-[2.5rem] bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-white/10 text-center space-y-8">
                            <h3 className="text-3xl font-bold">Ready to scale like Organic Glow?</h3>
                            <p className="text-slate-400">Get the exact same WhatsApp framework deployed in your business in 48 hours.</p>
                            <Link href="/marketplace/whatsapp-router">
                                <Button size="lg" className="bg-white text-black hover:bg-slate-200 h-14 px-8 font-bold">
                                    Get This Blueprint <ArrowRight className="ml-2 w-5 h-5" />
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

function Result({ icon: Icon, value, label }: { icon: any, value: string, label: string }) {
    return (
        <div className="text-center space-y-2">
            <div className="flex items-center justify-center text-green-400 mb-2">
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">{label}</div>
        </div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6 items-start">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400 font-bold shrink-0">
                {number}
            </div>
            <div className="space-y-1">
                <div className="font-bold text-lg">{title}</div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function HighlightCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
            <div className="font-bold text-green-400">{title}</div>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}
