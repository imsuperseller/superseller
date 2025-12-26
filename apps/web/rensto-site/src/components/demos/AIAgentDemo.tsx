'use client';

import React, { useState } from 'react';
import { DemoForm } from './DemoForm';
import { DemoResult } from './DemoResult';
import { Bot, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AIAgentDemo() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: Record<string, string>) => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/demos/ai-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const resData = await response.json();
            setResult(resData);
        } catch (error) {
            console.error('AI Agent demo failed:', error);
            setResult({ error: "Intelligence engine currently updating." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
                <DemoForm
                    title="AI Brain Preview"
                    description="Configure a specialist AI agent and witness its contextual reasoning."
                    fields={[
                        { id: 'persona', label: 'Agent Persona', placeholder: 'e.g. Expert Sales Closer', required: true },
                        { id: 'industry', label: 'Company Industry', placeholder: 'e.g. Solar Energy', required: true },
                        { id: 'knowledge', label: 'Specific Knowledge', placeholder: 'e.g. Pricing for 5kW systems', required: true }
                    ]}
                    submitLabel="Initialize Agent"
                    onSubmit={handleSubmit}
                    successMessage="Agent persona established. Review the logic breakdown below."
                />

                <Card className="border-blue-500/10 bg-blue-500/5 text-xs text-muted-foreground italic">
                    <CardContent className="p-4 flex gap-3">
                        <Bot className="w-4 h-4 text-blue-500 shrink-0" />
                        <p>This demo previews how our agents ingest your specific documentation to provide zero-hallucination support via AssemblyAI and custom LLM chains.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span>Contextual Processing Preview</span>
                </div>

                {loading || result ? (
                    <DemoResult
                        title="Agent Brain State"
                        data={result || { status: "Injecting memory buffers...", layer: "Reasoning" }}
                        isLoading={loading}
                    />
                ) : (
                    <div className="border border-dashed border-cyan-500/20 rounded-lg h-64 flex items-center justify-center text-center p-8 bg-muted/5">
                        <div className="space-y-2">
                            <div className="text-cyan-500/40 font-mono text-sm uppercase">Neural engine standby...</div>
                            <p className="text-xs text-muted-foreground max-w-[200px]">Define your agent to see how it structures its knowledge base.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
