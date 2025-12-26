'use client';

import React, { useState } from 'react';
import { DemoForm } from './DemoForm';
import { DemoResult } from './DemoResult';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Info } from 'lucide-react';

export function LeadGenDemo() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: Record<string, string>) => {
        setLoading(true);
        setResult(null);

        try {
            // Simulate real API call to Apify/Instantly logic
            const response = await fetch('/api/demos/lead-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const resData = await response.json();
            setResult(resData);
        } catch (error) {
            console.error('Lead Gen demo failed:', error);
            setResult({ error: "Failed to generate demo leads." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <DemoForm
                    title="Lead Gen Engine"
                    description="Find high-intent leads in your specific niche within seconds."
                    fields={[
                        { id: 'niche', label: 'Business Niche', placeholder: 'e.g. Roofers in Miami', required: true },
                        { id: 'count', label: 'Lead Count', placeholder: 'e.g. 10', type: 'number' },
                        { id: 'email', label: 'Your Email', placeholder: 'For report delivery', type: 'email', required: true }
                    ]}
                    submitLabel="Hunt Leads"
                    onSubmit={handleSubmit}
                    successMessage="Our engine found matching profiles! Check the data output."
                />

                <Card className="border-orange-500/10 bg-orange-500/5">
                    <CardContent className="p-4 flex gap-3 text-xs text-muted-foreground italic">
                        <Info className="w-4 h-4 text-orange-500 shrink-0" />
                        <p>This demo uses our proprietary scraping tech to identify public records and verify contact information in real-time.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Real-Time Output Buffer</span>
                </div>

                {loading || result ? (
                    <DemoResult
                        title="Sourced Lead Data"
                        data={result || { status: "Searching databases...", findings: [] }}
                        isLoading={loading}
                    />
                ) : (
                    <div className="border border-dashed border-cyan-500/20 rounded-lg h-64 flex items-center justify-center text-center p-8 bg-muted/5">
                        <div className="space-y-2">
                            <div className="text-cyan-500/40 font-mono text-sm uppercase">Waiting for input stream...</div>
                            <p className="text-xs text-muted-foreground max-w-[200px]">Fill out the form to see our lead generation engine in action.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
