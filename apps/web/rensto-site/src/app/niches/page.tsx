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
    CheckCircle2,
    Shield,
    Code,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const NICHES = [
    {
        id: 'legal',
        name: 'Law Firms',
        icon: Scale,
        description: 'Automatic client booking, document creation, and messaging for busy law offices.',
        color: 'from-blue-500 to-cyan-500',
        stat: '40hrs saved/mo'
    },
    {
        id: 'healthcare',
        name: 'Doctors & Clinics',
        icon: Stethoscope,
        description: 'Safe patient reminders, booking, and checking insurance automatically.',
        color: 'from-emerald-500 to-teal-500',
        stat: '90% faster intake'
    },
    {
        id: 'real-estate',
        name: 'Real Estate Agents',
        icon: Home,
        description: 'Quick lead sorting, tour booking, and automatic contracts for agents and agencies.',
        color: 'from-orange-500 to-red-500',
        stat: '24/7 lead response'
    },
    {
        id: 'logistics',
        name: 'Shipping & Delivery',
        icon: Truck,
        description: 'Tracking orders, warehouse alerts, and talking to vendors automatically.',
        color: 'from-purple-500 to-indigo-500',
        stat: 'Zero manual typing'
    },
    {
        id: 'ecommerce',
        name: 'Online Stores',
        icon: ShoppingBag,
        description: 'Syncing stock, answering customers, and getting reviews on autopilot.',
        color: 'from-pink-500 to-rose-500',
        stat: '3x more sales'
    },
    {
        id: 'professional-services',
        name: 'Agencies & Consultants',
        icon: Briefcase,
        description: 'Automatic client onboarding, tracking projects, and simple billing systems.',
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
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <AnimatedGridBackground />
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
                    <Badge className="bg-[#fe3d51]/10 text-[#fe3d51] border-[#fe3d51]/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                        Industry Solutions
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                        Automation built for <span className="italic text-cyan-400 text-glow">Your Business</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        We don't do "one-size-fits-all." We have specific tools pre-built for the unique challenges of your industry.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {NICHES.map((niche, index) => (
                        <motion.div
                            key={niche.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/niches/${niche.id}`}>
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
                        </motion.div>
                    ))}
                </div>

                {/* New Section: Architectural Depth */}
                <section className="py-24 border-y border-white/5">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-6">Our Blueprint for <span className="text-cyan-400">Industry Scale</span></h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">
                                We don&apos;t just build bots. We architect end-to-end operational systems
                                that understand the nuances of your specific industry.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-cyan-400" />
                                        Compliance Standardized
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Whether it&apos;s HIPAA for healthcare, SOC2 for tech, or Bar Association rules for legal—our
                                        architects ensure every automation follows your industry&apos;s strict security and ethical guidelines.
                                    </p>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <Code className="w-5 h-5 text-cyan-400" />
                                        Legacy Integration
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        We connect modern AI agents to the tools you already use. From old SQL databases to
                                        niche CRMs like Clio, MyCase, or PatientPop.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-cyan-400" />
                                        Real-Time Intelligence
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Your systems don&apos;t just store data—they act on it. Automatic lead qualifying,
                                        instant contract drafting, and predictive scheduling that keeps your pipeline moving.
                                    </p>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                        <Users className="w-5 h-5 text-cyan-400" />
                                        Team Empowerment
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Automating the 80% of repetitive tasks allows your high-value talent to focus on
                                        strategy, creativity, and relationship building.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-white/5 via-transparent to-transparent border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">Don't see your industry?</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Our systems work for any business. We specialize in taking the work you do manually today and turning it into an automatic tool that works 24/7.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/contact">
                                    <Button size="xl" className="font-bold" variant="renstoPrimary">
                                        Custom Audit <Zap className="ml-2 w-5 h-5 fill-current" />
                                    </Button>
                                </Link>
                                <Link href="/marketplace">
                                    <Button variant="renstoNeon" size="xl" className="font-bold">
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
                                        <span className="text-slate-300">Custom-made for your specific needs</span>
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
