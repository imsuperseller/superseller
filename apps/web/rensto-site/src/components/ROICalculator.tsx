'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-react';

import { useAnalytics } from '@/hooks/useAnalytics';

export function ROICalculator() {
    const [hoursPerWeek, setHoursPerWeek] = useState(10);
    const [hourlyRate, setHourlyRate] = useState(50);
    const [isVisible, setIsVisible] = useState(false);
    const { trackEvent } = useAnalytics();

    // Constants
    const INVESTMENT_COST = 5500; // Average custom build cost

    // Calculations
    const weeklySavings = hoursPerWeek * hourlyRate;
    const annualSavings = weeklySavings * 52;
    const firstYearROI = ((annualSavings - INVESTMENT_COST) / INVESTMENT_COST) * 100;
    const paybackWeeks = INVESTMENT_COST / weeklySavings;

    useEffect(() => {
        setIsVisible(true);
        trackEvent('roi_calculator_view');
    }, [trackEvent]);

    // Debounced tracking for slider interactions
    useEffect(() => {
        const timer = setTimeout(() => {
            trackEvent('roi_calculator_interact', {
                hoursPerWeek,
                hourlyRate,
                annualSavings
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [hoursPerWeek, hourlyRate, annualSavings, trackEvent]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <section className="relative w-full max-w-5xl mx-auto my-24 px-4">
            {/* Background Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[rgba(254,61,81,0.1)] via-[rgba(95,251,253,0.05)] to-[rgba(30,174,247,0.1)] blur-3xl rounded-full -z-10" />

            <div
                className={`relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{
                    boxShadow: '0 20px 80px -20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
                }}
            >
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Inputs */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-[rgba(254,61,81,0.2)] to-[rgba(191,87,0,0.2)] border border-[rgba(254,61,81,0.3)]">
                                    <Calculator className="w-6 h-6 text-[var(--rensto-primary)]" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Calculate Your ROI</h2>
                            </div>
                            <p className="text-[var(--rensto-text-secondary)] text-lg">
                                See exactly how much a custom automation system could save your business in the first year.
                            </p>
                        </div>

                        {/* Input: Hours Per Week */}
                        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-[var(--rensto-text-primary)] font-medium">
                                    <Clock className="w-4 h-4 text-[var(--rensto-accent-cyan)]" />
                                    Hours spent on manual tasks (weekly)
                                </label>
                                <span className="text-2xl font-bold text-[var(--rensto-accent-cyan)]">{hoursPerWeek}h</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="40"
                                step="1"
                                value={hoursPerWeek}
                                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--rensto-accent-cyan)]"
                                style={{
                                    backgroundImage: `linear-gradient(to right, var(--rensto-accent-cyan) 0%, var(--rensto-accent-cyan) ${(hoursPerWeek / 40) * 100}%, rgba(255,255,255,0.1) ${(hoursPerWeek / 40) * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-[var(--rensto-text-secondary)]">
                                <span>1 hour</span>
                                <span>40 hours</span>
                            </div>
                        </div>

                        {/* Input: Hourly Rate */}
                        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 text-[var(--rensto-text-primary)] font-medium">
                                    <DollarSign className="w-4 h-4 text-[var(--rensto-primary)]" />
                                    Average hourly rate (fully loaded)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--rensto-text-secondary)]">$</span>
                                    <input
                                        type="number"
                                        min="10"
                                        max="500"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                                        className="w-24 bg-black/30 border border-white/10 rounded-lg py-2 pl-6 pr-3 text-right text-white font-bold focus:outline-none focus:border-[var(--rensto-primary)] transition-colors"
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="200"
                                step="5"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--rensto-primary)]"
                                style={{
                                    backgroundImage: `linear-gradient(to right, var(--rensto-primary) 0%, var(--rensto-primary) ${(hourlyRate / 200) * 100}%, rgba(255,255,255,0.1) ${(hourlyRate / 200) * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(254,61,81,0.1)] to-[rgba(30,174,247,0.1)] rounded-3xl blur-xl" />
                        <div className="relative bg-black/40 border border-white/10 rounded-3xl p-8 space-y-6 backdrop-blur-md">

                            {/* Annual Savings Card */}
                            <div className="text-center space-y-2 pb-6 border-b border-white/10">
                                <p className="text-[var(--rensto-text-secondary)] font-medium uppercase tracking-wider text-sm">Projected Annual Savings</p>
                                <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--rensto-accent-cyan)] to-white animate-in fade-in zoom-in duration-500 key={annualSavings}">
                                    {formatCurrency(annualSavings)}
                                </div>
                                <p className="text-sm text-[var(--rensto-text-secondary)]">
                                    That&apos;s <span className="text-white font-bold">{formatCurrency(weeklySavings)}</span> saved every single week
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* ROI Card */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                    <div className="flex justify-center mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-green-400">
                                        {Math.round(firstYearROI)}%
                                    </div>
                                    <p className="text-xs text-[var(--rensto-text-secondary)] mt-1">First Year ROI</p>
                                </div>

                                {/* Payback Period Card */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                    <div className="flex justify-center mb-2">
                                        <Clock className="w-5 h-5 text-[var(--rensto-accent-cyan)]" />
                                    </div>
                                    <div className="text-2xl font-bold text-[var(--rensto-accent-cyan)]">
                                        {paybackWeeks < 1 ? '< 1' : Math.round(paybackWeeks)} wks
                                    </div>
                                    <p className="text-xs text-[var(--rensto-text-secondary)] mt-1">Payback Period</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <p className="text-xs text-center text-[var(--rensto-text-secondary)] mb-4">
                                    *Based on average custom build cost of {formatCurrency(INVESTMENT_COST)}
                                </p>
                                <button
                                    onClick={() => {
                                        trackEvent('roi_calculator_cta_click', { annualSavings });
                                        document.getElementById('consultation-cta')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="w-full py-4 rounded-xl font-bold text-white transition-all hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 group"
                                    style={{
                                        background: 'var(--rensto-gradient-primary)',
                                        boxShadow: 'var(--rensto-glow-primary)'
                                    }}
                                >
                                    Start Saving Today
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
