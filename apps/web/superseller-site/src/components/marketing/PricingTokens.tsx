'use client';

import { Check, Zap, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card-enhanced";
import { Tooltip } from "@/components/ui/tooltip-simple";

export function PricingTokens() {
    const plans = [
        {
            name: "Starter",
            tokens: 10,
            price: 497,
            description: "Perfect for small teams needing basic automation maintenance.",
            features: [
                "10 Work Tokens / mo",
                "Rollover unused tokens",
                "Basic Email Support",
                "15 min Strategy Call",
            ],
            cta: "Get Started",
            popular: false
        },
        {
            name: "Growing Crew",
            tokens: 30,
            price: 997,
            description: "Our most popular plan for active scaling businesses.",
            features: [
                "30 Work Tokens / mo",
                "Rollover unused tokens",
                "Priority Slack Channel",
                "1 Hour Strategy Call",
                "Quarterly Business Review"
            ],
            cta: "Most Popular",
            popular: true
        },
        {
            name: "Local Empire",
            tokens: 80,
            price: 2497,
            description: "A dedicated automation partner for your team.",
            features: [
                "80 Work Tokens / mo",
                "Rollover unused tokens",
                "Dedicated Account Manager",
                "Weekly Sync Calls",
                "Custom API Integrations"
            ],
            cta: "Scale Up",
            popular: false
        }
    ];

    const tokenTasks = [
        { task: "Update FAQ in AI Agent", cost: "1 Token" },
        { task: "Modify n8n Workflow Logic", cost: "3 Tokens" },
        { task: "Build New Simple Workflow", cost: "5 Tokens" },
        { task: "Create New Zaps/Make Scenarios", cost: "2 Tokens" },
        { task: "Custom Dashboard Report", cost: "5 Tokens" },
        { task: "Full CRM Migration", cost: "20 Tokens" },
    ];

    return (
        <section id="pricing" className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] to-[#1a1438] opacity-80 -z-10" />

            <div className="container mx-auto">
                <div className="text-center mb-16 space-y-6">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                        Transparent Economy
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                        PAY FOR <span className="text-cyan-400">RESULTS.</span><br />
                        NOT HOURS.
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        We use a simplified Token system. Purchases buy "Work Units" that never expire as long as you have an active plan.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-cyan-500/30 ${plan.popular ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)] transform md:-translate-y-4' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-cyan-500 text-black font-bold uppercase tracking-widest px-4 py-1">
                                        Best Value
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl font-black italic uppercase text-white">{plan.name}</CardTitle>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>
                                <CardDescription className="text-slate-400 mt-2 font-medium">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                                        <Zap className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <div className="font-black text-white text-lg">{plan.tokens} Tokens</div>
                                        <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Monthly Capacity</div>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className={`w-full font-bold text-lg h-12 ${plan.popular ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                >
                                    {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Token Tasks Table */}
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter mb-2">
                            What is a Token?
                        </h3>
                        <p className="text-slate-400">
                            Transparency is key. Here is exactly what your tokens buy you.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                        <div className="grid grid-cols-2 p-4 bg-white/5 border-b border-white/10 font-bold text-sm uppercase tracking-widest text-slate-400">
                            <div>Task Description</div>
                            <div className="text-right">Token Cost</div>
                        </div>
                        {tokenTasks.map((item, i) => (
                            <div key={i} className="grid grid-cols-2 p-4 border-b border-white/5 hover:bg-white/[0.02] items-center text-sm">
                                <div className="text-white font-medium flex items-center gap-2">
                                    {item.task}
                                    <Tooltip content="Includes complete implementation and testing.">
                                        <Info className="w-3 h-3 text-slate-600 cursor-help" />
                                    </Tooltip>
                                </div>
                                <div className="text-right font-mono text-cyan-400 font-bold">
                                    {item.cost}
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-cyan-950/10 text-center text-xs text-slate-500 font-medium">
                            * Complex tasks are quoted in advance. You simply approve the token spend.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
