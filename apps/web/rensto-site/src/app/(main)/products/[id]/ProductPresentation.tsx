'use client';
// Force rebuild timestamp: 2026-01-22-16-08

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium/NoiseTexture';
import {
    Zap as ZapIcon,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Cpu as CpuIcon,
    Lock,
    Terminal as TerminalIcon,
    Layers,
    Activity as ActivityIcon,
    CreditCard,
    Calendar,
    ArrowLeft,
    Crosshair as CrosshairIcon,
    X,
    Phone as PhoneIcon,
    HelpCircle as HelpCircleIcon,
    LayoutGrid as LayoutGridIcon,
    Workflow as WorkflowIcon,
    Users as UsersIcon,
    Shield as ShieldIcon
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
    Crosshair: CrosshairIcon,
    Zap: ZapIcon,
    Shield: ShieldIcon,
    Users: UsersIcon,
    Phone: PhoneIcon,
    HelpCircle: HelpCircleIcon,
    Workflow: WorkflowIcon,
    LayoutGrid: LayoutGridIcon,
    Activity: ActivityIcon,
    Cpu: CpuIcon
};
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import Link from 'next/link';

interface ProductPresentationProps {
    product: any;
}

export default function ProductPresentation({ product }: ProductPresentationProps) {
    const [priceType, setPriceType] = useState<'credits' | 'subscription'>('credits');
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const currentPrice = priceType === 'credits' ? product.price : product.subscriptionPrice;

    return (
        <div suppressHydrationWarning className="relative isolate min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans">
            <NoiseTexture opacity={0.2} />
            <div className="fixed inset-0 opacity-10 pointer-events-none -z-10">
                {isLoaded && <AnimatedGridBackground />}
            </div>

            <div className="container mx-auto px-6 py-24">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                    <div className="space-y-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group mb-4">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Master Dashboard</span>
                        </Link>

                        <div className="space-y-4">
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black">
                                Autonomous Engine v2.7.0
                            </Badge>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                                {product.name}
                            </h1>
                            <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 leading-tight">
                                {product.headline}
                            </p>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {product.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">
                                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Purchase Card */}
                    <div className={`relative bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <div className="space-y-10">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="inline-flex p-1 bg-white/5 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setPriceType('credits')}
                                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${priceType === 'credits' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Credit Buy
                                    </button>
                                    <button
                                        onClick={() => setPriceType('subscription')}
                                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${priceType === 'subscription' ? 'bg-[#fe3d51] text-white shadow-lg shadow-[#fe3d51]/20' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Monthly Hire
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-7xl font-black tracking-tighter">${currentPrice}</span>
                                        {priceType === 'subscription' && <span className="text-xl font-bold text-slate-600 uppercase">/mo</span>}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                        {priceType === 'credits' ? `${product.usageCredits || 'One-Time'} Credits Included` : 'Unlimited Autonomous Runs'}
                                    </p>
                                </div>
                            </div>

                            <Link href={`/solutions/${product.id}/onboarding`} className="block">
                                <div className="flex items-center justify-center w-full h-20 rounded-[2rem] bg-white text-black hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest gap-4 cursor-pointer">
                                    {product.cta}
                                    <ZapIcon className="w-5 h-5 fill-current" />
                                </div>
                            </Link>

                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2">
                                        <TerminalIcon className="w-4 h-4 text-cyan-400" />
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Engine Diagnostics</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        <span className="text-[8px] font-black text-cyan-400 uppercase">System Ready</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-[10px]">
                                    <div>
                                        <p className="text-slate-600 font-black uppercase">Core Model</p>
                                        <p className="text-slate-300 font-mono">GEMINI-2.0-PRO</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-600 font-black uppercase">Latency</p>
                                        <p className="text-slate-300 font-mono">1.2s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metric Ribbon */}
                {product.metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-y border-white/5 mb-24 bg-white/[0.01]">
                        {product.metrics.map((metric: any, i: number) => (
                            <div key={i} className="text-center space-y-2">
                                <p className="text-5xl font-black text-white tracking-tighter">{metric.value}</p>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">{metric.label}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{metric.sublabel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Comparison Table */}
                {product.comparisons && (
                    <section className="mb-32 space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Human Efficiency vs. {product.name}</h2>
                            <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">The Data Advantage</p>
                        </div>
                        <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.03]">
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Feature</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Manual (BDR)</th>
                                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-cyan-400">{product.name}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {product.comparisons.map((item: any, i: number) => (
                                        <tr key={i} className="group hover:bg-white/[0.01] transition-colors border-b border-white/5 last:border-0">
                                            <td className="p-8 font-black uppercase text-[10px] tracking-widest text-slate-400">{item.feature}</td>
                                            <td className="p-8 font-medium text-slate-500/80">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                                        <X className="w-4 h-4 text-red-500/70" />
                                                    </div>
                                                    <span className="line-through decoration-red-500/30 decoration-2">{item.human}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 font-black text-white bg-cyan-500/5 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                                    </div>
                                                    <span className="text-cyan-50">{item.agent}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Logic Schematic */}
                <section className="mb-32 space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">The {product.name} Logic Flow</h2>
                        <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">Autonomous Neural Pipeline</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto relative px-4">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-y-1/2 z-0" />

                        {(product.logicMap || [
                            { title: 'Extraction', icon: 'Target', desc: 'Sourcing data from LinkedIn/Maps.' },
                            { title: 'Enrichment', icon: 'Activity', desc: 'AI verifies emails and phone numbers.' },
                            { title: 'Analysis', icon: 'Cpu', desc: 'Neural scoring of lead quality.' },
                            { title: 'Outreach', icon: 'Zap', desc: 'Automated 1-to-1 personalization.' }
                        ]).map((step: any, i: number) => {
                            const IconComponent = ICON_MAP[step.icon] || ZapIcon;
                            return (
                                <div key={i} className="relative z-10 p-8 bg-[#0d0d0d] border border-white/5 rounded-3xl space-y-6 hover:border-cyan-500/30 transition-all group min-h-[220px] flex flex-col justify-between">
                                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300 shadow-lg shadow-cyan-500/5">
                                        <IconComponent className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-[9px] font-black text-slate-500 border border-white/5">0{i + 1}</span>
                                            <h3 className="font-black uppercase tracking-widest text-xs text-white">{step.title}</h3>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-tight">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Integrations Marquee */}
                {product.integrations && product.integrations.length > 0 && (
                    <div className="mb-32 space-y-8">
                        <p className="text-center text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">Seamlessly Integrated With</p>
                        <div className="relative flex overflow-x-hidden group border-y border-white/5 bg-white/[0.01] py-12">
                            <div className="animate-marquee whitespace-nowrap flex gap-16 px-8">
                                {[...product.integrations, ...product.integrations, ...product.integrations].map((tool, i) => (
                                    <div key={i} className="inline-flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-slate-700 hover:text-cyan-500 transition-colors">
                                        <span>{tool}</span>
                                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-16 px-8">
                                {[...product.integrations, ...product.integrations, ...product.integrations].map((tool, i) => (
                                    <div key={i} className="inline-flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-slate-700 hover:text-cyan-500 transition-colors">
                                        <span>{tool}</span>
                                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    </div>
                                ))}
                            </div>
                            {/* Fade Edges */}
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                {product.faqs && (
                    <section className="max-w-3xl mx-auto mb-32 space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Intelligence Audit (FAQ)</h2>
                            <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">Objection Handling</p>
                        </div>
                        <div className="space-y-4">
                            {product.faqs.map((faq: any, i: number) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        className="w-full p-6 text-left flex items-center justify-between group"
                                    >
                                        <span className="font-black uppercase tracking-widest text-[10px] text-slate-300 group-hover:text-cyan-400 transition-colors">{faq.q}</span>
                                        <Layers className={`w-4 h-4 text-slate-600 transition-all duration-300 ${activeFaq === i ? 'rotate-180 text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${activeFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="px-6 pb-6 text-slate-400 text-xs font-medium leading-relaxed border-t border-white/5 pt-4">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Final CTA */}
                <div className="py-24 border-t border-white/5 text-center space-y-12 mb-32 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">Scale Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">Profit Model</span></h2>
                        <p className="text-xl text-slate-500 uppercase font-black tracking-widest">Initialization Ready</p>
                    </div>
                    <Link href={`/solutions/${product.id}/onboarding`} className="inline-block relative z-10 group">
                        <div className="flex items-center justify-center px-16 h-24 rounded-[2rem] bg-cyan-500 text-black hover:bg-white transition-all font-black text-sm uppercase tracking-[0.3em] gap-6 shadow-2xl shadow-cyan-500/20 group-hover:scale-105 group-hover:shadow-cyan-400/50 cursor-pointer">
                            Activate Engine Now
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    );
}
