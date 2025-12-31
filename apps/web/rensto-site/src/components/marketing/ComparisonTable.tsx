'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Check,
    X,
    User,
    Bot,
    Clock,
    DollarSign,
    Zap,
    Coffee,
    Infinity,
    BarChart3
} from 'lucide-react';

const comparisons = [
    {
        feature: 'Monthly Cost',
        human: '$3,500 - $5,000+',
        ai: '$497 - $997',
        icon: DollarSign,
        winner: 'ai'
    },
    {
        feature: 'Availability',
        human: '40 Hours / Week',
        ai: '168 Hours / Week',
        icon: Clock,
        winner: 'ai'
    },
    {
        feature: 'Response Time',
        human: 'Minutes to Hours',
        ai: 'Instant (< 2 sec)',
        icon: Zap,
        winner: 'ai'
    },
    {
        feature: 'Reliability',
        human: 'Human Error Possible',
        ai: '100% Consistent',
        icon: Coffee,
        winner: 'ai'
    },
    {
        feature: 'Scalability',
        human: 'Limited (Needs Hiring)',
        ai: 'Unlimited (Concurrent)',
        icon: Infinity,
        winner: 'ai'
    }
];

export function ComparisonTable() {
    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                    The <span className="text-red-500 underline decoration-white/20 underline-offset-8">Bottom Line</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Comparing a traditional office assistant to a Rensto AI Agent. No jargon, just results.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-[2rem] border border-white/10 shadow-2xl bg-[#0a061e]/50 backdrop-blur-xl relative">
                {/* Feature Column (Desktop) */}
                <div className="hidden md:block bg-white/5 p-8 border-r border-white/10">
                    <div className="h-16 mb-8 flex items-center font-bold text-slate-500 uppercase tracking-widest text-sm">
                        Performance Metric
                    </div>
                    <div className="space-y-12">
                        {comparisons.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 h-12">
                                <c.icon className="w-5 h-5 text-slate-400" />
                                <span className="font-semibold text-slate-300">{c.feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Human Assistant */}
                <div className="p-8 border-r border-white/10 relative group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-16 mb-8 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                <User className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-slate-400">Human Admin</span>
                        </div>
                    </div>
                    <div className="space-y-12 relative z-10">
                        {comparisons.map((c, i) => (
                            <div key={i} className="h-12 flex items-center justify-between md:justify-start">
                                <span className="md:hidden text-slate-500 text-sm">{c.feature}</span>
                                <span className="text-slate-500 font-medium">{c.human}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                        Highly expensive & limited capacity
                    </div>
                </div>

                {/* Rensto AI Agent */}
                <div className="p-8 bg-cyan-500/5 border-2 border-cyan-500/30 relative">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-cyan-500 text-[#0a061e] px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(6,182,212,0.9)] z-20 whitespace-nowrap">
                        The Future
                    </div>
                    <div className="h-16 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-[#110d28]">
                                <Bot className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-white">Rensto AI Agent</span>
                        </div>
                    </div>
                    <div className="space-y-12">
                        {comparisons.map((c, i) => (
                            <div key={i} className="h-12 flex items-center justify-between md:justify-start">
                                <span className="md:hidden text-slate-500 text-sm">{c.feature}</span>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-cyan-400" />
                                    <span className="text-cyan-400 font-bold">{c.ai}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-sm font-bold text-center">
                        Fraction of the cost, 10x output
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center">
                <div className="inline-block p-8 rounded-3xl bg-white/5 border border-white/10 max-w-3xl">
                    <h3 className="text-2xl font-bold text-white mb-4">Total Annual Impact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider mb-1">Human Overhead</div>
                            <div className="text-2xl font-bold text-red-400">$42,000+ / Year</div>
                        </div>
                        <div>
                            <div className="text-cyan-500 text-sm uppercase tracking-wider mb-1">Rensto ROI</div>
                            <div className="text-2xl font-bold text-cyan-400">$25,000 - $100k+ Saved</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
