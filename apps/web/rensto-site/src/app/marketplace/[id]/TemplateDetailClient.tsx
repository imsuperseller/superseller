'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    features: Array<{ title: string; desc: string; image?: string; icon?: string }>;
    deploymentSteps?: Array<{ title: string; desc: string; icon?: string }>;
    useCases?: Array<{ title: string; desc: string; icon: any }>;
    faqs?: Array<{ q: string; a: string }>;
    kpis?: Array<{ label: string; value: string; icon: any }>;
    targetMarket: string;
    status: string;
    video?: string;
    demoVideo?: string;
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

const ICON_MAP: Record<string, any> = {
    Shield,
    Clock,
    TrendingUp,
    Zap,
    Globe,
    Rocket,
    CheckCircle2,
    Activity,
    Cpu,
    Lock,
    Mail,
    Layout,
    MessageSquare,
    CreditCard,
    Target: Layout // Fallback or mapping
};

const resolveIcon = (icon: any, fallback: any) => {
    if (!icon) return fallback;
    if (typeof icon === 'string' && ICON_MAP[icon]) return ICON_MAP[icon];
    return typeof icon === 'string' ? fallback : icon;
};

interface TemplateDetailClientProps {
    workflow: Workflow;
}

export default function TemplateDetailClient({ workflow }: TemplateDetailClientProps) {
    const router = useRouter();
    const t = {
        back: 'Back to Marketplace',
        choosePath: 'Choose your path',
        config: 'Start Price Discovery',
        blueprint: 'Get Personal Blueprint',
        deployment: 'Setup Roadmap',
        verified: 'Verified Asset',
        chooseOption: 'Choose your path',
        downloadLabel: 'Get Blueprint',
        downloadDesc: 'Best for "do it yourself" pros',
        installLabel: 'Expert Setup',
        installDesc: 'We connect it for you',
        deliveryAddress: 'Delivery Address',
        secureCheckout: 'Secure Checkout',
        secureDesc: 'Instant activation via encrypted Stripe link.',
        cloudSync: 'Cloud Sync',
        cloudDesc: 'Get the n8n blueprint directly to your inbox.',
        goLive: 'Go Live',
        goLiveDesc: 'Import, configure keys, and start automating.',
        expectedResults: 'Expected Results',
        realBusinessWins: 'Real Business Wins',
        transformOps: 'Actual examples of how this system transforms your daily operations.',
        builtByExperts: 'Built By The Experts',
        commonQuestions: 'Common Questions',
        helpFaq: 'Help & FAQ',
        whatsIncluded: "What's included",
        whatBuild: "What we'll set up for you",
        howItWorks: 'How it works for you',
        serviceDetails: 'Service Details',
        designedFor: 'Designed For',
        processEff: 'Process Efficiency',
        timeToActive: 'Time to Active',
        businessImpact: 'The Business Impact',
        customPlan: 'Need a custom plan?',
        speakSupport: 'Speak with our support team to create your dream system.',
        mostPopular: 'Most Popular',
        discovery: 'Discovery',
        getPrice: 'Get Price',
        interactivePreview: 'Watch Demo',
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

    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'download' | 'install'>('download');
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

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
                    productId: workflow.workflowId || workflow.id,
                    tier: selectedOption,
                    customerEmail,
                    metadata: {
                        workflowName: workflow.name,
                        workflowId: workflow.workflowId,
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

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <AnimatedGridBackground />
            <Header />

            <main className="flex-grow relative z-10">
                <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="container mx-auto max-w-7xl relative z-10"
                    >
                        <div className="flex flex-col lg:flex-row gap-16 items-start">
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
                                        {typeof (workflow.outcomeHeadline || workflow.name) === 'string' ? (workflow.outcomeHeadline || workflow.name).split(' ').map((word: string, i: number) => (
                                            <span key={i} className="inline-block hover:text-cyan-400 transition-colors duration-300">
                                                {word}&nbsp;
                                            </span>
                                        )) : workflow.name}
                                    </motion.h1>

                                    <motion.p variants={itemVariants} className="text-xl text-slate-400 leading-relaxed max-w-2xl font-medium">
                                        {workflow.description}
                                    </motion.p>
                                </div>

                                {workflow.kpis && workflow.kpis.length > 0 && (
                                    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-0 p-1 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-md overflow-hidden">
                                        {(workflow.kpis || []).map((kpi, idx) => {
                                            if (!kpi || typeof kpi !== 'object') return null;
                                            const KpiIcon = resolveIcon(kpi.icon, TrendingUp);
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

                                <motion.div variants={itemVariants} className="relative group aspect-video rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-[0_0_100px_rgba(6,182,212,0.1)]">
                                    {/* VIDEO PLACEHOLDER: Ensure workflow.video contains valid path to Sora2 generated video */}
                                    {workflow.demoVideo || workflow.video ? (
                                        <video
                                            src={workflow.demoVideo || workflow.video}
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

                                <motion.div variants={itemVariants} className="space-y-10 pt-12">
                                    <div className="flex items-center gap-4">
                                        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-cyan-500" />
                                        <div className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                            {t.deployment}
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {(workflow.deploymentSteps || [
                                            { title: t.secureCheckout, desc: t.secureDesc, icon: 'Lock' },
                                            { title: t.cloudSync, desc: t.cloudDesc, icon: 'Mail' },
                                            { title: t.goLive, desc: t.goLiveDesc, icon: 'Rocket' }
                                        ]).map((step, idx) => {
                                            const StepIcon = resolveIcon(step.icon, Rocket);
                                            return (
                                                <StepCard
                                                    key={idx}
                                                    number={`0${idx + 1}`}
                                                    title={step.title}
                                                    desc={step.desc}
                                                    icon={StepIcon}
                                                />
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>

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
                                                    <CreditCard className="w-8 h-8" />
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

                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center gap-6 group cursor-pointer hover:bg-white/[0.04] transition-all"
                                        onClick={() => window.location.href = '/contact'}
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
                                    {(workflow.features || []).map((feature: any, idx: number) => (
                                        <PremiumFeatureCard
                                            key={idx}
                                            title={typeof feature === 'string' ? feature : (feature.title || '')}
                                            desc={typeof feature === 'string' ? 'Premium system feature.' : (feature.desc || '')}
                                            image={typeof feature === 'string' ? undefined : feature.image}
                                            iconName={typeof feature === 'string' ? undefined : feature.icon}
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
                                        className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-8 relative overflow-hidden"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="text-2xl font-black text-white tracking-tight uppercase italic">{(t as any).businessImpact}</div>
                                            <p className="text-base text-slate-400 leading-relaxed font-semibold opacity-100">
                                                {workflow.businessImpact} <span className="text-emerald-400">{workflow.roiExample}</span>
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

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
                                    const CaseIcon = resolveIcon(useCase.icon, Rocket);
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
                                        {(workflow.creator.expertise || []).map((exp, i) => (
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
                                {(workflow.faqs || []).map((faq, idx) => (
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
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

function PremiumFeatureCard({ title, desc, idx, image, iconName }: { title: string, desc: string, idx: number, image?: string, iconName?: any }) {
    const FeatureIcon = resolveIcon(iconName, CheckCircle2);

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

            <div className={`w-16 h-16 rounded-2xl ${image ? 'bg-black/50 overflow-hidden' : 'bg-cyan-500/10'} flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 transition-all`}>
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <FeatureIcon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                )}
            </div>

            <div className="space-y-3 relative z-10">
                <h4 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h4>
                <p className="text-base text-slate-500 font-bold tracking-wide leading-relaxed group-hover:text-slate-400 transition-colors uppercase text-[12px] flex items-center gap-3">
                    <span className="w-4 h-[2px] bg-cyan-500/30" />
                    {desc}
                </p>
            </div>
            {/* Removed the large faint CPU icon to reduce clutter as requested */}
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
