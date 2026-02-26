'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2, CheckCircle, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';

interface MagicButtonProps {
    customerId: string;
    currentWorkflowId?: string;
    recentErrors?: Array<{
        executionId: string;
        errorMessage: string;
        timestamp: string;
    }>;
    carePlanTier?: 'starter' | 'growth' | 'scale';
    onSuccess?: (caseId: string) => void;
}

export function MagicButton({
    customerId,
    currentWorkflowId,
    recentErrors = [],
    carePlanTier = 'starter',
    onSuccess,
}: MagicButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!description.trim() && recentErrors.length === 0) {
            setError('Please describe your issue or ensure there are captured errors.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/support/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    workflowId: currentWorkflowId,
                    carePlanTier,
                    submissionMethod: 'magic_button',
                    issueDescription: description || 'Automated error detection - see context data',
                    contextData: {
                        recentErrors,
                        capturedAt: new Date().toISOString(),
                    },
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                onSuccess?.(data.caseId);
                // Reset after 3 seconds
                setTimeout(() => {
                    setIsOpen(false);
                    setIsSuccess(false);
                    setDescription('');
                }, 3000);
            } else {
                setError(data.error || 'Failed to create support case');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
                style={{
                    background: 'linear-gradient(135deg, #f47920 0%, #f79d4e 100%)',
                    boxShadow: '0 4px 20px rgba(244, 121, 32, 0.4)',
                }}
            >
                <AlertCircle className="w-6 h-6 text-white" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a1438 0%, #0d1b2e 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-white">Need Help?</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white transition-colors text-lg"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {isSuccess ? (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-white font-medium">Support case created!</p>
                        <p className="text-sm text-slate-400 mt-1">Our AI agent is on it.</p>
                    </div>
                ) : (
                    <>
                        {/* Auto-captured context */}
                        {(currentWorkflowId || recentErrors.length > 0) && (
                            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-cyan-400 font-medium mb-2">Auto-captured context:</p>
                                {currentWorkflowId && (
                                    <p className="text-xs text-slate-400">Workflow: {currentWorkflowId}</p>
                                )}
                                {recentErrors.length > 0 && (
                                    <p className="text-xs text-red-400">{recentErrors.length} recent error(s) detected</p>
                                )}
                            </div>
                        )}

                        {/* Description input */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what's wrong (optional if errors were captured)..."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 outline-none resize-none"
                        />

                        {error && (
                            <p className="text-xs text-red-400 mt-2">{error}</p>
                        )}

                        {/* Submit button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full mt-3 font-bold"
                            style={{ background: 'var(--superseller-gradient-primary)' }}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Issue
                                </>
                            )}
                        </Button>

                        <p className="text-[10px] text-center text-slate-500 mt-3">
                            Our AI agent will analyze and attempt to fix automatically.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
