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
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { motion } from 'framer-motion';
import { NoiseTexture, PremiumFeatureCard, GlowContainer, PillarsVisualization } from '@/components/ui/premium';

const translations = {
    en: {
        badge: "Case Studies",
        title: "Industry Infrastructure",
        subtitle: "We don't do \"one-size-fits-all.\" We deploy sector-specific Engine modkits designed for the unique operations of high-performing industries.",
        explore: "Explore Solutions",
        blueprintTitle: "Industry Scale Roadmap",
        blueprintSubtitle: "We don't just deploy scripts. We architect end-to-end operational systems that understand the nuances of your specific industry.",
        features: [
            {
                title: "Compliance Standardized",
                desc: "Whether it's HIPAA for healthcare, SOC2 for tech, or Bar Association rules for legal—our experts ensure every system follows your industry's strict security and ethical guidelines.",
                icon: Shield
            },
            {
                title: "Legacy Synchronization",
                desc: "We connect modern AI agents to the tools you already use. From institutional SQL databases to niche CRMs like Clio, MyCase, or PatientPop.",
                icon: Code
            },
            {
                title: "Real-Time Intelligence",
                desc: "Your systems don't just store data—they act on it. Automatic qualification, instant contract generation, and predictive scheduling that keeps your pipeline moving.",
                icon: Zap
            },
            {
                title: "Team Empowerment",
                desc: "Automating the 80% of repetitive tasks allows your high-value talent to focus on strategy, growth, and relationship building.",
                icon: Users
            }
        ],
        ctaTitle: "Don't see your industry?",
        ctaDesc: "Our systems work for any business. We specialize in taking the work you do manually today and turning it into an automatic tool that works 24/7.",
        customAudit: "Custom Audit",
        browseWorkflows: "Browse All Workflows",
        customPoint: "Custom-made for your specific needs",
        niches: [
            {
                id: 'accounting',
                name: 'Accounting & Finance',
                description: 'Autonomous data entry, tax document processing, and client onboarding engines.',
                stat: 'Audit-Ready 24/7',
                icon: Scale,
                color: 'from-blue-500 to-cyan-500'
            },
            {
                id: 'engineering',
                name: 'Engineering & Construction',
                description: 'Project management automations, resource tracking, and blueprint data extraction.',
                stat: '40% Less Admin',
                icon: Home,
                color: 'from-orange-500 to-red-500'
            },
            {
                id: 'healthcare',
                name: 'Medical Clinics',
                description: 'HIPAA-compliant patient intake, autonomous scheduling, and follow-up engines.',
                stat: '90% Faster Intake',
                icon: Stethoscope,
                color: 'from-emerald-500 to-teal-500'
            },
            {
                id: 'legal',
                name: 'Law Firms',
                description: 'Automatic client booking, document creation, and messaging for busy law offices.',
                stat: 'Zero Missed Leads',
                icon: Shield,
                color: 'from-indigo-500 to-purple-500'
            },
            {
                id: 'ecommerce',
                name: 'E-commerce',
                description: 'Syncing stock, answering customers, and getting reviews on autopilot.',
                stat: '3x More Sales',
                icon: ShoppingBag,
                color: 'from-pink-500 to-rose-500'
            },
            {
                id: 'agencies',
                name: 'Agencies & Consultants',
                description: 'Automatic client onboarding, tracking projects, and simple billing systems.',
                stat: 'Scale Without Hiring',
                icon: Briefcase,
                color: 'from-blue-600 to-blue-400'
            }
        ]
    },
};

export function NichesPageContent() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const t = translations.en;

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://superseller.agency' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://superseller.agency/niches' }
        ]
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-[#0f0c29]"
            style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
            suppressHydrationWarning
        >
            {mounted && <NoiseTexture />}
            {mounted && <AnimatedGridBackground />}
            {mounted && <Header />}
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow container mx-auto px-6 py-32 relative z-10">
                <div className="max-w-5xl mx-auto text-center mb-32 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge className="bg-[#f47920]/10 text-[#f47920] border-[#f47920]/20 px-6 py-2 uppercase tracking-[0.3em] text-[10px] font-black rounded-full mb-8">
                            {t.badge}
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic">
                            {t.title.split(' ').map((word, i) => (
                                <span key={i} className={i === 1 ? 'text-cyan-400 text-glow italic' : 'text-white'}>{word} </span>
                            ))}
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium mt-8">
                            {t.subtitle}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {t.niches.map((niche, index) => (
                        <motion.div
                            key={niche.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/niches/${niche.id}`}>
                                <GlowContainer className="h-full">
                                    <div className="group relative h-full bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-[3rem] p-10 transition-all hover:bg-white/[0.06] overflow-hidden">
                                        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${niche.color} opacity-5 blur-[100px] group-hover:opacity-20 transition-opacity duration-700`} />

                                        <div className="relative z-10 space-y-8">
                                            <div className={`w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-500`}>
                                                <niche.icon className="w-10 h-10 text-white group-hover:text-cyan-400 transition-colors" />
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-white tracking-tight uppercase italic">{niche.name}</h3>
                                                <p className="text-slate-400 leading-relaxed text-base font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {niche.description}
                                                </p>
                                            </div>

                                            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {niche.stat}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                                                    {t.explore} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlowContainer>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Architectural Depth */}
                <section className="py-32 px-6 relative overflow-hidden bg-[#0d0922]/50 border-y border-white/5 mx-[-1.5rem] md:mx-[-4rem] lg:mx-[-8rem] px-8 md:px-16 lg:px-32">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-32">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="space-y-16"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                        ROADMAP
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">{t.blueprintTitle}</h2>
                                </div>

                                <div className="grid sm:grid-cols-1 gap-6">
                                    {t.features.map((feature, idx) => (
                                        <PremiumFeatureCard
                                            key={idx}
                                            title={feature.title}
                                            desc={feature.desc}
                                            idx={idx}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="flex items-center justify-center"
                            >
                                <PillarsVisualization />
                            </motion.div>
                        </div>
                    </div>
                </section>

                <div className="mt-48 p-16 rounded-[4rem] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] -mr-64 -mt-64 animate-pulse pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-10">
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">{t.ctaTitle}</h2>
                            <p className="text-xl text-slate-400 leading-relaxed font-medium">
                                {t.ctaDesc}
                            </p>
                            <div className="flex flex-wrap gap-6 pt-4">
                                <Link href="/contact" className="w-full sm:w-auto">
                                    <Button size="xl" className="w-full h-20 px-10 text-xl font-black rounded-2xl bg-[#f47920] text-white hover:bg-[#f58a30] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        {t.customAudit} <Zap className="ml-3 w-6 h-6 fill-current" />
                                    </Button>
                                </Link>
                                <Link href="/niches" className="w-full sm:w-auto">
                                    <Button size="xl" variant="ghost" className="w-full h-20 px-10 text-xl font-black rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-white">
                                        {t.browseWorkflows}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block w-[400px]">
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-5 p-6 bg-white/[0.03] rounded-3xl border border-white/5 backdrop-blur-md"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <span className="text-white font-black uppercase tracking-tight text-lg">{t.customPoint}</span>
                                    </motion.div>
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

export default function NichesPage() {
    return <NichesPageContent />;
}
