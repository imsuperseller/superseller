'use client';

import React from 'react';
import { LeadGenDemo } from '@/components/demos/LeadGenDemo';
import { ContractDemo } from '@/components/demos/ContractDemo';
import { AIAgentDemo } from '@/components/demos/AIAgentDemo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Users, FileCheck, MessageSquare } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function DemosPage() {
    return (
        <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
            <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
                {/* Hero Header */}
                <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase italic bg-gradient-to-b from-white to-muted-foreground bg-clip-text text-transparent">
                        Interactive <span className="text-cyan-400">Demos</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                        Experience the power of Rensto's automation architecture. Real-time sourcing, legal drafting, and AI integration previews.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto">
                    <Tabs defaultValue="lead-gen" className="space-y-8">
                        <div className="flex justify-center">
                            <TabsList className="bg-muted/50 border border-border h-auto p-1 grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl">
                                <TabsTrigger value="lead-gen" className="py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-mono uppercase text-xs tracking-widest">
                                    <Users className="w-4 h-4 mr-2" />
                                    Lead Gen
                                </TabsTrigger>
                                <TabsTrigger value="contract" className="py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-mono uppercase text-xs tracking-widest">
                                    <FileCheck className="w-4 h-4 mr-2" />
                                    Contracts
                                </TabsTrigger>
                                <TabsTrigger value="ai-agent" className="py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-mono uppercase text-xs tracking-widest">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    AI Agents
                                </TabsTrigger>
                                <TabsTrigger value="workflow" disabled className="py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-mono uppercase text-xs tracking-widest opacity-50 cursor-not-allowed">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Workflows
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="lead-gen">
                            <Card className="border-none bg-transparent shadow-none">
                                <LeadGenDemo />
                            </Card>
                        </TabsContent>

                        <TabsContent value="contract">
                            <Card className="border-none bg-transparent shadow-none">
                                <ContractDemo />
                            </Card>
                        </TabsContent>

                        <TabsContent value="ai-agent">
                            <Card className="border-none bg-transparent shadow-none">
                                <AIAgentDemo />
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Info Footer */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-12">
                        <div className="space-y-2">
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Real-Time Processing</h4>
                            <p className="text-sm text-muted-foreground">Our demos simulate actual API payloads and logic paths used in production systems.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Service Customization</h4>
                            <p className="text-sm text-muted-foreground">Every field corresponds to variable mapping in our n8n and Firebase automation backends.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Enterprise Ready</h4>
                            <p className="text-sm text-muted-foreground">Built to scale with secure environment variable management and robust error handling.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
