'use client';

import React, { useState } from 'react';
import {
    Check,
    Clock,
    Zap,
    ArrowRight,
    Award,
    FileText,
    Upload,
    Calendar,
    TrendingUp,
    Package,
    Star
} from 'lucide-react';
import type { SolutionPlan, PricingOption } from '@/types/solution';

interface SolutionOnePagerProps {
    plan: SolutionPlan;
    prospectEmail: string;
    onAccept: (selectedTier: string) => void;
    onScheduleCall: () => void;
    onModify: () => void;
}

export function SolutionOnePager({
    plan,
    prospectEmail,
    onAccept,
    onScheduleCall,
    onModify
}: SolutionOnePagerProps) {
    const [selectedTier, setSelectedTier] = useState<string>(plan.recommendedTier);
    const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Get selected pricing option
    const selectedOption = plan.pricingOptions.find(opt => opt.id === selectedTier);

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--rensto-bg-card)' }}
        >
            {/* Header */}
            <div
                className="p-8 border-b"
                style={{
                    background: 'var(--rensto-gradient-brand)',
                    borderColor: 'rgba(255,255,255,0.1)'
                }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8" style={{ color: 'var(--rensto-text-primary)' }} />
                    <span
                        className="text-sm font-mono uppercase tracking-wider"
                        style={{ color: 'rgba(255,255,255,0.8)' }}
                    >
                        Custom Solution Proposal
                    </span>
                </div>
                <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    Your Personalized Automation Plan
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Prepared for {prospectEmail}
                </p>
            </div>

            {/* Executive Summary */}
            <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                <h2
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    <FileText className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    Executive Summary
                </h2>
                <p
                    className="text-lg leading-relaxed"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                >
                    {plan.summary}
                </p>
                <div
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{
                        backgroundColor: 'rgba(95, 251, 253, 0.1)',
                        border: '1px solid var(--rensto-cyan)'
                    }}
                >
                    <Zap className="w-4 h-4" style={{ color: 'var(--rensto-cyan)' }} />
                    <span style={{ color: 'var(--rensto-cyan)' }} className="font-medium">
                        Primary Focus: {plan.primaryPain}
                    </span>
                </div>
            </div>

            {/* Pricing Options */}
            <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                <h2
                    className="text-xl font-bold mb-6 flex items-center gap-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    <Package className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    Select Your Plan
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                    {plan.pricingOptions.map((option: PricingOption) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedTier(option.id)}
                            className={`relative p-6 rounded-xl text-left transition-all ${selectedTier === option.id ? 'ring-2' : ''
                                }`}
                            style={{
                                backgroundColor: 'var(--rensto-bg-secondary)',
                                borderColor: selectedTier === option.id ? 'var(--rensto-cyan)' : 'transparent',
                                ringColor: 'var(--rensto-cyan)',
                                boxShadow: selectedTier === option.id ? 'var(--rensto-glow-accent)' : 'none'
                            }}
                        >
                            {option.isRecommended && (
                                <div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        background: 'var(--rensto-gradient-primary)',
                                        color: 'var(--rensto-text-primary)'
                                    }}
                                >
                                    RECOMMENDED
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <h3
                                    className="text-lg font-bold"
                                    style={{ color: 'var(--rensto-text-primary)' }}
                                >
                                    {option.name}
                                </h3>
                                {selectedTier === option.id && (
                                    <Check className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                                )}
                            </div>

                            <div className="mb-2">
                                <span
                                    className="text-3xl font-bold"
                                    style={{ color: 'var(--rensto-cyan)' }}
                                >
                                    {formatCurrency(option.price)}
                                </span>
                                <span style={{ color: 'var(--rensto-text-muted)' }}> one-time</span>
                            </div>

                            <p
                                className="text-sm mb-3"
                                style={{ color: 'var(--rensto-text-muted)' }}
                            >
                                + {formatCurrency(option.monthlyFee)}/mo maintenance
                            </p>

                            <p
                                className="text-sm"
                                style={{ color: 'var(--rensto-text-secondary)' }}
                            >
                                {option.description}
                            </p>

                            <div className="mt-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color: 'var(--rensto-text-muted)' }} />
                                <span
                                    className="text-sm"
                                    style={{ color: 'var(--rensto-text-muted)' }}
                                >
                                    {option.timeline}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* What's Included */}
            {selectedOption && (
                <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                    <h2
                        className="text-xl font-bold mb-4 flex items-center gap-2"
                        style={{ color: 'var(--rensto-text-primary)' }}
                    >
                        <Star className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                        What&apos;s Included in {selectedOption.name}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                        {selectedOption.includes.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Check
                                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                                    style={{ color: 'var(--rensto-cyan)' }}
                                />
                                <span style={{ color: 'var(--rensto-text-secondary)' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Deliverables */}
            <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                <h2
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    <Package className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    Custom Deliverables
                </h2>
                <div className="space-y-4">
                    {plan.deliverables.map((deliverable, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                        >
                            <h4
                                className="font-bold mb-1"
                                style={{ color: 'var(--rensto-text-primary)' }}
                            >
                                {deliverable.name}
                            </h4>
                            <p
                                className="text-sm mb-2"
                                style={{ color: 'var(--rensto-text-secondary)' }}
                            >
                                {deliverable.description}
                            </p>
                            <div
                                className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded"
                                style={{
                                    backgroundColor: 'rgba(95, 251, 253, 0.1)',
                                    color: 'var(--rensto-cyan)'
                                }}
                            >
                                <TrendingUp className="w-3 h-3" />
                                {deliverable.businessImpact}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                <h2
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    <Calendar className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    Project Timeline
                </h2>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {plan.timeline.phases.map((phase, i) => (
                        <React.Fragment key={i}>
                            <div
                                className="flex-shrink-0 px-4 py-3 rounded-lg text-center min-w-[120px]"
                                style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                            >
                                <div
                                    className="text-sm font-bold"
                                    style={{ color: 'var(--rensto-text-primary)' }}
                                >
                                    {phase.name}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{ color: 'var(--rensto-text-muted)' }}
                                >
                                    {phase.duration}
                                </div>
                            </div>
                            {i < plan.timeline.phases.length - 1 && (
                                <ArrowRight
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{ color: 'var(--rensto-text-muted)' }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <p
                    className="mt-4 text-sm"
                    style={{ color: 'var(--rensto-cyan)' }}
                >
                    Total Duration: {plan.timeline.totalDuration}
                </p>
            </div>

            {/* What We Need */}
            <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                <h2
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    <Upload className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    What We&apos;ll Need From You
                </h2>
                <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--rensto-text-muted)' }}
                >
                    Project timeline starts only after 100% of these items are received.
                </p>
                <div className="space-y-2">
                    {plan.whatWeNeed.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                                style={{
                                    backgroundColor: 'rgba(95, 251, 253, 0.2)',
                                    color: 'var(--rensto-cyan)'
                                }}
                            >
                                {i + 1}
                            </div>
                            <span style={{ color: 'var(--rensto-text-secondary)' }}>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ROI Estimate */}
            <div className="p-8 border-b" style={{ borderColor: 'var(--rensto-bg-secondary)' }}>
                <h2
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--rensto-cyan)' }} />
                    Expected ROI
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div
                        className="p-4 rounded-xl text-center"
                        style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                    >
                        <div
                            className="text-3xl font-bold"
                            style={{ color: 'var(--rensto-cyan)' }}
                        >
                            {plan.estimatedROI.hoursSavedPerWeek}h
                        </div>
                        <div style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                            Hours Saved / Week
                        </div>
                    </div>
                    <div
                        className="p-4 rounded-xl text-center"
                        style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                    >
                        <div
                            className="text-3xl font-bold"
                            style={{ color: 'var(--rensto-cyan)' }}
                        >
                            {formatCurrency(plan.estimatedROI.estimatedMonthlySavings)}
                        </div>
                        <div style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                            Monthly Savings
                        </div>
                    </div>
                    <div
                        className="p-4 rounded-xl text-center"
                        style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
                    >
                        <div
                            className="text-3xl font-bold"
                            style={{ color: 'var(--rensto-cyan)' }}
                        >
                            {plan.estimatedROI.breakEvenMonths}
                        </div>
                        <div style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                            Months to Break Even
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="p-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                    <button
                        onClick={() => onAccept(selectedTier)}
                        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 rensto-animate-glow"
                        style={{
                            background: 'var(--rensto-gradient-primary)',
                            color: 'var(--rensto-text-primary)',
                            boxShadow: 'var(--rensto-glow-primary)'
                        }}
                    >
                        Accept & Sign Contract
                        <ArrowRight className="inline w-5 h-5 ml-2" />
                    </button>

                    <button
                        onClick={onScheduleCall}
                        className="px-6 py-4 rounded-xl font-medium transition-all hover:opacity-80"
                        style={{
                            border: '1px solid var(--rensto-text-muted)',
                            color: 'var(--rensto-text-primary)',
                            backgroundColor: 'transparent'
                        }}
                    >
                        Schedule a Call
                    </button>

                    <button
                        onClick={onModify}
                        className="px-6 py-4 rounded-xl font-medium transition-all hover:opacity-80"
                        style={{
                            color: 'var(--rensto-text-muted)',
                            backgroundColor: 'transparent'
                        }}
                    >
                        Request Modifications
                    </button>
                </div>

                <p
                    className="text-center text-xs mt-6"
                    style={{ color: 'var(--rensto-text-muted)' }}
                >
                    This proposal is valid for 48 hours. Questions? Reply to your confirmation email.
                </p>
            </div>
        </div>
    );
}

export default SolutionOnePager;
