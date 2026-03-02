'use client';

import React, { useState } from 'react';
import { FileText, ClipboardCheck, ArrowRight, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { trackEvent } from './analytics/GTMProvider';

export function LeadMagnetSection() {
    const router = useRouter();
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [auditEmail, setAuditEmail] = useState('');

    const handleAuditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAudit(true);

        // Simulate n8n webhook call
        try {
            trackEvent('lead_magnet_submit', {
                type: 'audit',
                email: auditEmail
            });
            // In a real scenario, this would be:
            // await fetch('https://n8n.your-instance.com/webhook/automation-audit', { ... });
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/thank-you?type=audit');
        } catch (error) {
            console.error('Audit submission failed:', error);
        } finally {
            setLoadingAudit(false);
        }
    };

    return (
        <section className="py-24 px-4 relative overflow-hidden bg-[#0a061e]">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Automation Journey</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Not ready to dive in? Grab one of our free resources to understand how AI can transform your operations.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {/* Audit Lead Magnet */}
                    <div className="group relative rounded-3xl p-1 shadow-2xl transition-all hover:scale-[1.02] flex flex-col">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition" />
                        <div className="relative h-full bg-[#0d1b2e] rounded-[22px] p-8 flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shrink-0">
                                <ClipboardCheck className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Free Automation Audit</h3>
                            <p className="text-gray-400 mb-6">
                                Our AI brain analyzes your industry and identifies the top 3 high-impact workflows you can automate today.
                            </p>

                            <div className="flex-grow">
                                <form onSubmit={handleAuditSubmit} className="space-y-3">
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your work email"
                                        value={auditEmail}
                                        onChange={(e) => setAuditEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-gray-600"
                                    />
                                    <p className="text-[10px] text-gray-500 pb-2 text-center">Results delivered to your inbox in 60 seconds.</p>

                                    <Button
                                        disabled={loadingAudit}
                                        className="w-full font-bold h-[56px] flex items-center justify-center gap-2 mt-auto"
                                        style={{
                                            background: 'linear-gradient(135deg, #F47920 0%, #f79d4e 100%)',
                                            boxShadow: '0 8px 20px rgba(244, 121, 32, 0.3)'
                                        }}
                                    >
                                        {loadingAudit ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Run My Audit <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Lead Magnet */}
                    <div className="group relative rounded-3xl p-1 shadow-2xl transition-all hover:scale-[1.02] flex flex-col">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition" />
                        <div className="relative h-full bg-[#0d1b2e] rounded-[22px] p-8 flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 shrink-0">
                                <FileText className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">AI Readiness Checklist</h3>
                            <p className="text-gray-400 mb-8">
                                15 critical points to check before deploying your first AI agent. Avoid the common pitfalls that waste thousands.
                            </p>

                            <div className="flex-grow flex flex-col">
                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> <span>PDF Format (5MB)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <CheckCircle2 className="w-3 h-3 text-cyan-400" /> <span>Used by 200+ businesses</span>
                                    </div>
                                </div>

                                <Link
                                    href="/thank-you?type=checklist"
                                    className="block mt-auto"
                                    onClick={() => trackEvent('lead_magnet_download', { type: 'checklist' })}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full font-bold h-[56px] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                    >
                                        Download Checklist
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Case Study Lead Magnet */}
                    <div className="group relative rounded-3xl p-1 shadow-2xl transition-all hover:scale-[1.02] flex flex-col">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition" />
                        <div className="relative h-full bg-[#0d1b2e] rounded-[22px] p-8 flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 shrink-0">
                                <Zap className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Mini Case Study</h3>
                            <p className="text-gray-400 mb-8">
                                How a Law Firm used a &quot;WhatsApp Support Agent&quot; to recoup 40 hours of partner time per month.
                            </p>

                            <div className="flex-grow flex flex-col">
                                <div className="flex items-center gap-1 opacity-50 mb-8">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-[#0d1b2e]" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-2">Verified Success Story</span>
                                </div>

                                <Link
                                    href="/thank-you?type=case-study"
                                    className="block mt-auto"
                                    onClick={() => trackEvent('lead_magnet_click', { type: 'case-study' })}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full font-bold h-[56px] border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all"
                                    >
                                        Read Case Study
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
