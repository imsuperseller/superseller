'use client';

import React, { useState } from 'react';
import { DemoForm } from './DemoForm';
import { DemoResult } from './DemoResult';
import { FileText, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ContractDemo() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: Record<string, string>) => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/demos/contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const resData = await response.json();
            setResult(resData);
        } catch (error) {
            console.error('Contract demo failed:', error);
            setResult({ error: "Service temporarily unavailable." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <DemoForm
                    title="Contract Automator"
                    description="Instantly generate legally-binding agreements based on custom project parameters."
                    fields={[
                        { id: 'clientName', label: 'Client Name', placeholder: 'e.g. Acme Corp', required: true },
                        { id: 'projectType', label: 'Project Type', placeholder: 'e.g. n8n Automation', required: true },
                        { id: 'budget', label: 'Project Budget', placeholder: 'e.g. 5000', type: 'number' },
                        { id: 'email', label: 'Recipient Email', placeholder: 'Demo target email', type: 'email', required: true }
                    ]}
                    submitLabel="Generate Agreement"
                    onSubmit={handleSubmit}
                    successMessage="Agreement drafted and staging environment initialized."
                />

                <Card className="border-cyan-500/10 bg-cyan-500/5 text-xs text-muted-foreground italic">
                    <CardContent className="p-4 flex gap-3">
                        <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
                        <p>Our system uses eSignatures.com API to dynamically inject data into pre-approved legal templates, ensuring 100% compliance automatically.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Agreement Metadata Preview</span>
                </div>

                {loading || result ? (
                    <DemoResult
                        title="Generated Document Data"
                        data={result || { status: "Assembling legal clauses...", logic: "Template Mapping" }}
                        isLoading={loading}
                    />
                ) : (
                    <div className="border border-dashed border-cyan-500/20 rounded-lg h-64 flex items-center justify-center text-center p-8 bg-muted/5">
                        <div className="space-y-2">
                            <div className="text-cyan-500/40 font-mono text-sm uppercase">Drafting engine idle...</div>
                            <p className="text-xs text-muted-foreground max-w-[200px]">Fill out the form to see how we automate the legal paperwork.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
