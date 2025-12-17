'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        if (!token) {
            // Redirect to error page
            window.location.href = '/auth/error?reason=missing_token';
            return;
        }

        // The actual verification happens server-side via the API route
        // This page just shows a loading state before the redirect
        const verifyToken = async () => {
            try {
                // Call the verify endpoint which will redirect on success
                const response = await fetch(`/api/auth/magic-link/verify?token=${token}`, {
                    redirect: 'follow'
                });

                if (response.redirected) {
                    window.location.href = response.url;
                } else if (!response.ok) {
                    window.location.href = '/auth/error?reason=invalid_token';
                }
            } catch {
                window.location.href = '/auth/error?reason=verification_failed';
            }
        };

        // Small delay for visual feedback
        setTimeout(verifyToken, 500);
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--rensto-bg-primary)' }}>
            <div
                className="max-w-md w-full rounded-2xl p-8 text-center"
                style={{
                    background: 'var(--rensto-bg-card)',
                    border: '1px solid rgba(95, 251, 253, 0.3)'
                }}
            >
                {status === 'verifying' && (
                    <>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'rgba(95, 251, 253, 0.2)' }}
                        >
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--rensto-cyan)' }} />
                        </div>
                        <h1
                            className="text-2xl font-bold mb-4"
                            style={{ color: 'var(--rensto-text-primary)' }}
                        >
                            Verifying Your Access
                        </h1>
                        <p style={{ color: 'var(--rensto-text-secondary)' }}>
                            Please wait while we authenticate your session...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                        >
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h1
                            className="text-2xl font-bold mb-4"
                            style={{ color: 'var(--rensto-text-primary)' }}
                        >
                            Access Verified!
                        </h1>
                        <p style={{ color: 'var(--rensto-text-secondary)' }}>
                            Redirecting to your dashboard...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--rensto-bg-primary)' }}>
                <div className="text-white">Loading...</div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
