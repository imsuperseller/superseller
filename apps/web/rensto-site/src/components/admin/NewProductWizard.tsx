'use client';

import React, { useState } from 'react';
import {
    Package,
    CreditCard,
    Settings,
    ChevronRight,
    Check,
    AlertCircle,
    Plus,
    Trash2,
    Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select-enhanced";
import { toast } from 'sonner';

interface Field {
    name: string;
    type: 'text' | 'number' | 'email';
}

export default function NewProductWizard() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'n8n_workflow',
        subscriptionPrice: '',
        setupFee: '',
        webhookId: '',
    });

    const [inputs, setInputs] = useState<Field[]>([
        { name: 'user_email', type: 'email' }
    ]);

    const steps = [
        { id: 1, title: 'Product Basics', icon: Package },
        { id: 2, title: 'Pricing Engine', icon: CreditCard },
        { id: 3, title: 'Workflow Config', icon: Settings },
    ];

    const generateSlug = (name: string) => {
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'name') {
            generateSlug(value);
        }
    };

    const addInput = () => {
        setInputs([...inputs, { name: '', type: 'text' }]);
    };

    const removeInput = (index: number) => {
        const newInputs = [...inputs];
        newInputs.splice(index, 1);
        setInputs(newInputs);
    };

    const updateInput = (index: number, key: keyof Field, value: string) => {
        const newInputs = [...inputs];
        // @ts-ignore
        newInputs[index][key] = value;
        setInputs(newInputs);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                pricing: {
                    subscription: Math.round(parseFloat(formData.subscriptionPrice) * 100),
                    setup: Math.round(parseFloat(formData.setupFee || '0') * 100)
                },
                n8n: {
                    webhookId: formData.webhookId,
                    inputs
                }
            };

            const response = await fetch('/api/admin/products/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success('Product Created Successfully!');
            // Reset form or redirect
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-800 -z-10" />
                {steps.map((s) => (
                    <div
                        key={s.id}
                        className={`flex flex-col items-center gap-2 bg-[#1a153f] px-4 py-2 rounded-xl border-2 transition-colors ${step >= s.id
                            ? 'border-[#5ffbfd] text-[#5ffbfd]'
                            : 'border-gray-700 text-gray-500'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.id ? 'bg-[#5ffbfd] text-black' : 'bg-gray-800'
                            }`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">{s.title}</span>
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <Card className="border-[#5ffbfd]/20 bg-[#1a153f]/50 backdrop-blur-lg">
                <CardContent className="p-8">
                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Daily Social Poster"
                                    className="border-white/10 bg-black/20 focus:border-[#5ffbfd]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>URL Slug (Auto-generated)</Label>
                                <Input
                                    name="slug"
                                    value={formData.slug}
                                    disabled
                                    className="border-white/10 bg-black/40 text-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="What does this agent do?"
                                    className="border-white/10 bg-black/20 focus:border-[#5ffbfd] min-h-[100px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Monthly Subscription ($)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                        <Input
                                            name="subscriptionPrice"
                                            type="number"
                                            value={formData.subscriptionPrice}
                                            onChange={handleInputChange}
                                            className="pl-8 border-white/10 bg-black/20 focus:border-[#5ffbfd]"
                                            placeholder="49.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>One-Time Setup Fee ($)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                                        <Input
                                            name="setupFee"
                                            type="number"
                                            value={formData.setupFee}
                                            onChange={handleInputChange}
                                            className="pl-8 border-white/10 bg-black/20 focus:border-[#5ffbfd]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-[#5ffbfd]/10 border border-[#5ffbfd]/20 text-[#5ffbfd] text-sm flex gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Values entered here will automatically create live Stripe Products and Prices.
                                    Ensure these are final before creating.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tech Config */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="space-y-2">
                                <Label>n8n Webhook ID (Production)</Label>
                                <Input
                                    name="webhookId"
                                    value={formData.webhookId}
                                    onChange={handleInputChange}
                                    placeholder="e.g. social-poster-prod"
                                    className="border-white/10 bg-black/20 focus:border-[#5ffbfd] font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Required User Inputs</Label>
                                    <Button onClick={addInput} size="sm" variant="outline" className="h-8 border-[#5ffbfd]/30 text-[#5ffbfd] hover:bg-[#5ffbfd]/10">
                                        <Plus className="w-4 h-4 mr-1" /> Add Field
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {inputs.map((field, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Input
                                                value={field.name}
                                                onChange={(e) => updateInput(index, 'name', e.target.value)}
                                                placeholder="Field Name (e.g. company_url)"
                                                className="flex-1 border-white/10 bg-black/20 font-mono text-sm"
                                            />
                                            <Select
                                                value={field.type}
                                                onValueChange={(val: string) => updateInput(index, 'type', val as Field['type'])}
                                            >
                                                <SelectTrigger className="w-[120px] border-white/10 bg-black/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="number">Number</SelectItem>
                                                    <SelectItem value="email">Email</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeInput(index)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-8 border-t border-white/10">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className="text-gray-400 hover:text-white"
                        >
                            Back
                        </Button>

                        {step < 3 ? (
                            <Button
                                onClick={() => setStep(s => Math.min(3, s + 1))}
                                className="bg-[#5ffbfd] text-black hover:bg-[#5ffbfd]/90"
                            >
                                Next Step <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-[#fe3d51] text-white hover:bg-[#fe3d51]/90 min-w-[140px]"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Product'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
