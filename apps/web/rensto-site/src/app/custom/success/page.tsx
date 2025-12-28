'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Mail, Calendar, Loader2 } from 'lucide-react';
import Script from 'next/script';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [sessionData, setSessionData] = useState<{
        clientEmail?: string;
        packageName?: string;
        amount?: number;
        clientId?: string;
    } | null>(null);

    useEffect(() => {
        if (sessionId) {
            // Fetch session details
            fetch(`/api/stripe/session?session_id=${sessionId}`)
                .then(res => res.json())
                .then(async (data) => {
                    setSessionData(data);
                    setLoading(false);

                    // Send magic link email if we have client email
                    if (data?.clientEmail && !magicLinkSent) {
                        try {
                            const clientId = data.clientId || `client-${Date.now()}`;

                            // Create client record in Firestore
                            await fetch('/api/clients', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    clientId: clientId,
                                    email: data.clientEmail,
                                    name: data.packageName || 'Customer',
                                    stripeSessionId: sessionId,
                                    amountPaid: data.amount,
                                    selectedTier: data.tier || 'professional',
                                    status: 'paid'
                                })
                            });

                            // Send magic link email
                            await fetch('/api/auth/magic-link/send', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: data.clientEmail,
                                    clientId: clientId,
                                    clientName: data.packageName || 'Customer'
                                })
                            });
                            setMagicLinkSent(true);
                        } catch (error) {
                            console.error('Failed to send magic link:', error);
                        }
                    }
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [sessionId, magicLinkSent]);

    useEffect(() => {
        // TidyCal initialization logic if needed when script loads
    }, []);

    if (loading) {
        return (
            <div className="text-center">
                <Loader2
                    className="w-16 h-16 animate-spin mx-auto mb-4"
                    style={{ color: 'var(--rensto-cyan)' }}
                />
                <p style={{ color: 'var(--rensto-text-secondary)' }}>
                    Confirming your payment...
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Success Icon */}
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 rensto-animate-glow"
                style={{ backgroundColor: 'rgba(95, 251, 253, 0.2)' }}
            >
                <CheckCircle className="w-10 h-10" style={{ color: 'var(--rensto-cyan)' }} />
            </div>

            <h1
                className="text-3xl font-bold mb-4"
                style={{ color: 'var(--rensto-text-primary)' }}
            >
                Payment Successful!
            </h1>

            <p
                className="text-lg mb-8"
                style={{ color: 'var(--rensto-text-secondary)' }}
            >
                Welcome to Rensto. Your automation journey begins now.
            </p>

            {/* What happens next */}
            <div
                className="rounded-xl p-6 mb-8 text-left"
                style={{ backgroundColor: 'var(--rensto-bg-secondary)' }}
            >
                <h2
                    className="text-lg font-bold mb-4"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    What Happens Next
                </h2>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold"
                            style={{
                                backgroundColor: 'rgba(95, 251, 253, 0.2)',
                                color: 'var(--rensto-cyan)'
                            }}
                        >
                            1
                        </div>
                        <div>
                            <p style={{ color: 'var(--rensto-text-primary)' }} className="font-medium">
                                Check Your Email
                            </p>
                            <p style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                We&apos;ve sent your dashboard access link and onboarding instructions.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold"
                            style={{
                                backgroundColor: 'rgba(95, 251, 253, 0.2)',
                                color: 'var(--rensto-cyan)'
                            }}
                        >
                            2
                        </div>
                        <div>
                            <p style={{ color: 'var(--rensto-text-primary)' }} className="font-medium">
                                Discovery Call (Within 24 Hours)
                            </p>
                            <p style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                We&apos;ll reach out to schedule your kickoff meeting.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold"
                            style={{
                                backgroundColor: 'rgba(95, 251, 253, 0.2)',
                                color: 'var(--rensto-cyan)'
                            }}
                        >
                            3
                        </div>
                        <div>
                            <p style={{ color: 'var(--rensto-text-primary)' }} className="font-medium">
                                Submit Required Assets
                            </p>
                            <p style={{ color: 'var(--rensto-text-muted)' }} className="text-sm">
                                Your timeline starts once we receive everything.
                            </p>
                        </div>
                    </div>
                </div>
            </div>



            // ... existing sessionId useEffect ...

            {/* CTA Buttons */}
            <div className="space-y-3">
                <button
                    data-tidycal-offer="rensto/custom-kickoff"
                    data-tidycal-popup="true"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{
                        background: 'var(--rensto-gradient-primary)',
                        color: 'var(--rensto-text-primary)',
                        boxShadow: 'var(--rensto-glow-primary)'
                    }}
                >
                    <Calendar className="w-5 h-5" />
                    Schedule Kickoff Call
                </button>

                <a
                    href={`mailto:${sessionData?.clientEmail || ''}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all hover:bg-white/5"
                    style={{
                        border: '1px solid var(--rensto-text-muted)',
                        color: 'var(--rensto-text-primary)',
                        backgroundColor: 'transparent'
                    }}
                >
                    <Mail className="w-5 h-5" />
                    Check Your Inbox
                </a>
            </div>

            <p
                className="text-xs mt-6"
                style={{ color: 'var(--rensto-text-muted)' }}
            >
                Questions? Contact support@rensto.com
            </p>

            <Script
                src="https://asset-tidycal.b-cdn.net/js/embed.js"
                strategy="lazyOnload"
            />
        </>
    );
}

function LoadingFallback() {
    return (
        <div className="text-center">
            <Loader2
                className="w-16 h-16 animate-spin mx-auto mb-4"
                style={{ color: 'var(--rensto-cyan)' }}
            />
            <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Loading...
            </p>
        </div>
    );
}

export default function CustomSolutionSuccessPage() {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: 'var(--rensto-bg-primary)' }}
        >
            <Header />
            <main className="flex-grow flex items-center justify-center p-8">
                <div
                    className="max-w-lg w-full rounded-2xl p-10 text-center"
                    style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <SuccessContent />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </div>
    );
}
