'use client';

import React from 'react';
import Link from 'next/link';
import { User, Briefcase, ShoppingBag, Home, GraduationCap, Stethoscope, Utensils, Hammer, Scale, ArrowRight } from 'lucide-react';
import nichesData from '@/data/niches.json';

import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { CustomHeader } from '@/components/CustomHeader';
import { Footer } from '@/components/Footer';

// Simple icon map (fallback for dynamic strings)
const iconMap: Record<string, any> = {
    'hvac': Home,
    'realtor': User,
    'construction': Hammer,
    'ecom': ShoppingBag,
    'lawyer': Scale,
    'tutor': GraduationCap,
    'clinic': Stethoscope,
    'roofer': Home,
    'restaurant': Utensils
};

export default function SelectNichePage() {
    return (
        <div className="min-h-screen text-white selection:bg-[#3B82F6] selection:text-white relative flex flex-col">
            <AnimatedGridBackground />

            {/* Nav */}
            <CustomHeader />

            <main className="pt-32 pb-20 px-6 flex-grow">
                <div className="max-w-7xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Pick your business type.
                        </h1>
                        <p className="text-xl text-[#94A3B8] leading-relaxed">
                            We&apos;ve built pre-configured automation systems for these 9 industries.
                            <br className="hidden md:block" />
                            Select yours to see exactly how it works.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nichesData.map((niche) => {
                            const Icon = iconMap[niche.id] || Briefcase;
                            return (
                                <Link
                                    key={niche.id}
                                    href={`/niches/${niche.slug}`}
                                    className="group relative"
                                >
                                    {/* Glass Card Effect matching Custom Page */}
                                    <div className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                                        style={{ background: 'rgba(30, 174, 247, 0.2)' }} />

                                    <div className="relative h-full rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 group-hover:translate-y-[-4px] flex flex-col items-center text-center"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(30, 174, 247, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                            borderColor: 'rgba(30, 174, 247, 0.3)'
                                        }}>

                                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500"
                                            style={{ background: 'rgba(30, 174, 247, 0.1)' }}>
                                            <Icon size={32} style={{ color: 'var(--rensto-blue)' }} />
                                        </div>

                                        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--rensto-text-primary)' }}>
                                            {niche.title.replace(' Automation System', '')}
                                        </h2>

                                        <p className="mb-6 line-clamp-2 min-h-[40px]" style={{ color: 'var(--rensto-text-secondary)' }}>
                                            {niche.hero.headline}
                                        </p>

                                        <div className="mt-auto px-4 py-2 rounded-full text-sm font-medium transition-all"
                                            style={{
                                                background: 'rgba(30, 174, 247, 0.1)',
                                                color: 'var(--rensto-blue)',
                                                border: '1px solid rgba(30, 174, 247, 0.3)'
                                            }}>
                                            See the System &rarr;
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Fallback Section */}
                    <div className="mt-20 text-center">
                        <div className="inline-block p-[2px] rounded-3xl bg-gradient-to-r from-white/10 to-white/5 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300">
                            <div className="bg-[#0B0F19] rounded-[22px] px-8 py-10 max-w-2xl mx-auto">
                                <h3 className="text-2xl font-bold mb-3 text-white">Don&apos;t see your industry?</h3>
                                <p className="text-[#94A3B8] mb-8 leading-relaxed">
                                    We build custom automation operating systems for unique businesses every day.
                                    Let&apos;s architect yours from scratch.
                                </p>
                                <Link
                                    href="/custom"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Build a Custom System
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
