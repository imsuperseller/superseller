'use client';

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Database,
    Cpu,
    Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { Progress } from '@/components/ui/progress';

interface FinancialMetric {
    label: string;
    value: number;
    change: number;
    trend: 'up' | 'down';
    icon: any;
    color: string;
}

export default function TreasuryManagement() {
    const [metrics, setMetrics] = useState<FinancialMetric[]>([
        { label: 'Gross Revenue', value: 0, change: 0, trend: 'up', icon: DollarSign, color: 'text-green-400' },
        { label: 'Platform Expenses', value: 0, change: 0, trend: 'up', icon: CreditCard, color: 'text-red-400' },
        { label: 'Partner Rev Share', value: 0, change: 0, trend: 'up', icon: TrendingUp, color: 'text-orange-400' },
        { label: 'Net Profit Margin', value: 0, change: 0, trend: 'up', icon: PieChart, color: 'text-cyan-400' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/financials');
            const data = await response.json();
            if (data.success) {
                // Map API icons back since they don't persist in JSON
                const iconMap: Record<string, any> = {
                    'Gross Revenue (MRR)': DollarSign,
                    'Platform Expenses': CreditCard,
                    'Partner Rev Share': TrendingUp,
                    'Net Profit Margin': PieChart
                };

                const mappedMetrics = data.metrics.map((m: any) => ({
                    ...m,
                    icon: iconMap[m.label] || DollarSign
                }));
                setMetrics(mappedMetrics);
            }
        } catch (error) {
            console.error('Failed to fetch financial metrics', error);
        } finally {
            setLoading(false);
        }
    };

    const expenses = [
        { id: '1', provider: 'RackNerd', amount: 45.00, date: '2026-01-20', status: 'paid', category: 'Infrastructure', icon: Database },
        { id: '2', provider: 'ElevenLabs', amount: 120.00, date: '2026-01-18', status: 'paid', category: 'AI Usage', icon: Zap },
        { id: '3', provider: 'UAD / David', amount: 840.00, date: '2026-01-21', status: 'pending', category: '50/50 Profit Share', icon: ArrowUpRight },
        { id: '4', provider: 'SimPass / Avi', amount: 1240.00, date: '2026-01-22', status: 'pending', category: 'License Royalty', icon: ArrowUpRight },
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Rensto Treasury</h2>
                    <p className="text-slate-400 font-medium tracking-tight">Financial intelligence and Profit/Loss orchestration.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-white/10 text-xs font-black uppercase tracking-widest">
                        <Calendar className="w-4 h-4 mr-2" />
                        Download Q1 Report
                    </Button>
                    <Button variant="renstoPrimary" className="rounded-2xl text-xs font-black uppercase tracking-widest px-8">
                        Upload Invoice
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                    <Card key={i} className="p-8 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all rounded-[2.5rem]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-center">
                                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <div className={`flex items-center text-xs font-black ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'} bg-white/5 px-2 py-1 rounded-lg border border-white/5`}>
                                {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {metric.change}%
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{metric.label}</p>
                        <h3 className="text-3xl font-black text-white tracking-tighter">
                            {metric.label.includes('Margin') ? `${metric.value}%` : `$${metric.value.toLocaleString()}`}
                        </h3>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expense List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Live Operating Costs</h3>
                    <Card className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {expenses.map((exp) => (
                                <div key={exp.id} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                            <exp.icon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight">{exp.provider}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{exp.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-white tracking-tight">-${exp.amount.toFixed(2)}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${exp.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            }`}>
                                            {exp.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Terry Financial Insights */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Terry Insights</h3>
                    <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 space-y-8 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-cyan-400 border border-cyan-500/30 w-fit px-3 py-1 rounded-full bg-cyan-500/10">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">ROI Optimization</span>
                            </div>
                            <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                                "I've detected that 3 of your active 'Lead Machine' engines are consuming API credits but haven't yielded conversion in 7 days. We could save **$420/mo** by moving them to the 'Cold Cache' layer."
                            </p>
                            <Button variant="renstoPrimary" size="sm" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-10">
                                Apply Terry's Fix
                            </Button>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Profit Goal</span>
                                <span className="text-xs font-black text-white">{metrics[3]?.value}% / 90%</span>
                            </div>
                            <Progress value={Number(metrics[3]?.value) || 0} className="h-1.5 bg-white/5" indicatorClassName="bg-cyan-500" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
