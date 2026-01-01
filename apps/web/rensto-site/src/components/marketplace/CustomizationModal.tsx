'use client';

import React, { useState } from 'react';
import { X, Loader2, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';

interface ParameterField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'url' | 'select' | 'file' | 'number';
    placeholder?: string;
    required?: boolean;
    options?: string[]; // For select type
    hint?: string;
}

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    workflowName: string;
    workflowId: string;
    parametersSchema: ParameterField[];
    estimatedTime?: string;
    complexity?: 'Basic' | 'Intermediate' | 'Advanced';
    perRunCost?: number;
}

export function CustomizationModal({
    isOpen,
    onClose,
    workflowName,
    workflowId,
    parametersSchema,
    estimatedTime = '24-48 hours',
    complexity = 'Intermediate',
    perRunCost,
}: CustomizationModalProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleInputChange = (fieldId: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Submit to n8n webhook for customization
            const response = await fetch('/api/marketplace/customize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId,
                    parameters: formData,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                // Auto-close after 3 seconds
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setFormData({});
                }, 3000);
            } else {
                setError(data.error || 'Customization failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getComplexityColor = (level: string) => {
        switch (level) {
            case 'Basic': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const isFormValid = parametersSchema
        .filter(field => field.required)
        .every(field => formData[field.id]?.trim());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #1a1438 0%, #110d28 100%)' }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#1a1438]/95 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-cyan-400" />
                            Customize Workflow
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">{workflowName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Customization Submitted!</h3>
                        <p className="text-slate-400">
                            We're preparing your personalized workflow. You'll receive an email when it's ready.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Workflow Info */}
                        <div className="flex flex-wrap gap-2">
                            <Badge className={getComplexityColor(complexity)}>{complexity}</Badge>
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                Est. {estimatedTime}
                            </Badge>
                            {perRunCost && (
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                    ~${perRunCost.toFixed(2)}/run
                                </Badge>
                            )}
                        </div>

                        {/* Dynamic Form Fields */}
                        <div className="space-y-4">
                            {parametersSchema.map((field) => (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                    </label>

                                    {field.type === 'select' ? (
                                        <select
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
                                            required={field.required}
                                        >
                                            <option value="" className="bg-[#1a1438]">Select...</option>
                                            {field.options?.map((option) => (
                                                <option key={option} value={option} className="bg-[#1a1438]">
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            type={field.type}
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                                        />
                                    )}

                                    {field.hint && (
                                        <p className="text-xs text-slate-500 mt-1">{field.hint}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isFormValid || isSubmitting}
                                className="flex-1 font-bold"
                                style={{ background: isFormValid ? 'var(--rensto-gradient-primary)' : undefined }}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Start Customization'
                                )}
                            </Button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-center text-slate-500">
                            Our team will configure and test your workflow before delivery.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

// Export mock schema for testing/demo purposes
export const MOCK_FLOOR_PLAN_SCHEMA: ParameterField[] = [
    {
        id: 'email',
        label: 'Your Email',
        type: 'email',
        placeholder: 'you@company.com',
        required: true,
        hint: 'We\'ll send the generated tour to this address.'
    },
    {
        id: 'propertyStyle',
        label: 'Property Style',
        type: 'select',
        options: ['Modern', 'Traditional', 'Minimalist', 'Industrial', 'Scandinavian'],
        required: true
    },
    {
        id: 'brandName',
        label: 'Your Brand/Company Name',
        type: 'text',
        placeholder: 'Luxury Realty Inc.',
        required: false,
        hint: 'Optional: For watermarking the final video.'
    }
];

export const MOCK_YOUTUBE_CLONER_SCHEMA: ParameterField[] = [
    {
        id: 'channelUrl',
        label: 'YouTube Channel URL',
        type: 'url',
        placeholder: 'https://youtube.com/@channel',
        required: true,
        hint: 'The channel you want to analyze and clone.'
    },
    {
        id: 'telegramHandle',
        label: 'Telegram Username (for chat)',
        type: 'text',
        placeholder: '@yourusername',
        required: true
    }
];
