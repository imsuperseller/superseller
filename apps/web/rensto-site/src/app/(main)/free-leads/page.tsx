'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Label } from '@/components/ui/label-enhanced';
import { ArrowRight, Sparkles, CheckCircle2, Search, Loader2, Globe, Database, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
import { Badge } from '@/components/ui/badge-enhanced';
import { Header } from '@/components/Header';
import { gsap } from 'gsap';

const GradientText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h1 className={`text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 tracking-tighter leading-tight ${className}`}>
        {children}
    </h1>
);

export default function FreeLeadsPage() {
    const [email, setEmail] = useState('');
    const [niche, setNiche] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !niche) return;

        setLoading(true);
        try {
            const res = await fetch('/api/free-leads/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, niche })
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
                gsap.fromTo(".success-element",
                    { opacity: 0, scale: 0.9, y: 20 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" }
                );

                // Wait 4 seconds for the "WOW" success state and then redirect to dashboard with token
                setTimeout(() => {
                    if (data.dashboardUrl) {
                        window.location.href = data.dashboardUrl;
                    } else if (data.id) {
                        // Fallback in case dashboardUrl is missing but we have an ID
                        window.location.href = `/dashboard/${data.userId || data.id.replace(/[^a-z0-9]/g, '_')}`;
                    }
                }, 4000);
            } else {
                alert(data.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-rensto-red/30">
            <Header />
            <AnimatedGridBackground className="opacity-30" />
            <NoiseTexture opacity={0.03} />

            <main className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex flex-col justify-center">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-rensto-red/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatePresence mode="wait">
                        {!submitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
                                className="grid lg:grid-cols-2 gap-16 items-center"
                            >
                                <div className="space-y-10 text-left">
                                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                        <Sparkles className="w-4 h-4 text-rensto-red animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Operational Offer</span>
                                    </div>

                                    <div className="space-y-6">
                                        <GradientText>
                                            Fuel Your Pipeline With <span className="text-rensto-red">10 Free</span> Premium Leads
                                        </GradientText>
                                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
                                            Test the <span className="text-white font-bold">Rensto Intelligent Extraction Engine</span>.
                                            We'll source, scrub, and verify 10 high-intent prospects in any niche—delivered straight to your terminal.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { icon: Globe, label: "Global Coverage" },
                                            { icon: Database, label: "Real-time Scrubbing" },
                                            { icon: Zap, label: "Instant Delivery" },
                                            { icon: CheckCircle2, label: "Verified Email/Phone" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <item.icon className="w-5 h-5 text-cyan-400" />
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-300">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    ref={formRef}
                                    className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-14 backdrop-blur-3xl shadow-2xl relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[3rem] pointer-events-none" />

                                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Target Niche</Label>
                                                <div className="relative group">
                                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                                    <Input
                                                        placeholder="e.g. CMOs in Fintech London"
                                                        className="pl-14 h-16 bg-white/[0.03] border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl text-lg font-medium"
                                                        value={niche}
                                                        onChange={(e) => setNiche(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Command Center Email</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="agent@company.com"
                                                    className="h-16 bg-white/[0.03] border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-2xl text-lg font-medium"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-18 text-xs font-black uppercase tracking-[0.4em] bg-gradient-to-r from-rensto-red to-rensto-orange hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl shadow-xl shadow-rensto-red/20 py-6"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Initializing Engine...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span>Acquire Leads</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-t border-white/5 pt-8">
                                            <Database className="w-3 h-3" />
                                            <span>No Credit Card Required • Verified Credits</span>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-3xl mx-auto"
                            >
                                <div className="bg-white/[0.02] border border-white/10 rounded-[4rem] p-16 md:p-24 backdrop-blur-3xl text-center space-y-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />

                                    <div className="success-element relative w-32 h-32 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                                        <CheckCircle2 className="w-16 h-16 text-green-400" />
                                    </div>

                                    <div className="space-y-6">
                                        <h2 className="success-element text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
                                            Engine <span className="text-green-400">Deployed</span>
                                        </h2>

                                        <p className="success-element text-xl text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                                            The Rensto Extraction Engine is currently scrubbing the web for high-intent prospects in:
                                            <br />
                                            <span className="text-white font-bold bg-white/5 px-4 py-1 rounded-lg mt-2 inline-block">"{niche}"</span>
                                        </p>
                                    </div>

                                    <div className="success-element p-8 bg-white/[0.03] rounded-3xl border border-white/5 max-w-md mx-auto">
                                        <div className="flex items-center justify-center gap-3 mb-3">
                                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 underline underline-offset-4">Processing Queue</span>
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium">
                                            We'll transmit your CSV of 10 verified leads to <strong>{email}</strong> within the next 2-5 minutes.
                                        </p>
                                    </div>

                                    <div className="success-element pt-6">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 4, ease: "linear" }}
                                                    className="h-full bg-gradient-to-r from-rensto-red to-cyan-400"
                                                />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
                                                Launching Dashboard...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
