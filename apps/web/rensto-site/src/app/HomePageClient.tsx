'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import {
    Mic,
    Users,
    Package as PackageIcon,
    ArrowRight,
    CheckCircle,
    Check,
    Star,
    TrendingUp,
    Facebook,
    Instagram,
    Linkedin,
    Quote,
    Award,
    BarChart3,
    MessageSquare,
    Scale,
    Stethoscope,
    ShoppingBag,
    User,
    Lock,
    Wifi,
    X,
    Bot,
    Workflow,
    Zap,
    Target as TargetIcon,
    Shield,
    Clock,
    Sparkles,
    Phone as PhoneIcon,
    HelpCircle as HelpCircleIcon,
    Search,
    Settings,
    ShieldCheck,
    Activity as ActivityIcon,
    Cpu as CpuIcon,
    LayoutGrid as LayoutGridIcon,
    Crosshair as CrosshairIcon
} from 'lucide-react';
import { Schema } from '@/components/seo/Schema';
import { LeadMagnetSection } from '@/components/LeadMagnetSection';
import { NoiseTexture, PillarsVisualization } from '@/components/ui/premium';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { PricingTokens } from '@/components/marketing/PricingTokens';
import { Client, Testimonial } from '@/types/firestore';
import * as framer from 'framer-motion';
const { motion } = framer;
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';
import { Terminal as TerminalIcon } from 'lucide-react';

interface HomePageProps {
    initialLogos?: Client[];
    initialTestimonials?: Testimonial[];
    initialProducts?: any[];
    initialStats?: Array<{ value: string; label: string; icon: string }>;
}

const ICON_MAP: Record<string, React.ElementType> = {
    Crosshair: CrosshairIcon,
    Zap,
    Shield,
    Users,
    Phone: PhoneIcon,
    HelpCircle: HelpCircleIcon,
    LayoutGrid: LayoutGridIcon,
    Workflow,
    Activity: ActivityIcon,
    Cpu: CpuIcon,
    Package: PackageIcon,
    Target: TargetIcon,
    Clock: Clock,
    CheckCircle: CheckCircle
};

