'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Textarea } from '@/components/ui/textarea-enhanced';
import { FormField, ServiceInstance } from '@/types/firestore';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

interface ConfigurationFormProps {
    schema: FormField[];
    productId: string;
    productName: string;
    clientId: string; // User ID from session or params
    clientEmail?: string;
    paymentIntentId?: string; // Optional, linking to payment
    onComplete?: (instanceId: string) => void;
}

export function ConfigurationForm({
    schema,
    productId,
    productName,
    clientId,
    clientEmail,
    paymentIntentId,
    onComplete
}: ConfigurationFormProps) {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    const handleChange = (fieldId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validate required fields
        for (const field of schema) {
            if (field.required && !answers[field.id]) {
                setError(`Please answer: ${field.label}`);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const response = await fetch('/api/fulfillment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    clientEmail,
                    productId,
                    productName,
                    configuration: answers,
                    paymentIntentId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit configuration');
            }

            setSuccessId(data.instanceId);
            if (onComplete) onComplete(data.instanceId);

            // Redirect to the dynamic client dashboard
            setTimeout(() => {
                router.push(`/dashboard/${clientId}`);
            }, 3000);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successId) {
        return (
            <div className="text-center space-y-4 p-8 bg-green-50/10 rounded-xl border border-green-500/20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Setup Initiated!</h3>
                <p className="text-slate-400">
                    Your agent is being provisioned. You will be redirected to your dashboard shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Configure Your Agent</h3>
                <p className="text-sm text-slate-400">
                    We need a few details to customize {productName} for your business.
                </p>
            </div>

            <div className="space-y-4">
                {schema.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                            <Textarea
                                placeholder={field.placeholder}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                            />
                        ) : field.type === 'select' ? (
                            <select
                                className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            >
                                <option value="" disabled>Select an option</option>
                                {field.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <Input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white"
                            />
                        )}

                        {field.helperText && (
                            <p className="text-xs text-slate-500">{field.helperText}</p>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                variant="renstoPrimary"
                className="w-full h-12"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Provisioning...
                    </>
                ) : (
                    'Activate Agent'
                )}
            </Button>
        </form>
    );
}
