'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Tooltip } from '@/components/ui/tooltip-simple';
import { OfferConfiguration } from '@/types/offer';
import {
    Check,
    Zap,
    ShieldCheck,
    Plus,
    ArrowRight,
    Crown,
    Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalBuilderProps {
    config: OfferConfiguration;
}

export function ProposalBuilder({ config }: ProposalBuilderProps) {
    const { base, supportOptions, upgrades, meta } = config;

    // State
    const [selectedSupport, setSelectedSupport] = useState<string | null>(null);
    const [selectedUpgrades, setSelectedUpgrades] = useState<Set<string>>(new Set());
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const toggleUpgrade = (id: string) => {
        const next = new Set(selectedUpgrades);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedUpgrades(next);
    };

    // Calculations
    const totalOneTime = React.useMemo(() => {
        return base.price + Array.from(selectedUpgrades).reduce((acc, id) => {
            const upg = upgrades.find(u => u.id === id);
            return acc + (upg ? upg.price : 0);
        }, 0);
    }, [selectedUpgrades, base.price, upgrades]);

    // Monthly total is calculated but NOT charged today for the first month if included
    const monthlySupportPrice = selectedSupport ? (supportOptions.find(s => s.id === selectedSupport)?.price || 0) : 0;

    // For the UI display of "Due Today", we only show One-Time because Support is "Included" (starts next month)
    const totalDueToday = totalOneTime;
    const totalMonthlyStartingNextMonth = monthlySupportPrice;

    const totalMonthly = React.useMemo(() => {
        if (!selectedSupport) return 0;
        const option = supportOptions.find(o => o.id === selectedSupport);
        return option ? option.price : 0;
    }, [selectedSupport, supportOptions]);

    const startCheckoutProcess = () => {
        setIsReviewOpen(true);
    };

    const confirmCheckout = async () => {
        const selectedIds = [
            base.id,
            ...(selectedSupport ? [selectedSupport] : []),
            ...Array.from(selectedUpgrades)
        ];

        // 0. Trigger Contract Sending
        try {
            toast.loading('Finalizing Agreement details...', { id: 'checkout-toast' });
            await fetch('/api/contract/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signerName: 'Lital (Alali Group)',
                    signerEmail: 'lital@example.com',
                    packageName: meta.title,
                    price: totalOneTime,
                    customFeatures: selectedIds
                })
            });
            toast.success('Agreement ready. Redirecting to secure payment...', { id: 'checkout-toast' });
        } catch (err) {
            console.error('Contract send error:', err);
        }

        // 1. Create Checkout Session
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType: 'custom-config',
                    featureIds: selectedIds,
                    customerEmail: 'lital@example.com',
                    metadata: { type: 'hybrid_builder', offerId: config.id }
                }),
            });
            const data = await response.json();
            if (data.url) window.location.href = data.url;
            else throw new Error('No URL returned');
        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error('Payment initiation failed. Please try again.');
        }
    };

    // Helper to determine if we have a specific client name, otherwise generic
    const searchParams = useSearchParams();
    const clientParam = searchParams.get('client');
    const clientName = clientParam
        ? decodeURIComponent(clientParam).toUpperCase()
        : (config.id === 'lital' ? 'ALALI GROUP' : 'YOUR BUSINESS');

    return (
        <main className="min-h-screen bg-[#0B0F19] text-slate-200 selection:bg-rensto-blue/30 overflow-x-hidden">
            {/* --- HERO --- */}
            <section className="relative pt-32 pb-16 px-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-rensto-blue/10 rounded-full blur-[120px] -z-10" />
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-rensto-blue mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rensto-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rensto-blue"></span>
                        </span>
                        RENSTO x {clientName}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {meta.title} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rensto-blue to-rensto-cyan">Command Center</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                        {base.description}
                    </p>
                </div>
            </section>

            {/* --- HYBRID BUILDER --- */}
            <section className="py-12 px-4" id="builder">
                <div className="container mx-auto max-w-6xl grid lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: SELECTIONS */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* 1. CORE BRAIN (LOCKED) */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rensto-blue text-white text-xs">1</span>
                                {base.label}
                            </h3>
                            <div className="bg-[#131722]/80 border border-rensto-blue/40 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-rensto-blue/5">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-rensto-blue/10 rounded-xl h-fit border border-rensto-blue/20">
                                        <Zap className="w-8 h-8 text-rensto-blue" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{base.label}</h2>
                                        <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-lg">{base.description}</p>

                                        <div className="mt-4 flex items-baseline gap-3">
                                            <span className="text-3xl font-bold text-white">${base.price.toLocaleString()}</span>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3 mt-6">
                                            {base.features.map((feat, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Check className="w-4 h-4 text-green-500" /> {feat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. AGENT SKILLS (TOGGLES) */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rensto-blue text-white text-xs">2</span>
                                Unlock {meta.pronouns === 'he' ? 'His' : (meta.pronouns === 'she' ? 'Her' : 'Its')} Capabilities
                            </h3>
                            <div className="space-y-3">
                                {upgrades.map((upg) => {
                                    const isSelected = selectedUpgrades.has(upg.id);
                                    return (
                                        <div
                                            key={upg.id}
                                            onClick={() => toggleUpgrade(upg.id)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                                                isSelected ? "bg-rensto-blue/10 border-rensto-blue" : "bg-[#131722] border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-rensto-blue border-rensto-blue" : "border-slate-600")}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white">{upg.label.replace('Unlock: ', '')}</span>
                                                        <Tooltip content={upg.description} />
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">{upg.description}</p>
                                                </div>
                                            </div>
                                            <div className="font-mono font-bold text-white whitespace-nowrap">
                                                +${upg.price.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>



                        {/* 3. MAINTENANCE TIERS */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rensto-blue text-white text-xs">3</span>
                                Agent Health Insurance
                                <span className="text-xs font-normal text-slate-500 ml-2">(1st Month Included)</span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {supportOptions.map((opt) => {
                                    const isSelected = selectedSupport === opt.id;
                                    const isRecommended = opt.recommended;

                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => setSelectedSupport(isSelected ? null : opt.id)}
                                            className={cn(
                                                "cursor-pointer relative p-6 rounded-xl border transition-all duration-300 hover:border-white/20",
                                                isSelected
                                                    ? "bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                                    : "bg-[#131722] border-white/5",
                                                isRecommended && !isSelected && "border-amber-500/30"
                                            )}
                                        >
                                            <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                1ST MO. FREE
                                            </div>
                                            {isRecommended && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                    Recommended
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-4">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    isSelected ? "bg-emerald-500/20 text-emerald-500" : (isRecommended ? "bg-amber-500/10 text-amber-500" : "bg-slate-700 text-slate-300")
                                                )}>
                                                    {isRecommended ? <Crown className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                                </div>
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full border flex items-center justify-center",
                                                    isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-500"
                                                )}>
                                                    {isSelected && <div className="w-2 h-2 bg-[#0B0F19] rounded-full" />}
                                                </div>
                                            </div>

                                            <h4 className={cn("text-lg font-bold", isSelected ? "text-emerald-100" : "text-white")}>{opt.label}</h4>
                                            <div className="flex items-baseline gap-2 mt-1 mb-2">
                                                <span className="text-2xl font-bold text-white">${opt.price}</span>
                                                <span className="text-sm font-normal text-slate-500">/mo</span>
                                            </div>
                                            {isSelected && (
                                                <div className="text-xs text-emerald-400 font-bold mb-2">
                                                    First month included with Core.
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-400 min-h-[40px] leading-relaxed">{opt.description}</p>

                                            <ul className="mt-4 space-y-2">
                                                {opt.features.map((f: string, i: number) => (
                                                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                                        <Check className={cn("w-3 h-3", isSelected ? "text-emerald-500" : "text-slate-500")} /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SUMMARY STICKY */}
                    <div className="relative">
                        <div className="lg:sticky lg:top-8 bg-[#131722] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
                            <h3 className="text-xl font-bold text-white">Investment Summary</h3>

                            {/* ONE-TIME SECTION */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300">The 4-Brand Engine</span>
                                    <span className="text-white font-medium">${base.price.toLocaleString()}</span>
                                </div>
                                {Array.from(selectedUpgrades).map(id => {
                                    const u = upgrades.find(x => x.id === id);
                                    if (!u) return null;
                                    return (
                                        <div key={id} className="flex justify-between text-sm animate-in fade-in slide-in-from-left-2">
                                            <span className="text-slate-400 flex items-center gap-1"><Plus className="w-3 h-3" /> {u.label.replace('Unlock: ', '')}</span>
                                            <span className="text-white font-medium">${u.price.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                                <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                                    <span className="text-slate-400 font-bold text-sm">Due Today</span>
                                    <span className="text-2xl font-bold text-white">${totalOneTime.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* RECURRING SECTION */}
                            {(selectedSupport && totalMonthly > 0) && (
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 animate-in fade-in zoom-in-95">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 flex items-center gap-2">
                                            {selectedSupport === 'support_gold' ? <Crown className="w-3 h-3 text-amber-500" /> : <Server className="w-3 h-3 text-slate-400" />}
                                            Uptime Insurance
                                        </span>
                                        <span className="text-white font-medium">${totalMonthly}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex justify-between items-end">
                                        <span className="text-slate-400 font-bold text-xs uppercase">Monthly Total</span>
                                        <span className="text-lg font-bold text-white">${totalMonthly}<span className="text-xs font-normal text-slate-500">/mo</span></span>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={startCheckoutProcess}
                                className="w-full h-14 text-lg bg-gradient-to-r from-rensto-blue to-rensto-cyan text-white shadow-lg shadow-rensto-blue/20 hover:opacity-90"
                            >
                                Secure Your Application <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                            <p className="text-center text-xs text-slate-500">
                                Protected by Stripe. <br />
                                100% Money-Back Guarantee until Kickoff.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- REVIEW MODAL OVERLAY --- */}
            {isReviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#131722] border border-white/10 w-full max-w-lg rounded-2xl p-8 relative shadow-2xl animate-in zoom-in-95">
                        <button
                            onClick={() => setIsReviewOpen(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Review Your New Employee</h2>
                            <p className="text-slate-400">You are hiring {base.label} for {meta.title.replace('Plan', '')}.</p>
                        </div>

                        <div className="space-y-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-300">Human Team Value (Annual)</span>
                                <span className="text-slate-500 line-through decoration-red-500">$108,000</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                <div>
                                    <span className="text-white font-bold block">Due Today (Setup)</span>
                                    <span className="text-xs text-emerald-400">Includes 1st Month Support</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-rensto-blue">${totalDueToday.toLocaleString()}</div>
                                    {totalMonthlyStartingNextMonth > 0 && <div className="text-xs text-slate-400">${totalMonthlyStartingNextMonth}/mo (Starts Month 2)</div>}
                                </div>
                            </div>
                        </div>

                        {/* TRUST & GUARANTEE */}
                        <div className="flex items-start gap-4 mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-emerald-400 font-bold text-sm mb-1">100% Money-Back Guarantee</h4>
                                <p className="text-xs text-slate-300">
                                    Fully refundable until the end of your Kickoff Call. If you&apos;re not confident in the plan strategy, we refund you immediately. No questions asked.
                                </p>
                            </div>
                        </div>

                        {/* TIMELINE */}
                        <div className="space-y-4 mb-8">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Steps</h4>
                            <div className="flex gap-4 text-sm">
                                <span className="text-white font-bold">1. Secure Fund</span>
                                <span className="text-slate-600">→</span>
                                <span className="text-slate-400">2. Sign Agreement</span>
                                <span className="text-slate-600">→</span>
                                <span className="text-slate-400">3. Kickoff Call</span>
                            </div>
                        </div>

                        <Button
                            onClick={confirmCheckout}
                            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                        >
                            Confirm & Pay Securely
                        </Button>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
