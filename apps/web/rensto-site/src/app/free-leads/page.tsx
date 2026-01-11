'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { ArrowRight, Sparkles, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FreeLeadsPage() {
    const [email, setEmail] = useState('');
    const [niche, setNiche] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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

            if (res.ok) {
                setSubmitted(true);
            } else {
                alert('Something went wrong. Please try again.');
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
            <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10 text-center">

                    {!submitted ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-rensto-red" />
                                <span className="text-sm font-medium text-white/80">Limited Time Offer</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-rensto-red to-rensto-purple">10 Free Leads</span>
                                <br /> In Any Niche
                            </h1>

                            <p className="text-xl text-white/60 max-w-2xl mx-auto">
                                Experience the power of the <strong>Rensto Lead Machine</strong>. We'll scrape, enrich, and verify 10 high-value prospects for your business—100% free.
                            </p>

                            <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Target Niche</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                                            <Input
                                                placeholder="e.g. Real Estate Agents in Miami"
                                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-rensto-red/50 text-white"
                                                value={niche}
                                                onChange={(e) => setNiche(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Your Email</label>
                                        <Input
                                            type="email"
                                            placeholder="you@company.com"
                                            className="h-12 bg-white/5 border-white/10 focus:border-rensto-red/50 text-white"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-rensto-red to-rensto-orange hover:brightness-110 transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                                        ) : (
                                            <>Get My 10 Leads <ArrowRight className="w-5 h-5 ml-2" /></>
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-white/40 mt-4">
                                        By clicking above, you agree to receive your leads via email. No credit card required.
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-2xl mx-auto backdrop-blur-xl text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                            </div>

                            <h2 className="text-4xl font-bold">Request Received!</h2>

                            <p className="text-xl text-white/70">
                                The Lead Machine is spinning up. Searching for: <br />
                                <span className="text-white font-semibold">"{niche}"</span>
                            </p>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white/60">
                                We will email your CSV of 10 verified leads to <strong>{email}</strong> shortly.
                                <br />Usually takes 2-5 minutes.
                            </div>

                            <Button
                                variant="outline"
                                className="h-12 border-white/10 hover:bg-white/5"
                                onClick={() => window.location.href = '/offers'}
                            >
                                Explore Full Plans
                            </Button>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
