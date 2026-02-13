'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
import {
    Quote,
    Award,
    BarChart3,
    MessageSquare,
    Bot,
    Send,
    UserCircle2,
    Zap,
    Shield,
    Globe,
    CheckCircle2,
    Plus,
    Check,
    Smartphone,
    Users,
    Lock,
    Radio,
    MessageCircle,
    LayoutGrid,
    Clock,
    UserCircle,
    Server,
    Megaphone,
    Loader2,
    Activity,
    Cpu,
    Terminal,
    Target,
    Filter,
    ArrowRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { gsap } from 'gsap';

const GradientText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <h1 className={`text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 tracking-tighter leading-[0.9] uppercase italic ${className}`}>
        {children}
    </h1>
);

interface WhatsAppClientProps {
    initialProduct: any;
}

const ADDONS = [
    {
        id: 'media',
        name: 'Send Photos & Quotes',
        description: 'Let customers send you job photos, and send back estimates.',
        price: 79,
        setup: 199,
        icon: MessageSquare,
        available: true
    },
    {
        id: 'handoff',
        name: 'Alert Me Button',
        description: 'Customer can request to talk to a human anytime.',
        price: 199,
        setup: 399,
        icon: Users,
        available: false,
        comingSoon: true
    },
    {
        id: 'groups',
        name: 'Team Inbox',
        description: 'Multiple people can manage the same WhatsApp.',
        price: 149,
        setup: 299,
        icon: Users,
        available: true
    },
    {
        id: 'broadcast',
        name: 'Broadcast Pack',
        description: 'Automate Channels & Status updates (Stories).',
        price: 199,
        setup: 299,
        icon: Megaphone,
        available: false,
        comingSoon: true
    },
    {
        id: 'interactive',
        name: 'Smart Menus',
        description: 'Let customers tap buttons to select services instead of typing.',
        price: 99,
        setup: 199,
        icon: Radio,
        available: true
    },
    {
        id: 'reliability',
        name: 'Multi-Location',
        description: 'Run separate agents for each business location.',
        price: 249,
        setup: 499,
        icon: Server,
        available: true
    },
    {
        id: 'security',
        name: 'Security Hardening',
        description: 'IP Allowlisting, HMAC verification, Audit Logs.',
        price: 149,
        setup: 399,
        icon: Lock,
        available: false,
        comingSoon: true
    }
];

const BUNDLES = [
    {
        id: 'bundle-1',
        name: 'Never Miss a Lead',
        tagline: 'Entry Level',
        description: 'Instant response 24/7. Stop losing money to missed calls.',
        features: [
            'Instant response 24/7 (within seconds)',
            'Answer FAQs automatically',
            'Capture name, phone, email',
            'Send info to your phone/CRM'
        ],
        includedAddons: [],
        highlight: false
    },
    {
        id: 'bundle-2',
        name: 'Auto-Qualify & Book',
        tagline: 'Most Popular',
        description: 'Filter tire-kickers and book appointments while you sleep.',
        features: [
            'Everything in Bundle 1',
            'Ask qualifying questions',
            'Book appointments directly',
            'Send confirmation + reminders',
            'Re-engage cold leads'
        ],
        includedAddons: ['interactive'],
        highlight: true
    },
    {
        id: 'bundle-3',
        name: 'Full AI Sales Rep',
        tagline: 'Premium',
        description: 'Handle quotes, objections, and complex sales flows.',
        features: [
            'Everything in Bundle 2',
            'Send quotes/estimates',
            'Handle objections',
            'Multi-language support',
            'Escalate to human'
        ],
        includedAddons: ['interactive', 'media', 'handoff'],
        highlight: false
    }
];

