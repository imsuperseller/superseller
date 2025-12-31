'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Target,
    Zap,
    Shield,
    Users,
    Scale,
    Stethoscope,
    ShoppingBag,
    Briefcase,
    CheckCircle,
    TrendingUp,
    Clock,
    DollarSign,
    Loader2,
    Home,
    Hammer,
    Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

type Industry = 'legal' | 'healthcare' | 'ecommerce' | 'agency' | 'other';
type Operations = 'manual_intake' | 'workflow_bottlenecks' | 'legacy_systems' | 'scaling_pain';
type HoursLost = '5' | '10' | '20' | '40';

interface QuizState {
    industry: Industry | null;
    painPoint: Operations | null;
    hoursLost: HoursLost | null;
    email: string;
}

interface QuizProps {
    lang?: 'en' | 'he';
}

const translations = {
    en: {
        steps: [
            {
                title: 'Which industry are you in?',
                subtitle: 'Our AI is optimized for specific business architectures.',
                options: {
                    legal: 'Law Firm',
                    healthcare: 'Healthcare',
                    ecommerce: 'E-commerce',
                    realestate: 'Real Estate',
                    construction: 'Construction',
                    logistics: 'Logistics',
                    agency: 'Agency',
                    other: 'Other'
                }
            },
            {
                title: 'What is your biggest bottleneck?',
                subtitle: 'Identify the leak in your operational efficiency.',
                options: {
                    manual_intake: 'Manual Lead Intake',
                    workflow_bottlenecks: 'Broken Workflows',
                    legacy_systems: 'Old Software',
                    scaling_pain: 'Overwhelmed by Scale'
                }
            },
            {
                title: 'Manual work hours lost per week?',
                subtitle: 'Estimated time spent on tasks that could be automated.',
                options: {
                    h5: 'Under 10 hours',
                    h10: '10-20 hours',
                    h20: '20-40 hours',
                    h40: '40+ hours'
                }
            }
        ],
        step: 'Step',
        of: 'of',
        back: 'Back',
        calculating: 'Analyzing Your Potential',
        comparing: 'Comparing your ops against our database of 500+ automations...',
        complete: 'Analysis Complete',
        youAre: 'You are',
        automatable: 'Automatable',
        savingsLabel: 'Estimated Annual Savings',
        savingsSub: 'Based on current hours lost vs industry avg',
        planLabel: 'Recommended Plan',
        planSub: 'Optimized for your bottleneck',
        emailPlaceholder: 'Enter email to get your detailed report',
        cta: 'Get Your Personal Automation Roadmap',
        startOver: 'Start over'
    },
    he: {
        steps: [
            {
                title: 'באיזה תחום העסק שלכם?',
                subtitle: 'מערכת ה-AI שלנו מותאמת למבנים עסקיים ספציפיים.',
                options: {
                    legal: 'משרד עורכי דין',
                    healthcare: 'רפואה ובריאות',
                    ecommerce: 'מסחר אלקטרוני',
                    realestate: 'נדל״ן / תיווך',
                    construction: 'בנייה ותשתיות',
                    logistics: 'לוגיסטיקה ושילוח',
                    agency: 'סוכנות / ייעוץ',
                    other: 'אחר'
                }
            },
            {
                title: 'מהו צוואר הבקבוק העיקרי שלכם?',
                subtitle: 'זהו את המקום שבו היעילות התפעולית שלכם דולפת.',
                options: {
                    manual_intake: 'קליטת לידים ידנית',
                    workflow_bottlenecks: 'תהליכי עבודה שבורים',
                    legacy_systems: 'תוכנות ישנות',
                    scaling_pain: 'קושי בצמיחה וגדילה'
                }
            },
            {
                title: 'כמה שעות עבודה ידניות הולכות לאיבוד בשבוע?',
                subtitle: 'זמן משוער המושקע במשימות שניתן לאוטומט.',
                options: {
                    h5: 'פחות מ-10 שעות',
                    h10: '10-20 שעות',
                    h20: '20-40 שעות',
                    h40: '40+ שעות'
                }
            }
        ],
        step: 'שלב',
        of: 'מתוך',
        back: 'חזרה',
        calculating: 'מנתח את הפוטנציאל שלכם',
        comparing: 'משווה את הפעילות שלכם מול מאגר של 500+ אוטומציות...',
        complete: 'הניתוח הושלם',
        youAre: 'אתם ב- ',
        automatable: 'יכולת אוטומציה',
        savingsLabel: 'חיסכון שנתי משוער',
        savingsSub: 'מבוסס על שעות אבודות מול ממוצע בתעשייה',
        planLabel: 'תוכנית מומלצת',
        planSub: 'מותאם אישית לצוואר הבקבוק שלכם',
        emailPlaceholder: 'הזינו מייל לקבלת הדו"ח המלא',
        cta: 'קבלו את מפת הדרכים האישית שלכם',
        startOver: 'התחל מחדש'
    }
};

const steps = [
    {
        id: 'industry',
        options: [
            { id: 'legal', icon: Scale },
            { id: 'healthcare', icon: Stethoscope },
            { id: 'ecommerce', icon: ShoppingBag },
            { id: 'realestate', icon: Home },
            { id: 'construction', icon: Hammer },
            { id: 'logistics', icon: Truck },
            { id: 'agency', icon: Briefcase },
            { id: 'other', icon: Target },
        ]
    },
    {
        id: 'painPoint',
        options: [
            { id: 'manual_intake', icon: Users },
            { id: 'workflow_bottlenecks', icon: Zap },
            { id: 'legacy_systems', icon: Shield },
            { id: 'scaling_pain', icon: TrendingUp },
        ]
    },
    {
        id: 'hoursLost',
        options: [
            { id: '5', icon: Clock },
            { id: '10', icon: Clock },
            { id: '20', icon: Clock },
            { id: '40', icon: Clock },
        ]
    }
];

