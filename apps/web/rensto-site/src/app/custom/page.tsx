'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import { Footer } from '@/components/Footer';
import {
    ArrowRight
} from 'lucide-react';

export default function CustomSolutionsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white font-sans selection:bg-rensto-red/30">

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#0B0F19]/90">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/rensto-logo.png"
                                alt="Rensto Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold">Rensto</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                        <Link href="#process" className="hover:text-white transition-colors">The Process</Link>
                        <Link href="#outcome" className="hover:text-white transition-colors">Your Options</Link>
                    </nav>
                    <Button variant="renstoPrimary" size="sm" asChild>
                        <Link href="https://tidycal.com/rensto/15-min-consult" target="_blank">
                            Book Free 15-Min Consult
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-grow">

                {/* HERO SECTION */}
                <section className="relative py-24 md:py-32 px-4 overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-rensto-blue/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                    <div className="container mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-8">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Available Now: Instant Custom Planning
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                            Stop Guessing. Get A Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-rensto-blue to-rensto-cyan">Automation Plan</span> In 15 Minutes.
                        </h1>

                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Tell us what you need. We&apos;ll tell you exactly what it costs, how long it takes, and what you get. No fluff. No weeks of waiting for proposals.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Button variant="renstoPrimary" size="lg" className="w-full sm:w-auto text-lg px-8 py-6" asChild>
                                <Link href="https://tidycal.com/rensto/15-min-consult" target="_blank">
                                    Book Free 15-Min Consult <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>

                        {/* HERO VIDEO */}
                        <div className="relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-black aspect-video overflow-hidden shadow-2xl shadow-rensto-blue/20 group">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/zOPmSBXHiEk?rel=0&modestbranding=1"
                                title="Rensto Custom Plan"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION: THE PROCESS */}
                <section id="process" className="py-24 px-4 bg-white/5">
                    <div className="container mx-auto max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">How It Works</h2>
                            <p className="text-xl text-slate-400">We respect your time. Here is exactly what happens.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Step 1 */}
                            <div className="relative bg-[#0B0F19] p-8 rounded-2xl border border-white/10 z-10 h-full flex flex-col group hover:border-rensto-blue/30 transition-colors duration-500">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rensto-blue/20 to-transparent border border-rensto-blue/30 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] transition-all duration-500">
                                    <div className="text-2xl font-bold text-white">1</div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-center group-hover:text-rensto-blue transition-colors">The Consult (15 Mins)</h3>
                                <p className="text-slate-400 text-sm mb-4 text-center flex-grow">
                                    We hop on a quick call. You dump your requirements, pains, and goals. We listen and map it out live.
                                </p>
                                <div className="flex justify-center items-center gap-1 h-8 mt-auto">
                                    {/* Animated Audio Wave */}
                                    <div className="w-1 h-3 bg-rensto-blue rounded-full animate-[bounce_1s_infinite_0ms]" />
                                    <div className="w-1 h-5 bg-rensto-blue rounded-full animate-[bounce_1s_infinite_200ms]" />
                                    <div className="w-1 h-3 bg-rensto-blue rounded-full animate-[bounce_1s_infinite_400ms]" />
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative bg-[#0B0F19] p-8 rounded-2xl border border-rensto-cyan/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] z-10 h-full flex flex-col group hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-all duration-500">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rensto-cyan/20 to-transparent border border-rensto-cyan/30 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.5)] transition-all duration-500">
                                    <div className="text-2xl font-bold text-white">2</div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-center text-rensto-cyan">The Instant Plan</h3>
                                <p className="text-slate-400 text-sm mb-4 text-center flex-grow">
                                    Right there on the call, we give you the <strong>Scope</strong>, <strong>Timeline</strong>, and <strong>Fixed Price</strong>.
                                </p>
                                <div className="bg-rensto-cyan/10 p-3 rounded-lg text-xs text-rensto-cyan font-medium text-center mt-auto border border-rensto-cyan/20">
                                    No &quot;I&apos;ll get back to you&quot;. You get the plan now.
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative bg-[#0B0F19] p-8 rounded-2xl border border-white/10 z-10 h-full flex flex-col group hover:border-rensto-blue/30 transition-colors duration-500">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rensto-blue/20 to-transparent border border-rensto-blue/30 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] transition-all duration-500">
                                    <div className="text-2xl font-bold text-white">3</div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-center group-hover:text-rensto-blue transition-colors">The Decision</h3>
                                <p className="text-slate-400 text-sm mb-4 text-center flex-grow">
                                    You get a clear path forward. Decide to build it with us, or take the plan and walk.
                                </p>
                                <div className="flex justify-center items-center mt-auto">
                                    {/* Animated Lock-on Target */}
                                    <div className="relative w-8 h-8 flex items-center justify-center">
                                        <div className="absolute inset-0 border border-rensto-blue/30 rounded-full animate-[spin_3s_linear_infinite]" />
                                        <div className="absolute inset-1 border border-rensto-blue/60 rounded-full border-t-transparent animate-[spin_2s_linear_infinite_reverse]" />
                                        <div className="w-1.5 h-1.5 bg-rensto-blue rounded-full animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION: START CONSULTATION */}
                <section id="outcome" className="py-24 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Let&apos;s Build Your Plan</h2>
                            <p className="text-slate-400">No commitment. No cost. Just a clear path forward.</p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            {/* Single Option: Free Consultation */}
                            <div className="bg-gradient-to-br from-rensto-blue/10 to-transparent border border-rensto-blue/30 rounded-2xl p-8 relative overflow-hidden group hover:border-rensto-blue/50 transition-all text-center hover:shadow-[0_0_60px_-20px_rgba(59,130,246,0.3)]">
                                <div className="absolute top-0 right-0 bg-rensto-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg">FREE</div>

                                {/* Animated Reactor Core */}
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rensto-blue/20 to-transparent border border-rensto-blue/30 flex items-center justify-center mb-8 mx-auto shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] relative">
                                    <div className="absolute inset-0 rounded-full border border-rensto-blue/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                    <div className="absolute inset-2 rounded-full border border-rensto-blue/60 border-t-transparent animate-[spin_4s_linear_infinite]" />
                                    <div className="w-12 h-12 bg-rensto-blue rounded-full blur-md animate-pulse opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 bg-white rounded-full blur-[20px]" />
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold mb-4">Start Free Consultation Now</h3>
                                <p className="text-slate-400 text-lg mb-8">
                                    We&apos;ll map out your entire automation architecture, define the scope, and give you a fixed price—live on the call.
                                </p>
                                <ul className="inline-block text-left space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-slate-300">
                                        {/* Animated Status Dot */}
                                        <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-rensto-blue rounded-full animate-pulse" />
                                            <div className="absolute inset-0 bg-rensto-blue/30 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                        </div>
                                        <span>Speak with an Automation Architect</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-rensto-blue rounded-full animate-pulse" />
                                            <div className="absolute inset-0 bg-rensto-blue/30 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                        </div>
                                        <span>Get your <strong>Custom Scope & Quote</strong></span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            <div className="w-2 h-2 bg-rensto-blue rounded-full animate-pulse" />
                                            <div className="absolute inset-0 bg-rensto-blue/30 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                        </div>
                                        <span>Zero obligation to proceed</span>
                                    </li>
                                </ul>
                                <Button variant="renstoPrimary" size="lg" className="w-full text-lg py-6" asChild>
                                    <Link href="https://tidycal.com/rensto/15-min-consult" target="_blank">
                                        Start Free Consultation Now
                                    </Link>
                                </Button>
                                <p className="text-slate-500 text-xs mt-4">
                                    * Paid implementation options available after the consult.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-32 px-4 text-center">
                    <h2 className="text-4xl font-bold mb-8">Ready To Build?</h2>
                    <p className="text-xl text-slate-400 mb-12">15 Minutes. One Plan. No Obligation.</p>
                    <Button variant="renstoPrimary" size="lg" className="text-xl px-12 py-8 h-auto" asChild>
                        <Link href="https://tidycal.com/rensto/15-min-consult" target="_blank">
                            Get Your Custom Plan
                        </Link>
                    </Button>
                </section>

            </main>
            <Footer />
        </div>
    );
}
