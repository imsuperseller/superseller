'use client';

import React from 'react';
import { Button } from '@/components/ui/button-enhanced';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Calendar, ArrowRight, FileText, Mail, ShieldCheck, Zap } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function LitalOnboardingPage() {
    return (
        <main className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>

            {/* --- CUSTOM NAVBAR (Dark Mode Overrides) --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                            <Image
                                src="/rensto-logo.webp"
                                alt="Rensto - AI-Powered Business Automation"
                                width={40}
                                height={40}
                                className="object-contain"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgba(30, 174, 247, 0.5))'
                                }}
                                priority
                            />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Rensto<span className="text-rensto-blue">.</span></span>
                    </Link>

                    {/* Status Indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-mono text-green-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        SYSTEM ACTIVE
                    </div>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background Gradients (Matches Proposal) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-rensto-blue/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-rensto-cyan/5 rounded-full blur-[100px] -z-10" />

                <div className="container mx-auto max-w-4xl text-center relative z-10">

                    {/* Success Icon with Glow */}
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30 shadow-[0_0_40px_-5px_rgba(34,197,94,0.3)] backdrop-blur-sm relative group">
                        <div className="absolute inset-0 rounded-full border border-green-400/20 animate-ping opacity-20" />
                        <Check className="w-10 h-10 text-green-400" />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                        Welcome to the Family, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rensto-blue to-rensto-cyan">Lital.</span>
                    </h1>

                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Payment received. We are officially thrilled to partner with <strong className="text-white">Alali Group</strong>.
                        Your transformation into an automated revenue machine starts now.
                    </p>

                    {/* Timeline / Next Steps */}
                    <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">

                        {/* Card 1: Contract */}
                        <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rensto-blue/50 rounded-2xl p-8 relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                                <FileText className="w-20 h-20 text-rensto-blue transform group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-rensto-blue/20 flex items-center justify-center text-rensto-blue font-bold text-sm">1</div>
                                    <h3 className="text-xl font-bold text-white">Sign Agreement</h3>
                                </div>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    We&apos;ve sent the official service agreement to your email. Please review and sign it to finalize compliance.
                                </p>
                                <div className="inline-flex items-center gap-2 text-xs font-mono text-rensto-blue bg-rensto-blue/10 px-3 py-1.5 rounded-full border border-rensto-blue/20">
                                    <Mail className="w-3 h-3" /> Check inbox: lital@...
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Kickoff */}
                        <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rensto-cyan/50 rounded-2xl p-8 relative overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                                <Calendar className="w-20 h-20 text-rensto-cyan transform group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-rensto-cyan/20 flex items-center justify-center text-rensto-cyan font-bold text-sm">2</div>
                                    <h3 className="text-xl font-bold text-white">Kickoff Call</h3>
                                </div>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    Let&apos;s map out the first week of deployment for Pizza Ella and Meat Point.
                                </p>
                                <Link href="https://tidycal.com/rensto/kickoff" target="_blank">
                                    <Button className="h-10 text-sm bg-gradient-to-r from-rensto-blue to-rensto-cyan text-white hover:opacity-90 border-0 shadow-[0_0_20px_-5px_rgba(30,174,247,0.5)] w-full">
                                        Book Strategy Session <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-16 p-8 rounded-2xl bg-[#0B0F19] border border-white/10 max-w-3xl mx-auto shadow-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-sm relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -z-0" />

                            <div className="relative z-10 bg-[#0B0F19] px-4 flex flex-col items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                <span className="text-green-400 font-medium">Payment Secure</span>
                            </div>

                            <div className="relative z-10 bg-[#0B0F19] px-4 flex flex-col items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                <span className="text-yellow-400 font-medium">Awaiting Signature</span>
                            </div>

                            <div className="relative z-10 bg-[#0B0F19] px-4 flex flex-col items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" />
                                <span className="text-slate-500">System Deployment</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 flex justify-center pb-20">
                        <Link href="/">
                            <span className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-2 cursor-pointer border-b border-transparent hover:border-slate-500 pb-0.5">
                                Return to Homepage
                            </span>
                        </Link>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
