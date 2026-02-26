'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Shield } from 'lucide-react';
import { gsap } from 'gsap';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
import { Badge } from '@/components/ui/badge-enhanced';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Entry animation
        gsap.fromTo(cardRef.current,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'expo.out' }
        );

        if (!token) {
            window.location.href = '/auth/error?reason=missing_token';
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`/api/auth/magic-link/verify?token=${token}`, {
                    redirect: 'follow'
                });

                if (response.redirected) {
                    setStatus('success');
                    // Brief delay to show success state
                    setTimeout(() => {
                        window.location.href = response.url;
                    }, 1000);
                } else if (!response.ok) {
                    window.location.href = '/auth/error?reason=invalid_token';
                }
            } catch {
                window.location.href = '/auth/error?reason=verification_failed';
            }
        };

        const timer = setTimeout(verifyToken, 1500);
        return () => clearTimeout(timer);
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--superseller-bg-primary)' }}>
            <AnimatedGridBackground className="opacity-30" />
            <NoiseTexture opacity={0.03} />

            <div
                ref={cardRef}
                className="max-w-md w-full rounded-[3rem] p-12 text-center relative z-10 backdrop-blur-3xl shadow-2xl border"
                style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(95, 251, 253, 0.1)'
                }}
            >
                {/* Subtle Glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />

                <div className="mb-8">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black">
                        Security Protocol
                    </Badge>
                </div>

                {status === 'verifying' && (
                    <div className="space-y-8">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-full h-full rounded-full border border-cyan-500/20 flex items-center justify-center bg-white/[0.03]">
                                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                                Verifying Access
                            </h1>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Our autonomous security layer is validating your authentication token. Please remain on this terminal.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-4">
                            <Shield className="w-4 h-4 text-slate-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                End-to-End Encrypted
                            </span>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                            <div className="relative w-full h-full rounded-full border border-green-500/20 flex items-center justify-center bg-green-500/10">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                                Access Granted
                            </h1>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Security check complete. Initializing your operational environment...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
