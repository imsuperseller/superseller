'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, ArrowRight, Target } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ScorecardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ScorecardModal({ isOpen, onClose }: ScorecardModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: ''
    });
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        if (isOpen) {
            trackEvent('scorecard_open');
        }
    }, [isOpen, trackEvent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/scorecard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            trackEvent('scorecard_submit', { company: formData.company });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ name: '', email: '', company: '' });
            }, 3000);
        } catch (error) {
            console.error('Scorecard submission error:', error);
            trackEvent('scorecard_error', { error: String(error) });
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-md rounded-2xl border-2 p-8 animate-in fade-in zoom-in duration-300"
                style={{
                    background: 'var(--superseller-bg-card)',
                    borderColor: 'var(--superseller-accent-cyan)',
                    boxShadow: 'var(--superseller-glow-primary)'
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-white/70" />
                </button>

                {success ? (
                    <div className="text-center py-8">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'rgba(95, 251, 253, 0.2)' }}
                        >
                            <CheckCircle className="w-8 h-8" style={{ color: 'var(--superseller-accent-cyan)' }} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--superseller-text-primary)' }}>
                            Scorecard Sent!
                        </h3>
                        <p style={{ color: 'var(--superseller-text-secondary)' }}>
                            Check your email for your personalized automation readiness scorecard.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'rgba(254, 61, 81, 0.2)' }}
                            >
                                <Target className="w-6 h-6" style={{ color: 'var(--superseller-primary)' }} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--superseller-text-primary)' }}>
                                Get Your Scorecard
                            </h2>
                            <p className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>
                                See how ready your business is for automation.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--superseller-text-secondary)' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                    style={{
                                        background: 'var(--superseller-bg-secondary)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--superseller-text-primary)',
                                        borderColor: 'rgba(254, 61, 81, 0.3)'
                                    }}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--superseller-text-secondary)' }}>
                                    Work Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                    style={{
                                        background: 'var(--superseller-bg-secondary)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--superseller-text-primary)',
                                        borderColor: 'rgba(254, 61, 81, 0.3)'
                                    }}
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--superseller-text-secondary)' }}>
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                                    style={{
                                        background: 'var(--superseller-bg-secondary)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'var(--superseller-text-primary)',
                                        borderColor: 'rgba(254, 61, 81, 0.3)'
                                    }}
                                    placeholder="Acme Inc."
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                                style={{
                                    background: 'var(--superseller-gradient-primary)',
                                    boxShadow: 'var(--superseller-glow-primary)'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Get My Scorecard
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
