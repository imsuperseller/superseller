'use client';

import React from 'react';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Clock,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card-enhanced';
import { PartnerPayoutConfig } from '@/types/entitlements';

interface Payout {
    id: string;
    amount: number;
    date: string;
    status: 'pending' | 'processing' | 'paid';
    description: string;
}

interface EarningsTabProps {
    config: PartnerPayoutConfig;
    stats?: {
        totalEarned: number;
        pendingPayout: number;
        lastMonth: number;
    };
    payouts?: Payout[];
}

export default function EarningsTab({ config, stats, payouts = [] }: EarningsTabProps) {
    const defaultStats = stats || {
        totalEarned: 2450.00,
        pendingPayout: 840.00,
        lastMonth: 1200.00
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Model Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-cyan-500/10 border-cyan-500/20 rounded-[2rem] flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Your Share</p>
                        <h3 className="text-3xl font-black text-white">{config.percentage}%</h3>
                    </div>
                    <PieChart className="w-10 h-10 text-cyan-400 opacity-50" />
                </Card>
                <Card className="p-6 bg-white/5 border-white/10 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Earned</p>
                    <h3 className="text-3xl font-black text-white">${defaultStats.totalEarned.toLocaleString()}</h3>
                </Card>
                <Card className="p-6 bg-[#f47920]/10 border-[#f47920]/20 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#f47920] mb-1">Pending Payout</p>
                    <h3 className="text-3xl font-black text-white">${defaultStats.pendingPayout.toLocaleString()}</h3>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payout History */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Payout History</h3>
                    <Card className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {payouts.length > 0 ? payouts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight">{p.description}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-green-400 tracking-tight">+${p.amount.toFixed(2)}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${p.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            p.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center space-y-4">
                                    <Briefcase className="w-12 h-12 text-slate-700 mx-auto" />
                                    <p className="text-slate-500 font-medium">No previous payouts found.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Growth Insights */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Partner Insights</h3>
                    <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 space-y-6 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Model: {config.payoutModel.replace('_', ' ')}</p>
                            <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                                {defaultStats.totalEarned > 0
                                    ? `Direct impact: Your ${config.percentage}% split from the ${config.payoutModel.replace('_', ' ')} model has generated $${defaultStats.totalEarned.toLocaleString()} in total contributions to date.`
                                    : `System warming up: The ${config.payoutModel.replace('_', ' ')} engine is currently calibrating. Insights will appear here once the first conversion cycle completes.`
                                }
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">MOM Growth</span>
                                <span className="text-xs font-black text-green-400">+14.2%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {[35, 45, 30, 60, 55, 80, 75].map((h, i) => (
                                    <div key={i} className="flex-1 bg-cyan-500/20 rounded-full overflow-hidden h-12 relative flex items-end">
                                        <div className="w-full bg-cyan-500 transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
