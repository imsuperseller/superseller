'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoField {
    id: string;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
}

interface DemoFormProps {
    title: string;
    description: string;
    fields: DemoField[];
    submitLabel: string;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    successMessage?: string;
    className?: string;
}

export function DemoForm({
    title,
    description,
    fields,
    submitLabel,
    onSubmit,
    successMessage = "Demo processed successfully!",
    className
}: DemoFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setIsSuccess(true);
        } catch (error) {
            console.error('Demo submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    if (isSuccess) {
        return (
            <Card className={cn("border-green-500/20 bg-green-500/5", className)}>
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-green-400 font-mono italic uppercase tracking-wider">Success!</h3>
                        <p className="text-muted-foreground">{successMessage}</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsSuccess(false)}
                        className="border-green-500/30 hover:bg-green-500/10"
                    >
                        Run Another Demo
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border-cyan-500/20 bg-background/50 backdrop-blur-sm", className)}>
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-mono uppercase italic tracking-tighter">
                    {title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id} className="text-sm font-medium uppercase tracking-widest text-cyan-400/80">
                                {field.label}
                            </Label>
                            <Input
                                id={field.id}
                                type={field.type || 'text'}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="bg-muted/30 border-cyan-500/10 focus:border-cyan-500/40 transition-all duration-300"
                                value={formData[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                        </div>
                    ))}
                    <Button
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-mono font-bold uppercase tracking-widest group"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        )}
                        {submitLabel}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