export function QualificationQuiz({ lang = 'en' }: QuizProps) {
    const t = translations[lang];
    const isRtl = lang === 'he';

    const [currentStep, setCurrentStep] = useState(0);
    const [state, setState] = useState<QuizState>({
        industry: null,
        painPoint: null,
        hoursLost: null,
        email: '',
    });
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<{
        potential: number;
        recommendation: string;
        savings: number;
    } | null>(null);

    const handleOptionSelect = (stepId: string, optionId: string) => {
        setState(prev => ({ ...prev, [stepId]: optionId }));
        if (currentStep < steps.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            handleCalculate();
        }
    };

    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => {
            // Map option IDs to actual hour values
            const hoursMap: Record<string, number> = {
                '5': 5,    // Under 10 hours
                '10': 15,  // 10-20 hours (use midpoint)
                '20': 30,  // 20-40 hours (use midpoint)
                '40': 50   // 40+ hours (conservative estimate)
            };
            const h = hoursMap[state.hoursLost || '5'] || 10;
            const potential = h > 25 ? 95 : h > 10 ? 85 : 65;
            const savings = h * 52 * 75; // $75/hr value × 52 weeks

            let rec = 'Starter Care';
            if (h >= 20) rec = 'Growth Care';
            if (h >= 40) rec = 'Scale Care';

            setResult({ potential, recommendation: rec, savings });
            setIsCalculating(false);
            setCurrentStep(steps.length); // Results step
        }, 1500);
    };

    const reset = () => {
        setCurrentStep(0);
        setResult(null);
        setState({ industry: null, painPoint: null, hoursLost: null, email: '' });
    };

    return (
        <div
            className="w-full max-w-2xl mx-auto p-4 md:p-8 rounded-[2rem] border border-white/10 bg-[#1a1438]/40 backdrop-blur-xl shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center"
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

            <AnimatePresence mode="wait">
                {currentStep < steps.length && (
                    <motion.div
                        key={steps[currentStep].id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1">
                                {t.step} {currentStep + 1} {t.of} {steps.length}
                            </Badge>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {t.steps[currentStep].title}
                            </h2>
                            <p className="text-slate-400">
                                {t.steps[currentStep].subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {steps[currentStep].options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(steps[currentStep].id, opt.id)}
                                    className={`p-6 rounded-2xl border transition-all text-left flex items-center gap-4 group ${state[steps[currentStep].id as keyof QuizState] === opt.id
                                        ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(95,251,253,0.1)]'
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${state[steps[currentStep].id as keyof QuizState] === opt.id
                                        ? 'bg-cyan-500 text-white'
                                        : 'bg-white/5 text-slate-400 group-hover:text-cyan-400'
                                        }`}>
                                        <opt.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold ${state[steps[currentStep].id as keyof QuizState] === opt.id
                                        ? 'text-white'
                                        : 'text-slate-300'
                                        }`}>
                                        {opt.id === '5' || opt.id === '10' || opt.id === '20' || opt.id === '40' ? (t.steps[currentStep].options as any)[`h${opt.id}`] : (t.steps[currentStep].options as any)[opt.id]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {currentStep > 0 && (
                            <button
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                                {t.back}
                            </button>
                        )}
                    </motion.div>
                )}

                {isCalculating && (
                    <motion.div
                        key="calculating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="relative w-24 h-24 mx-auto">
                            <Loader2 className="w-24 h-24 text-cyan-500 animate-spin opacity-20" />
                            <Zap className="w-12 h-12 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">{t.calculating}</h2>
                        <p className="text-slate-400">{t.comparing}</p>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 mb-4">
                                <CheckCircle className="w-4 h-4" />
                                {t.complete}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {t.youAre} {result.potential}%{' '}
                                <span className="text-cyan-400">{t.automatable}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <div className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t.savingsLabel}</div>
                                <div className="text-3xl font-bold text-white" dir="ltr">${result.savings.toLocaleString()}</div>
                                <p className="text-[10px] text-slate-600 mt-2">{t.savingsSub}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                                <div className="text-cyan-400 text-sm mb-1 uppercase tracking-wider font-semibold">{t.planLabel}</div>
                                <div className="text-3xl font-bold text-white">{result.recommendation}</div>
                                <p className="text-[10px] text-cyan-600 mt-2">{t.planSub}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder={t.emailPlaceholder}
                                    value={state.email}
                                    onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
                                />
                            </div>
                            <Button
                                size="xl"
                                onClick={() => {
                                    // Redirect to audit with context
                                    window.location.href = `/offers#audit?email=${encodeURIComponent(state.email)}&industry=${state.industry}&potential=${result.potential}`;
                                }}
                                disabled={!state.email}
                                className="w-full font-bold shadow-[0_10px_30px_rgba(30,174,247,0.3)] bg-gradient-to-r from-blue-600 to-cyan-400 text-white"
                            >
                                {t.cta}
                                <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                            </Button>
                            <button
                                onClick={reset}
                                className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {t.startOver}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return <ChevronRight className={className} />;
}