export default function HomePage({ initialLogos, initialTestimonials, initialProducts = [], initialStats }: HomePageProps) {
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Checkout states
    const [loading, setLoading] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCheckout = async (productId: string, flowType: string) => {
        if (!email && !showEmailModal) {
            setShowEmailModal(productId);
            return;
        }

        setLoading(productId);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowType,
                    productId,
                    customerEmail: email,
                    tier: 'standard'
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('Checkout failed:', data.error);
                alert('Checkout failed. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    // Map AITable products to Registry format
    const dynamicRegistry: Record<string, any> = {};
    initialProducts.forEach(p => {
        const id = p['Product ID'] || p.id;
        dynamicRegistry[id] = {
            id,
            name: p['Product Name'] || p.name,
            headline: p['Headline'] || p.headline || '',
            price: parseInt(p['Price'] || p.price) || 0,
            status: p['Status'] || p.status || 'active',
            stripePriceId: p['Stripe ID'] || p.stripePriceId,
            n8nWorkflowId: p['n8n Webhook'] || p.n8nWorkflowId,
            flowType: p['Flow Type'] || p.flowType || 'managed-engine',
            usageCredits: p['Usage Credits'] || p.usageCredits,
            icon: ICON_MAP[p['Icon'] || p.icon] || Zap
        };
    });

    const activeRegistry = dynamicRegistry;

    // Unified Products from Registry
    const theTeam = [
        activeRegistry['lead-machine'],
        activeRegistry['autonomous-secretary'],
        activeRegistry['knowledge-engine'],
        activeRegistry['content-engine']
    ].filter(p => p && p.status !== 'hidden');

    const applets = Object.values(activeRegistry).filter((p: any) => p.flowType === 'applet' && p.status !== 'hidden');

    const carePlans = [
        {
            id: 'starter-care',
            name: 'Starter Care',
            price: 497,
            period: 'month',
            description: 'Perfect for small teams needing monitoring',
            features: ['Monitor automations & Fix breaks', '1 monthly check-in (15 min)', 'Update FAQs & Responses', 'Basic performance report', '5 hours/mo included'],
            cta: 'Start Care Plan',
            popular: false
        },
        {
            id: 'growth-care',
            name: 'Growth Care',
            price: 997,
            period: 'month',
            description: 'Our most popular plan for active scaling',
            features: ['Deploy 1-2 new growth flows/mo', 'Optimize flows & A/B test', 'Quarterly strategy call (1h)', 'CRM synchronization & care', '15 hours/mo included'],
            cta: 'Get Growth Care',
            popular: true
        },
        {
            id: 'scale-care',
            name: 'Scale Care',
            price: 2497,
            period: 'month',
            description: 'A dedicated automation partner for your team',
            features: ['Dedicated expert (same person)', 'Activate custom capabilities on request', 'Weekly sync calls', 'Full analytics dashboard', 'Priority response (<4 hrs)'],
            cta: 'Get Scale Care',
            popular: false
        }
    ];

    function getStripeLink(productName: string): string | undefined {
        const links = {
            'Strategic Audit': env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
            'The Lead Machine': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
            'The Content Engine': env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER,
            'Voice AI Agent': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
            'Knowledge Engine': env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
            'Full Ecosystem': env.NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM,
            'Starter Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER,
            'Growth Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH,
            'Scale Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE,
        };
        return links[productName as keyof typeof links];
    }

    // Social proof stats - System Capabilities (Truthful & Impressive)
    const stats = initialStats
        ? initialStats.map(s => ({
            ...s,
            icon: ICON_MAP[s.icon] || Shield
        }))
        : [
            { value: 'Zero', label: 'Sick Days Taken', icon: Shield },
            { value: '24/7', label: 'Operational Uptime', icon: Clock },
            { value: '100%', label: 'Process Adherence', icon: CheckCircle },
            { value: '∞', label: 'Scalability', icon: Zap }
        ];

    // Testimonials with real clients - merge database results if available
    const testimonials = initialTestimonials && initialTestimonials.length > 0
        ? initialTestimonials.map(t => ({
            quote: t.quote,
            author: t.author,
            role: t.role,
            result: t.result,
            image: t.imageUrl,
            label: t.label
        }))
        : [
            {
                quote: "The Automated Website Team changed how we handle our site. It's like having a full tech team on standby 24/7.",
                author: "Ben Ginati",
                role: "CEO, Tax4US LLC",
                result: "24/7 Website Support",
                image: "/images/testimonials/client-testimonial-ben.jpg",
                label: "TAX4US"
            },
            {
                quote: "The project management automations cut our administrative overhead by 40%. Best investment we've made.",
                author: "Aviad Hazout",
                role: "CEO, Ardan Management & Engineering",
                result: "Project Automation",
                image: "/images/clients/client-aviad-hazout.jpg",
                label: "ARDAN"
            },
            {
                quote: "The systems Rensto built saved me hours of manual operations every single day. They understood my vision for Miss Party from day one and executed perfectly.",
                author: "Michal Kacher Szender",
                role: "CEO, Miss Party",
                result: "Operations Automation",
                image: "/images/testimonials/michal-kacher.jpg",
                label: "MISS PARTY"
            },
            {
                quote: "The Family Insurance Profiler Agent we built with Rensto is a game-changer. It automates complex client profiling and has transformed how I serve families.",
                author: "Shelly Mizrahi",
                role: "Insurance Agent",
                result: "AI Profiler Agent",
                image: "/images/testimonials/shelly-mizrahi.jpg",
                label: "INSURANCE"
            },
            {
                quote: "Rensto's service made my business smarter. The automations work 24/7 and free me to focus on growth.",
                author: "David Szender",
                role: "Business Owner",
                result: "Business Intelligence",
                image: "/images/clients/client-david-szender.jpg",
                label: "WONDERCARE"
            }
        ];

    // FAQ for objection handling
    const faqs = [
        {
            q: "How is this different from hiring a developer?",
            a: "We're not just technical specialists—we're automation strategists. We analyze your operations, identify the highest-impact opportunities, and deploy systems that pay for themselves within months."
        },
        {
            q: "What if I'm not tech-savvy?",
            a: "Perfect. Our systems run in the background. You get results through dashboards you already use. No technical knowledge required."
        },
        {
            q: "How quickly can I see results?",
            a: "Industry packages are ready in 1-2 weeks. Custom solutions take 2-4 weeks. Most clients see measurable impact within the first month."
        },
        {
            q: "What's the catch with the qualification process?",
            a: "No catch—we're selective because we guarantee results. If your business isn't ready for automation, we'd rather tell you honestly than take your money."
        },
        {
            q: "Do I own the system?",
            a: "Yes. For our custom ecosystems, you own the infrastructure. We set it up on your accounts, and you keep the intellectual property forever."
        },
        {
            q: "Can this replace my whole team?",
            a: "It's designed to replace the boring, repetitive work. It frees your team to focus on high-value tasks like strategy and closing deals."
        },
        {
            q: "What tools do you connect with?",
            a: "We connect with almost everything: Monday.com, Salesforce, HubSpot, WhatsApp, G-Suite, Slack, and custom databases."
        },
        {
            q: "Is my data secure?",
            a: "Absolutely. We follow enterprise-grade security protocols and ensure your systems are private, encrypted, and isolated from other clients."
        },
        {
            q: "How much maintenance is required?",
            a: "Zero for you. Our Care Plans handle monitoring, security updates, and active optimization so your engine never stops running."
        },
        {
            q: "What happens if a system breaks?",
            a: "Our monitoring detects issues instantly. Most 'breaks' are fixed before you even notice them. We offer SLA-backed support for critical systems."
        }
    ];

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const breadcrumbData = {
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://rensto.com'
            }
        ]
    };

    const faqData = {
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a
            }
        }))
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-[#0f0c29]"
            style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
            suppressHydrationWarning
        >
            {mounted && <NoiseTexture opacity={0.03} />}
            {mounted && <AnimatedGridBackground />}
            {mounted && <Header />}
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <Schema type="FAQPage" data={faqData} />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
                    {/* Background Video */}
                    <div className="absolute inset-0 z-0">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-15"
                        >
                            <source src="/assets/whatsapp-hero.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-[#0a061e]/40" />
                    </div>
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            background: 'radial-gradient(circle at 50% 50%, rgba(95, 251, 253, 0.3) 0%, transparent 70%)'
                        }}
                    />
                    <div className="container mx-auto text-center relative z-10">
                        <div className="max-w-4xl mx-auto">
                            {/* Pullback Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
                                style={{
                                    background: 'rgba(254, 61, 81, 0.1)',
                                    border: '1px solid var(--rensto-primary)',
                                    color: 'var(--rensto-primary)'
                                }}
                            >
                                <Shield className="w-4 h-4" />
                                Specialized Business Automation
                            </div>

                            <h1
                                className="hero-title text-4xl sm:text-5xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic text-white"
                            >
                                Stop the <span className="text-cyan-400">Manual Work Tax.</span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 text-slate-400">
                                    Deploy Your Profit Engines.
                                </span>
                            </h1>

                            <p
                                className="hero-description text-xl md:text-2xl mb-6 max-w-3xl mx-auto"
                                style={{ color: 'var(--rensto-text-secondary)' }}
                            >
                                We architect autonomous ecosystems that stop the theft of your time and scale your business 24/7.
                            </p>

                            {/* Key Benefits - Scannable */}
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
                                <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>Stop losing time on paperwork</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>Setup in days, not months</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>More reliable than a dedicated full-time hire</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                                <Link href="#team">
                                    <Button
                                        size="xl"
                                        className="font-bold transition-all hover:-translate-y-1 w-full sm:w-auto px-10"
                                        style={{
                                            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                                            color: '#ffffff',
                                            boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)'
                                        }}
                                    >
                                        <Users className="w-5 h-5 mr-3" />
                                        Hire The Team
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="#applets">
                                    <Button
                                        size="xl"
                                        variant="renstoSecondary"
                                        className="font-black italic uppercase tracking-widest w-full sm:w-auto"
                                    >
                                        Browse Applets
                                    </Button>
                                </Link>
                            </div>

                            {/* Dashboard Mockup - Premium addition */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="mt-16 relative mx-auto max-w-4xl hidden md:block"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 animate-pulse"></div>
                                <div className="relative rounded-xl bg-[#0d0d0d]/90 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                                    {/* Mockup Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                                            </div>
                                            <span className="ml-3 text-[10px] font-mono text-slate-400">rensto_command_center.exe</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">System Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mockup Body */}
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Stat Cards */}
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Total Leads</div>
                                                <div className="text-2xl font-mono text-white">1,248</div>
                                                <div className="text-[10px] text-green-400 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> +12% this week
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Active Agents</div>
                                                <div className="text-2xl font-mono text-white">4</div>
                                                <div className="text-[10px] text-cyan-400">All systems nominal</div>
                                            </div>
                                        </div>
                                        {/* Console/Activity Feed */}
                                        <div className="md:col-span-2 p-4 rounded-lg bg-black/40 border border-white/5 font-mono text-xs overflow-hidden h-[140px] relative">
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10"></div>
                                            <div className="space-y-2">
                                                <div className="flex gap-2 text-slate-400"><span className="text-cyan-500">[14:20:01]</span> <span className="text-yellow-400">WARN</span> Lead #8294 sentiment analysis ambiguous</div>
                                                <div className="flex gap-2 text-slate-400"><span className="text-cyan-500">[14:20:05]</span> <span className="text-green-400">INFO</span> Successfully booked meeting for Lead #8291</div>
                                                <div className="flex gap-2 text-slate-400"><span className="text-cyan-500">[14:20:12]</span> <span className="text-blue-400">EXEC</span> Launching "Reactivation" Campaign</div>
                                                <div className="flex gap-2 text-slate-400"><span className="text-cyan-500">[14:20:15]</span> <span className="text-green-400">SUCCESS</span> 42 emails dispatched via SendGrid</div>
                                                <div className="flex gap-2 text-slate-400"><span className="text-cyan-500">[14:20:22]</span> <span className="text-blue-400">EXEC</span> AITable Synchronization...</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Trust Indicators */}
                            <div
                                className="mt-12 pt-8 border-t"
                                style={{ borderColor: 'rgba(95, 251, 253, 0.2)' }}
                            >
                                <p className="text-sm mb-6 uppercase tracking-widest font-bold" style={{ color: 'var(--rensto-cyan)', opacity: 0.8 }}>
                                    Powering high-performance operations for industry leaders
                                </p>
                                <div className="mb-8 flex flex-wrap justify-center gap-4 text-xs font-medium" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <span>Accounting</span>
                                    <span className="opacity-30">•</span>
                                    <span>Engineering</span>
                                    <span className="opacity-30">•</span>
                                    <span>Healthcare</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80 items-center justify-items-center max-w-4xl mx-auto">
                                    {/* Real Client Logos - Loaded from database or fallback */}
                                    {initialLogos && initialLogos.length > 0 ? (
                                        (() => {
                                            const getLogoProps = (name: string) => {
                                                const lower = name.toLowerCase();

                                                // Default style for white/monochrome conversion on dark theme
                                                const whiteFilterStyle = { filter: 'brightness(0) invert(1)' };

                                                // Ardan (Special handling for scaling due to heavy padding in square asset)
                                                if (lower.includes('ardan')) return {
                                                    className: "object-contain opacity-100 hover:opacity-100 transition-opacity scale-[4.5]",
                                                    style: whiteFilterStyle,
                                                    unoptimized: true
                                                };
                                                // Shelly (Square-ish, needs minor boost)
                                                if (lower.includes('shelly')) return {
                                                    className: "object-contain opacity-100 hover:opacity-100 transition-opacity scale-[1.5]",
                                                    style: whiteFilterStyle,
                                                    unoptimized: true
                                                };
                                                // Tax4US, Wonder.Care, and others
                                                return {
                                                    className: "object-contain opacity-100 hover:opacity-100 transition-opacity",
                                                    style: whiteFilterStyle,
                                                    unoptimized: true
                                                };
                                            };
                                            return initialLogos.map((client) => {
                                                const props = getLogoProps(client.name);
                                                return (
                                                    <div key={client.id} className="h-12 relative w-full max-w-[140px]">
                                                        <Image
                                                            src={client.logoUrl}
                                                            alt={client.name}
                                                            fill
                                                            className={props.className}
                                                            style={props.style}
                                                            unoptimized={props.unoptimized}
                                                        />
                                                    </div>
                                                );
                                            });
                                        })()
                                    ) : (
                                        <>
                                            {/* Static Fallback Logos - Guaranteed to look good */}
                                            <div className="h-8 relative w-full max-w-[120px]">
                                                <Image
                                                    src="/images/logos/logo-tax4us.png"
                                                    alt="Tax4US"
                                                    fill
                                                    className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                            <div className="h-8 relative w-full max-w-[120px]">
                                                <Image
                                                    src="/images/logos/logo-ardan-transparent.png"
                                                    alt="ARDAN"
                                                    fill
                                                    style={{ filter: 'brightness(0) invert(1)' }}
                                                    className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                            <div className="h-8 relative w-full max-w-[120px]">
                                                <Image
                                                    src="/images/logos/logo-shelly-mizrahi.png"
                                                    alt="Shelly Mizrahi"
                                                    fill
                                                    style={{ filter: 'brightness(0) invert(1)' }}
                                                    className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                            <div className="h-8 relative w-full max-w-[120px]">
                                                <Image
                                                    src="/images/logos/logo-wondercare.png"
                                                    alt="Wonder.Care"
                                                    fill
                                                    style={{ filter: 'brightness(0) invert(1)' }}
                                                    className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ROI Comparison Section */}
                <section className="py-24 px-4 border-t border-white/5 bg-[#0a061e]/20">
                    <ComparisonTable />
                </section>

                {/* Technical Authority & Monitoring Section */}
                <section className="py-24 px-4 border-t border-white/5 relative overflow-hidden">
                    {/* Abstract Grid Background */}

                    <div className="container mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6 text-sm font-bold">
                                    <Zap className="w-4 h-4" />
                                    The Engine Behind the Result
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                    Enterprise Grade <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Automation Infrastructure</span>
                                </h2>
                                <p className="text-xl text-slate-400 mb-8 max-w-xl">
                                    While others use &quot;simple task-bots&quot;, we build comprehensive multi-stage Engines.
                                    Every system we activate includes a **Daily Health Check**—our own code monitoring your business every 60 seconds.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                                            <Shield className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">Daily Pulse Monitoring</h4>
                                            <p className="text-sm text-slate-500">Automatic reporting on uptime, lead volume, and system health delivered to your inbox daily.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Lock className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">Private & Secure</h4>
                                            <p className="text-sm text-slate-500">Your systems are hosted in isolated environments. Your data never leaves your private cloud.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:w-1/2 relative">
                                {/* Workflow Interface Mockup */}
                                <div className="relative rounded-2xl border border-white/10 bg-[#0d0922] p-4 shadow-2xl overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

                                    {/* Mock n8n Header */}
                                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-500">Automated_Sales_Pipeline</div>
                                    </div>

                                    {/* Visual Representation of n8n Nodes */}
                                    <div className="grid grid-cols-2 gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <Zap className="w-8 h-8 text-yellow-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">New Lead</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <Bot className="w-8 h-8 text-cyan-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">AI Qualification</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <Workflow className="w-8 h-8 text-purple-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">CRM Update</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <CheckCircle className="w-8 h-8 text-green-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">Meeting Booked</span>
                                        </div>
                                    </div>

                                    {/* Overlay Pulse */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <div className="w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
                                    </div>
                                </div>

                                {/* Background Glow */}
                                <div className="absolute -z-10 top-1/2 right-0 w-64 h-64 rounded-full bg-blue-500/20 blur-[100px]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Autonomous Team Section */}
                <section id="team" className="py-32 px-4 relative overflow-hidden">
                    <div className="container mx-auto">
                        <div className="text-center mb-24 space-y-6">
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                                Personnel v2.6
                            </Badge>
                            <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-6">
                                HIRE THE <span className="text-cyan-400">UNSTOPPABLE</span> TEAM.
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                Don&apos;t build tools. Hire autonomous agents that work 24/7 without a manual work tax.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {theTeam.map((agent) => (
                                <Link key={agent.id} href={`/products/${agent.id}`} className="group relative block p-px rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent hover:from-cyan-500/40 transition-all duration-500 overflow-hidden">
                                    <div className="relative z-10 bg-[#0d0d0d] p-10 rounded-[2.4rem] h-full flex flex-col space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                                {agent.icon && <agent.icon className="w-8 h-8" />}
                                            </div>
                                            {agent.status === 'active' && (
                                                <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest leading-none">Live</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{agent.name}</h3>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 italic">
                                                {agent.headline}
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Starting at ${agent.price}</span>
                                            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <PackageIcon className="w-32 h-32" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* The Applet Grid Section */}
                <section id="applets" className="py-32 px-4 bg-white/[0.01] border-y border-white/5 relative">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                            <div className="space-y-4 max-w-xl">
                                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">
                                    UTILITY <span className="text-cyan-400">APPLETS.</span>
                                </h2>
                                <p className="text-lg text-slate-500 font-medium italic">
                                    Small-scale engines for specific tactical missions. Buy credits, activate the logic, get the result.
                                </p>
                            </div>
                            <Badge className="bg-[#fe3d51]/10 text-[#fe3d51] border-[#fe3d51]/20 px-6 py-3 rounded-full uppercase tracking-widest text-[10px] font-black">
                                Instant Activation Enabled
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {applets.map((applet) => (
                                <Link key={applet.id} href={`/products/${applet.id}`} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all group flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/10 group-hover:border-cyan-400 transition-all">
                                        {applet.icon && <applet.icon className="w-5 h-5 text-cyan-400" />}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{applet.name}</h4>
                                            {applet.usageCredits && (
                                                <span className="text-[8px] font-black px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md uppercase tracking-widest border border-cyan-500/20">
                                                    {applet.usageCredits} Runs
                                                </span>
                                            )}

                                            {/* Live System Badge */}
                                            {applet.status === 'active' && (
                                                <div className="ml-auto bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                                                    <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                    </span>
                                                    <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest leading-none">Live</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                                            {applet.headline}
                                        </p>
                                        <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#fe3d51] opacity-0 group-hover:opacity-100 transition-opacity">
                                            Activate Engine <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="qualify" className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0a061e]/30">
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 text-sm font-bold">
                                <Search className="w-4 h-4" />
                                Initial Diagnostic Phase
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                                See if your business can <span className="text-cyan-400">run itself.</span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                                You don&apos;t need to be a tech expert. We take care of everything. Let&apos;s see how much time we can save you.
                            </p>
                        </div>
                        <QualificationQuiz />
                    </div>
                </section>

                {/* Stats Section - Capabilities */}
                <section className="py-24 px-4 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[400px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="container mx-auto relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />

                                    <stat.icon className="w-8 h-8 text-cyan-400 mb-6 relative z-10" />

                                    <div
                                        className="text-4xl md:text-5xl font-black mb-2 relative z-10"
                                        style={{
                                            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                                            WebkitBackgroundClip: 'text',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        {stat.value}
                                    </div>

                                    <div className="text-sm font-bold uppercase tracking-widest text-cyan-500/80 relative z-10">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Badges */}
                <section className="py-8 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
                    <div className="container mx-auto">
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                            {[
                                { icon: Shield, label: 'Enterprise Security', detail: 'SOC 2 Compliant' },
                                { icon: Lock, label: 'Data Privacy', detail: 'GDPR Ready' },
                                { icon: Wifi, label: '99.9% Uptime', detail: 'SLA Guaranteed' }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                                        style={{
                                            background: 'rgba(95, 251, 253, 0.1)',
                                            border: '1px solid rgba(95, 251, 253, 0.2)'
                                        }}
                                    >
                                        <badge.icon className="w-6 h-6" style={{ color: 'var(--rensto-cyan)' }} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: 'var(--rensto-text-primary)' }}>
                                            {badge.label}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--rensto-text-muted)' }}>
                                            {badge.detail}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* The Business Model Section */}
                <section id="model" className="py-24 px-4 border-t border-white/5 bg-[#0a061e]/20">
                    <div className="container mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                                    THE <span className="text-cyan-400">PROFIT</span> MODELS.
                                </h2>
                                <p className="text-xl text-slate-400 font-medium leading-relaxed">
                                    We don&apos;t just sell software. We deploy high-performance assets. Choose the engagement that matches your velocity.
                                </p>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-cyan-500/30 transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <h4 className="text-xl font-black text-white uppercase italic">Credit Buy (One-Time)</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium italic">
                                            Purchase a specific amount of &quot;Runs&quot; or &quot;Leads&quot;. Perfect for testing the engine or low-volume surgical operations.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-[#fe3d51]/30 transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#fe3d51]/10 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-[#fe3d51]" />
                                            </div>
                                            <h4 className="text-xl font-black text-white uppercase italic">Monthly Hire (Scale)</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium italic">
                                            Hire the agent full-time. Unlimited autonomous runs, active monitoring, and priority evolution. The ultimate time-leverage.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative p-12 rounded-[3.5rem] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 backdrop-blur-3xl">
                                <div className="absolute top-0 right-0 p-8">
                                    <Badge className="bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                                        strategic tier
                                    </Badge>
                                </div>
                                <div className="space-y-8">
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                        Full Strategic <br /><span className="text-cyan-400">Ecosystem.</span>
                                    </h3>
                                    <p className="text-lg text-slate-200 font-medium italic leading-relaxed">
                                        For businesses doing $1M+ ARR. We architect the entire infrastructure, connect all agents, and provide a dedicated automation partner.
                                    </p>
                                    <div className="py-8 border-y border-white/5">
                                        <span className="text-6xl font-black text-white">${activeRegistry['full-ecosystem']?.price || 5497}</span>
                                        <span className="ml-4 text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Full Deployment</span>
                                    </div>
                                    <Link href={`/products/full-ecosystem`} className="block">
                                        <Button size="xl" className="w-full h-20 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] gap-3">
                                            Activate Total Scale
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Industry Specific Grid - Internal Linking Powerhouse */}
                <section className="py-20 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                Built for Your Industry
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                We&apos;ve engineered pre-configured systems for high-growth sectors.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {[
                                { name: 'Law Firms', slug: 'lawyer', icon: Scale },
                                { name: 'Medical Clinics', slug: 'clinic', icon: Stethoscope },
                                { name: 'E-commerce', slug: 'ecom', icon: ShoppingBag },
                                { name: 'Real Estate', slug: 'realtor', icon: User }
                            ].map((niche) => (
                                <Link
                                    key={niche.slug}
                                    href={`/niches/${niche.slug}`}
                                    className="group p-6 rounded-2xl border transition-all hover:border-cyan-500/50 hover:-translate-y-1 text-center"
                                    style={{
                                        background: 'var(--rensto-bg-card)',
                                        borderColor: 'rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <niche.icon className="w-8 h-8 mx-auto mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-sm block" style={{ color: 'var(--rensto-text-primary)' }}>
                                        {niche.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link href="/niches" className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-2">
                                Explore All Industry Packages <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Testimonials - Real Results */}
                <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'var(--rensto-bg-secondary)' }}>
                    {/* Background Accent */}
                    <div className="absolute inset-0 opacity-5" style={{
                        background: 'radial-gradient(circle at 80% 20%, rgba(30, 174, 247, 0.4) 0%, transparent 50%)'
                    }} />

                    <div className="container mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                            <div>
                                <p className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--rensto-cyan)' }}>
                                    Client Success Stories
                                </p>
                                <h2 className="text-4xl md:text-5xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                    Real Results, Real People
                                </h2>
                            </div>
                            <p className="max-w-md text-lg" style={{ color: 'var(--rensto-text-muted)' }}>
                                Entrepreneurs who stopped doing busy work and started scaling.
                            </p>
                        </div>

                        {/* Horizontal Scroll Container with Gradient Hints */}
                        <div className="relative">
                            {/* Left Fade */}
                            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{
                                background: 'linear-gradient(to right, var(--rensto-bg-secondary), transparent)'
                            }} />
                            {/* Right Fade */}
                            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{
                                background: 'linear-gradient(to left, var(--rensto-bg-secondary), transparent)'
                            }} />

                            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory px-4 -mx-4 md:px-8 md:-mx-8 scrollbar-hide">
                                {testimonials.map((testimonial, i) => (
                                    <div
                                        key={i}
                                        className="min-w-[320px] md:min-w-[400px] rounded-2xl p-8 relative flex-shrink-0 snap-center border group hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1"
                                        style={{
                                            background: 'linear-gradient(145deg, rgba(17, 13, 40, 0.9) 0%, rgba(11, 15, 25, 0.9) 100%)',
                                            borderColor: 'rgba(95, 251, 253, 0.15)',
                                            boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {/* Quote Icon */}
                                        <Quote className="absolute top-6 right-6 w-10 h-10 opacity-10" style={{ color: 'var(--rensto-cyan)' }} />

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 relative shadow-lg" style={{ borderColor: 'var(--rensto-cyan)' }}>
                                                {testimonial.image ? (
                                                    <Image
                                                        src={testimonial.image}
                                                        alt={`Rensto Client Testimonial - ${testimonial.author}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center text-xl font-bold text-white relative overflow-hidden"
                                                        style={{ background: 'var(--rensto-gradient-secondary)' }}
                                                    >
                                                        {testimonial.author.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                {testimonial.label && (
                                                    <div className="text-cyan-400 font-black text-[10px] tracking-widest mb-1 opacity-50 uppercase">
                                                        {testimonial.label}
                                                    </div>
                                                )}
                                                <div className="font-bold text-lg" style={{ color: 'var(--rensto-text-primary)' }}>{testimonial.author}</div>
                                                <div className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>{testimonial.role}</div>
                                            </div>
                                        </div>

                                        <p
                                            className="text-lg mb-6 leading-relaxed"
                                            style={{ color: 'var(--rensto-text-secondary)' }}
                                        >
                                            &ldquo;{testimonial.quote}&rdquo;
                                        </p>

                                        <div
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                                            style={{
                                                background: 'rgba(30, 174, 247, 0.15)',
                                                color: 'var(--rensto-cyan)',
                                                border: '1px solid rgba(30, 174, 247, 0.2)'
                                            }}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {testimonial.result}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                Our Engagement Model
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {[
                                { num: '01', title: 'Check Fit', desc: 'Answer a few simple questions to see if we can help you save time.' },
                                { num: '02', title: 'Plan', desc: 'We chat (via AI or human) to map out your specific needs.' },
                                { num: '03', title: 'Setup', desc: 'We handle 100% of the tech. You don\'t lift a finger.' },
                                { num: '04', title: 'Relax', desc: 'Watch your business run on autopilot while you focus on growth.' }
                            ].map((step, i) => (
                                <div key={i} className="text-center">
                                    <div
                                        className="text-5xl font-bold mb-4 opacity-30"
                                        style={{ color: 'var(--rensto-cyan)' }}
                                    >
                                        {step.num}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ color: 'var(--rensto-text-secondary)' }}>
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Lead Magnet Section */}
                <LeadMagnetSection />

                {/* Token Pricing Section */}
                <PricingTokens />

                {/* FAQ Section */}
                <section className="py-20 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
                    <div className="container mx-auto max-w-3xl">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                Questions We Get
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl overflow-hidden border"
                                    style={{
                                        background: 'var(--rensto-bg-card)',
                                        borderColor: openFaq === i ? 'var(--rensto-cyan)' : 'rgba(254, 61, 81, 0.2)'
                                    }}
                                >
                                    <button
                                        className="w-full px-6 py-5 text-left flex items-center justify-between"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        <h3 className="font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                            {faq.q}
                                        </h3>
                                        <ArrowRight
                                            className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-90' : ''}`}
                                            style={{ color: 'var(--rensto-cyan)' }}
                                        />
                                    </button>
                                    {openFaq === i && (
                                        <div
                                            className="px-6 pb-5"
                                            style={{ color: 'var(--rensto-text-secondary)' }}
                                        >
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section
                    className="py-24 px-4 relative overflow-hidden"
                    style={{ background: 'var(--rensto-bg-primary)' }}
                >
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            background: 'radial-gradient(circle at 50% 50%, rgba(254, 61, 81, 0.3) 0%, transparent 70%)'
                        }}
                    />
                    <div className="container mx-auto text-center relative z-10">
                        <h2
                            className="text-4xl md:text-5xl font-bold mb-6"
                            style={{ color: 'var(--rensto-text-primary)' }}
                        >
                            Ready to Stop Wasting Time?
                        </h2>
                        <p
                            className="text-xl mb-8 max-w-2xl mx-auto"
                            style={{ color: 'var(--rensto-text-secondary)' }}
                        >
                            Every day you wait is another day of manual work.
                            <span className="block mt-2" style={{ color: 'var(--rensto-text-muted)' }}>
                                Take 2 minutes to see if you qualify.
                            </span>
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/offers#audit">
                                <Button
                                    size="lg"
                                    className="font-bold transition-all hover:-translate-y-1 text-lg px-10 w-full sm:w-auto"
                                    style={{
                                        background: 'var(--rensto-gradient-secondary)',
                                        color: '#ffffff',
                                        boxShadow: 'var(--rensto-glow-secondary)'
                                    }}
                                >
                                    Get Your Automation Audit
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-rensto-support'))}
                                className="font-bold transition-all hover:-translate-y-1 text-lg px-10 w-full sm:w-auto border-rensto-cyan/20 hover:bg-rensto-cyan/10"
                            >
                                <Bot className="w-5 h-5 mr-2 text-rensto-cyan" />
                                Chat with AI Agent
                            </Button>
                        </div>
                        <p className="mt-6 text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                            No credit card required. Takes less than 2 minutes.
                        </p>
                    </div>
                </section>

                {/* Final CTA Section */}
                {/* ... lines 767 to 825 ... */}
            </main>
            <Footer />

            {/* Email Capture Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0a061e] border border-white/10 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl space-y-8"
                    >
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Secure Your Spot</h3>
                            <p className="text-slate-400 font-medium">
                                Enter your email to proceed to secure payment. We&apos;ll use this to deliver your {showEmailModal === 'automation-audit' ? 'Audit Report' : 'Sprint Blueprint'}.
                            </p>
                        </div>

                        <input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white font-bold focus:border-cyan-500 outline-none transition-all placeholder:text-white/20"
                            autoFocus
                        />

                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setShowEmailModal(null)}
                                className="flex-1 h-16 rounded-2xl text-slate-400 font-black uppercase text-xs tracking-widest"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleCheckout(showEmailModal, 'service-purchase')}
                                disabled={!email || !!loading}
                                className="flex-[2] h-16 rounded-2xl bg-cyan-500 text-black font-black uppercase text-xs tracking-widest hover:bg-cyan-400 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue to Payment'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
