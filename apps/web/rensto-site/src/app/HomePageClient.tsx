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
    Bot
} from 'lucide-react';
import { Schema } from '@/components/seo/Schema';
import { LeadMagnetSection } from '@/components/LeadMagnetSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';


export default function HomePage() {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    // Three core services with Gatekeeper psychology
    const serviceTypes = [
        {
            id: 'custom',
            name: 'Custom Solutions',
            tagline: 'Professional Automation',
            description: 'We build your tailored automation infrastructure from the ground up. Perfect for businesses needing a dedicated Custom Solution.',
            icon: Mic,
            features: [
                'Architecture design',
                'Custom workflow logic',
                'Full implementation',
                'Dedicated support',
                'System ownership'
            ],
            pricing: 'From $2,997',
            qualifier: 'For rapidly scaling businesses',
            cta: 'Start Qualification',
            href: '/custom',
            gradient: 'secondary',
            popular: true,
            slots: '5 spots available'
        },
        {
            id: 'subscriptions',
            name: 'Operational SaaS',
            tagline: 'Leads & Workflow as a Service',
            description: 'Ongoing value delivery. From qualified leads to fully managed workflow tools as an Operational SaaS.',
            icon: Users,
            features: [
                'Qualified Lead Generation',
                'Workflow-as-a-Service',
                'CRM Integration',
                'Automated Follow-up',
                'Performance Dashboards'
            ],
            pricing: 'From $199/mo',
            qualifier: 'Instant value, monthly flexibility',
            cta: 'View Plans',
            href: '/subscriptions',
            gradient: 'primary',
            popular: false,
            slots: 'Immediate Start'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp Agent',
            tagline: '24/7 Operating System',
            description: 'Turn WhatsApp into an automated powerhouse with our AI-powered WhatsApp Agent routing.',
            icon: MessageSquare,
            features: [
                '24/7 Auto-Response',
                'Media & Voice Handling',
                'Human Handoff',
                'Group Automation',
                'Anti-Ban Technology'
            ],
            pricing: 'From $249/mo',
            qualifier: 'For always-on businesses',
            cta: 'Build Agent',
            href: '/whatsapp',
            gradient: 'accent',
            popular: true,
            slots: 'New Launch'
        },
        {
            id: 'solutions',
            name: 'Industry Packages',
            tagline: 'Pre-configured Systems',
            description: 'Proven automation units deployed for your specific industry. Explore our Industry Packages.',
            icon: Package,
            features: [
                'Industry-specific logic',
                'Rapid deployment',
                'Standardized best practices',
                'Training included',
                'Continuous optimization'
            ],
            pricing: 'From $499',
            qualifier: 'Best for specific niches',
            cta: 'Explore Packages',
            href: '/niches',
            gradient: 'primary',
            popular: false,
            slots: 'Open Enrollment'
        }
    ];

    // Social proof stats - Concrete Numbers
    const stats = [
        { value: '5+', label: 'Industry Partners', icon: Users },
        { value: '40+', label: 'Automations Deployed', icon: Zap },
        { value: '200+', label: 'Hours Saved Monthly', icon: Clock },
        { value: '4', label: 'Industries Covered', icon: Target }
    ];

    // Testimonials with real clients
    const testimonials = [
        {
            quote: "The WordPress Agentic Team transformed how we handle updates. It's like having a full dev team on standby.",
            author: "Ben Ginati",
            role: "CEO, Tax4US LLC",
            result: "WordPress Agentic Team",
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
            quote: "Our agreements are now generated instantly via WhatsApp. It changed my entire workflow.",
            author: "Maor Laham Hacohen",
            role: "Advocate, MLH Law",
            result: "Legal Agreements Agent",
            image: "/images/clients/client-maor-laham.jpg"
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
        <div className="min-h-screen flex flex-col pt-16" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <Schema type="FAQPage" data={faqData} />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-24 px-4 relative overflow-hidden">
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
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
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
                                className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto"
                                style={{ color: 'var(--rensto-text-secondary)' }}
                            >
                                We build AI-powered automation systems that handle your sales, support, and operations 24/7.
                            </p>

                            {/* Key Benefits - Scannable */}
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8">
                                <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>Save 20+ hours/week</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>Live in 7-10 days</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm md:text-base" style={{ color: 'var(--rensto-text-muted)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span>100% Satisfaction Guarantee</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                                <Link href="/offers#audit">
                                    <Button
                                        size="lg"
                                        className="font-bold transition-all hover:-translate-y-1 text-lg px-8"
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
                                <Link href="/whatsapp">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="font-bold transition-all hover:-translate-y-1 text-lg px-8 border-2"
                                        style={{
                                            borderColor: 'var(--rensto-accent)',
                                            color: 'var(--rensto-accent)'
                                        }}
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
                                <p className="text-sm mb-6" style={{ color: 'var(--rensto-text-muted)' }}>
                                    Trusted by Law Firms, Healthcare Providers, and Agencies
                                </p>
                                <div className="flex flex-wrap justify-center items-center gap-8 opacity-90">
                                    {/* Real Client Logos */}
                                    <div className="h-8 relative w-24">
                                        <Image
                                            src="/images/logos/logo-wondercare.png"
                                            alt="Wonder.care - AI Automation Client"
                                            fill
                                            className="object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                    <div className="h-8 relative w-24">
                                        <Image
                                            src="/images/logos/logo-tax4us.png"
                                            alt="Tax4US - AI Automation Client"
                                            fill
                                            className="object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                    <div className="h-10 relative w-28">
                                        <Image
                                            src="/images/logos/logo-mlh-law.png"
                                            alt="MLH Law - AI Automation Client"
                                            fill
                                            className="object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                    {/* Ardan as text since logo contains Hebrew */}
                                    <div
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm"
                                        style={{
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.03)'
                                        }}
                                    >
                                        <span className="font-bold text-sm tracking-wide opacity-70" style={{ color: 'var(--rensto-text-secondary)' }}>
                                            ARDAN
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
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

                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {serviceTypes.map((service) => {
                                const IconComponent = service.icon;
                                return (
                                    <div
                                        key={service.id}
                                        className="relative rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-2"
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
                                                    className="px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 text-white"
                                                    style={{ background: 'var(--rensto-gradient-secondary)' }}
                                                >
                                                    <Star className="w-4 h-4" />
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <div
                                                className="w-14 h-14 mb-4 rounded-xl flex items-center justify-center"
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
                                            <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--rensto-text-primary)' }}>
                                                {service.name}
                                            </h3>
                                            <p className="text-sm font-medium mb-3" style={{ color: 'var(--rensto-cyan)' }}>
                                                {service.tagline}
                                            </p>
                                            <p style={{ color: 'var(--rensto-text-secondary)' }}>
                                                {service.description}
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                                                {service.pricing}
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                                                {service.qualifier}
                                            </p>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            {service.features.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--rensto-cyan)' }} />
                                                    <span style={{ color: 'var(--rensto-text-secondary)' }}>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Scarcity indicator */}
                                        <div
                                            className="text-xs font-medium mb-4 flex items-center gap-2"
                                            style={{ color: 'var(--rensto-primary)' }}
                                        >
                                            <Zap className="w-4 h-4" />
                                            {service.slots}
                                        </div>

                                        <Link href={service.href}>
                                            <button
                                                className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                                style={{
                                                    background: service.gradient === 'primary'
                                                        ? 'var(--rensto-gradient-primary)'
                                                        : 'var(--rensto-gradient-secondary)',
                                                    color: '#ffffff',
                                                    boxShadow: service.gradient === 'primary'
                                                        ? 'var(--rensto-glow-primary)'
                                                        : 'var(--rensto-glow-secondary)'
                                                }}
                                            >
                                                {service.cta}
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </Link>
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
                                { num: '01', title: 'Qualify', desc: 'Answer a few questions to see if this is right for you' },
                                { num: '02', title: 'Consult', desc: 'Voice AI or human call to understand your needs' },
                                { num: '03', title: 'Build', desc: 'We create your custom automation system' },
                                { num: '04', title: 'Scale', desc: 'Watch your business run on autopilot' }
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
                                Chat with AI
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