export default function WhatsAppClient({ initialProduct }: WhatsAppClientProps) {
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
    const [extraNumbers, setExtraNumbers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Pricing Configuration
    const BASE_PLAN = {
        price: parseInt(initialProduct?.['Price'] || initialProduct?.price || 299),
        setup: 499,
        features: initialProduct?.features || [
            'Instant response 24/7 (within seconds)',
            'Answer FAQs automatically',
            'Capture name, phone, email',
            'Send info to your phone/CRM'
        ]
    };

    const toggleAddon = (id: string) => {
        setSelectedBundleId(null);
        setSelectedAddons(prev =>
            prev.includes(id)
                ? prev.filter(a => a !== id)
                : [...prev, id]
        );
    };

    const selectBundle = (bundleId: string) => {
        const bundle = BUNDLES.find(b => b.id === bundleId);
        if (bundle) {
            setSelectedAddons(bundle.includedAddons);
            setSelectedBundleId(bundleId);
            const configElement = document.getElementById('configurator');
            if (configElement) {
                configElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const handleCheckout = async () => {
        if (!email && !showEmailModal) {
            setShowEmailModal(true);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType: 'managed-plan',
                    productId: (initialProduct?.['Product ID'] || initialProduct?.id || 'autonomous-secretary'),
                    customerEmail: email,
                    selectedAddons,
                    extraNumbers,
                    selectedBundleId: selectedBundleId || undefined
                }),
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data);
                alert('Something went wrong initiating checkout.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to connect to checkout service.');
        } finally {
            setIsLoading(false);
        }
    };

    const totals = useMemo(() => {
        let monthly = BASE_PLAN.price;
        let setup = BASE_PLAN.setup;

        selectedAddons.forEach(id => {
            const addon = ADDONS.find(a => a.id === id);
            if (addon) {
                monthly += addon.price;
                setup += addon.setup;
            }
        });

        if (extraNumbers > 0) {
            monthly += (149 * extraNumbers);
            setup += (99 * extraNumbers);
        }

        return { monthly, setup };
    }, [selectedAddons, extraNumbers, BASE_PLAN]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
            <NoiseTexture opacity={0.3} />
            <AnimatedGridBackground />
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#110d28] to-[#110d28]" />

                    <div className="container relative mx-auto px-4 text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center mb-20"
                        >
                            <Badge className="mb-8 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-5 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                                <Activity className="w-3 h-3 mr-2" />
                                Operational Instance: WA-ALPHA
                            </Badge>

                            <GradientText className="mb-10 text-center">
                                Your 24/7 Autonomous<br />
                                <span className="text-rensto-red">Sales Intelligence</span>
                            </GradientText>

                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                Deploy a high-fidelity WhatsApp AI Agent that handles qualification,
                                objection handling, and CRM synchronization with surgical precision.
                            </p>
                        </motion.div>

                        <div className="flex flex-col md:flex-row gap-8 items-stretch max-w-6xl mx-auto">
                            {/* Video - Dominant */}
                            <div className="flex-[2] min-h-[300px] md:min-h-[400px] bg-[#1a162f]/80 rounded-2xl border border-cyan-500/30 relative overflow-hidden group shadow-[0_0_30px_rgba(30,174,247,0.2)] backdrop-blur-sm">
                                <video
                                    src="/assets/whatsapp-hero.mp4"
                                    poster="/images/whatsapp-hero-poster.jpg"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#110d28] via-transparent to-transparent pointer-events-none" />

                                <div className="absolute bottom-6 left-6 text-sm font-medium text-white/90 px-3 py-2 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#5ffbfd]"></span>
                                    The Zen of Automation
                                </div>
                            </div>

                            {/* Base Platform Card - Slimmer */}
                            <div className="flex-1 bg-[#1a162f] border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative group flex flex-col text-left shadow-2xl">
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-500" />
                                <div className="relative flex-1 flex flex-col">
                                    <div className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-2">The Foundation</div>
                                    <h3 className="text-xl font-bold mb-2 text-white">Base Platform</h3>
                                    <div className="text-3xl font-bold text-white mb-4">${BASE_PLAN.price}<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                                    <ul className="space-y-3 text-gray-300 mb-6 flex-1">
                                        {BASE_PLAN.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto p-3 bg-[#110d28] rounded-lg border border-white/10 text-xs text-gray-400">
                                        Includes robust anti-ban architecture. <br />
                                        <strong>Everything else is optional.</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bundles Section */}
                <section className="py-20 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-4">Choose Your <span className="text-cyan-400">Growth Engine</span></h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Start with what you need today. Scale up anytime.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {BUNDLES.map(bundle => (
                                <motion.div
                                    key={bundle.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`
                                        relative p-10 rounded-[3rem] border flex flex-col items-center text-center group cursor-pointer transition-all duration-500 h-full backdrop-blur-3xl
                                        ${bundle.highlight
                                            ? 'bg-rensto-red/5 border-rensto-red/20 shadow-[0_20px_50px_rgba(254,61,81,0.1)] scale-105 z-10'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}
                                    `}
                                    onClick={() => selectBundle(bundle.id)}
                                >
                                    {bundle.highlight && (
                                        <div className="absolute -top-4 px-6 py-2 bg-rensto-red text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full shadow-lg">
                                            {bundle.tagline}
                                        </div>
                                    )}
                                    {!bundle.highlight && (
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">{bundle.tagline}</div>
                                    )}

                                    <h3 className="text-2xl font-black mb-4 mt-2 text-white uppercase tracking-tight">{bundle.name}</h3>
                                    <p className="text-sm text-slate-400 font-medium mb-10 min-h-[40px] leading-relaxed">{bundle.description}</p>

                                    <ul className="space-y-4 mb-10 text-left w-full">
                                        {bundle.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-300">
                                                <div className={`mt-1 p-0.5 rounded-full ${bundle.highlight ? 'bg-rensto-red/20 text-rensto-red' : 'bg-white/10 text-slate-500'}`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto pt-8 w-full">
                                        <Button
                                            className={`w-full font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-2xl transition-all duration-300 ${bundle.highlight ? 'bg-gradient-to-r from-rensto-red to-rensto-orange text-white shadow-xl shadow-rensto-red/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                                        >
                                            Initialize Bundle
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="configurator" className="py-32 bg-[#050505] border-t border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rensto-red/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16">

                            {/* Left: Add-on Menu */}
                            <div className="flex-1">
                                <div className="mb-12">
                                    <Badge className="mb-4 bg-white/5 text-slate-500 border-white/10 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black">
                                        Module Configuration
                                    </Badge>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Architect Your <span className="text-rensto-red">Agent</span></h2>
                                    <p className="text-slate-400 font-medium max-w-xl">Select and hot-swap operational modules to calibrate your agent's capabilities in real-time.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {ADDONS.map(addon => (
                                        <button
                                            key={addon.id}
                                            onClick={() => addon.available !== false && toggleAddon(addon.id)}
                                            disabled={addon.available === false}
                                            className={`
                                                relative p-6 rounded-[2rem] text-left transition-all duration-300 border backdrop-blur-3xl overflow-hidden group
                                                ${addon.available === false
                                                    ? 'bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed'
                                                    : selectedAddons.includes(addon.id)
                                                        ? 'bg-rensto-red/[0.03] border-rensto-red/30 shadow-[0_10px_30px_rgba(254,61,81,0.05)]'
                                                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'}
                                            `}
                                        >
                                            {selectedAddons.includes(addon.id) && (
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-rensto-red/10 blur-3xl rounded-full" />
                                            )}

                                            {addon.comingSoon && (
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                    Dev Queue
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 rounded-2xl transition-colors duration-300 ${addon.available === false ? 'bg-white/5 text-slate-700' : selectedAddons.includes(addon.id) ? 'bg-rensto-red/20 text-rensto-red' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                                                    <addon.icon className="w-6 h-6" />
                                                </div>
                                                {addon.available !== false && (
                                                    <div className="text-right">
                                                        <div className={`font-black tracking-tight ${selectedAddons.includes(addon.id) ? 'text-white' : 'text-slate-400'}`}>+${addon.price}<span className="text-[10px] opacity-60 ml-0.5">/mo</span></div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">+${addon.setup} setup</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className={`font-black uppercase tracking-tight mb-2 transition-colors ${selectedAddons.includes(addon.id) ? 'text-white' : 'text-slate-300'}`}>{addon.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{addon.description}</p>
                                            </div>

                                            {selectedAddons.includes(addon.id) && addon.available !== false && (
                                                <div className="absolute top-6 right-6 text-rensto-red">
                                                    <CheckCircle2 className="w-5 h-5 fill-rensto-red/10" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Extra Numbers Toggle */}
                                <div className="mt-10 p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-cyan-400">
                                                <Smartphone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white uppercase tracking-tight text-lg">
                                                    Scale Operations
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium mt-1">
                                                    Deploy additional WhatsApp session instances.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 p-2 bg-black/40 rounded-2xl border border-white/10 scale-110">
                                            <button
                                                onClick={() => setExtraNumbers(Math.max(0, extraNumbers - 1))}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white font-black text-xl"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-mono text-xl font-bold text-white">{extraNumbers}</span>
                                            <button
                                                onClick={() => setExtraNumbers(extraNumbers + 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white font-black text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em]">
                                            + $149/mo Unit Cost
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Sticky Summary */}
                            <div className="lg:w-[400px]">
                                <div className="sticky top-32 bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rensto-red/50 to-transparent" />

                                    <div className="flex items-center gap-3 mb-10">
                                        <Terminal className="w-4 h-4 text-rensto-red" />
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Hardware Manifest</h3>
                                    </div>

                                    <div className="space-y-8 mb-12">
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Monthly Commitment</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">${totals.monthly}</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-rensto-red w-2/3" />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center py-4 border-y border-white/5">
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Initialization Fee</span>
                                            <span className="font-mono text-xl font-bold text-slate-300">${totals.setup}</span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-4">Instance Modules</div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className="bg-white/5 text-slate-400 border-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                                                    Base Plate
                                                </Badge>
                                                {selectedAddons.map(id => (
                                                    <Badge key={id} className="bg-rensto-red/10 text-rensto-red border-rensto-red/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                                                        {ADDONS.find(a => a.id === id)?.name}
                                                    </Badge>
                                                ))}
                                                {extraNumbers > 0 && (
                                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                                                        + {extraNumbers} Clusters
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-20 bg-gradient-to-r from-rensto-red to-rensto-orange text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-[1.5rem] shadow-2xl shadow-rensto-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                                        onClick={handleCheckout}
                                        disabled={isLoading}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Allocating Resources...
                                                </>
                                            ) : (
                                                <>
                                                    Authorize Build
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </span>
                                    </Button>

                                    <div className="mt-8 flex items-center justify-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="w-3 h-3 text-slate-600" />
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Encrypted</span>
                                        </div>
                                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-3 h-3 text-slate-600" />
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Instant Provision</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-32 bg-black relative">
                    <div className="absolute top-1/2 left-0 w-64 h-64 bg-rensto-red/5 blur-[120px] rounded-full" />
                    <div className="container mx-auto px-4 max-w-4xl relative z-10">
                        <div className="text-center mb-20">
                            <Badge className="mb-4 bg-white/5 text-slate-500 border-white/10 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black">
                                Intelligence Base
                            </Badge>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Technical <span className="text-rensto-red">Manifest</span></h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { q: "Can I use my existing WhatsApp number?", a: "Yes. Integration is performed via Secure Linked Device protocol. Your mobile terminal remains fully operational while the AI agent handles concurrent streams." },
                                { q: "Is this safe from platform restrictions?", a: "We utilize Type II Architecture with human-mimetic delays and intelligent rate-limiting to ensure 99.9% instance stability. Spamming is strictly prohibited." },
                                { q: "How does CRM synchronization work?", a: "The Rensto Brain maps data points directly to your central CRM (HubSpot, Salesforce, Pipedrive) in real-time. No manual entry required." },
                                { q: "Can the AI handle non-text assets?", a: "With the Media Module enabled, the agent processes images and audio via vision-language models for comprehensive intent extraction." },
                                { q: "Is international scaling supported?", a: "Deploy agents globally across 190+ regional codes with no additional latency or message taxation." },
                                { q: "Is Meta API approval required?", a: "Negative. Our bypass architecture allows for instant deployment without the 14-day Meta verification cycle." },
                                { q: "Can human operators intervene?", a: "Always. The agent enters 'Passive Mode' the instant it detects human input on the thread, ensuring no overlapping transmissions." },
                                { q: "What is the deployment timeline?", a: "Standard builds are operational within 72 hours of hardware allocation (setup payment)." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-300">
                                    <h3 className="font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-rensto-red rounded-full" />
                                        {item.q}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            {/* Email Capture Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#110d28] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold mb-2">Secure Your Slot</h3>
                        <p className="text-gray-400 mb-6">
                            Enter your email to proceed to secure payment. We&apos;ll use this to set up your Dedicated WhatsApp Instance.
                        </p>
                        <input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setShowEmailModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCheckout}
                                disabled={!email || isLoading}
                                className="flex-1 font-bold bg-green-500 hover:bg-green-600 text-black"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Continue'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
