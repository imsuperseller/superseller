'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Zap, ArrowRight, Gift } from 'lucide-react';

interface CTAPopupProps {
    scrollTriggerPercent?: number; // % of page scrolled before showing
    exitIntentEnabled?: boolean;
    delayMs?: number; // Delay before popup can appear
}

export function CTAPopup({
    scrollTriggerPercent = 50,
    exitIntentEnabled = true,
    delayMs = 5000
}: CTAPopupProps) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);
    const [canShow, setCanShow] = useState(false);

    // Routes where popup should not appear
    const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/control');
    const isAppRoute = pathname?.startsWith('/app') || pathname?.startsWith('/portal');
    const isLoginRoute = pathname === '/login';
    const isOnboardingRoute = pathname?.startsWith('/onboarding') || pathname?.startsWith('/offer');
    const isHiddenRoute = isAdminRoute || isAppRoute || isLoginRoute || isOnboardingRoute;

    // Check localStorage for dismissal
    useEffect(() => {
        const dismissed = localStorage.getItem('rensto_popup_dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
            // Show again after 24 hours
            if (hoursSinceDismissed < 24) {
                setHasBeenShown(true);
            }
        }
    }, []);

    // Delay before popup can appear
    useEffect(() => {
        const timer = setTimeout(() => setCanShow(true), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    // Scroll trigger
    useEffect(() => {
        if (isHiddenRoute || hasBeenShown || !canShow) return;

        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= scrollTriggerPercent && !hasBeenShown) {
                setIsVisible(true);
                setHasBeenShown(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollTriggerPercent, hasBeenShown, canShow, isHiddenRoute]);

    // Exit intent trigger (desktop only)
    useEffect(() => {
        if (!exitIntentEnabled || isHiddenRoute || hasBeenShown || !canShow) return;

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger when mouse leaves through top of viewport
            if (e.clientY <= 0 && !hasBeenShown) {
                setIsVisible(true);
                setHasBeenShown(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [exitIntentEnabled, hasBeenShown, canShow, isHiddenRoute]);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        localStorage.setItem('rensto_popup_dismissed', Date.now().toString());
    }, []);

    if (!isVisible || isHiddenRoute) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            />

            {/* Popup */}
            <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative max-w-lg w-full rounded-3xl p-8 pointer-events-auto animate-in zoom-in-95 fade-in duration-300"
                    style={{
                        background: 'linear-gradient(145deg, rgba(17, 13, 40, 0.98) 0%, rgba(11, 15, 25, 0.98) 100%)',
                        border: '1px solid rgba(95, 251, 253, 0.2)',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(30, 174, 247, 0.15)'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/10"
                        style={{ color: 'var(--rensto-text-muted)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Content */}
                    <div className="text-center">
                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                            style={{
                                background: 'var(--rensto-gradient-secondary)',
                                boxShadow: 'var(--rensto-glow-secondary)'
                            }}
                        >
                            <Gift className="w-8 h-8 text-white" />
                        </div>

                        {/* Headline */}
                        <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--rensto-text-primary)' }}>
                            Wait! Before You Go...
                        </h3>

                        <p className="text-lg mb-6" style={{ color: 'var(--rensto-text-secondary)' }}>
                            Get a <span className="font-bold" style={{ color: 'var(--rensto-cyan)' }}>FREE Automation Audit</span> worth $500.
                            We&apos;ll show you exactly where AI can save you 20+ hours/week.
                        </p>

                        {/* Benefits */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {['No Commitment', '15-Min Call', 'Custom Roadmap'].map((benefit, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full"
                                    style={{
                                        background: 'rgba(95, 251, 253, 0.1)',
                                        color: 'var(--rensto-cyan)'
                                    }}
                                >
                                    <Zap className="w-3 h-3" />
                                    {benefit}
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/custom" onClick={handleClose}>
                                <button
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                    style={{
                                        background: 'var(--rensto-gradient-secondary)',
                                        boxShadow: 'var(--rensto-glow-secondary)'
                                    }}
                                >
                                    Claim My Free Audit
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <button
                                onClick={handleClose}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold transition-all hover:bg-white/5"
                                style={{ color: 'var(--rensto-text-muted)' }}
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
