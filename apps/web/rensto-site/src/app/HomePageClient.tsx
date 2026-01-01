'use client';

import { useState } from 'react';
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
    Zap,
    Target,
    Shield,
    Clock,
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
    Workflow
} from 'lucide-react';
import { Schema } from '@/components/seo/Schema';
import { LeadMagnetSection } from '@/components/LeadMagnetSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { HelpCircle } from 'lucide-react';


export default function HomePage() {
    const [selectedService, setSelectedService] = useState<string | null>(null);

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
                'Google Maps/LinkedIn Scraping',
                'AI Lead Enrichment',
                'Automated Cold Outreach',
                'Smart CRM Synchronization',
                'Daily Lead Reports'
            ],
            pricing: 'From $997/mo',
            qualifier: 'Scale your sales overnight',
            cta: 'Build My Engine',
            href: '/offers',
            gradient: 'primary',
            popular: true,
            slots: '3 slots left'
        },
        {
            id: 'whatsapp-secretary',
            name: 'Autonomous Secretary',
            tagline: 'WhatsApp & Voice AI',
            description: 'Your own AI assistant that answers messages, books meetings, and handles clients perfectly on WhatsApp and Voice.',
            vsHuman: 'Available 24/7. Never forgets a follow-up. Never calls in sick.',
            icon: MessageSquare,
            features: [
                '24/7 WhatsApp Response',
                'Live Voice AI Calling',
                'Automated Appointment Booking',
                'Multi-Language Support',
                'Zero-Ban Protection'
            ],
            pricing: 'From $497/mo',
            qualifier: 'Never miss a lead again',
            cta: 'Hire My Assistant',
            href: '/whatsapp',
            gradient: 'accent',
            popular: false,
            slots: '⭐ Top Rated'
        },
        {
            id: 'rag-systems',
            name: 'Knowledge Engine',
            tagline: 'Agentic RAG & Systems',
            description: 'Connect AI to your company data. A private intelligence system that knows your best practices and projects.',
            vsHuman: 'The "perfect memory" employee who never needs re-training.',
            icon: Mic,
            features: [
                'Custom Data Source Sync',
                'Private AI Knowledge Base',
                'Team Training Included',
                'Process Logic Flowcharts',
                'Strict Data Security'
            ],
            pricing: 'From $1,497/mo',
            qualifier: 'For established teams',
            cta: 'Secure My Data',
            href: '/contact',
            gradient: 'secondary',
            popular: false,
            slots: 'Engineering Required'
        },
        {
            id: 'content-engine',
            name: 'The Content Engine',
            tagline: 'Traffic & Viral Growth',
            description: 'Autonomous systems that generate, edit, and distribute high-authority content across all social channels.',
            vsHuman: 'A full content agency in a box—at a fraction of the cost.',
            icon: Users,
            features: [
                'Multi-Channel Distribution',
                'AI Video/Image Generation',
                'SEO Authority Automation',
                'Trending Topic Analysis',
                'Weekly Growth Reports'
            ],
            pricing: 'From $1,497/mo',
            qualifier: 'Dominate your market',
            cta: 'See The Results',
            href: '/offers',
            gradient: 'primary',
            popular: false,
            slots: 'Scaling Fast'
        }
    ];

    // Social proof stats - Concrete Numbers
    const stats = [
        { value: 'Systems', label: 'Architected', icon: Zap },
        { value: 'Hours', label: 'Reclaimed Daily', icon: Clock },
        { value: 'Savings', label: 'Operational Impact', icon: TrendingUp },
        { value: '24/7', label: 'Support Coverage', icon: Shield }
    ];

    // Testimonials with real clients
    const testimonials = [
        {
            quote: "The Automated Website Team changed how we handle our site. It's like having a full tech team on standby 24/7.",
            author: "Ben Ginati",
            role: "CEO, Tax4US LLC",
            result: "24/7 Website Support",
            image: "/images/testimonials/client-testimonial-ben.jpg"
        },
        {
            quote: "The Monday.com automations save me hours every single day. I can finally focus on patient care.",
            author: "Ortal Flanary",
            role: "Founder, Wonder.care",
            result: "Time-Saving Automations",
            image: "/images/testimonials/client-testimonial-ortal.jpg"
        },
        {
            quote: "The project management automations cut our administrative overhead by 40%. Best investment we've made.",
            author: "Aviad Hazout",
            role: "CEO, Ardan Management & Engineering",
            result: "Project Automation",
            image: "/images/clients/client-aviad-hazout.jpg"
        }
    ];

    // FAQ for objection handling
    const faqs = [
        {
            q: "How is this different from hiring a developer?",
            a: "We're not just developers—we're automation strategists. We analyze your operations, identify the highest-impact opportunities, and build systems that pay for themselves within months."
        },
        {
            q: "What if I'm not tech-savvy?",
            a: "Perfect. Our systems run in the background. You get results through dashboards you already use. No technical knowledge required."
        },
        {
            q: "How quickly can I see results?",
            a: "Industry packages deploy in 1-2 weeks. Custom solutions take 2-4 weeks. Most clients see measurable impact within the first month."
        },
        {
            q: "What's the catch with the qualification process?",
            a: "No catch—we're selective because we guarantee results. If your business isn't ready for automation, we'd rather tell you honestly than take your money."
        },
        {
            q: "Do I own the system?",
            a: "Yes. For our built-for-you systems, you own the infrastructure. We build it on your accounts, and you keep the intellectual property forever."
        },
        {
            q: "Can this replace my whole team?",
            a: "It's designed to replace the boring, repetitive work. It frees your team to focus on high-value tasks like strategy and closing deals."
        },
        {
            q: "What tools do you integrate with?",
            a: "We work with almost everything: Monday.com, Salesforce, HubSpot, WhatsApp, G-Suite, Slack, and custom databases."
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
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
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
                                className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                                style={{ color: 'var(--rensto-text-primary)' }}
                            >
                                Stop Working {' '}
                                <span style={{
                                    background: 'var(--rensto-gradient-secondary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    For Your Business
                                </span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2" style={{ color: 'var(--rensto-text-secondary)' }}>
                                    Make It Work For You.
                                </span>
                            </h1>

                            <p
                                className="hero-description text-xl md:text-2xl mb-6 max-w-3xl mx-auto"
                                style={{ color: 'var(--rensto-text-secondary)' }}
                            >
                                We build AI-powered automation systems that handle your sales, support, and operations 24/7.
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
                                    <span>Cheaper than a part-time junior</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                                <Button
                                    size="xl"
                                    variant="renstoSecondary"
                                    onClick={() => document.getElementById('qualify')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="font-bold transition-all hover:-translate-y-1 w-full sm:w-auto"
                                >
                                    Qualify for an Audit
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Link href="/whatsapp">
                                    <Button
                                        size="xl"
                                        variant="renstoNeon"
                                        className="font-bold transition-all hover:-translate-y-1 w-full sm:w-auto"
                                    >
                                        See WhatsApp AI Demo
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
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 opacity-80 items-center justify-items-center max-w-3xl mx-auto">
                                    {/* Real Client Logos - Normalized Heights */}
                                    <div className="h-10 relative w-full max-w-[140px]">
                                        <Image
                                            src="/images/logos/logo-tax4us.png"
                                            alt="Tax4US - AI Automation Client"
                                            fill
                                            className="object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                    <div className="h-10 relative w-full max-w-[140px]">
                                        <Image
                                            src="/images/logos/logo-ardan.png"
                                            alt="ARDAN - Project Management Client"
                                            fill
                                            className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                                            style={{ mixBlendMode: 'screen' }}
                                        />
                                    </div>
                                    <div className="h-10 relative w-full max-w-[140px]">
                                        <Image
                                            src="/images/logos/logo-wondercare.png"
                                            alt="WonderCare - Healthcare Automation"
                                            fill
                                            className="object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </div>
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
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: 'url(/images/grid.svg) repeat' }} />

                    <div className="container mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6 text-sm font-bold">
                                    <Zap className="w-4 h-4" />
                                    The Engine Behind the Result
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                    Enterprise Grade <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Automation Backend</span>
                                </h2>
                                <p className="text-xl text-slate-400 mb-8 max-w-xl">
                                    While others offer &quot;simple bots&quot;, we architect complex multi-stage workflows in n8n.
                                    Every system we build includes a **Daily Health Check**—our own code monitoring your business every 60 seconds.
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
                                        <div className="text-[10px] font-mono text-slate-500">CORE_SERVICE_FULFILLMENT.json</div>
                                    </div>

                                    {/* Visual Representation of n8n Nodes */}
                                    <div className="grid grid-cols-2 gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <Zap className="w-8 h-8 text-yellow-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">Trigger</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <Bot className="w-8 h-8 text-cyan-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">AI Branching</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <Workflow className="w-8 h-8 text-purple-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">Process Logic</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
                                            <CheckCircle className="w-8 h-8 text-green-400" />
                                            <span className="text-[10px] font-mono text-slate-400 uppercase">Success</span>
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
                <section id="qualify" className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0a061e]/30">
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 text-sm font-bold">
                                <HelpCircle className="w-4 h-4" />
                                New to AI? Start Here
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                                See if your business can <span className="text-cyan-400">run itself.</span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                                You don&apos;t need to be a tech expert. We take care of everything. Let&apos;s see how much time we can save you.
                            </p>
                        </div>
                        <QualificationQuiz />
                    </div>
                </section>

                {/* Stats Section - Capabilities */}
                <section className="py-12 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
                    <div className="container mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center group hover:-translate-y-1 transition-transform duration-300">
                                    <div
                                        className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-105 transition-transform"
                                        style={{
                                            background: 'var(--rensto-gradient-secondary)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div className="flex items-center justify-center gap-2" style={{ color: 'var(--rensto-text-secondary)' }}>
                                        <stat.icon className="w-4 h-4 opacity-50" />
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

                                            <Link href={service.href}>
                                                <Button
                                                    size="xl"
                                                    variant={service.gradient === 'primary' ? 'renstoPrimary' : 'renstoSecondary'}
                                                    className="w-full font-bold transition-all duration-200 h-14"
                                                >
                                                    {service.cta}
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
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
        </div>
    );
}
