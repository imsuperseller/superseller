'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Zap,
    Download,
    Settings,
    CheckCircle2,
    Clock,
    BarChart3,
    ExternalLink,
    ArrowLeft,
    Loader2,
    Shield,
    Cpu,
    Globe,
    Mail,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Input } from '@/components/ui/input';
import { Schema } from '@/components/seo/Schema';

interface Workflow {
    id: string;
    workflowId: string;
    name: string;
    category: string;
    description: string;
    downloadPrice: number;
    installPrice: number;
    customPrice: number;
    complexity: string;
    setupTime: string;
    features: string[];
    targetMarket: string;
    status: string;
}

export default function WorkflowDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'download' | 'install' | 'custom'>('download');

    useEffect(() => {
        async function fetchWorkflow() {
            try {
                const response = await fetch(`/api/marketplace/${id}`);
                const data = await response.json();

                if (data.success) {
                    setWorkflow(data.workflow);
                } else {
                    // Fallback to MOCK
                    const mock = MOCK_TEMPLATES.find(m => m.id === id);
                    if (mock) {
                        setWorkflow({
                            id: mock.id,
                            workflowId: mock.id,
                            name: mock.name,
                            category: mock.category,
                            description: mock.description,
                            downloadPrice: mock.price,
                            installPrice: 797,
                            customPrice: 1497,
                            complexity: 'Intermediate',
                            setupTime: '2 hours',
                            features: mock.features,
                            targetMarket: 'Small Businesses',
                            status: 'Active'
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching workflow:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchWorkflow();
    }, [id]);

    const handlePurchase = async () => {
        if (!customerEmail || !customerEmail.includes('@')) {
            setShowEmailForm(true);
            return;
        }

        setPurchaseLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType: 'marketplace-template',
                    productId: workflow?.workflowId || id,
                    tier: selectedOption, // 'download' | 'install' | 'custom'
                    customerEmail,
                    metadata: {
                        workflowName: workflow?.name,
                        workflowId: workflow?.workflowId,
                        purchaseType: selectedOption
                    }
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Failed to initiate purchase. Please try again.');
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#110d28] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#fe3d51] animate-spin" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="min-h-screen bg-[#110d28] flex flex-col items-center justify-center text-white space-y-6">
                <h1 className="text-4xl font-bold">Workflow Not Found</h1>
                <Button onClick={() => router.push('/marketplace')} variant="ghost">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Marketplace
                </Button>
            </div>
        );
    }

    const productSchema = {
        name: workflow.name,
        description: workflow.description,
        image: 'https://rensto.com/workflow-placeholder.jpg',
        sku: workflow.workflowId || workflow.id,
        offers: {
            '@type': 'Offer',
            url: `https://rensto.com/marketplace/${workflow.id}`,
            priceCurrency: 'USD',
            price: workflow.downloadPrice,
            availability: 'https://schema.org/InStock'
        }
    };

    const breadcrumbData = {
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://rensto.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Marketplace',
                item: 'https://rensto.com/marketplace'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: workflow.name,
                item: `https://rensto.com/marketplace/${workflow.id}`
            }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Schema type="Product" data={productSchema} />
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <AnimatedGridBackground />
            <Header />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                <Button
                    onClick={() => router.push('/marketplace')}
                    variant="ghost"
                    className="mb-8 text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Marketplace
                </Button>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 font-mono uppercase tracking-widest text-[10px]">
                                    {workflow.category}
                                </Badge>
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                    {workflow.name}
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    {workflow.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Stat icon={BarChart3} label="Complexity" value={workflow.complexity} />
                                <Stat icon={Clock} label="Setup Time" value={workflow.setupTime} />
                                <Stat icon={Zap} label="n8n Powered" value="Verified" />
                                <Stat icon={Shield} label="Security" value="AES-256" />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <div className="w-2 h-8 bg-cyan-500 rounded-full" />
                                Technical Specifications
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {workflow.features && workflow.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 p-4 bg-[#1a1438]/50 border border-slate-700/50 rounded-xl group hover:border-cyan-500/30 transition-all">
                                        <CheckCircle2 className="w-5 h-5 text-cyan-500 mt-0.5" />
                                        <span className="text-slate-300 group-hover:text-white transition-colors">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 space-y-6">
                            <h2 className="text-2xl font-bold">What's Included?</h2>
                            <div className="space-y-4">
                                <IncludeItem text="Complete n8n JSON Template file" />
                                <IncludeItem text="Step-by-step PDF Setup Guide" />
                                <IncludeItem text="Environment Variable Cheat Sheet" />
                                <IncludeItem text="API Integration checklist (Stripe, Twilio, OpenAI, etc.)" />
                                <IncludeItem text="30-day technical support via Discord/Email" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Sidebar */}
                    <div className="space-y-6">
                        <div className="sticky top-24 p-8 rounded-3xl bg-[#1a1438]/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Choose your path</h3>

                                <div
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedOption === 'download'
                                        ? 'border-cyan-500 bg-cyan-500/5'
                                        : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => setSelectedOption('download')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === 'download' ? 'border-cyan-500' : 'border-slate-500'}`}>
                                            {selectedOption === 'download' && <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">Download JSON</div>
                                            <div className="text-xs text-slate-500">Self-installation required</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold">${workflow.downloadPrice}</div>
                                </div>

                                <div
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedOption === 'install'
                                        ? 'border-[#fe3d51] bg-[#fe3d51]/5'
                                        : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => setSelectedOption('install')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === 'install' ? 'border-[#fe3d51]' : 'border-slate-500'}`}>
                                            {selectedOption === 'install' && <div className="w-2.5 h-2.5 bg-[#fe3d51] rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">Expert Implementation</div>
                                            <div className="text-xs text-slate-500">We do the work for you</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold">${workflow.installPrice}</div>
                                </div>

                                <div
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedOption === 'custom'
                                        ? 'border-purple-500 bg-purple-500/5'
                                        : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                    onClick={() => setSelectedOption('custom')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === 'custom' ? 'border-purple-500' : 'border-slate-500'}`}>
                                            {selectedOption === 'custom' && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">Custom Setup</div>
                                            <div className="text-xs text-slate-500">Discovery call + custom config</div>
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold">${workflow.customPrice}</div>
                                </div>
                            </div>

                            {showEmailForm && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Enter delivery email
                                    </label>
                                    <Input
                                        placeholder="you@company.com"
                                        className="bg-black/20 border-slate-700"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        type="email"
                                    />
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        By proceeding, you'll receive the secure download link and login credentials to your fulfillment portal at this address.
                                    </p>
                                </div>
                            )}

                            <Button
                                className={`w-full h-14 text-lg font-bold transition-all ${selectedOption === 'download'
                                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                                    : selectedOption === 'install'
                                        ? 'bg-[#fe3d51] text-white hover:bg-[#ff4d61]'
                                        : 'bg-purple-600 text-white hover:bg-purple-500'
                                    }`}
                                disabled={purchaseLoading}
                                onClick={handlePurchase}
                            >
                                {purchaseLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : selectedOption === 'download' ? (
                                    <>
                                        Download & Automate <Download className="ml-2 w-5 h-5" />
                                    </>
                                ) : selectedOption === 'install' ? (
                                    <>
                                        Get Expert Installation <Settings className="ml-2 w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        Book Custom Setup <Cpu className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800">
                                <div className="flex flex-col items-center gap-1 opacity-50">
                                    <Lock className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] uppercase font-mono">Secure Stripe</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 opacity-50">
                                    <Globe className="w-4 h-4 text-cyan-500" />
                                    <span className="text-[10px] uppercase font-mono">Cloud Native</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="bg-[#1a1438]/50 border border-slate-700/50 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-mono mb-1">
                <Icon className="w-3 h-3" /> {label}
            </div>
            <div className="text-lg font-bold">{value}</div>
        </div>
    );
}

function IncludeItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-slate-400">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
            <span>{text}</span>
        </div>
    );
}

const MOCK_TEMPLATES = [
    {
        id: 'whatsapp-router',
        name: 'WhatsApp Business Router',
        description: 'Intelligently route incoming WhatsApp messages to the correct agent or department accurately.',
        category: 'Operations',
        price: 97,
        features: ['WAHA Integration', 'Intelligent Routing', 'Multi-Agent Support', 'Analytics']
    },
    {
        id: 'rensto-support-agent',
        name: 'AI Support Specialist',
        description: '24/7 AI-powered support agent trained on your company knowledge base for instant answers.',
        category: 'AI Agents',
        price: 197,
        features: ['Gemini RAG', 'Voice Support', 'Knowledge Base Sync', 'Human Handoff']
    },
    {
        id: 'tax4us-agent',
        name: 'Tax Compliance Agent',
        description: 'Specialized AI agent for tax inquiries, law compliance, and customer support with voice support.',
        category: 'AI Agents',
        price: 247,
        features: ['Legal Knowledge Base', 'Document Analysis', 'Compliance Filtering', 'Voice Processing']
    },
    {
        id: 'meatpoint-agent',
        name: 'MeatPoint Sales Agent',
        description: 'Automated sales and support for high-volume retail/wholesale operations via WhatsApp.',
        category: 'Sales',
        price: 197,
        features: ['Inventory Integration', 'Order Processing', 'Customer History', 'Upsell Logic']
    }
];
