'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import {
    Mic,
    Users,
    Package,
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
    Target,
    Shield,
    Clock,
    Sparkles
} from 'lucide-react';
import { Schema } from '@/components/seo/Schema';
import { LeadMagnetSection } from '@/components/LeadMagnetSection';
import { HelpCircle, Search, Settings, ShieldCheck } from 'lucide-react';
import { NoiseTexture, PillarsVisualization } from '@/components/ui/premium';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { Client, Testimonial } from '@/types/firestore';
import * as framer from 'framer-motion';
const { motion } = framer;
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface HomePageProps {
    initialLogos?: Client[];
    initialTestimonials?: Testimonial[];
}

export default function HomePage({ initialLogos, initialTestimonials }: HomePageProps) {
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

    // Four core pillars - ROI focused
    const serviceTypes = [
        {
            id: 'lead-gen',
            name: 'The Lead Machine',
            tagline: 'Outbound & Prospecting',
            description: 'A 24/7 outbound engine that sources leads, enriches data, and sends custom outreach at scale while you sleep.',
            vsHuman: 'Replaces 3-5 manual SDRs with zero management overhead.',
            icon: Target,
            features: [
                'Automated Lead Sourcing',
                'AI Data Enrichment',
                'Multi-Channel Outreach',
                'Smart CRM Synchronization',
                'Daily Performance Reports'
            ],
            pricing: 'From $997/mo',
            qualifier: 'Scale your sales overnight',
            cta: 'Activate My Engine',
            href: '/offers',
            gradient: 'primary',
            popular: true,
            slots: '3 slots left'
        },
        {
            id: 'voice-ai-agent',
            name: 'Voice AI Agent',
            tagline: 'Autonomous Receptionist',
            description: 'A 24/7 AI sales rep and receptionist that handles calls, books meetings, and syncs perfectly with your CRM.',
            vsHuman: 'Available 24/7. Never forgets a follow-up. 1/10th the cost of a human.',
            icon: Mic,
            features: [
                '24/7 Inbound/Outbound Calls',
                'Automated Appointment Booking',
                'Live CRM Connection',
                'Multi-Language Support',
                'Meeting Lead Qualification'
            ],
            pricing: 'From $497/mo',
            qualifier: 'Never miss a call again',
            cta: 'Partner With My Agent',
            href: '/whatsapp',
            gradient: 'accent',
            popular: false,
            slots: '⭐ Top Rated'
        },
        {
            id: 'rag-systems',
            name: 'Knowledge Engine',
            tagline: 'Custom Knowledge RAG',
            description: 'Connect AI to your company data. A private intelligence system with the "perfect memory" of your organization.',
            vsHuman: 'The employee who knows every project and best practice instantly.',
            icon: Shield,
            features: [
                'Live Data Source Sync',
                'Private AI Knowledge Base',
                'Internal Workflow Logic',
                'Context-Aware Assistance',
                'Enterprise-Grade Security'
            ],
            pricing: 'From $1,497/mo',
            qualifier: 'For established teams',
            cta: 'Secure My Data',
            href: '/contact',
            gradient: 'secondary',
            popular: false,
            slots: 'Advanced Systems'
        },
        {
            id: 'content-engine',
            name: 'The Content Engine',
            tagline: 'Idea to Content Pipeline',
            description: 'Autonomous systems that handle research, ideation, and generation of high-authority content at scale.',
            vsHuman: 'A full content agency engine that never runs out of ideas.',
            icon: Users,
            features: [
                'Content Research & Ideation',
                'Automated Video/Image Gen',
                'Multi-Channel Distribution',
                'Authority Building Logic',
                'Weekly Growth Reports'
            ],
            pricing: 'From $1,497/mo',
            qualifier: 'Dominate your market',
            cta: 'Start Creating',
            href: '/offers',
            gradient: 'primary',
            popular: false,
            slots: 'Scaling Fast'
        }
    ];

    const ecosystemBundle = {
        id: 'full-ecosystem',
        name: 'Full Ecosystem',
        price: 5497,
        description: 'All four pillars plus premium support, custom integrations, and a dedicated engineer for end‑to‑end automation.',
        features: ['Lead Machine Engine', 'Voice AI Agent System', 'Knowledge Engine (RAG)', 'The Content Engine', 'Strategic Roadmap', 'Dedicated Automation Partner', '24/7 Priority Support'],
        cta: 'Claim The Ecosystem Bundle',
        popular: true,
        icon: Zap
    };

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
    const stats = [
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
                                Activate Your {' '}
                                <span className="text-cyan-400">
                                    Autonomous Ecosystem
                                </span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2 text-slate-400">
                                    The 4 Pillars of Scale.
                                </span>
                            </h1>

                            <p
                                className="hero-description text-xl md:text-2xl mb-6 max-w-3xl mx-auto"
                                style={{ color: 'var(--rensto-text-secondary)' }}
                            >
                                We activate AI-powered automation systems that handle your sales, support, and operations 24/7.
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
                                <Link href="/free-leads">
                                    <Button
                                        size="xl"
                                        className="font-bold transition-all hover:-translate-y-1 w-full sm:w-auto px-10"
                                        style={{
                                            background: 'linear-gradient(135deg, #FE3D51 0%, #FF6B7D 100%)',
                                            color: '#ffffff',
                                            boxShadow: '0 0 30px rgba(254, 61, 81, 0.4)'
                                        }}
                                    >
                                        <Sparkles className="w-5 h-5 mr-3 animate-pulse text-yellow-300" />
                                        Get 10 Free Leads
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="#pillars">
                                    <Button
                                        size="xl"
                                        variant="renstoSecondary"
                                        className="font-bold transition-all hover:-translate-y-1 w-full sm:w-auto"
                                    >
                                        The 4 Pillars
                                    </Button>
                                </Link>
                                <Link href="/offers#ecosystem">
                                    <Button
                                        size="xl"
                                        variant="renstoNeon"
                                        className="font-bold transition-all hover:-translate-y-1 w-full sm:w-auto"
                                    >
                                        The Bundle
                                    </Button>
                                </Link>
                            </div>

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

                {/* Qualification Engine - The Core Funnel */}
                <section id="pillars" className="py-32 px-4 relative overflow-hidden">
                    <div className="container mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-24 items-center">
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-black uppercase tracking-widest">
                                        <HelpCircle className="w-4 h-4" />
                                        The Ecosystem Architecture
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                        The <span className="text-cyan-400 text-glow">4 Pillars</span> of Autonomous Success
                                    </h2>
                                    <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed">
                                        Most businesses fail at automation because they use scattered task-bots. We architect an integrated Ecosystem where your leads, operations, and knowledge are perfectly synchronized.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Link href="#qualify">
                                        <Button
                                            size="xl"
                                            variant="renstoSecondary"
                                            className="font-black italic uppercase tracking-widest"
                                        >
                                            Start My Analysis
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="relative">
                                <PillarsVisualization />
                            </div>
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
                                            WebkitTextFillColor: 'transparent',
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

                {/* Service Type Cards */}
                <section className="py-20 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                Choose Your Path to Automation
                            </h2>
                            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                                Select the model that fits your growth stage.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                            {serviceTypes.map((service) => {
                                const IconComponent = service.icon;
                                return (
                                    <div
                                        key={service.id}
                                        className="relative rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col"
                                        style={{
                                            background: 'var(--rensto-bg-card)',
                                            borderColor: service.popular ? 'var(--rensto-cyan)' : 'rgba(254, 61, 81, 0.2)',
                                            boxShadow: selectedService === service.id
                                                ? 'var(--rensto-glow-secondary)'
                                                : service.popular
                                                    ? '0 0 30px rgba(95, 251, 253, 0.15)'
                                                    : 'none'
                                        }}
                                        onMouseEnter={() => setSelectedService(service.id)}
                                        onMouseLeave={() => setSelectedService(null)}
                                    >
                                        {service.popular && (
                                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                                <span
                                                    className="px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 text-white whitespace-nowrap"
                                                    style={{ background: 'var(--rensto-gradient-secondary)' }}
                                                >
                                                    <Star className="w-4 h-4" />
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <div
                                                className="w-14 h-14 mb-4 rounded-xl flex items-center justify-center shrink-0"
                                                style={{
                                                    background: service.gradient === 'primary'
                                                        ? 'var(--rensto-gradient-primary)'
                                                        : service.gradient === 'accent'
                                                            ? 'var(--rensto-gradient-neon)'
                                                            : 'var(--rensto-gradient-secondary)'
                                                }}
                                            >
                                                <IconComponent className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-1 min-h-[4rem] flex items-center" style={{ color: 'var(--rensto-text-primary)' }}>
                                                {service.name}
                                            </h3>
                                            <p className="service-tagline text-sm font-medium mb-3" style={{ color: 'var(--rensto-cyan)' }}>
                                                {service.tagline}
                                            </p>
                                            <p className="text-sm min-h-[4.5rem]" style={{ color: 'var(--rensto-text-secondary)' }}>
                                                {service.description}
                                            </p>
                                            <div className="h-10 mb-4 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center px-3 gap-2">
                                                <User className="w-3 h-3 text-red-400 opacity-50" />
                                                <span className="text-[10px] text-red-200/60 font-medium leading-none italic">
                                                    {(service as any).vsHuman}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-6 border-y border-white/5 py-4">
                                            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--rensto-text-primary)' }}>
                                                {service.pricing}
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--rensto-text-muted)' }}>
                                                {service.qualifier}
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-8 flex-grow flex flex-col">
                                            <div className="flex-grow">
                                                {service.features.map((feature, index) => (
                                                    <div key={index} className="flex items-start gap-3 mb-3 last:mb-0">
                                                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--rensto-cyan)' }} />
                                                        <span className="text-xs leading-snug" style={{ color: 'var(--rensto-text-secondary)' }}>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            {/* Scarcity indicator */}
                                            <div
                                                className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                                                style={{ color: 'var(--rensto-primary)' }}
                                            >
                                                <Zap className="w-3 h-3" />
                                                {service.slots}
                                            </div>

                                            <Button
                                                size="xl"
                                                variant={service.gradient === 'primary' ? 'renstoPrimary' : 'renstoSecondary'}
                                                className="w-full font-bold transition-all duration-200 h-14"
                                                onClick={() => {
                                                    const slug = service.id === 'lead-gen' ? 'lead-machine' : service.id;
                                                    handleCheckout(slug, 'service-purchase');
                                                }}
                                                disabled={!!loading}
                                            >
                                                {loading === (service.id === 'lead-gen' ? 'lead-machine' : service.id) ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                                ) : (
                                                    <div className="flex items-center justify-center">
                                                        {service.cta}
                                                        <ArrowRight className="w-5 h-5 ml-2" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Full Ecosystem Bundle Section */}
                <section id="ecosystem" className="py-24 px-4 bg-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]" />
                    <div className="container mx-auto relative z-10">
                        <div className="max-w-6xl mx-auto rounded-[3.5rem] p-12 md:p-20 bg-white/[0.02] border border-white/5 backdrop-blur-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <span className="bg-cyan-500 text-black font-black uppercase text-xs tracking-widest px-6 py-2 rounded-full">
                                    Limited Capacity
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                            <Zap className="w-4 h-4" />
                                            The Ultimate Package
                                        </div>
                                        <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                                            The <span className="text-cyan-400">Total</span> <br />Ecosystem
                                        </h2>
                                    </div>
                                    <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                                        {ecosystemBundle.description}
                                    </p>
                                    <div className="flex items-baseline gap-4 py-8 border-y border-white/5">
                                        <span className="text-7xl font-black text-white">{formatCurrency(ecosystemBundle.price)}</span>
                                        <span className="text-slate-500 font-black uppercase text-sm tracking-[0.2em] line-through decoration-cyan-500/50">
                                            Value: $12,500+
                                        </span>
                                    </div>
                                    <Button
                                        size="xl"
                                        onClick={() => handleCheckout(ecosystemBundle.id, 'service-purchase')}
                                        disabled={!!loading}
                                        className="w-full h-24 text-2xl font-black bg-cyan-400 text-black hover:bg-cyan-300 rounded-3xl transition-all duration-300 shadow-[0_0_50px_rgba(34,211,238,0.2)] hover:shadow-[0_0_70px_rgba(34,211,238,0.3)]"
                                    >
                                        {loading === ecosystemBundle.id ? (
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                {ecosystemBundle.cta}
                                                <ArrowRight className="w-8 h-8" />
                                            </div>
                                        )}
                                    </Button>
                                </div>

                                <div className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Included Components</h3>
                                    <ul className="space-y-6">
                                        {ecosystemBundle.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-5">
                                                <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0">
                                                    <Check className="w-4 h-4 text-cyan-400" />
                                                </div>
                                                <span className="text-lg text-slate-200 font-bold tracking-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
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

                {/* Care Plans Section */}
                <section id="pricing" className="py-24 px-4 border-t border-white/5 bg-[#0f0c29]">
                    <div className="container mx-auto">
                        <div className="text-center mb-16 space-y-6">
                            <div className="inline-flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                <Workflow className="w-4 h-4" />
                                Growth & Maintenance
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                                Ongoing <span className="text-cyan-400">Scale Plans</span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                                Dedicated engineering bandwidth to maintain and evolve your automation engine.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {carePlans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    <div className={`p-8 rounded-[2.5rem] border h-full group transition-all duration-500 flex flex-col ${plan.popular ? 'bg-cyan-500/5 border-cyan-500/30 hover:bg-cyan-500/10' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'}`}>
                                        <div className="mb-10">
                                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">{plan.name}</h3>
                                            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-8">{plan.description}</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black text-white">{formatCurrency(plan.price)}</span>
                                                <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">/{plan.period}</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-5 mb-12 flex-grow">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-4">
                                                    <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                                    <span className="text-sm text-slate-300 font-bold tracking-wide">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            size="xl"
                                            onClick={() => handleCheckout(plan.id, 'subscription')}
                                            disabled={!!loading}
                                            className={`w-full h-20 text-xl font-black rounded-2xl transition-all ${plan.popular ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'bg-white/5 text-white hover:bg-white/10'}`}
                                        >
                                            {loading === plan.id ? (
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            ) : (
                                                plan.cta
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

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
