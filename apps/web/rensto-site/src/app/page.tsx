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
    BarChart3
} from 'lucide-react';

export default function HomePage() {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    // Three core services with Gatekeeper psychology
    const serviceTypes = [
        {
            id: 'custom',
            name: 'Custom Solutions',
            tagline: 'Professional Automation',
            description: 'We build your tailored automation infrastructure from the ground up.',
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
            description: 'Ongoing value delivery. From lead generation to fully managed workflow tools.',
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
            id: 'solutions',
            name: 'Industry Packages',
            tagline: 'Pre-configured Systems',
            description: 'Proven automation suites deployed for your specific industry. Fast & reliable.',
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

    // Social proof stats - Abstract Capabilities
    const stats = [
        { value: '24/7', label: 'Operations', icon: Clock },
        { value: 'Zero', label: 'Employee Churn', icon: Users },
        { value: '∞', label: 'Scalability', icon: TrendingUp },
        { value: '100%', label: 'IP Ownership', icon: Shield }
    ];

    // Testimonials with real clients
    const testimonials = [
        {
            quote: "The WordPress Agentic Team transformed how we handle updates. It's like having a full dev team on standby.",
            author: "Ben Ginati",
            role: "CEO, Tax4US LLC",
            result: "WordPress Agentic Team",
            image: "/images/testimonials/ben.jpg"
        },
        {
            quote: "The Monday.com automations save me hours every single day. I can finally focus on patient care.",
            author: "Ortal Flanary",
            role: "Founder, Wonder.care",
            result: "Time-Saving Automations",
            image: "/images/testimonials/ortal.jpg"
        },
        {
            quote: "Our agreements are now generated instantly via WhatsApp. It changed my entire workflow.",
            author: "Maor Laham Hacohen",
            role: "Advocate, MLH Law",
            result: "Legal Agreements Agent",
            image: null // Placeholder
        },
        {
            quote: "My Ruling News Agent keeps me updated faster than any human researcher could.",
            author: "Liran Cohen",
            role: "Advocate",
            result: "Ruling News Agent",
            image: null // Placeholder
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

    return (
        <div className="min-h-screen" style={{ background: 'var(--rensto-bg-primary)', color: 'var(--rensto-text-primary)', fontFamily: 'var(--font-outfit), sans-serif' }}>
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
                            Enterprise-Grade Automation
                        </div>

                        <h1
                            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                            style={{ color: 'var(--rensto-text-primary)' }}
                        >
                            Building the {' '}
                            <span style={{
                                background: 'var(--rensto-gradient-secondary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Infrastructure
                            </span>{' '}
                            of Tomorrow
                        </h1>

                        <p
                            className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto"
                            style={{ color: 'var(--rensto-text-secondary)' }}
                        >
                            We don&apos;t just build bots. We engineer complete operational ecosystems.
                            <span className="block mt-2" style={{ color: 'var(--rensto-text-muted)' }}>
                                Scale your business with systems that never sleep.
                            </span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                            <Link href="/custom">
                                <Button
                                    size="lg"
                                    className="font-bold transition-all hover:-translate-y-1 text-lg px-8"
                                    style={{
                                        background: 'var(--rensto-gradient-secondary)',
                                        color: '#ffffff',
                                        boxShadow: 'var(--rensto-glow-secondary)'
                                    }}
                                >
                                    Start The Process
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div
                            className="mt-12 pt-8 border-t"
                            style={{ borderColor: 'rgba(95, 251, 253, 0.2)' }}
                        >
                            <p className="text-sm mb-6" style={{ color: 'var(--rensto-text-muted)' }}>
                                Powering forward-thinking law firms, healthcare providers, and agencies
                            </p>
                            <div className="flex flex-wrap justify-center gap-6 opacity-80">
                                {/* Logo Placeholders */}
                                {[
                                    { name: 'Wonder.care', color: '#FF0055' },
                                    { name: 'Tax4US', color: '#0055FF' },
                                    { name: 'MLH Law', color: '#AA00FF' },
                                    { name: 'Liran Cohen', color: '#00AAFF' }
                                ].map((client, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 px-5 py-3 rounded-lg border backdrop-blur-sm"
                                        style={{
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.03)'
                                        }}
                                    >
                                        <div className="w-3 h-3 rounded-full" style={{ background: client.color }} />
                                        <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--rensto-text-secondary)' }}>
                                            {client.name.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
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

            {/* Service Type Cards */}
            <section className="py-20 px-4" style={{ background: 'var(--rensto-bg-primary)' }}>
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                            Three Paths to Automation
                        </h2>
                        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                            Each path requires different levels of commitment. Choose based on where you are in your journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
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

            {/* Testimonials - Real Results */}
            <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'var(--rensto-bg-secondary)' }}>
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                            Real Results, Real People
                        </h2>
                        <p style={{ color: 'var(--rensto-text-muted)' }}>
                            Entrepreneurs who stopped doing busy work
                        </p>
                    </div>

                    {/* Scrolling Container */}
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory px-4 -mx-4 md:mx-0 md:px-0 scrollbar-hide">
                        {testimonials.map((testimonial, i) => (
                            <div
                                key={i}
                                className="min-w-[300px] md:min-w-[350px] rounded-2xl p-8 relative flex-shrink-0 snap-center border group hover:border-cyan-500/30 transition-colors"
                                style={{
                                    background: 'var(--rensto-bg-card)',
                                    borderColor: 'rgba(254, 61, 81, 0.1)'
                                }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 relative" style={{ borderColor: 'var(--rensto-cyan)' }}>
                                        {testimonial.image ? (
                                            <Image
                                                src={testimonial.image}
                                                alt={testimonial.author}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl font-bold text-white">
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
                                    className="text-lg mb-6 leading-relaxed italic"
                                    style={{ color: 'var(--rensto-text-secondary)' }}
                                >
                                    &ldquo;{testimonial.quote}&rdquo;
                                </p>

                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                    style={{
                                        background: 'rgba(30, 174, 247, 0.1)',
                                        color: 'var(--rensto-blue)'
                                    }}
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    {testimonial.result}
                                </div>
                            </div>
                        ))}
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
                                    <span className="font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                                        {faq.q}
                                    </span>
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
                    <Link href="/custom">
                        <Button
                            size="lg"
                            className="font-bold transition-all hover:-translate-y-1 text-lg px-10"
                            style={{
                                background: 'var(--rensto-gradient-secondary)',
                                color: '#ffffff',
                                boxShadow: 'var(--rensto-glow-secondary)'
                            }}
                        >
                            Start Qualification
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <p className="mt-6 text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                        No credit card required. Takes less than 2 minutes.
                    </p>
                </div>
            </section>

        </div>
    );
}
