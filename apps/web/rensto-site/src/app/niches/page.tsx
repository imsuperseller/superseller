'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Scale,
    Stethoscope,
    Home,
    Truck,
    ShoppingBag,
    Briefcase,
    ArrowRight,
    Zap,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';

const NICHES = [
    {
        id: 'legal',
        name: 'Legal & Law Firms',
        icon: Scale,
        description: 'Automate intake, document generation, and client communication for high-volume practices.',
        color: 'from-blue-500 to-cyan-500',
        stat: '40hrs saved/mo'
    },
    {
        id: 'healthcare',
        name: 'Healthcare & Medical',
        icon: Stethoscope,
        description: 'HIPAA-compliant appointment routing, patient follow-ups, and insurance verification.',
        color: 'from-emerald-500 to-teal-500',
        stat: '90% faster intake'
    },
    {
        id: 'real-estate',
        name: 'Real Estate & Property',
        icon: Home,
        description: 'Lead qualification, tour scheduling, and automated contract management for agents.',
        color: 'from-orange-500 to-red-500',
        stat: '24/7 lead response'
    },
    {
        id: 'logistics',
        name: 'Logistics & Supply Chain',
        icon: Truck,
        description: 'Shipment tracking, warehouse alerts, and automated vendor communication.',
        color: 'from-purple-500 to-indigo-500',
        stat: 'Zero manual entry'
    },
    {
        id: 'ecommerce',
        name: 'E-commerce & Retail',
        icon: ShoppingBag,
        description: 'Inventory sync, customer support agents, and automated review management.',
        color: 'from-pink-500 to-rose-500',
        stat: '3x conversion rate'
    },
    {
        id: 'professional-services',
        name: 'Consulting & Agencies',
        icon: Briefcase,
        description: 'Onboarding automation, project tracking, and recurring billing systems.',
        color: 'from-blue-600 to-blue-400',
        stat: 'Scale without hiring'
    }
];

export default function NichesPage() {
    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rensto.com' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://rensto.com/niches' }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>
            <AnimatedGridBackground />
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
                    <Badge className="bg-[#fe3d51]/10 text-[#fe3d51] border-[#fe3d51]/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                        Industry Solutions
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                        Automation Architected for <span className="italic text-cyan-400 text-glow">Your Sector</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        We don't do "one-size-fits-all." Explore our specialized automation frameworks designed for the unique challenges of your industry.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {NICHES.map((niche) => (
                        <Link key={niche.id} href={`/niches/${niche.id}`}>
                            <div className="group relative h-full bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl p-8 transition-all hover:border-cyan-500/50 hover:bg-[#1a1438]/60 overflow-hidden">
                                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${niche.color} opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity`} />

                                <div className="relative z-10 space-y-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                                        <niche.icon className="w-8 h-8 text-white" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold mb-3">{niche.name}</h3>
                                        <p className="text-slate-400 leading-relaxed text-sm">
                                            {niche.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                                            {niche.stat}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-white transition-colors">
                                            Explore Solutions <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-white/5 via-transparent to-transparent border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">Don't see your industry?</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Our "AI Architecture" is universally applicable. We specialize in mapping complex human workflows to autonomous systems, regardless of the niche.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/contact">
                                    <Button size="lg" className="h-14 px-8 font-bold" variant="renstoPrimary">
                                        Custom Audit <Zap className="ml-2 w-5 h-5 fill-current" />
                                    </Button>
                                </Link>
                                <Link href="/marketplace">
                                    <Button variant="outline" size="lg" className="border-slate-700 h-14 px-8">
                                        Browse All Workflows
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block w-1/3">
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                                        <span className="text-slate-300">Bespoke Architectural Mapping</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
