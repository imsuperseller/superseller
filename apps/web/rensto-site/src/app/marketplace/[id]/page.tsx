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
    ChevronRight,
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
    businessImpact?: string;
    roiExample?: string;
    oneTimeCost?: number;
    maintenanceCost?: number;
    maintenanceExplanation?: string;
    aiPromptScript?: string;
    soraVideoPrompt?: string;
    outcomeHeadline?: string;
    guarantee?: string;
    creator?: {
        name: string;
        bio: string;
        photo?: string;
        expertise: string[];
    };
    isTargetTier?: boolean;
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
    const isRtl = false;
    const t = {
        back: 'Back to Marketplace',
        choosePath: 'Choose your path',
        config: 'Start Price Discovery',
        blueprint: 'Get Personal Blueprint',
        deployment: 'Deployment Roadmap',
        verified: 'Verified Asset',
        chooseOption: 'Choose your path',
        downloadLabel: 'Download Blueprint',
        downloadDesc: 'Best for "do it yourself" pros',
        installLabel: 'Pro Managed Setup',
        installDesc: 'We build & connect it for you',
        deliveryAddress: 'Delivery Address',
        secureCheckout: 'Secure Checkout',
        secureDesc: 'Instant activation via encrypted Stripe link.',
        cloudSync: 'Cloud Sync',
        cloudDesc: 'Direct delivery of the n8n blueprint to your inbox.',
        goLive: 'Go Live',
        goLiveDesc: 'Import, configure keys, and start automating.',
        expectedResults: 'Expected Results',
        realBusinessWins: 'Real Business Wins',
        transformOps: 'Actual examples of how this system transforms your daily operations.',
        builtByExperts: 'Built By The Experts',
        commonQuestions: 'Common Questions',
        helpFaq: 'Help & FAQ',
        whatsIncluded: "What's included",
        whatBuild: "What we'll build for you",
        howItWorks: 'How it works for you',
        serviceDetails: 'Service Details',
        designedFor: 'Designed For',
        processEff: 'Process Efficiency',
        timeToActive: 'Time to Active',
        businessImpact: 'The Business Impact',
        customPlan: 'Need a custom plan?',
        speakSupport: 'Speak with our support team to build your dream system.',
        mostPopular: 'Most Popular',
        discovery: 'Discovery',
        getPrice: 'Get Price',
        interactivePreview: 'Interactive Preview Active',
        blueprintTitle: 'BLUEPRINT',
        notFound: 'Workflow Not Found',
        home: 'Home',
        marketplace: 'Marketplace',
        verifiedBadge: 'Verified',
        sslEncrypted: 'SSL Encrypted',
        stripeSecure: 'Stripe Secure',
        projectDiscovery: 'Project Discovery',
        discoveryDesc: 'Discovery session for {{name}} implementation.',
        estimatedTime: '24-48 hours',
        complexity: 'Intermediate',
        goalLabel: 'Primary Business Goal',
        goalHint: 'What is the #1 thing you want this system to achieve?',
        goalOptions: ['Save Time / Reduce Manual Work', 'Get More Leads', 'Improve Customer Experience', 'Scale Operations'],
        currentProcessLabel: 'Current Process',
        currentProcessPlaceholder: 'Briefly, how do you handle this task today?',
        currentProcessHint: 'This helps us understand how much time we can save you.',
        softwareLabel: 'Existing Software',
        softwarePlaceholder: 'e.g. ServiceTitan, Housecall Pro, HubSpot...',
        softwareHint: 'List any software you want this system to talk to.',
        notesLabel: 'Special Requirements',
        notesPlaceholder: 'Anything else we should know?'
    };

    const { id } = useParams();
    const router = useRouter();
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'download' | 'install'>('download');
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

    useEffect(() => {
        console.log('%c RENSTO PREMIUM ENGINE V2.0 ACTIVE ', 'background: #06b6d4; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;');
    }, []);

    useEffect(() => {
        async function fetchWorkflow() {
            setLoading(true);
            try {
                const docRef = doc(db, 'templates', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as Template;

                    // Unified Mapping Logic (Server-side fields prioritized)
                    const mapping: any = {
                        ...data,
                        id: docSnap.id,
                        workflowId: data.id || docSnap.id,
                        name: data.name,
                        description: data.description,
                        outcomeHeadline: data.outcomeHeadline,
                        features: data.features || [],
                        businessImpact: data.businessImpact,
                        roiExample: data.roiExample,
                        maintenanceExplanation: data.maintenanceExplanation,
                        guarantee: data.guarantee,
                        kpis: data.kpis || [],
                        useCases: data.useCases || [],
                        faqs: data.faqs || [],
                        creator: data.creator,
                        downloadPrice: data.price || 97,
                        installPrice: data.installPrice || 797,
                        customPrice: data.customPrice || 1497,
                        status: data.readinessStatus || 'Active',
                        video: data.video ? data.video.replace('http://172.245.56.50', '') : undefined,
                    };

                    if (mapping.features.length > 0 && typeof mapping.features[0] === 'string') {
                        mapping.features = mapping.features.map((f: string) => ({
                            title: f,
                            desc: 'Outcome-optimized core module engineered for horizontal scaling and mission-critical reliability.'
                        }));
                    }
                    setWorkflow(mapping);
                } else {
                    throw new Error("Template not found in Firestore");
                }
            } catch (error) {
                console.error('Error fetching workflow:', error);
                // Last resort fallback (Mock)
                const mock = (MOCK_TEMPLATES as any).find((m: any) => m.id === id);
                if (mock) {
                    setWorkflow({
                        ...mock,
                        downloadPrice: mock.price || 97,
                        installPrice: 797,
                        customPrice: 1497,
                        status: 'Active'
                    } as any);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchWorkflow();
    }, [id]);

    const handlePurchase = async () => {
        if (selectedOption === 'install') {
            setIsCustomizeOpen(true);
            return;
        }

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
            <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            </div>
        );
    }

    if (!workflow) {
        return (
            <div className="min-h-screen bg-[#110d28] flex flex-col items-center justify-center text-white space-y-6">
                <h1 className="text-4xl font-bold">{t.notFound}</h1>
                <Button onClick={() => router.push('/marketplace')} variant="ghost">
                    <ArrowLeft className="mr-2 w-4 h-4" /> {t.back}
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
                name: t.home,
                item: 'https://rensto.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: t.marketplace,
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
                                        {t.back}
                                    </Link>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                                        {workflow.outcomeHeadline ? (
                                            workflow.outcomeHeadline.split(' ').map((word, i) => (
                                                <span key={i} className={i === 0 ? 'text-white' : 'text-white/40'}>{word} </span>
                                            ))
                                        ) : (
                                            workflow.name.split(' ').map((word, i) => (
                                                <span key={i} className={i === 0 ? 'text-white' : 'text-white/40'}>{word} </span>
                                            ))
                                        )}
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
                                        <div className="text-white font-bold tracking-tight">{t.interactivePreview}</div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-[0.2em] text-[10px] font-black rounded-full">
                                        {workflow.category}
                                    </Badge>
                                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 uppercase tracking-[0.2em] text-[10px] font-black rounded-full flex items-center gap-2">
                                        <Shield className="w-3 h-3" />
                                        {t.verified}
                                    </Badge>
                                </motion.div>

                                {/* Deployment Roadmap */}
                                <motion.div variants={itemVariants} className="space-y-10 pt-12">
                                    <div className="flex items-center gap-4">
                                        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-cyan-500" />
                                        <div className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                            {t.deployment}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <StepCard
                                            number="01"
                                            title={t.secureCheckout}
                                            desc={t.secureDesc}
                                            icon={Lock}
                                        />
                                        <StepCard
                                            number="02"
                                            title={t.cloudSync}
                                            desc={t.cloudDesc}
                                            icon={Mail}
                                        />
                                        <StepCard
                                            number="03"
                                            title={t.goLive}
                                            desc={t.goLiveDesc}
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
                                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{t.choosePath}</span>
                                                    <Badge variant="outline" className="border-white/10 text-white/40 text-[9px]">v2.4</Badge>
                                                </div>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-7xl font-black text-white tracking-tighter">
                                                        {selectedOption === 'install' ? t.getPrice : `$${workflow.downloadPrice}`}
                                                    </span>
                                                    <span className="text-slate-500 font-bold text-lg">{selectedOption === 'install' ? t.discovery : (t as any).blueprintTitle}</span>
                                                </div>
                                                {workflow.guarantee && (
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                                        <Check className="w-3 h-3" />
                                                        {workflow.guarantee}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <OptionTab
                                                    active={selectedOption === 'download'}
                                                    onClick={() => setSelectedOption('download')}
                                                    icon={Download}
                                                    price={workflow.downloadPrice}
                                                    label={t.downloadLabel}
                                                    desc={t.downloadDesc}
                                                    t={t}
                                                    isPopular={workflow.isTargetTier}
                                                />
                                                <OptionTab
                                                    active={selectedOption === 'install'}
                                                    onClick={() => setSelectedOption('install')}
                                                    icon={Layout}
                                                    price={0}
                                                    label={t.installLabel}
                                                    desc={t.installDesc}
                                                    t={t}
                                                    accent="red"
                                                    isQuote
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
                                                                    {t.deliveryAddress}
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
                                                        'bg-[#fe3d51] text-white hover:bg-[#ff4d61]'
                                                        }`}
                                                    disabled={purchaseLoading}
                                                    onClick={handlePurchase}
                                                >
                                                    {purchaseLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                        <div className="flex items-center justify-center gap-3">
                                                            {selectedOption === 'install' ? t.config : t.blueprint}
                                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>

                                            <div className="space-y-6 pt-6 border-t border-white/5">
                                                <div className="flex items-center justify-center gap-6 opacity-40 grayscale hover:opacity-100 transition-all">
                                                    <svg className="h-4 fill-white" viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg"><path d="M37.362 5.093c-.886 0-1.42.443-1.42 1.259 0 .852.798 1.136 1.348 1.33.585.195.834.337.834.621 0 .302-.284.479-.727.479-.585 0-1.047-.213-1.384-.532l-.46.816a3.1 3.1 0 001.95.639c.993 0 1.633-.514 1.633-1.4 0-.852-.798-1.154-1.365-1.348-.39-.125-.816-.302-.816-.585 0-.213.213-.426.657-.426.479 0 .87.16.1.18c.316l.443-.886 a3.0 3.0 0 0 0-1.405-.246zm-5.75-.408l-1.047 10.435h1.755l1.047-10.435h-1.755zm-4.704 0L24.8 10.155l-.657-5.47h-1.72l1.633 10.435hh1.808l3.194-10.435h-1.968zm-9.352 0c-2.43 0-4.043 1.632-4.043 3.9h1.773c0-1.294.762-2.11 2.27-2.11.46 0 1.01.124 1.01.124l-.195 1.578s-.691-.124-1.223-.124c-2.023 0-3.6 1.206-3.6 3.017 0 1.63 1.294 2.5 2.768 2.5.886 0 1.578-.32 1.578-.32l.142-1.348s-.55.195-1.01.195c-.852 0-1.474-.479-1.474-1.1s.62-.976 1.474-.976c.55 0 1.154.213 1.154.213 l.426-3.4s-.55-.16-1.082-.16h.001zM4.0 5.483L2.4 10.155.746 5.483H0l2.642 7.842L3.62 16.0h1.755l.833-2.677L8.913 5.3h-1.633z" /></svg>
                                                    <div className="h-4 w-[1px] bg-white/10" />
                                                    <div className="text-[10px] font-black tracking-widest text-white uppercase italic opacity-40">{t.verifiedBadge}</div>
                                                </div>
                                                <div className="flex items-center justify-center gap-8">
                                                    <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                                        <CreditCard className="w-4 h-4" />
                                                        <span className="text-[9px] font-bold tracking-widest uppercase">{t.sslEncrypted}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                                                        <Shield className="w-4 h-4" />
                                                        <span className="text-[9px] font-bold tracking-widest uppercase">{t.stripeSecure}</span>
                                                    </div>
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
                                            <div className="font-black text-white tracking-tight">{(t as any).customPlan}</div>
                                            <p className="text-sm text-slate-500 font-medium">{(t as any).speakSupport}</p>
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
                                        {(t as any).whatsIncluded}
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{(t as any).whatBuild}</h2>
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
                                        {(t as any).serviceDetails}
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">{(t as any).howItWorks}</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-600/10 via-white/[0.02] to-transparent border border-purple-500/20 backdrop-blur-xl space-y-12 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl" />
                                        {[
                                            { label: (t as any).designedFor, val: workflow?.targetMarket },
                                            { label: (t as any).processEff, val: '99.9% Automated' },
                                            { label: (t as any).timeToActive, val: workflow?.setupTime }
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
                                        className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-8 group hover:bg-emerald-500/10 transition-all cursor-cell relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors">
                                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="text-2xl font-black text-white tracking-tight uppercase italic">{(t as any).businessImpact}</div>
                                            <p className="text-base text-slate-400 leading-relaxed font-semibold opacity-70 group-hover:opacity-100 transition-opacity">
                                                {workflow.businessImpact} <span className="text-emerald-400">{workflow.roiExample}</span>
                                            </p>
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
                                        {(t as any).expectedResults}
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{(t as any).realBusinessWins}</h2>
                                </div>
                                <p className="text-xl text-slate-500 max-w-md font-medium">{(t as any).transformOps}</p>
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

                {/* Creator Section */}
                {workflow.creator && (
                    <section className="py-32 px-6 relative border-t border-white/5 bg-white/[0.01]">
                        <div className="container mx-auto max-w-4xl relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left"
                            >
                                <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-cyan-500 to-purple-600 p-[2px] shrink-0 transform -rotate-6 hover:rotate-0 transition-transform duration-500 group cursor-pointer shadow-2xl">
                                    <div className="w-full h-full rounded-[2.4rem] bg-[#0f0c29] flex items-center justify-center overflow-hidden">
                                        {workflow.creator.photo ? (
                                            <img src={workflow.creator.photo} alt={workflow.creator.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-16 h-16 text-white/10 group-hover:text-cyan-400/50 transition-colors" />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <div className="space-y-2">
                                        <div className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em]">{(t as any).builtByExperts}</div>
                                        <h2 className="text-4xl font-black text-white tracking-tight">{workflow.creator.name}</h2>
                                    </div>
                                    <p className="text-lg text-slate-400 leading-relaxed font-medium">
                                        {workflow.creator.bio}
                                    </p>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        {workflow.creator.expertise.map((exp, i) => (
                                            <Badge key={i} className="bg-white/5 text-slate-400 border-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-xl">
                                                {exp}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
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
                                    {(t as any).commonQuestions}
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">{(t as any).helpFaq}</h2>
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
                title={t.projectDiscovery}
                description={t.discoveryDesc.replace('{{name}}', workflow.name)}
                submitLabel={t.getPrice}
                oneTimeCost={workflow.oneTimeCost}
                maintenanceCost={workflow.maintenanceCost}
                maintenanceExplanation={workflow.maintenanceExplanation}
                parametersSchema={[
                    { id: 'business_goal', label: t.goalLabel, type: 'select', options: t.goalOptions, required: true, hint: t.goalHint },
                    { id: 'current_process', label: t.currentProcessLabel, type: 'text', required: true, placeholder: t.currentProcessPlaceholder, hint: t.currentProcessHint },
                    { id: 'software_stack', label: t.softwareLabel, type: 'text', required: false, placeholder: t.softwarePlaceholder, hint: t.softwareHint },
                    { id: 'additional_notes', label: t.notesLabel, type: 'text', required: false, placeholder: t.notesPlaceholder }
                ]}
                estimatedTime={t.estimatedTime}
                complexity={t.complexity as any}
                perRunCost={undefined}
            />

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] pointer-events-none">
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-auto"
                >
                    <Button
                        size="xl"
                        className={`w-full h-16 text-lg font-black rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl border border-white/10 relative overflow-hidden group ${selectedOption === 'download' ? 'bg-cyan-400 text-black' : 'bg-[#fe3d51] text-white'}`}
                        onClick={handlePurchase}
                    >
                        {purchaseLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <div className="flex items-center justify-center gap-2">
                                {selectedOption === 'install' ? t.getPrice : `${t.downloadLabel} - $${workflow.downloadPrice}`}
                                {isRtl ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        )}
                    </Button>
                </motion.div>
            </div>
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

function OptionTab({ active, onClick, icon: Icon, price, label, desc, t, accent = 'cyan', isQuote = false, isPopular = false }: { active: boolean, onClick: () => void, icon: any, price: number, label: string, desc: string, t: any, accent?: 'cyan' | 'red' | 'purple', isQuote?: boolean, isPopular?: boolean }) {
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
            {isPopular && (
                <div className="absolute top-0 right-10">
                    <div className="bg-cyan-500 text-black text-[8px] font-black px-3 py-1 rounded-b-lg uppercase tracking-widest shadow-lg">
                        {(t as any).mostPopular}
                    </div>
                </div>
            )}

            {active && <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${colors.glow} blur-3xl opacity-50`} />}

            <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${active ? colors.bg + ' ' + colors.border + ' border' : 'bg-white/5 border border-white/10'}`}>
                    <Icon className={`w-8 h-8 ${active ? colors.text : 'text-slate-500 group-hover:text-slate-300'}`} />
                </div>
                <div className="flex flex-col">
                    <span className={`font-black text-base uppercase tracking-tight ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${active ? colors.text : 'text-slate-600'}`}>
                        {desc}
                    </span>
                </div>
            </div>
            <div className="text-right relative z-10">
                <span className={`text-2xl font-black ${active ? 'text-white' : 'text-slate-500'}`}>
                    {isQuote ? t.discovery : `$${price}`}
                </span>
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
        outcomeHeadline: 'Drive High-Engagement Brand Awareness with Viral AI Video Experiences',
        description: 'Empower your audience to become the star of your brand\'s cinematic journey. This automated engine generates high-fidelity AI video experiences where users are seamlessly integrated into iconic scenes, perfect for viral marketing campaigns and hyper-personalized customer engagement.',
        category: 'Content Engine',
        price: 297,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'Rensto Labs',
            bio: 'Expert AI automation team specializing in viral content engines.',
            expertise: ['Neural Video Synthesis', 'Social Growth', 'Automation Architecture']
        },
        businessImpact: "Creates high-viral brand awareness that traditional ads can't touch.",
        roiExample: "Generated 1.2M impressions for our last beta user in under 48 hours.",
        oneTimeCost: 2497,
        maintenanceCost: 197,
        maintenanceExplanation: "Includes ongoing Higgsfield API credits, Kling Omni neural model updates, and multi-scene stitching server maintenance.",
        aiPromptScript: "Analyze the user's face structure and map it to the character in the action movie scene. Ensure lighting consistency and 24fps motion smoothing.",
        soraVideoPrompt: "A cinematic cinematic movie trailer featuring a personalized character in a high-speed chase through a futuristic city, hyper-realistic reflections.",
        kpis: [
            { label: 'Brand Retention', value: '85%+', icon: Shield },
            { label: 'Processing Time', value: '< 2 min', icon: Clock },
            { label: 'Viral Potential', value: 'Extreme', icon: TrendingUp }
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
            { q: 'Can I add my own clips?', a: 'Professional tiers allow custom template creation with your brand\'s specific B-roll or cinematic assets.' },
            { q: 'How does this drive business revenue?', a: 'High-engagement personalized content typically sees 3-5x higher share rates than static ads, significantly reducing your effective CAC.' },
            { q: 'Can we white-label the delivery?', a: 'Absolutely. The WhatsApp delivery module can be fully branded with your logo, business name, and custom messaging templates.' },
            { q: 'Is there an enterprise API available?', a: 'Yes. For high-volume requirements, we offer direct API access to our neural rendering cluster for seamless app integration.' }
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
        outcomeHeadline: 'Scale Your Ads with Proven, Competitor-Tested Creative Patterns',
        description: 'Eliminate guesswork from your creative strategy. This engine scrapes active high-performance ads from the Meta Ad Library and uses AI vision to reverse-engineer their winning hooks, scripts, and visual patterns for your own brand.',
        category: 'Lead Machine',
        price: 197,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'Shaf Studio',
            bio: 'Performance marketing engineers with $10M+ in managed ad spend.',
            expertise: ['Competitive Intelligence', 'Ad Hooks', 'Meta Ads']
        },
        businessImpact: "Instantly identifies high-converting creative patterns in your specific niche.",
        roiExample: "Reduced creative testing costs by 40% for home service agencies.",
        features: [
            { title: 'Ad Scraping', desc: 'Automated retrieval of active and historical ads from Meta Library.' },
            { title: 'AI Video Analysis', desc: 'Deep vision processing to extract hook patterns and CTA structures.' },
            { title: 'Template Generation', desc: 'Instant creation of high-converting scripts based on winning ad logic.' },
            { title: 'Boost.Space Storage', desc: 'Organized data sink for competitor research and creative assets.' }
        ],
        oneTimeCost: 1497,
        maintenanceCost: 147,
        maintenanceExplanation: "Covers daily Meta Ad Library scrapes, AI vision processing credits, and creative template database maintenance.",
        video: "/videos/meta-ad-analyzer.mp4",
        configurationSchema: [
            { id: 'competitor_domain', label: 'Competitor Domain', type: 'url', required: true, placeholder: 'https://competitor.com' },
            { i: 'niche', label: 'Advertising Niche', type: 'text', required: true, placeholder: 'e.g. E-commerce, SaaS' }
        ]
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: 'YouTube AI Clone',
        outcomeHeadline: 'Convert Thousands of Hours of Video Into Your Private Intelligence Engine',
        description: 'Transform any YouTube channel into a searchable, conversational persona. This system extracts full transcript data and synthesizes a custom LLM persona that mirrors an expert\'s knowledge base and communication style, accessible via Telegram.',
        category: 'Knowledge Engine',
        price: 347,
        guarantee: 'Satisfaction Guaranteed',
        creator: {
            name: 'Rensto Labs',
            bio: 'Expert AI automation team specializing in knowledge management.',
            expertise: ['Persona Synthesis', 'LLM Fine-tuning', 'Knowledge Retrieval']
        },
        features: [
            { title: 'Transcript Extraction', desc: 'Clean, formatted text retrieval from any video ID or channel URL.' },
            { title: 'Persona Synthesis', desc: 'Training OpenAI models to mirror specific speech patterns and knowledge bases.' },
            { title: 'Telegram Bot Integration', desc: 'Real-time conversational interface for mobile and desktop chat.' },
            { title: 'Perplexity Research', desc: 'Real-time fact checking and source citation for AI generated responses.' }
        ],
        oneTimeCost: 1897,
        maintenanceCost: 197,
        maintenanceExplanation: "Includes transcript extraction throughput, OpenAI persona training tokens, and Perplexity research API integration.",
        video: "/videos/youtube-clone.mp4",
        roiExample: "Synthesized 2,400+ hours of training data into an instant-response advisory bot.",
        configurationSchema: [
            { id: 'channel_url', label: 'YouTube Channel URL', type: 'url', required: true, placeholder: 'https://youtube.com/@channel' },
            { id: 'persona_voice', label: 'Clone Voice Style', type: 'select', required: true, options: ['Enthusiastic', 'Analytical', 'Sarcastic', 'Inspirational'] }
        ]
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: 'Call Audio Lead Analyzer',
        outcomeHeadline: 'Recover Lost Revenue Hidden in Your Voice Recordings',
        description: 'Stop letting sales opportunities slip through the cracks. Our Telnyx-powered engine automatically transcribes call recordings, scores lead intent using sentiment analysis, and syncs qualified opportunities directly to your CRM with intelligent categorization.',
        category: 'Lead Machine',
        price: 497,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'ServiceFlow Pro',
            bio: 'Service industry specialists focused on CRM automation.',
            expertise: ['Workiz Integration', 'Voice AI', 'Lead Capture']
        },
        businessImpact: "Ensures no sales opportunity ever falls through the cracks of your call recordings.",
        roiExample: "Recovered $12,400 in 'missed quote' revenue for a single plumbing client last month.",
        features: [
            { title: 'Telnyx Integration', desc: 'Direct webhook processing for incoming recordings and call logs.' },
            { title: 'Audio Transcription', desc: 'High-fidelity voice-to-text conversion for sales and support calls.' },
            { title: 'Lead Scoring', desc: 'Sentiment analysis and intent detection to prioritize high-value prospects.' },
            { title: 'Workiz CRM Sync', desc: 'Automated entry and categorization within your existing operations stack.' }
        ],
        oneTimeCost: 2497,
        maintenanceCost: 247,
        maintenanceExplanation: "Covers Telnyx recording hooks, AI audio-to-text transcription credits, and secure Workiz CRM lead synchronization.",
        video: "/videos/call-audio-analyzer.mp4",
        configurationSchema: [
            { id: 'crm_type', label: 'Target CRM', type: 'select', required: true, options: ['Workiz', 'PipeDrive', 'Salesforce', 'HubSpot'] },
            { id: 'score_threshold', label: 'Lead Score Threshold', type: 'number', required: true, placeholder: '0-100' }
        ]
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: 'AI Calendar Assistant',
        outcomeHeadline: 'Eliminate Scheduling Friction with an Autonomous Booking Agent',
        description: 'Delegate your entire calendar management to an agent that actually understands your business. Handles complex multi-timezone booking, natural language rescheduling requests, and human-in-the-loop approval workflows via Telegram or Slack.',
        category: 'Voice AI Agent',
        price: 147,
        guarantee: 'Satisfaction Guaranteed',
        creator: {
            name: 'Rensto Labs',
            bio: 'Expert AI automation team specializing in autonomous agents.',
            expertise: ['Agentic Workflows', 'Natural Language Scheduling', 'API Orchestration']
        },
        features: [
            { title: 'Conflict Resolution', desc: 'Intelligent handling of double-bookings and time-zone overlaps.' },
            { title: 'Natural Language', desc: 'Process scheduling requests like "Move my Tuesday 10am to next Monday".' },
            { title: 'Human Approval Flow', desc: 'Optional Slack/WhatsApp confirmation before finalizing bookings.' },
            { title: 'Webhook Triggers', desc: 'Connect to external apps to trigger bookings from lead forms.' }
        ],
        oneTimeCost: 897,
        maintenanceCost: 87,
        maintenanceExplanation: "Includes webhook monitoring, natural language scheduling API credits, and conflict resolution logic maintenance.",
        video: "/videos/calendar-assistant.mp4",
        roiExample: "Saved an average of 12 hours per month in administrative coordination per user.",
        configurationSchema: [
            { id: 'calendar_provider', label: 'Calendar Provider', type: 'select', required: true, options: ['Google Calendar', 'Outlook', 'iCloud'] },
            { id: 'timezone', label: 'Primary Timezone', type: 'text', required: true, placeholder: 'e.g. America/New_York' }
        ]
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: 'Floor Plan to Property Tour',
        outcomeHeadline: 'Sell Properties Faster with Photorealistic AI Video Walkthroughs',
        description: 'Transform flat 2D floor plans into immersive 4K cinematic walkthroughs. This spatial AI engine renders photorealistic room textures in multiple architectural styles and stitches them into a high-production property tour.',
        category: 'Content Engine',
        price: 397,
        guarantee: 'Satisfaction Guaranteed',
        isTargetTier: true,
        creator: {
            name: 'VisioReal',
            bio: 'Pioneers in AI-driven architectural visualization.',
            expertise: ['Spatial AI', 'Photorealistic Rendering', 'PropTech']
        },
        features: [
            { title: '2D to 3D Conversion', desc: 'Neural reconstruction of spatial layouts from simple image files.' },
            { title: 'Photorealistic Rendering', desc: 'Ray-traced quality visuals with accurate lighting and material textures.' },
            { title: 'Video Walkthrough', desc: 'Dynamic camera paths that explore the property in 4K resolution.' },
            { title: 'Multi-Style Options', desc: 'Switch between Modern, Industrial and Classic themes instantly.' }
        ],
        oneTimeCost: 1997,
        maintenanceCost: 197,
        maintenanceExplanation: "Includes neural reconstruction processing, 4K rendering cloud credits, and episodic walkthrough stitching maintenance.",
        video: "/videos/floor-plan-tour.mp4",
        roiExample: "Boosted pre-construction sales engagement by 230% for luxury developments.",
        configurationSchema: [
            { id: 'floorplan_url', label: 'Floor Plan Image URL', type: 'url', required: true },
            { id: 'style', label: 'Interior Style', type: 'select', required: true, options: ['Modern', 'Scandinavian', 'Industrial', 'Traditional'] }
        ]
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: 'Monthly CRO Insights Bot',
        outcomeHeadline: 'Automate Your Growth Strategy with Continuous UX Audits',
        description: 'Turn your GA4 and Clarity data into a prioritized growth roadmap. This system autonomously identifies revenue leaks, rage clicks, and conversion bottlenecks, delivering actionable CRO recommendations directly to your team via Slack.',
        category: 'Knowledge Engine',
        price: 247,
        guarantee: 'Satisfaction Guaranteed',
        creator: {
            name: 'Shaf Studio',
            bio: 'Data-driven optimization specialists focused on user behavior.',
            expertise: ['UX Analysis', 'Google Analytics 4', 'Conversion Optimization']
        },
        features: [
            { title: 'Drop-off Analysis', desc: 'Detection of funnel leaks and navigation bottlenecks across the journey.' },
            { title: 'Heatmap Integration', desc: 'Correlating click density with user conversion intent scores.' },
            { title: 'Slack Reporting', desc: 'Beautifully formatted monthly summaries sent directly to team channels.' },
            { title: 'Action Item Prioritization', desc: 'Ranking fixes by estimated ROI and development effort.' }
        ],
        oneTimeCost: 1297,
        maintenanceCost: 127,
        maintenanceExplanation: "Covers GA4/Clarity data warehouse storage, automated monthly insight generation, and secure Slack communication maintenance.",
        video: "/videos/cro-insights.mp4",
        roiExample: "Identified $4,200/mo in potential recovered revenue from cart-abandonment UX leaks.",
        configurationSchema: [
            { id: 'ga4_id', label: 'GA4 Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
            { id: 'domain', label: 'Website Domain', type: 'url', required: true }
        ]
    }
];

const MOCK_TEMPLATES_HE = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: 'מחולל סרטוני סלפי מפורסמים',
        outcomeHeadline: 'צרו מודעות ויראלית ומודעות למותג באמצעות חוויות וידאו AI',
        description: 'העצימו את הקהל שלכם להפוך לכוכב המסע הקולנועי של המותג שלכם. מנוע אוטומטי המייצר חוויות וידאו AI באיכות גבוהה שבהן המשתמשים משולבים בצורה חלקה בסצנות אייקוניות.',
        category: 'מנוע תוכן',
        price: 297,
        guarantee: 'שביעות רצון מובטחת',
        isTargetTier: true,
        creator: {
            name: 'מעבדות רנסטו',
            bio: 'צוות מומחי אוטומציה של AI המתמחה במנועי תוכן ויראליים.',
            expertise: ['סינתזת וידאו עצבית', 'צמיחה חברתית', 'ארכיטקטורת אוטומציה']
        },
        businessImpact: "יוצר מודעות למותג ויראלית גבוהה שמודעות מסורתיות לא יכולות להגיע אליה.",
        roiExample: "ייצר 1.2 מיליון חשיפות עבור משתמש הבטא האחרון שלנו תוך פחות מ-48 שעות.",
        oneTimeCost: 2497,
        maintenanceCost: 197,
        maintenanceExplanation: "כולל קרדיטים ל-API של Higgsfield, עדכוני מודל עצבי Kling Omni, ותחזוקת שרת לחיבור מספר סצנות.",
        kpis: [
            { label: 'שימור מותג', value: '85%+', icon: Shield },
            { label: 'זמן עיבוד', value: '< 2 דק׳', icon: Clock },
            { label: 'פוטנציאל ויראלי', value: 'קיצוני', icon: TrendingUp }
        ],
        features: [
            { title: 'החלפת פנים AI', desc: 'מיפוי עצבי מתקדם לשילוב דמויות חלק.' },
            { title: 'חיבור מספר סצנות', desc: 'עריכה ותיקון צבע אוטומטיים על פני קטעי סרטים אגדיים.' },
            { title: 'גילוי בוואטסאפ', desc: 'משלוח מיידי לכל מכשיר נייד ללא התקנת אפליקציה.' }
        ],
        faqs: [
            { q: 'כמה סצנות כלולות?', a: 'כברירת מחדל, כל יצירה מחברת 3 סצנות אייקוניות יחד לחוויה קולנועית של 15 שניות.' },
            { q: 'האם המידע שלי בטוח?', a: 'כן. אנחנו משתמשים בעיבוד זמני. תמונת המקור שלך נמחקת מיד לאחר יצירת הווידאו.' }
        ],
        video: "/videos/celebrity-selfie-generator.mp4"
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: 'מנתח ספריית המודעות של מטא',
        outcomeHeadline: 'שדרגו את הפרסום שלכם עם דפוסי קריאייטיב מוכחים שנבדקו אצל המתחרים',
        description: 'הסירו את חוסר הוודאות מאסטרטגיית הקריאייטיב שלכם. מנוע זה סורק מודעות בעלות ביצועים גבוהים מספריית המודעות של מטא ומשתמש בבינה מלאכותית ויזואלית כדי לפצח את הוקים, התסריטים והדפוסים הוויזואליים המנצחים עבור המותג שלכם.',
        category: 'מנוע לידים',
        price: 197,
        guarantee: 'שביעות רצון מובטחת',
        isTargetTier: true,
        roiExample: "הפחתת עלויות בדיקת קריאייטיב ב-40% עבור סוכנויות שירותי בית.",
        features: [
            { title: 'שאיבת מודעות', desc: 'שליפה אוטומטית של מודעות פעילות והיסטוריות מספריית מטא.' },
            { title: 'ניתוח וידאו AI', desc: 'עיבוד ויזואלי עמוק לחילוץ דפוסי הוק ומבנה CTA.' }
        ],
        video: "/videos/meta-ad-analyzer.mp4"
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: 'משכפל יוטיוברים ב-AI',
        outcomeHeadline: 'הפכו אלפי שעות וידאו למנוע אינטליגנציה פרטי',
        description: 'הפכו כל ערוץ יוטיוב לפרסונה חיפושית ושיחתית. המערכת מחלצת נתוני תמלול מלאים ומסנתזת פרסונת LLM מותאמת אישית שמשקפת את בסיס הידע וסגנון התקשורת של המומחה, נגישה דרך טלגרם.',
        category: 'מנוע ידע',
        price: 347,
        guarantee: 'שביעות רצון מובטחת',
        roiExample: "סינתזה של 2,400+ שעות נתוני אימון לבוט ייעוץ בעל תגובה מיידית.",
        features: [
            { title: 'חילוץ תמלול', desc: 'שליפת טקסט נקייה ומפורמטת מכל מזהה וידאו או כתובת ערוץ.' },
            { title: 'סינתזת פרסונה', desc: 'אימון מודלי OpenAI לשיקוף דפוסי דיבור ובסיסי ידע ספציפיים.' }
        ],
        video: "/videos/youtube-clone.mp4"
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: 'מנתח שיחות לידים',
        outcomeHeadline: 'החזירו הכנסות אבודות החבויות בהקלטות השיחות שלכם',
        description: 'הפסיקו לתת להזדמנויות מכירה לחמוק מבין האצבעות. מנוע מבוסס Telnyx שלנו מתמלל אוטומטית הקלטות שיחות, מדרג כוונת ליד באמצעות ניתוח סנטימנט ומסנכרן הזדמנויות כשירות ישירות ל-CRM שלכם.',
        category: 'מנוע לידים',
        price: 497,
        guarantee: 'שביעות רצון מובטחת',
        isTargetTier: true,
        roiExample: "החזר הכנסות של $12,400 ב-׳הצעות מחיר שהוחמצו׳ עבור לקוח אינסטלציה יחיד בחודש האחרון.",
        features: [
            { title: 'אינטגרציית Telnyx', desc: 'עיבוד ישיר של הקלטות ויומני שיחות.' },
            { title: 'תמלול אודיו', desc: 'המרה איכותית של קול לטקסט עבור שיחות מכירה ותמיכה.' }
        ],
        video: "/videos/call-audio-analyzer.mp4"
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: 'עוזר לוח שנה AI',
        outcomeHeadline: 'בטלו את החיכוך בתזמון פגישות עם סוכן הזמנות אוטונומי',
        description: 'האצילו את כל ניהול היומן שלכם לסוכן שבאמת מבין את העסק שלכם. מטפל בהזמנות מורכבות במספר אזורי זמן, בקשות תזמון בשפה טבעית ותהליכי אישור אנושיים דרך טלגרם או סלאק.',
        category: 'מזכירה אוטונומית',
        price: 147,
        guarantee: 'שביעות רצון מובטחת',
        roiExample: "חסכון ממוצע של 12 שעות בחודש בתיאום אדמיניסטרטיבי למשתמש.",
        features: [
            { title: 'פתרון התנגשויות', desc: 'טיפול חכם בכפל הזמנות וחפיפות בזמני זמן.' },
            { title: 'שפה טבעית', desc: 'עיבוד בקשות תזמון כמו \"הזז את הפגישה שלי מיום שלישי ב-10 בבוקר ליום שני הבא\".' }
        ],
        video: "/videos/calendar-assistant.mp4"
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: 'תוכנית קומה לסיור נכס',
        outcomeHeadline: 'מכרו נכסים מהר יותר עם סיורי וידאו פוטוריאליסטיים ב-AI',
        description: 'הפכו תוכניות קומה 2D שטוחות לסיורים קולנועיים סוחפים ב-4K. מנוע spatial AI זה מרנדר טקסטורות חדרים פוטוריאליסטיות במגוון סגנונות אדריכליים ומחבר אותם לסיור נכס באיכות הפקה גבוהה.',
        category: 'מנוע תוכן',
        price: 397,
        guarantee: 'שביעות רצון מובטחת',
        isTargetTier: true,
        roiExample: "שיפור מעורבות במכירות לפני בנייה ב-230% עבור פרויקטי יוקרה.",
        features: [
            { title: 'המרה מ-2D ל-3D', desc: 'שחזור עצבי של פריסות מרחביות מקבצי תמונה פשוטים.' },
            { title: 'רינדור פוטוריאליסטי', desc: 'ויזואליה באיכות ריי-טרייסינג עם תאורה וטקסטורות חומרים מדויקות.' }
        ],
        video: "/videos/floor-plan-tour.mp4"
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: 'מנתח שיפור המרות חודשי',
        outcomeHeadline: 'הפכו את אסטרטגיית הצמיחה שלכם לאוטומטית עם ביקורות UX רציפות',
        description: 'הפכו את נתוני ה-GA4 והקלאריטי שלכם למפת דרכים מתועדפת לצמיחה. מערכת זו מזהה באופן אוטונומי דליפות הכנסה, הקלקות של תסכול וצווארי בקבוק בהמרות, ומספקת המלצות CRO מעשיות ישירות לצוות שלכם.',
        category: 'מנוע ידע',
        price: 247,
        guarantee: 'שביעות רצון מובטחת',
        roiExample: "זיהוי של $4,200 בחודש בהכנסות פוטנציאליות מדליפות UX בסל הקניות.",
        features: [
            { title: 'ניתוח נטישה', desc: 'זיהוי דליפות משפך וצווארי בקבוק בניווט לאורך המסע.' },
            { title: 'אינטגרציית מפות חום', desc: 'קישור דחיסות הקלקות עם ציוני כוונת המרת משתמשים.' }
        ],
        video: "/videos/cro-insights.mp4"
    }
];
