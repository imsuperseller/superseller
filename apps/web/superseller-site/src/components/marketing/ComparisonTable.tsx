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

const translations = {
    en: {
        title: <>The Hire You&apos;ve <span className="text-cyan-400 underline decoration-white/20 underline-offset-8">Always Dreamed Of</span></>,
        subtitle: "No sick days. No vacations. No excuses. Just 100% logical execution of your business processes, 24/7.",
        metric: "Performance Metric",
        humanTitle: "Human Admin",
        humanDesc: "Emotional, expensive, and limited capacity.",
        aiTitle: "SuperSeller AI AI Agent",
        aiTag: "The Future",
        aiDesc: "Unmatched reliability. Zero management overhead.",
        advantageTitle: "The Automated Economic Advantage",
        risk: "Traditional Hiring Risk",
        riskValue: "$65,000+ / Yr + Payroll Tax",
        superseller: "SuperSeller AI Business Engine",
        supersellerValue: "Fixed Cost. Infinite Scale.",
        comparisons: [
            { feature: 'Annual Cost', human: '$45,000 - $85,000+', ai: '$6,000 - $12,000' },
            { feature: 'Availability', human: '8 Hours (Plus Coffee Breaks)', ai: '24/7/365 (Never Sleeps)' },
            { feature: 'Training & Ramp-up', human: '3-6 Months of Management', ai: 'Instant (7-Day Deployment)' },
            { feature: 'Reliability', human: 'Sick Days, Moods, & Lies', ai: '100% Logic & Duty' },
            { feature: 'Management Overhead', human: 'High (Meetings & Reviews)', ai: 'Zero (Self-Monitoring)' }
        ]
    },
    he: {
        title: <>העובד שתמיד <span className="text-cyan-400 underline decoration-white/20 underline-offset-8">חלמתם עליו</span></>,
        subtitle: "בלי ימי מחלה. בלי חופשות. בלי תירוצים. פשוט ביצוע לוגי מושלם של התהליכים העסקיים שלכם, 24/7.",
        metric: "מדד ביצועים",
        humanTitle: "עובד אנושי",
        humanDesc: "מוגבל, יקר, ומושפע מרגשות.",
        aiTitle: "סוכן AI של רנסטו",
        aiTag: "העתיד כבר כאן",
        aiDesc: "אמינות מוחלטת. אפס זמן ניהול.",
        advantageTitle: "היתרון הכלכלי האוטומטי",
        risk: "עלות העסקה מסורתית",
        riskValue: "₪240,000+ / שנה + סוציאליות",
        superseller: "המנוע העסקי של רנסטו",
        supersellerValue: "עלות קבועה. סקייל אינסופי.",
        comparisons: [
            { feature: 'עלות שנתית', human: '₪180,000 - ₪300,000+', ai: '₪24,000 - ₪48,000' },
            { feature: 'זמינות', human: '9 שעות (פלוס הפסקות קפה)', ai: '24/7/365 (לא ישן לעולם)' },
            { feature: 'זמן הכשרה', human: '3-6 חודשים של ניהול צמוד', ai: 'מיידי (הטמעה תוך 7 ימים)' },
            { feature: 'אמינות', human: 'ימי מחלה, מצבי רוח, וטעויות', ai: '100% לוגיקה ומחויבות' },
            { feature: 'תקורה ניהולית', human: 'גבוהה (פגישות ומשובים)', ai: 'אפס (ניטור עצמי)' }
        ]
    }
};

interface ComparisonTableProps {
    lang?: 'en' | 'he';
}

export function ComparisonTable({ lang = 'en' }: ComparisonTableProps) {
    const t = translations[lang];
    const isRtl = lang === 'he';
    const icons = [DollarSign, Clock, Zap, Coffee, Infinity];

    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-sans">
                    {t.title}
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-sans">
                    {t.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-[2rem] border border-white/10 shadow-2xl bg-[#0a061e]/50 backdrop-blur-xl relative">
                {/* Feature Column (Desktop) */}
                <div className="hidden md:block bg-white/5 p-8 border-r border-white/10">
                    <div className="h-16 mb-8 flex items-center font-bold text-slate-500 uppercase tracking-widest text-sm font-sans">
                        {t.metric}
                    </div>
                    <div className="space-y-12">
                        {t.comparisons.map((c, i) => {
                            const Icon = icons[i];
                            return (
                                <div key={i} className="flex items-center gap-3 h-12">
                                    <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                                    <span className="font-semibold text-slate-300 font-sans">{c.feature}</span>
                                </div>
                            )
                        })}
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
                            <span className="text-xl font-bold text-slate-400 font-sans">{t.humanTitle}</span>
                        </div>
                    </div>
                    <div className="space-y-12 relative z-10">
                        {t.comparisons.map((c, i) => (
                            <div key={i} className="h-12 flex items-center justify-between md:justify-start">
                                <span className="md:hidden text-slate-500 text-sm font-sans">{c.feature}</span>
                                <span className="text-slate-500 font-medium font-sans">{c.human}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center font-sans">
                        {t.humanDesc}
                    </div>
                </div>

                {/* SuperSeller AI AI Agent */}
                <div className="p-8 bg-cyan-500/5 border-2 border-cyan-500/30 relative">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-cyan-500 text-[#0a061e] px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(6,182,212,0.9)] z-20 whitespace-nowrap font-sans">
                        {t.aiTag}
                    </div>
                    <div className="h-16 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-[#0d1b2e]">
                                <Bot className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-white font-sans">{t.aiTitle}</span>
                        </div>
                    </div>
                    <div className="space-y-12">
                        {t.comparisons.map((c, i) => (
                            <div key={i} className="h-12 flex items-center justify-between md:justify-start">
                                <span className="md:hidden text-slate-500 text-sm font-sans">{c.feature}</span>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                    <span className="text-cyan-400 font-bold font-sans">{c.ai}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 p-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-sm font-bold text-center font-sans">
                        {t.aiDesc}
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center">
                <div className="inline-block p-8 rounded-3xl bg-white/5 border border-white/10 max-w-3xl">
                    <h3 className="text-2xl font-bold text-white mb-4 font-sans">{t.advantageTitle}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider mb-1 font-sans">{t.risk}</div>
                            <div className="text-2xl font-bold text-red-400 font-sans" dir="ltr">{t.riskValue}</div>
                        </div>
                        <div>
                            <div className="text-cyan-500 text-sm uppercase tracking-wider mb-1 font-sans">{t.superseller}</div>
                            <div className="text-2xl font-bold text-cyan-400 font-sans">{t.supersellerValue}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
