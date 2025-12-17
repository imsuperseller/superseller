'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');

    const errorMessages: Record<string, { title: string; message: string }> = {
        missing_token: {
            title: 'Missing Link',
            message: 'The authentication link is incomplete. Please click the full link from your email.'
        },
        invalid_token: {
            title: 'Invalid Link',
            message: 'This authentication link is not valid. It may have already been used or was incorrectly copied.'
        },
        expired_token: {
            title: 'Link Expired',
            message: 'This authentication link has expired. Links are valid for 24 hours. Please request a new one.'
        },
        verification_failed: {
            title: 'Verification Failed',
            message: 'We couldn\'t verify your authentication. Please try again or contact support.'
        }
    };

    const error = errorMessages[reason || ''] || {
        title: 'Authentication Error',
        message: 'Something went wrong during authentication. Please try again.'
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--rensto-bg-primary)' }}>
            <div
                className="max-w-md w-full rounded-2xl p-8 text-center"
                style={{
                    background: 'var(--rensto-bg-card)',
                    border: '1px solid rgba(254, 61, 81, 0.3)'
                }}
            >
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'rgba(254, 61, 81, 0.2)' }}
                >
                    <AlertTriangle className="w-8 h-8" style={{ color: 'var(--rensto-primary)' }} />
                </div>

                <h1
                    className="text-2xl font-bold mb-4"
                    style={{ color: 'var(--rensto-text-primary)' }}
                >
                    {error.title}
                </h1>

                <p
                    className="mb-8"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                >
                    {error.message}
                </p>

                <div className="space-y-4">
                    {reason === 'expired_token' && (
                        <Link
                            href="/contact"
                            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-medium transition-all"
                            style={{
                                background: 'var(--rensto-gradient-primary)',
                                color: '#ffffff'
                            }}
                        >
                            <RefreshCw className="w-5 h-5" />
                            Request New Link
                        </Link>
                    )}

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-medium transition-all border"
                        style={{
                            borderColor: 'rgba(254, 61, 81, 0.3)',
                            color: 'var(--rensto-text-primary)'
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                </div>

                <p
                    className="mt-8 text-sm"
                    style={{ color: 'var(--rensto-text-muted)' }}
                >
                    Need help? Contact{' '}
                    <a
                        href="mailto:support@rensto.com"
                        className="underline"
                        style={{ color: 'var(--rensto-cyan)' }}
                    >
                        support@rensto.com
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--rensto-bg-primary)' }}>
                <div className="text-white">Loading...</div>
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
