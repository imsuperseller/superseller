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
      tagline: 'For serious businesses only',
      description: 'AI-powered consultation builds your tailored automation system. We handle everything.',
      icon: Mic,
      features: [
        'Voice AI qualification call',
        'Custom solution proposal',
        'Full implementation',
        'Dedicated support',
        'ROI guarantee'
      ],
      pricing: 'From $2,997',
      qualifier: 'Requires $10K+ monthly revenue',
      cta: 'See If You Qualify',
      href: '/custom',
      gradient: 'secondary',
      popular: true,
      slots: 'Only 5 spots available this month'
    },
    {
      id: 'subscriptions',
      name: 'Lead Subscriptions',
      tagline: 'Automated lead generation',
      description: 'Hot leads delivered directly to your CRM. Fully qualified and ready to close.',
      icon: Users,
      features: [
        'Niche-specific targeting',
        'CRM integration',
        'Lead scoring',
        'Automated follow-up',
        'Performance analytics'
      ],
      pricing: 'From $199/mo',
      qualifier: 'Requires existing sales process',
      cta: 'Check Availability',
      href: '/subscriptions',
      gradient: 'primary',
      popular: false,
      slots: 'Limited capacity per niche'
    },
    {
      id: 'solutions',
      name: 'Industry Packages',
      tagline: 'Proven automation systems',
      description: 'Pre-built solutions for your specific industry. Deploy in days, not months.',
      icon: Package,
      features: [
        'Industry-specific workflows',
        'Quick deployment',
        'Proven templates',
        'Training included',
        'Ongoing optimization'
      ],
      pricing: 'From $499',
      qualifier: 'Best for established businesses',
      cta: 'View Packages',
      href: '/solutions',
      gradient: 'primary',
      popular: false,
      slots: '3 industries accepting clients'
    }
  ];

  // Social proof stats
  const stats = [
    { value: '147', label: 'Clients Automated', icon: Users },
    { value: '2.4M', label: 'Hours Saved', icon: Clock },
    { value: '340%', label: 'Avg ROI', icon: TrendingUp },
    { value: '98%', label: 'Retention Rate', icon: Award }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "Rensto's Custom Solution saved us 40 hours a week. The ROI was visible within the first month.",
      author: "Sarah Chen",
      role: "COO, TechFlow Systems",
      result: "$180K saved annually"
    },
    {
      quote: "The lead subscription literally pays for itself. We get qualified leads on autopilot.",
      author: "Marcus Rodriguez",
      role: "Owner, Elite Roofing",
      result: "3x pipeline growth"
    },
    {
      quote: "Their HVAC package was exactly what we needed. Deployed in a week, running perfectly.",
      author: "James Mitchell",
      role: "VP Operations, ComfortAir",
      result: "60% faster dispatching"
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
    <div className="min-h-screen" style={{
      background: 'var(--rensto-bg-primary)',
      color: 'var(--rensto-text-primary)',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-all"
        style={{
          background: 'rgba(17, 13, 40, 0.98)',
          borderColor: 'rgba(254, 61, 81, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10">
                <Image
                  src="/rensto-logo.png"
                  alt="Rensto Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                  }}
                  priority
                />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>Rensto</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/custom"
                className="transition-colors hover:opacity-80 font-medium"
                style={{ color: 'var(--rensto-cyan)' }}
              >
                Custom Solutions
              </Link>
              <Link
                href="/subscriptions"
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Subscriptions
              </Link>
              <Link
                href="/solutions"
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--rensto-text-primary)' }}
              >
                Industry Packages
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/custom">
                <Button
                  size="sm"
                  className="font-bold"
                  style={{
                    background: 'var(--rensto-gradient-secondary)',
                    color: '#ffffff',
                    boxShadow: 'var(--rensto-glow-secondary)'
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Gatekeeper Psychology */}
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
              Not for everyone — by design
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--rensto-text-primary)' }}
            >
              Most Businesses{' '}
              <span style={{
                background: 'var(--rensto-gradient-secondary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Aren&apos;t Ready
              </span>{' '}
              for This
            </h1>

            <p
              className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto"
              style={{ color: 'var(--rensto-text-secondary)' }}
            >
              We build automation systems that replace entire departments.
              <span className="block mt-2" style={{ color: 'var(--rensto-text-muted)' }}>
                If you&apos;re still comparing prices, this probably isn&apos;t for you.
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
                  See If You Qualify
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div
              className="mt-12 pt-8 border-t"
              style={{ borderColor: 'rgba(95, 251, 253, 0.2)' }}
            >
              <p className="text-sm mb-4" style={{ color: 'var(--rensto-text-muted)' }}>
                Trusted by select businesses who value their time
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-60">
                {/* Placeholder for client logos */}
                {['HVAC Pro', 'Elite Realty', 'FastLock', 'TechFlow'].map((name, i) => (
                  <div
                    key={i}
                    className="text-sm font-medium px-4 py-2 rounded"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{
                    background: 'var(--rensto-gradient-secondary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: 'var(--rensto-text-secondary)' }}>{stat.label}</div>
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

      {/* Testimonials */}
      <section className="py-20 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
              Results That Speak
            </h2>
            <p style={{ color: 'var(--rensto-text-muted)' }}>
              From businesses that took the leap
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 relative"
                style={{ background: 'var(--rensto-bg-card)' }}
              >
                <Quote
                  className="w-10 h-10 mb-4 opacity-30"
                  style={{ color: 'var(--rensto-cyan)' }}
                />
                <p
                  className="text-lg mb-6 leading-relaxed"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                      {testimonial.author}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--rensto-text-muted)' }}>
                      {testimonial.role}
                    </p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: 'rgba(95, 251, 253, 0.1)',
                      color: 'var(--rensto-cyan)'
                    }}
                  >
                    {testimonial.result}
                  </div>
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
              Simple Process, Serious Results
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

      {/* Footer */}
      <footer
        className="py-12 px-4 border-t"
        style={{
          background: 'var(--rensto-bg-primary)',
          borderColor: 'rgba(254, 61, 81, 0.2)'
        }}
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/rensto-logo.png"
                    alt="Rensto Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(254, 61, 81, 0.5)) drop-shadow(0 0 12px rgba(30, 174, 247, 0.3))'
                    }}
                  />
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
                  Rensto
                </span>
              </div>
              <p style={{ color: 'var(--rensto-text-secondary)' }}>
                Automation systems for businesses that value their time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Services
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/custom"
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Custom Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/subscriptions"
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Lead Subscriptions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solutions"
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Industry Packages
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/privacy"
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/terms"
                    className="transition-colors hover:opacity-80"
                    style={{ color: 'var(--rensto-text-secondary)' }}
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                Connect
              </h3>
              <div className="flex items-center gap-4">
                <Link
                  href="https://facebook.com/myrensto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </Link>
                <Link
                  href="https://instagram.com/myrensto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/rensto-llc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--rensto-text-secondary)' }}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>

          <div
            className="border-t mt-8 pt-8 text-center"
            style={{ borderColor: 'rgba(254, 61, 81, 0.2)' }}
          >
            <p style={{ color: 'var(--rensto-text-muted)' }}>
              © 2025 Rensto. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
