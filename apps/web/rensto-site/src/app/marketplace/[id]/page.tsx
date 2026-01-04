'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as framer from 'framer-motion';
const { motion, AnimatePresence } = framer;
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
    Lock,
    TrendingUp,
    Rocket,
    ArrowRight,
    Users,
    Globe,
    Shield,
    Check,
    HelpCircle,
    Eye,
    Mail,
    Cpu,
    Fingerprint,
    MessageSquare,
    Copy,
    Share2,
    ChevronLeft,
    Workflow as WorkflowIcon,
    Star,
    Layout,
    Menu,
    Activity,
    CreditCard
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
import { CustomizationModal } from '@/components/marketplace/CustomizationModal';

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
    features: Array<{ title: string; desc: string }>;
    useCases?: Array<{ title: string; desc: string; icon: any }>;
    faqs?: Array<{ q: string; a: string }>;
    kpis?: Array<{ label: string; value: string; icon: any }>;
    targetMarket: string;
    status: string;
    video?: string;
    configurationSchema?: any[];
}

const NoiseTexture = () => (
    <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
    </div>
);

const GlowContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`relative group ${className}`}>
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative">
            {children}
        </div>
    </div>
);

export default function WorkflowDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'download' | 'install' | 'custom'>('download');
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

    useEffect(() => {
        console.log('%c RENSTO PREMIUM ENGINE V2.0 ACTIVE ', 'background: #06b6d4; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;');
    }, []);

    useEffect(() => {
        async function fetchWorkflow() {
            try {
                // Try fetching from Firestore first
                const docRef = doc(db, 'templates', id as string);
                const docSnap = await getDoc(docRef);

                // Find corresponding mock template for fallbacks
                const mock = (MOCK_TEMPLATES as any).find((m: any) => m.id === id);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Map Firestore data to Workflow interface, with MOCK fallbacks for rich content
                    setWorkflow({
                        id: data.id || id as string,
                        workflowId: data.id || id as string,
                        name: data.name || mock?.name || 'Unnamed Workflow',
                        category: data.category || mock?.category || 'Automation',
                        description: data.description || mock?.description || 'No description available.',
                        downloadPrice: data.price || data.downloadPrice || mock?.price || 97,
                        installPrice: data.installPrice || 797,
                        customPrice: data.customPrice || 1497,
                        complexity: data.complexity || 'Intermediate',
                        setupTime: data.setupTime || '2 hours',
                        // Handle features - wrap string to object, try to find matching mock desc if possible
                        features: (data.features && data.features.length > 0)
                            ? (typeof data.features[0] === 'string'
                                ? data.features.map((f: string) => {
                                    const matchingMockFeature = mock?.features?.find((mf: any) =>
                                        mf.title.toLowerCase().includes(f.toLowerCase()) ||
                                        f.toLowerCase().includes(mf.title.toLowerCase())
                                    );
                                    return {
                                        title: f,
                                        desc: matchingMockFeature?.desc || 'Neural-optimized core module engineered for horizontal scaling and mission-critical reliability.'
                                    };
                                })
                                : data.features)
                            : (mock?.features || []),
                        useCases: data.useCases || mock?.useCases || [],
                        faqs: data.faqs || mock?.faqs || [],
                        kpis: (data.kpis && data.kpis.length > 0) ? data.kpis : (mock?.kpis || []),
                        targetMarket: data.targetMarket || mock?.targetMarket || 'Small Businesses',
                        status: data.readinessStatus || data.status || 'Active',
                        video: (data.video && data.video.trim() !== '') ? data.video.replace('http://172.245.56.50', '') : (mock && mock.video ? mock.video.replace('http://172.245.56.50', '') : undefined),
                        configurationSchema: data.configurationSchema || mock?.configurationSchema
                    });
                } else {
                    // Fallback to MOCK
                    if (mock) {
                        setWorkflow({
                            ...mock,
                            features: mock.features || [],
                            downloadPrice: mock.price || 97,
                            installPrice: 797,
                            customPrice: 1497,
                            complexity: 'Intermediate',
                            setupTime: '2 hours',
                            targetMarket: 'Small Businesses',
                            status: 'Active',
                            video: mock.video ? mock.video.replace('http://172.245.56.50', '') : undefined,
                        } as any);
                    }
                }
            } catch (error) {
                console.error('Error fetching workflow:', error);
                // Fallback to MOCK on error
                const mock = (MOCK_TEMPLATES as any).find((m: any) => m.id === id);
                if (mock) {
                    setWorkflow({
                        ...mock,
                        features: mock.features || [],
                        downloadPrice: mock.price || 97,
                        installPrice: 797,
                        customPrice: 1497,
                        complexity: 'Intermediate',
                        setupTime: '2 hours',
                        targetMarket: 'Small Businesses',
                        status: 'Active',
                        video: mock.video ? mock.video.replace('http://172.245.56.50', '') : undefined,
                    } as any);
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
        image: 'https://www.rensto.com/assets/brand/dashboard_ui_dark.webp',
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0f0c29]" style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}>
            <Schema type="Product" data={productSchema} />
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <NoiseTexture />

            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <AnimatedGridBackground />
            <Header />

            <main className="flex-grow relative z-10">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="container mx-auto max-w-7xl relative z-10"
                    >
                        <div className="flex flex-col lg:flex-row gap-16 items-start">
                            {/* Left Content */}
                            <div className="flex-1 space-y-12">
                                <motion.div variants={itemVariants}>
                                    <Link
                                        href="/marketplace"
                                        className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors group mb-8"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
                                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                        </div>
                                        Back to Marketplace
                                    </Link>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                                        {workflow.name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? 'text-white' : 'text-white/40'}>{word} </span>
                                        ))}
                                    </motion.h1>

                                    <motion.p variants={itemVariants} className="text-xl text-slate-400 leading-relaxed max-w-2xl font-medium">
                                        {workflow.description}
                                    </motion.p>
                                </div>

                                {/* Results KPI Bar */}
                                {workflow.kpis && workflow.kpis.length > 0 && (
                                    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-0 p-1 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-md overflow-hidden">
                                        {workflow.kpis.map((kpi, idx) => {
                                            const KpiIcon = kpi.icon || TrendingUp;
                                            return (
                                                <div key={idx} className={`p-8 space-y-3 relative group hover:bg-white/[0.02] transition-colors ${idx !== 2 ? 'border-r border-white/[0.05]' : ''}`}>
                                                    <div className="flex items-center gap-3 text-cyan-400 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <KpiIcon className="w-4 h-4" />
                                                        {kpi.label}
                                                    </div>
                                                    <div className="text-3xl font-black text-white tracking-tight">{kpi.value}</div>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {/* Video Preview UI */}
                                <motion.div variants={itemVariants} className="relative group aspect-video rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-[0_0_100px_rgba(6,182,212,0.1)]">
                                    {workflow.video ? (
                                        <video
                                            src={workflow.video}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1438] to-[#0f0c29]">
                                            <WorkflowIcon className="w-24 h-24 text-white/5 animate-pulse" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0922] via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-10 left-10 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Eye className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-white font-bold tracking-tight">Interactive Preview Active</div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-[0.2em] text-[10px] font-black rounded-full">
                                        {workflow.category}
                                    </Badge>
                                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 uppercase tracking-[0.2em] text-[10px] font-black rounded-full flex items-center gap-2">
                                        <Shield className="w-3 h-3" />
                                        Verified Asset
                                    </Badge>
                                </motion.div>

                                {/* Deployment Roadmap */}
                                <motion.div variants={itemVariants} className="space-y-10 pt-12">
                                    <div className="flex items-center gap-4">
                                        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-cyan-500" />
                                        <div className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                            Deployment Roadmap
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <StepCard
                                            number="01"
                                            title="Secure Checkout"
                                            desc="Instant activation via encrypted Stripe link."
                                            icon={Lock}
                                        />
                                        <StepCard
                                            number="02"
                                            title="Cloud Sync"
                                            desc="Direct delivery of the n8n blueprint to your inbox."
                                            icon={Mail}
                                        />
                                        <StepCard
                                            number="03"
                                            title="Go Live"
                                            desc="Import, configure keys, and start automating."
                                            icon={Rocket}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* RIGHT COLUMN: Sticky Purchase Card */}
                            <div className="lg:w-[440px] shrink-0 w-full">
                                <motion.div
                                    variants={itemVariants}
                                    className="sticky top-32 space-y-8"
                                >
                                    <div className="p-10 rounded-[3rem] bg-white/[0.04] backdrop-blur-[40px] border border-white/10 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />

                                        <div className="relative z-10 space-y-10">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Acquisition Tier</span>
                                                    <Badge variant="outline" className="border-white/10 text-white/40 text-[9px]">v1.4.2</Badge>
                                                </div>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-7xl font-black text-white tracking-tighter">
                                                        ${selectedOption === 'download' ? workflow.downloadPrice : selectedOption === 'install' ? workflow.installPrice : workflow.customPrice}
                                                    </span>
                                                    <span className="text-slate-500 font-bold text-lg">USD</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <OptionTab
                                                    active={selectedOption === 'download'}
                                                    onClick={() => setSelectedOption('download')}
                                                    icon={Download}
                                                    price={workflow.downloadPrice}
                                                    label="Download Template"
                                                    desc="Best for tech-savvy users"
                                                />
                                                <OptionTab
                                                    active={selectedOption === 'install'}
                                                    onClick={() => setSelectedOption('install')}
                                                    icon={Layout}
                                                    price={workflow.installPrice}
                                                    label="Setup & Installation"
                                                    desc="We configure everything"
                                                    accent="red"
                                                />
                                                <OptionTab
                                                    active={selectedOption === 'custom'}
                                                    onClick={() => setSelectedOption('custom')}
                                                    icon={Cpu}
                                                    price={workflow.customPrice}
                                                    label="Bespoke Solution"
                                                    desc="Tailored for your business"
                                                    accent="purple"
                                                />
                                            </div>

                                            <div className="space-y-6">
                                                <AnimatePresence mode="wait">
                                                    {showEmailForm && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="space-y-3"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                                    Delivery Address
                                                                </label>
                                                                <Star className="w-3 h-3 text-cyan-500" />
                                                            </div>
                                                            <Input
                                                                placeholder="you@company.com"
                                                                className="bg-white/5 border-white/10 h-16 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 transition-all text-white font-bold"
                                                                value={customerEmail}
                                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                                type="email"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <Button
                                                    size="xl"
                                                    className={`w-full h-20 text-xl font-black rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${selectedOption === 'download' ? 'bg-cyan-400 text-black hover:bg-cyan-300' :
                                                        selectedOption === 'install' ? 'bg-[#fe3d51] text-white hover:bg-[#ff4d61]' :
                                                            'bg-purple-500 text-white hover:bg-purple-400'
                                                        }`}
                                                    disabled={purchaseLoading}
                                                    onClick={handlePurchase}
                                                >
                                                    {purchaseLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                        <div className="flex items-center justify-center gap-3">
                                                            Initiate Deployment
                                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-center gap-8 pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="text-[9px] font-bold tracking-widest uppercase">Encrypted</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                                    <Activity className="w-4 h-4" />
                                                    <span className="text-[9px] font-bold tracking-widest uppercase">Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Support Card */}
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center gap-6 group cursor-pointer hover:bg-white/[0.04] transition-all"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                                            <MessageSquare className="w-7 h-7 text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="font-black text-white tracking-tight">Enterprise Advisory</div>
                                            <p className="text-sm text-slate-500 font-medium">Chat with the architects behind this engine.</p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Technical Specifications Grid */}
                <section className="py-32 px-6 relative overflow-hidden bg-[#0d0922]/50 border-y border-white/5">
                    <div className="container mx-auto max-w-7xl relative z-10">
                        <div className="grid lg:grid-cols-2 gap-32">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="space-y-16"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                        Advanced Specifications
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Technical Infrastructure</h2>
                                </div>

                                <div className="grid sm:grid-cols-1 gap-6">
                                    {workflow.features.map((feature, idx) => (
                                        <PremiumFeatureCard
                                            key={idx}
                                            title={feature.title}
                                            desc={feature.desc}
                                            idx={idx}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="space-y-16"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-purple-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                        Operational Intelligence
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">Strategic Blueprint</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-600/10 via-white/[0.02] to-transparent border border-purple-500/20 backdrop-blur-xl space-y-12 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl" />
                                        {[
                                            { label: 'Primary Market', val: workflow?.targetMarket },
                                            { label: 'Neural Complexity', val: workflow?.complexity },
                                            { label: 'Activation Window', val: workflow?.setupTime }
                                        ].map((item, i) => (
                                            <div key={i} className={`flex justify-between items-end ${i !== 2 ? 'pb-12 border-b border-white/[0.05]' : ''} relative z-10`}>
                                                <div className="space-y-2">
                                                    <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">{item.label}</div>
                                                    <div className="w-8 h-[2px] bg-purple-500/30" />
                                                </div>
                                                <div className="text-white font-black text-2xl tracking-tighter uppercase italic">{item.val}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-8 group hover:bg-indigo-500/10 transition-all cursor-cell relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors">
                                            <Globe className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="text-2xl font-black text-white tracking-tight uppercase italic">Global Edge Distribution</div>
                                            <p className="text-base text-slate-400 leading-relaxed font-semibold opacity-70 group-hover:opacity-100 transition-opacity">Engineered for localized low-latency execution on high-compute n8n clusters worldwide.</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                {workflow.useCases && workflow.useCases.length > 0 && (
                    <section className="py-32 px-6 relative bg-black/20 border-b border-white/5">
                        <div className="container mx-auto max-w-7xl">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-emerald-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Deployment Scenarios
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Infinite Utility</h2>
                                </div>
                                <p className="text-xl text-slate-500 max-w-md font-medium">Wherever there is a digital pulse, this engine can deliver transformative impact.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {workflow.useCases.map((useCase, idx) => {
                                    const CaseIcon = useCase.icon || Rocket;
                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -10 }}
                                            className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                                <CaseIcon className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{useCase.title}</h3>
                                            <p className="text-slate-400 leading-relaxed font-medium">{useCase.desc}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ Section */}
                {workflow.faqs && workflow.faqs.length > 0 && (
                    <section className="py-32 px-6 relative">
                        <div className="container mx-auto max-w-4xl relative z-10">
                            <div className="text-center mb-24 space-y-6">
                                <div className="inline-flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em] mb-4">
                                    <HelpCircle className="w-4 h-4" />
                                    Security & Protocol
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Knowledge Base</h2>
                            </div>
                            <div className="space-y-4">
                                {workflow.faqs.map((faq, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group cursor-help"
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                                                <span className="text-xs font-black text-slate-500 group-hover:text-cyan-400">Q</span>
                                            </div>
                                            <div className="space-y-4 pt-1">
                                                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">{faq.q}</h3>
                                                <p className="text-slate-400 leading-relaxed font-medium pl-0 border-l-2 border-white/5 pl-6 group-hover:border-cyan-500/30 transition-colors">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />

            <CustomizationModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
                workflowName={workflow.name}
                workflowId={workflow.id}
                parametersSchema={(workflow.configurationSchema?.map((f: any) => ({
                    id: f.id,
                    label: f.label,
                    type: (f.type === 'textarea' || f.type === 'boolean') ? 'text' : f.type as any,
                    placeholder: f.placeholder,
                    required: f.required,
                    options: f.options,
                    hint: f.helperText
                })) as any) || [
                        { id: 'custom_notes', label: 'Customization Requirements', type: 'text', required: true, placeholder: 'Tell us how you want to modify this workflow...' }
                    ]}
                estimatedTime="24-48 hours"
                complexity="Intermediate"
                perRunCost={workflow.downloadPrice * 0.1}
            />
        </div >
    );
}

function StepCard({ number, title, desc, icon: Icon }: { number: string, title: string, desc: string, icon: any }) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative p-10 rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.1] backdrop-blur-2xl group transition-all duration-700 overflow-hidden shadow-2xl"
        >
            <div className="absolute -right-6 -top-6 text-9xl font-black text-white/[0.03] group-hover:text-cyan-500/[0.08] transition-all duration-700 select-none italic tracking-tighter">
                {number}
            </div>
            <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-white/10 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/20 transition-all duration-500 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                    <Icon className="w-10 h-10 text-cyan-400 group-hover:scale-125 transition-transform" />
                </div>
                <h4 className="font-black text-2xl mb-4 text-white group-hover:text-cyan-400 transition-colors tracking-tight uppercase italic">{title}</h4>
                <p className="text-base text-slate-400 leading-relaxed font-semibold opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
        </motion.div>
    );
}

function PremiumFeatureCard({ title, desc, idx }: { title: string, desc: string, idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, x: 10 }}
            className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-500 flex items-start gap-8"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 transition-all">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3 relative z-10">
                <h4 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h4>
                <p className="text-base text-slate-500 font-bold tracking-wide leading-relaxed group-hover:text-slate-400 transition-colors uppercase text-[12px] flex items-center gap-3">
                    <span className="w-4 h-[2px] bg-cyan-500/30" />
                    {desc}
                </p>
            </div>
            <div className="absolute right-10 bottom-10 opacity-0 group-hover:opacity-[0.03] transition-opacity">
                <Cpu className="w-24 h-24 text-white" />
            </div>
        </motion.div>
    );
}

function OptionTab({ active, onClick, icon: Icon, price, label, desc, accent = 'cyan' }: { active: boolean, onClick: () => void, icon: any, price: number, label: string, desc: string, accent?: 'cyan' | 'red' | 'purple' }) {
    const accents = {
        cyan: { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400', shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]', glow: 'bg-cyan-500/20' },
        red: { border: 'border-[#fe3d51]', bg: 'bg-[#fe3d51]/10', text: 'text-[#fe3d51]', shadow: 'shadow-[0_0_30px_rgba(254,61,81,0.25)]', glow: 'bg-[#fe3d51]/20' },
        purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.25)]', glow: 'bg-purple-500/20' }
    };
    const colors = accents[accent];

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group h-28 relative overflow-hidden ${active ? `${colors.border} ${colors.bg} ${colors.shadow}` : 'border-white/5 hover:border-white/20 bg-white/[0.01]'
                }`}
        >
            {active && <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${colors.glow} blur-3xl opacity-50`} />}

            <div className="flex items-center gap-5 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? colors.bg + ' ' + colors.border + ' border' : 'bg-white/5 border border-white/10'}`}>
                    <Icon className={`w-6 h-6 ${active ? colors.text : 'text-slate-500 group-hover:text-slate-300'}`} />
                </div>
                <div className="flex flex-col">
                    <span className={`font-black text-base uppercase tracking-tight ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${active ? colors.text : 'text-slate-600'}`}>
                        {desc}
                    </span>
                </div>
            </div>
            <div className="text-right relative z-10">
                <span className={`text-2xl font-black ${active ? 'text-white' : 'text-slate-500'}`}>${price}</span>
            </div>

            {active && (
                <div className="absolute top-2 right-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('/10', '')} animate-ping`} />
                </div>
            )}
        </motion.div>
    );
}

// Remove old helper components that are no longer used
function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) { return null; }
function IncludeItem({ text }: { text: string }) { return null; }

const MOCK_TEMPLATES = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: 'Celebrity Selfie Video Generator',
        description: 'Create personalized AI video journeys through movie history. Upload a photo and get a merged video where the user stars in iconic scenes. Powered by Higgsfield Kling Omni and delivered via WhatsApp.',
        category: 'Content Engine',
        price: 297,
        kpis: [
            { label: 'Realism', value: '99%', icon: Shield },
            { label: 'Latency', value: '2 min', icon: Clock },
            { label: 'Social Impact', value: 'Viral', icon: TrendingUp }
        ],
        features: [
            { title: 'AI Face Swap', desc: 'State-of-the-art neural mapping for seamless character integration.' },
            { title: 'Multi-Scene Stitching', desc: 'Automatic editing and color grading across legendary movie clips.' },
            { title: 'WhatsApp Discovery', desc: 'Instant delivery to any mobile device without app installation.' },
            { title: 'Custom Movie Presets', desc: 'Growing library of action, sci-fi, and classic cinema themes.' },
            { title: 'ImgBB Integration', desc: 'Secure, ephemeral photo hosting for privacy-first AI processing.' }
        ],
        useCases: [
            { title: 'Viral Marketing', desc: 'Create hyper-personalized ads that stop the scroll instantly.', icon: Zap },
            { title: 'Personalized Gifts', desc: 'Turn friends into movie stars for birthdays or anniversaries.', icon: Globe },
            { title: 'Brand Storytelling', desc: 'Tell your brand story with cinematic high-production value.', icon: Rocket }
        ],
        faqs: [
            { q: 'How many scenes are included?', a: 'By default, each generation stitches 3 iconic scenes together for a 15-second cinematic experience.' },
            { q: 'Is my data safe?', a: 'Yes. We use ephemeral processing. Your source photo is deleted immediately after the video is generated.' },
            { q: 'Can I add my own clips?', a: 'Professional tiers allow custom template creation. Contact our team for enterprise API access.' }
        ],
        video: "/videos/celebrity-selfie-generator.mp4",
        configurationSchema: [
            { id: 'movie_theme', label: 'Movie Theme', type: 'select', required: true, options: ['Action Hero', 'Classic Romance', 'Sci-Fi Explorer', 'Historical Legend'], placeholder: 'Select a theme' },
            { id: 'user_photo', label: 'Upload Portrait', type: 'text', required: true, placeholder: 'URL to your photo', helperText: 'Front-facing portrait for AI mapping' }
        ]
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: 'Meta Ad Library Analyzer',
        description: 'Scrapes winning ads from Meta Ad Library and generates detailed replication templates using AI vision analysis. Identifies UGC and testimonial-style ads with precise scene-by-scene breakdowns.',
        category: 'Lead Machine',
        price: 197,
        features: [
            { title: 'Ad Scraping', desc: 'Automated retrieval of active and historical ads from Meta Library.' },
            { title: 'AI Video Analysis', desc: 'Deep vision processing to extract hook patterns and CTA structures.' },
            { title: 'Template Generation', desc: 'Instant creation of high-converting scripts based on winning ad logic.' },
            { title: 'Boost.Space Storage', desc: 'Organized data sink for competitor research and creative assets.' }
        ],
        video: "/videos/meta-ad-analyzer.mp4",
        configurationSchema: [
            { id: 'competitor_domain', label: 'Competitor Domain', type: 'url', required: true, placeholder: 'https://competitor.com' },
            { id: 'niche', label: 'Advertising Niche', type: 'text', required: true, placeholder: 'e.g. E-commerce, SaaS' }
        ]
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: 'YouTube AI Clone',
        description: 'Create an AI persona from any YouTube channel. Extracts transcripts, synthesizes a conversational persona, and lets you chat with the clone via Telegram. Includes Perplexity research tool.',
        category: 'Knowledge Engine',
        price: 347,
        features: [
            { title: 'Transcript Extraction', desc: 'Clean, formatted text retrieval from any video ID or channel URL.' },
            { title: 'Persona Synthesis', desc: 'Training OpenAI models to mirror specific speech patterns and knowledge bases.' },
            { title: 'Telegram Bot Integration', desc: 'Real-time conversational interface for mobile and desktop chat.' },
            { title: 'Perplexity Research', desc: 'Real-time fact checking and source citation for AI generated responses.' }
        ],
        video: "/videos/youtube-clone.mp4",
        configurationSchema: [
            { id: 'channel_url', label: 'YouTube Channel URL', type: 'url', required: true, placeholder: 'https://youtube.com/@channel' },
            { id: 'persona_voice', label: 'Clone Voice Style', type: 'select', required: true, options: ['Enthusiastic', 'Analytical', 'Sarcastic', 'Inspirational'] }
        ]
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: 'Call Audio Lead Analyzer',
        description: 'Ingests Telnyx call recordings, transcribes them with AI, and creates qualified leads in Workiz with intelligent categorization. Sends email reports via Outlook.',
        category: 'Lead Machine',
        price: 497,
        features: [
            { title: 'Telnyx Integration', desc: 'Direct webhook processing for incoming recordings and call logs.' },
            { title: 'Audio Transcription', desc: 'High-fidelity voice-to-text conversion for sales and support calls.' },
            { title: 'Lead Scoring', desc: 'Sentiment analysis and intent detection to prioritize high-value prospects.' },
            { title: 'Workiz CRM Sync', desc: 'Automated entry and categorization within your existing operations stack.' }
        ],
        video: "/videos/call-audio-analyzer.mp4",
        configurationSchema: [
            { id: 'crm_type', label: 'Target CRM', type: 'select', required: true, options: ['Workiz', 'PipeDrive', 'Salesforce', 'HubSpot'] },
            { id: 'score_threshold', label: 'Lead Score Threshold', type: 'number', required: true, placeholder: '0-100' }
        ]
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: 'AI Calendar Assistant',
        description: 'An AI agent that manages your TidyCal calendar. Books meetings, reschedules, checks availability, and detects conflicts via natural chat commands through Telegram or webhooks.',
        category: 'Autonomous Secretary',
        price: 147,
        features: [
            { title: 'Conflict Resolution', desc: 'Intelligent handling of double-bookings and time-zone overlaps.' },
            { title: 'Natural Language', desc: 'Process scheduling requests like "Move my Tuesday 10am to next Monday".' },
            { title: 'Human Approval Flow', desc: 'Optional Slack/WhatsApp confirmation before finalizing bookings.' },
            { title: 'Webhook Triggers', desc: 'Connect to external apps to trigger bookings from lead forms.' }
        ],
        video: "/videos/calendar-assistant.mp4",
        configurationSchema: [
            { id: 'calendar_provider', label: 'Calendar Provider', type: 'select', required: true, options: ['Google Calendar', 'Outlook', 'iCloud'] },
            { id: 'timezone', label: 'Primary Timezone', type: 'text', required: true, placeholder: 'e.g. America/New_York' }
        ]
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: 'Floor Plan to Property Tour',
        description: 'Upload a floor plan and receive a photorealistic video walkthrough. AI generates room renders in multiple styles (Modern, Traditional, Scandinavian) and stitches them into a smooth tour video.',
        category: 'Content Engine',
        price: 397,
        features: [
            { title: '2D to 3D Conversion', desc: 'Neural reconstruction of spatial layouts from simple image files.' },
            { title: 'Photorealistic Rendering', desc: 'Ray-traced quality visuals with accurate lighting and material textures.' },
            { title: 'Video Walkthrough', desc: 'Dynamic camera paths that explore the property in 4K resolution.' },
            { title: 'Multi-Style Options', desc: 'Switch between Modern, Industrial and Classic themes instantly.' }
        ],
        video: "/videos/floor-plan-tour.mp4",
        configurationSchema: [
            { id: 'floorplan_url', label: 'Floor Plan Image URL', type: 'url', required: true },
            { id: 'style', label: 'Interior Style', type: 'select', required: true, options: ['Modern', 'Scandinavian', 'Industrial', 'Traditional'] }
        ]
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: 'Monthly CRO Insights Bot',
        description: 'Automated monthly analysis of GA4 and Clarity data with actionable CRO recommendations. Identifies rage clicks, scroll depth issues, and generates prioritized action items delivered via Slack.',
        category: 'Knowledge Engine',
        price: 247,
        features: [
            { title: 'Drop-off Analysis', desc: 'Detection of funnel leaks and navigation bottlenecks across the journey.' },
            { title: 'Heatmap Integration', desc: 'Correlating click density with user conversion intent scores.' },
            { title: 'Slack Reporting', desc: 'Beautifully formatted monthly summaries sent directly to team channels.' },
            { title: 'Action Item Prioritization', desc: 'Ranking fixes by estimated ROI and development effort.' }
        ],
        video: "/videos/cro-insights.mp4",
        configurationSchema: [
            { id: 'ga4_id', label: 'GA4 Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
            { id: 'domain', label: 'Website Domain', type: 'url', required: true }
        ]
    }
];
