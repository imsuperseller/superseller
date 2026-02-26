'use client';

import React, { useState } from 'react';
import { X, Loader2, CheckCircle, Zap, Shield, HelpCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

interface ParameterField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'url' | 'select' | 'file' | 'number';
    placeholder?: string;
    required?: boolean;
    options?: string[]; // For select type
    hint?: string;
}

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    workflowName: string;
    workflowId: string;
    parametersSchema: ParameterField[];
    estimatedTime?: string;
    complexity?: 'Basic' | 'Intermediate' | 'Advanced';
    perRunCost?: number;
    title?: string;
    description?: string;
    submitLabel?: string;
    oneTimeCost?: number;
    maintenanceCost?: number;
    maintenanceExplanation?: string;
    customerEmail?: string;
    lang?: 'en' | 'he';
}

export function CustomizationModal({
    isOpen,
    onClose,
    workflowName,
    workflowId,
    parametersSchema,
    estimatedTime = '24-48 hours',
    complexity = 'Intermediate',
    perRunCost,
    title = 'Project Discovery',
    description,
    submitLabel = 'Submit Request',
    oneTimeCost = 1497,
    maintenanceCost = 147,
    maintenanceExplanation = 'Covers API updates, security patches, and 24/7 reliability monitoring.',
    customerEmail = '',
    lang = 'en',
}: CustomizationModalProps) {
    const isRtl = lang === 'he';
    const t = {
        en: {
            aiActive: 'AI Discovery Active',
            strategyDev: 'Strategy Developed',
            roadmapDesc: 'Neural architect has calculated your implementation roadmap and ROI parameters.',
            setupInv: 'Setup Investment',
            serviceMaint: 'Service Maintenance',
            whyMaint: 'Why Maintenance Matters',
            activateSystem: 'Activate System',
            reviewRoadmap: 'Review Roadmap',
            schedule: 'Schedule ($150)',
            strategySession: 'Strategy Session (Free)',
            rerunScan: 'Re-run Discovery Scan',
            cancel: 'Cancel',
            footerNote: 'Our team will configure and test your workflow before delivery.',
            analyzing: "Analyzing Business Goals...",
            identifying: "Identifying Automation Bottlenecks...",
            simulating: "Simulating Neural Integration...",
            calculating: "Calculating ROI Thresholds...",
            optimizing: "Optimizing Deployment Architecture...",
            finalizing: "Finalizing Strategic Blueprint...",
            discovery: 'Project Discovery',
            submit: 'Submit Request'
        },
        he: {
            aiActive: 'אפיון AI פעיל',
            strategyDev: 'האסטרטגיה פותחה',
            roadmapDesc: 'מנוע ה-AI שלנו חישב את מפת הדרכים להטמעה ופרמטרי ה-ROI שלכם.',
            setupInv: 'השקעת הקמה',
            serviceMaint: 'תחזוקת שירות',
            whyMaint: 'למה תחזוקה חשובה?',
            activateSystem: 'הפעלת מערכת',
            reviewRoadmap: 'סקירת תוכנית העבודה',
            schedule: 'תיאום פגישה ($150)',
            strategySession: 'פגישת אסטרטגיה (חינם)',
            rerunScan: 'הרצה מחדש של האפיון',
            cancel: 'ביטול',
            footerNote: 'הצוות שלנו יגדיר ויבדוק את תוכנית העבודה שלכם לפני המסירה.',
            analyzing: "מנתח מטרות עסקיות...",
            identifying: "מזהה צווארי בקבוק באוטומציה...",
            simulating: "מבצע סימולציית אינטגרציה...",
            calculating: "מחשב ספי ROI...",
            optimizing: "מבצע אופטימיזציה לארכיטקטורה...",
            finalizing: "מגבש תוכנית עבודה אסטרטגית...",
            discovery: 'אפיון פרויקט',
            submit: 'שליחת בקשה'
        }
    }[lang];

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [flowState, setFlowState] = useState<'form' | 'calculating' | 'result'>('form');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [thoughtIndex, setThoughtIndex] = useState(0);

    // Persist success state
    React.useEffect(() => {
        if (isOpen) {
            const savedState = localStorage.getItem(`superseller_discovery_${workflowId}`);
            if (savedState === 'result') {
                setFlowState('result');
            }
        }
    }, [isOpen, workflowId]);

    const thoughts = [
        t.analyzing,
        t.identifying,
        t.simulating,
        t.calculating,
        t.optimizing,
        t.finalizing
    ];

    if (!isOpen) return null;

    const handleInputChange = (fieldId: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setFlowState('calculating');
        setProgress(0);
        setThoughtIndex(0);

        // Simulate AI Calculation with progress bar and thought rotation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const next = prev + 1;
                // Switch thoughts every 16%
                if (next % 16 === 0) setThoughtIndex(i => Math.min(i + 1, thoughts.length - 1));
                return next;
            });
        }, 30);

        try {
            // Submit to n8n webhook for customization
            const response = await fetch('/api/marketplace/customize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId,
                    parameters: formData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Wait for progress to reach 100 before showing result
                setTimeout(() => {
                    setFlowState('result');
                    localStorage.setItem(`superseller_discovery_${workflowId}`, 'result');
                    setIsSubmitting(false);
                }, 3100);
            } else {
                setError(data.error || 'Customization failed. Please try again.');
                setFlowState('form');
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            setFlowState('form');
            setIsSubmitting(false);
        }
    };

    const handleActivateSystem = async () => {
        setIsCheckoutLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType: 'marketplace-template',
                    productId: workflowId,
                    tier: 'install',
                    customerEmail: formData.email || customerEmail || '',
                    metadata: {
                        workflowName,
                        source: 'discovery_modal'
                    }
                })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.error || 'Checkout initialization failed.');
                setIsCheckoutLoading(false);
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            setIsCheckoutLoading(false);
        }
    };

    const handleReset = () => {
        localStorage.removeItem(`superseller_discovery_${workflowId}`);
        setFlowState('form');
        setFormData({});
        setProgress(0);
    };

    const getComplexityColor = (level: string) => {
        const normalized = level.toLowerCase();
        if (normalized.includes('basic') || normalized.includes('בסיסי')) return 'bg-green-500/10 text-green-400 border-green-500/20';
        if (normalized.includes('intermediate') || normalized.includes('בינוני')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        if (normalized.includes('advanced') || normalized.includes('מתקדם')) return 'bg-red-500/10 text-red-400 border-red-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const isFormValid = parametersSchema
        .filter(field => field.required)
        .every(field => formData[field.id]?.trim());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #152236 0%, #0d1b2e 100%)' }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#152236]/95 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-cyan-400" />
                            {title === 'Project Discovery' ? t.discovery : title}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">{description || workflowName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {flowState === 'calculating' ? (
                    <div className="p-12 text-center space-y-8">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10" />
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="64" cy="64" r="60"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={377}
                                    strokeDashoffset={377 - (377 * progress) / 100}
                                    className="text-cyan-400 transition-all duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">
                                {progress}%
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white tracking-tight italic uppercase">{t.aiActive}</h3>
                            <div className="h-6 flex items-center justify-center">
                                <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase animate-pulse">
                                    {thoughts[thoughtIndex]}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : flowState === 'result' ? (
                    <div className="p-8 space-y-10">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-[2rem] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">{t.strategyDev}</h2>
                            <p className="text-slate-400 text-sm max-w-sm mx-auto">{t.roadmapDesc}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-2xl" />
                                <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{t.setupInv}</div>
                                <div className="text-4xl font-black text-white tracking-tighter">${oneTimeCost}<span className="text-xs text-cyan-500/60 ml-1 font-bold">USD</span></div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-2xl" />
                                <div className="text-[10px] font-black tracking-widest text-purple-400 uppercase">{t.serviceMaint}</div>
                                <div className="text-4xl font-black text-white tracking-tighter">${maintenanceCost}<span className="text-xs text-purple-400/60 ml-1 font-bold">{isRtl ? '/לחודש' : '/MO'}</span></div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3 relative group">
                            <div className="absolute -inset-0.5 bg-indigo-500/5 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="relative">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-tight mb-2">
                                    <Shield className="w-4 h-4" />
                                    {t.whyMaint}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">{maintenanceExplanation}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                size="xl"
                                className="w-full h-20 bg-emerald-500 text-black hover:bg-emerald-400 font-black text-xl rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.2)] disabled:opacity-50"
                                onClick={handleActivateSystem}
                                disabled={isCheckoutLoading}
                            >
                                <div className="flex items-center gap-3">
                                    {isCheckoutLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            {t.activateSystem}
                                            <Zap className="w-5 h-5 fill-current" />
                                        </>
                                    )}
                                </div>
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-16 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-tight text-xs"
                                    onClick={() => {
                                        onClose();
                                        window.location.href = '#faq';
                                    }}
                                >
                                    {t.reviewRoadmap}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-16 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-tight text-xs"
                                    onClick={() => {
                                        const bookedCount = parseInt(localStorage.getItem('superseller_strategy_booked') || '0');
                                        const url = bookedCount === 0
                                            ? '/contact?type=strategy'
                                            : '/contact?type=strategy-premium';

                                        window.open(url, '_blank');
                                        localStorage.setItem('superseller_strategy_booked', (bookedCount + 1).toString());
                                    }}
                                >
                                    {typeof window !== 'undefined' && parseInt(localStorage.getItem('superseller_strategy_booked') || '0') > 0
                                        ? t.schedule
                                        : t.strategySession}
                                </Button>
                            </div>

                            <button
                                onClick={handleReset}
                                className="w-full py-2 text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
                            >
                                {t.rerunScan}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Workflow Info */}
                        <div className="flex flex-wrap gap-2">
                            <Badge className={getComplexityColor(complexity)}>{complexity}</Badge>
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                {isRtl ? 'כ-' : 'Est. '} {estimatedTime}
                            </Badge>
                            {perRunCost && (
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                    ~${perRunCost.toFixed(2)}{isRtl ? '/הרצה' : '/run'}
                                </Badge>
                            )}
                        </div>

                        {/* Dynamic Form Fields */}
                        <div className="space-y-4">
                            {parametersSchema.map((field) => (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>

                                    {field.type === 'select' ? (
                                        <select
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                                            required={field.required}
                                        >
                                            <option value="" className="bg-[#152236]">{isRtl ? 'בחר...' : 'Select...'}</option>
                                            {field.options?.map((option) => (
                                                <option key={option} value={option} className="bg-[#152236]">
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            type={field.type}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                                        />
                                    )}

                                    {field.hint && (
                                        <p className="text-xs text-slate-500 mt-1">{field.hint}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1"
                            >
                                {t.cancel}
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="flex-1 font-bold"
                                style={{ background: isFormValid ? 'var(--superseller-gradient-primary)' : undefined }}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    submitLabel === 'Submit Request' ? t.submit : submitLabel
                                )}
                            </Button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-center text-slate-500">
                            {t.footerNote}
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

// Export mock schema for testing/demo purposes
export const MOCK_FLOOR_PLAN_SCHEMA: ParameterField[] = [
    {
        id: 'email',
        label: 'Your Email',
        type: 'email',
        placeholder: 'you@company.com',
        required: true,
        hint: 'We\'ll send the generated tour to this address.'
    },
    {
        id: 'propertyStyle',
        label: 'Property Style',
        type: 'select',
        options: ['Modern', 'Traditional', 'Minimalist', 'Industrial', 'Scandinavian'],
        required: true
    },
    {
        id: 'brandName',
        label: 'Your Brand/Company Name',
        type: 'text',
        placeholder: 'Luxury Realty Inc.',
        required: false,
        hint: 'Optional: For watermarking the final video.'
    }
];

export const MOCK_YOUTUBE_CLONER_SCHEMA: ParameterField[] = [
    {
        id: 'channelUrl',
        label: 'YouTube Channel URL',
        type: 'url',
        placeholder: 'https://youtube.com/@channel',
        required: true,
        hint: 'The channel you want to analyze and clone.'
    },
    {
        id: 'telegramHandle',
        label: 'Telegram Username (for chat)',
        type: 'text',
        placeholder: '@yourusername',
        required: true
    }
];
