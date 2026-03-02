'use client';

import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Suspense, useRef, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw, Mail, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
import { Badge } from '@/components/ui/badge-enhanced';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { opacity: 0, scale: 0.95, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'expo.out' }
        );
    }, []);

    const errorMessages: Record<string, { title: string; message: string }> = {
        missing_token: {
            title: 'Incomplete Handshake',
            message: 'The authentication sequence is missing critical data. Please click the full link from your terminal access email.'
        },
        invalid_token: {
            title: 'Unauthorized Access',
            message: 'This authentication token is no longer valid. It may have already been consumed or was malformed during transmission.'
        },
        expired_token: {
            title: 'Token Expired',
            message: 'Your operational access link has timed out. For security, links are only valid for 24 hours. Please request a new initialization.'
        },
        verification_failed: {
            title: 'System Failure',
            message: 'We encountered an error during the authentication handshake. Please attempt to re-establish connection.'
        }
    };

    const error = errorMessages[reason || ''] || {
        title: 'Authentication Error',
        message: 'A critical error occurred during the authentication process. System access denied.'
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--superseller-bg-primary)' }}>
            <AnimatedGridBackground className="opacity-30" />
            <NoiseTexture opacity={0.03} />

            <div
                ref={cardRef}
                className="max-w-md w-full rounded-[3rem] p-12 text-center relative z-10 backdrop-blur-3xl shadow-2xl border"
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(244, 121, 32, 0.15)'
                }}
            >
                {/* Intense Error Glow */}
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-superseller-red/20 blur-[120px] rounded-full" />

                <div className="mb-8">
                    <Badge className="bg-superseller-red/10 text-superseller-red border-superseller-red/20 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black">
                        System Alert
                    </Badge>
                </div>

                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 relative group"
                >
                    <div className="absolute inset-0 bg-superseller-red/20 blur-2xl rounded-full group-hover:bg-superseller-red/30 transition-all duration-500" />
                    <div className="relative w-full h-full rounded-full border border-superseller-red/20 flex items-center justify-center bg-superseller-red/10">
                        <AlertTriangle className="w-10 h-10 text-superseller-red" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">
                    {error.title}
                </h1>

                <p className="mb-12 text-slate-400 font-medium leading-relaxed">
                    {error.message}
                </p>

                <div className="space-y-4">
                    {reason === 'expired_token' && (
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-3 w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all bg-gradient-to-r from-superseller-red to-superseller-orange text-white shadow-xl shadow-superseller-red/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Request New Access
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to operational control
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                        Need Technical Assistance?
                    </p>
                    <a
                        href="mailto:support@superseller.agency"
                        className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs"
                    >
                        <Mail className="w-3 h-3" />
                        support@superseller.agency
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 text-superseller-red animate-spin" />
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
