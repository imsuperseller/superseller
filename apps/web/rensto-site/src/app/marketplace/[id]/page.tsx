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
import { Badge } from '@/components/ui/badge-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Input } from '@/components/ui/input-enhanced';
import { Schema } from '@/components/seo/Schema';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Template } from '@/types/firestore';

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
    video?: string;
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
                // Try fetching from Firestore first
                const docRef = doc(db, 'templates', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Map Firestore data to Workflow interface
                    setWorkflow({
                        id: data.id,
                        workflowId: data.id,
                        name: data.name,
                        category: data.category,
                        description: data.description,
                        downloadPrice: data.price, // Map price to downloadPrice
                        installPrice: 797, // Default upsell
                        customPrice: 1497, // Default upsell
                        complexity: 'Intermediate',
                        setupTime: '2 hours',
                        features: data.features || [],
                        targetMarket: 'Small Businesses',
                        status: 'Active',
                        video: data.video
                    });
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
                            status: 'Active',
                            video: mock.video
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching workflow:', error);
                // Fallback to MOCK on error
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
                        status: 'Active',
                        video: mock.video
                    });
                }
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
        image: workflow.video ? workflow.video.replace('.mp4', '.jpg') : 'https://rensto.com/assets/brand/dashboard_ui_dark.png',
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
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
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

                                {workflow.video && (
                                    <div className="rounded-2xl overflow-hidden border border-slate-700/50 relative group shadow-2xl bg-black aspect-video">
                                        <video
                                            src={workflow.video}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

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
        id: '4OYGXXMYeJFfAo6X',
        name: 'Celebrity Selfie Video Generator',
        description: 'Create personalized AI video journeys through movie history. Upload a photo and get a merged video where the user stars in iconic scenes. Powered by Higgsfield Kling Omni and delivered via WhatsApp.',
        category: 'Content Engine',
        price: 297,
        features: ['AI Face Swap', 'Multi-Scene Stitching', 'WhatsApp Delivery', 'Custom Movie Presets', 'ImgBB Photo Hosting'],
        video: "http://172.245.56.50/videos/celebrity-selfie-generator.mp4"
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: 'Meta Ad Library Analyzer',
        description: 'Scrapes winning ads from Meta Ad Library and generates detailed replication templates using AI vision analysis. Identifies UGC and testimonial-style ads with precise scene-by-scene breakdowns.',
        category: 'Lead Machine',
        price: 197,
        features: ['Ad Scraping', 'AI Video Analysis', 'Template Generation', 'Boost.Space Storage', 'WhatsApp Trigger Support'],
        video: "http://172.245.56.50/videos/meta-ad-analyzer.mp4"
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: 'YouTube AI Clone',
        description: 'Create an AI persona from any YouTube channel. Extracts transcripts, synthesizes a conversational persona, and lets you chat with the clone via Telegram. Includes Perplexity research tool.',
        category: 'Knowledge Engine',
        price: 347,
        features: ['Transcript Extraction', 'Persona Synthesis', 'Telegram Bot Integration', 'Perplexity Research Tool', 'Session Memory'],
        video: "http://172.245.56.50/videos/youtube-clone.mp4"
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: 'Call Audio Lead Analyzer',
        description: 'Ingests Telnyx call recordings, transcribes them with AI, and creates qualified leads in Workiz with intelligent categorization. Sends email reports via Outlook.',
        category: 'Lead Machine',
        price: 497,
        features: ['Telnyx Integration', 'Audio Transcription', 'Lead Scoring', 'Workiz CRM Sync', 'Outlook Email Reports'],
        video: "http://172.245.56.50/videos/call-audio-analyzer.mp4"
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: 'AI Calendar Assistant',
        description: 'An AI agent that manages your TidyCal calendar. Books meetings, reschedules, checks availability, and detects conflicts via natural chat commands through Telegram or webhooks.',
        category: 'Autonomous Secretary',
        price: 147,
        features: ['Conflict Resolution', 'Natural Language', 'Smart Rescheduling', 'Human Approval Flow', 'Webhook Triggers'],
        video: "http://172.245.56.50/videos/calendar-assistant.mp4"
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: 'Floor Plan to Property Tour',
        description: 'Upload a floor plan and receive a photorealistic video walkthrough. AI generates room renders in multiple styles (Modern, Traditional, Scandinavian) and stitches them into a smooth tour video.',
        category: 'Content Engine',
        price: 397,
        features: ['2D to 3D Conversion', 'Photorealistic Rendering', 'Video Walkthrough', 'Five Interior Styles', 'Email Delivery'],
        video: "http://172.245.56.50/videos/floor-plan-tour.mp4"
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: 'Monthly CRO Insights Bot',
        description: 'Automated monthly analysis of GA4 and Clarity data with actionable CRO recommendations. Identifies rage clicks, scroll depth issues, and generates prioritized action items delivered via Slack.',
        category: 'Knowledge Engine',
        price: 247,
        features: ['Drop-off Analysis', 'Heatmap Integration', 'Monthly Report', 'Slack Reports', 'Error Alerting'],
        video: "http://172.245.56.50/videos/cro-insights.mp4"
    }
];

