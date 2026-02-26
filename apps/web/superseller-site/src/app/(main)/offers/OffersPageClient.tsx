'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as framer from 'framer-motion';
const { motion } = framer;
import { formatCurrency } from '@/lib/utils';
import {
    Check,
    Shield,
    Loader2,
    ArrowRight,
    Target as TargetIcon,
    HelpCircle as HelpCircleIcon,
    Zap,
    Users,
    Phone as PhoneIcon,
    LayoutGrid as LayoutGridIcon,
    Workflow,
    Activity as ActivityIcon,
    Cpu as CpuIcon,
    Package as PackageIcon,
    Crosshair as CrosshairIcon
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { NoiseTexture, GlowContainer } from '@/components/ui/premium';

interface OffersPageClientProps {
    initialProducts: any[];
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
    Target: TargetIcon
};

export default function OffersPageClient({ initialProducts }: OffersPageClientProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Merge AITable data with Registry
    const activeProducts = initialProducts.filter(p => {
        const flowType = p['Flow Type'] || p.flowType;
        return flowType !== 'care-plan' && flowType !== 'token-plan';
    }).map(p => {
        const id = p['Product ID'] || p.id;
        return {
            id,
            name: p['Product Name'] || p.name,
            price: parseInt(p['Price'] || p.price) || 0,
            stripePriceId: p['Stripe ID'] || p.stripePriceId,
            flowType: p['Flow Type'] || p.flowType || 'service-purchase',
            description: p['Description'] || p.description || '',
            features: p['Features'] || p.features || [],
            cta: p['CTA'] || p.cta || 'Get Started',
            icon: ICON_MAP[p['Icon'] || p.icon] || Zap,
            popular: p['Popular'] || p.popular || false
        };
    });

    const activeCarePlans = initialProducts.filter(p => {
        const flowType = p['Flow Type'] || p.flowType;
        return flowType === 'care-plan' || flowType === 'token-plan';
    }).map(p => {
        const id = p['Product ID'] || p.id;
        return {
            id,
            name: p['Product Name'] || p.name,
            price: parseInt(p['Price'] || p.price) || 0,
            stripeLink: p['Stripe ID'] || p.stripeLink,
            period: p['Period'] || p.period || 'month',
            description: p['Description'] || p.description || '',
            features: p['Features'] || p.features || [],
            cta: p['CTA'] || p.cta || 'Get Started',
            popular: p['Popular'] || p.popular || false
        };
    });

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
    }

    const t = {
        title: <>Choose Your <br /><span className="gradient-text">Success Path</span></>,
        subtitle: "From strategic audits to ongoing ecosystem care. Designed for businesses that prioritize predictable scale.",
        guaranteeTitle: "The SuperSeller AI Success Guarantee",
        guaranteeText: "Measurable ROI or We Keep Working Until You See It.",
        qualifyTag: "Strategic Analysis",
        qualifyTitle: <>See if your business is ready for <span className="text-cyan-400">Scale.</span></>,
        qualifyText: "Before setting up an Ecosystem, we analyze your current business bottlenecks.",
        expert: "Institutional Standard",
        fixed: "Fixed-Fee",
        careTitle: <>Ongoing <span className="text-cyan-400">Scale Partnerships</span></>,
        careSubtitle: "Dedicated expert bandwidth to maintain and evolve your autonomous engine.",
        roiTitle: "The SuperSeller AI Wealth Impact Guarantee",
        roiText: <>We don&apos;t do regular &quot;trials&quot;. We work with serious founders. If we don&apos;t meet the specific ROI targets agreed upon in your Strategic Roadmap, we keep working—completely on our dime—until the system delivers exactly what we promised.</>,
        ctaTitle: "Not Sure Which Path is Right?",
        ctaText: "Let's discuss your targets and find the perfect automation infrastructure for your business.",
        scheduleCall: "Schedule Strategic Call",
        learnProcess: "Learn Our Methodology"
    };

    return (
        <div
            className="min-h-screen flex flex-col bg-[#0f0c29]"
            style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
        >
            {mounted && <NoiseTexture opacity={0.3} />}

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[160px] rounded-full animate-pulse" />
            </div>

            {mounted && <AnimatedGridBackground />}
            {mounted && <Header />}
            <main className="flex-grow container mx-auto px-6 relative z-10 pt-12 pb-32">
                {/* Hero Section */}
                <section className="py-24 px-4 relative overflow-hidden">
                    <div className="container mx-auto max-w-5xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <Badge className="mb-8 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2">
                                <TargetIcon className="w-4 h-4 mr-2" />
                                Special Automation Offers
                            </Badge>
                            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic mb-8">
                                {t.title}
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                                {t.subtitle}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Success Guarantee Banner */}
                <section className="py-12 mb-32 bg-white/[0.02] border-y border-white/5 rounded-[4rem] px-12">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        <div className="flex items-center gap-6">
                            <Shield className="w-12 h-12 text-cyan-400" />
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{t.guaranteeTitle}</h3>
                                <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest">{t.guaranteeText}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* One-Time Services */}
                <section id="one-time" className="mb-48">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeProducts.map((product, index) => {
                            const Icon = product.icon;
                            const isAudit = product.name === 'Automation Audit';
                            const isEcosystem = product.name === 'Full Ecosystem';
                            const productId = product.id;

                            const CardContent = (
                                <div
                                    id={productId === 'full-ecosystem' ? 'ecosystem' : undefined}
                                    className={`relative p-8 rounded-[2.5rem] border h-full group transition-all duration-500 overflow-hidden flex flex-col ${isAudit ? 'bg-cyan-500/5 border-cyan-500/30 hover:bg-cyan-500/10' :
                                        isEcosystem ? 'bg-[#fe3d51]/5 border-[#fe3d51]/30 hover:bg-[#fe3d51]/10' :
                                            'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                                        }`}>
                                    {product.popular && (
                                        <div className="absolute -top-1 right-12 px-6 py-2 rounded-b-2xl text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black z-20">
                                            {t.expert}
                                        </div>
                                    )}

                                    <div className="mb-10">
                                        <div className="flex items-center gap-6 mb-8">
                                            {Icon && <Icon className={`w-12 h-12 ${isAudit ? 'text-cyan-400' : isEcosystem ? 'text-[#fe3d51]' : 'text-white'}`} />}
                                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">{product.name}</h3>
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-6">
                                            <span className="text-5xl font-black text-white">{formatCurrency(product.price)}</span>
                                            <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t.fixed}</span>
                                        </div>

                                        <p className="text-slate-400 leading-relaxed font-semibold mb-8 group-hover:text-slate-300 transition-colors">
                                            {product.description}
                                        </p>
                                    </div>

                                    <ul className="space-y-4 mb-12 flex-grow">
                                        {product.features?.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-4">
                                                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                                                <span className="text-sm text-slate-300 font-bold tracking-wide">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        size="xl"
                                        onClick={() => {
                                            if (product.flowType === 'strategic-plan' || product.id === 'automation-audit' || product.id === 'full-ecosystem') {
                                                handleCheckout(product.id, product.flowType);
                                            } else {
                                                document.getElementById('qualify')?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className={`w-full h-20 text-xl font-black rounded-2xl transition-all shadow-2xl ${isAudit ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:scale-[1.02]' :
                                            isEcosystem ? 'bg-[#fe3d51] text-white hover:bg-[#ff4d61] hover:scale-[1.02]' :
                                                'bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {loading === product.id ? (
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                {product.cta}
                                                <ArrowRight className="w-6 h-6" />
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            );

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {isAudit || isEcosystem || product.popular ? (
                                        <GlowContainer className="h-full">
                                            {CardContent}
                                        </GlowContainer>
                                    ) : CardContent}
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Qualification Engine */}
                <section id="qualify" className="mb-48 p-16 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10">
                        <div className="text-center mb-16 space-y-6">
                            <div className="inline-flex items-center gap-3 text-cyan-400 font-black text-[11px] uppercase tracking-[0.3em]">
                                <HelpCircleIcon className="w-4 h-4" />
                                {t.qualifyTag}
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                                {t.qualifyTitle}
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                                {t.qualifyText}
                            </p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <QualificationQuiz lang="en" />
                        </div>
                    </div>
                </section>

                {/* Care Plans */}
                <section id="care-plans" className="mb-48">
                    <div className="text-center mb-24 space-y-6">
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                            {t.careTitle}
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                            {t.careSubtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {activeCarePlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="h-full"
                            >
                                <div className={`p-8 rounded-[2.5rem] border h-full group transition-all duration-500 flex flex-col ${plan.popular ? 'bg-cyan-500/5 border-cyan-500/30 hover:bg-cyan-500/10' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                                    }`}>
                                    <div className="mb-10">
                                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">{plan.name}</h3>
                                        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-8">{plan.description}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-white">{formatCurrency(plan.price)}</span>
                                            <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">/{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-5 mb-12 flex-grow">
                                        {plan.features?.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center gap-4">
                                                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                                <span className="text-sm text-slate-300 font-bold tracking-wide">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.stripeLink ? (
                                        <Link href={plan.stripeLink} className="w-full">
                                            <Button
                                                size="xl"
                                                className={`w-full h-20 text-xl font-black rounded-2xl transition-all ${plan.popular ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'bg-white/5 text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/contact" className="w-full">
                                            <Button
                                                size="xl"
                                                className="w-full h-20 text-xl font-black rounded-2xl bg-[#fe3d51] text-white hover:bg-[#ff4d61]"
                                            >
                                                Schedule Discovery
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Guarantee Seal */}
                <section className="mb-48 text-center max-w-4xl mx-auto">
                    <div className="p-20 rounded-[4rem] border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                        <Shield className="w-20 h-20 text-cyan-400 mx-auto mb-10" />
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8">{t.roiTitle}</h2>
                        <p className="text-xl text-slate-400 leading-relaxed font-bold">
                            {t.roiText}
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mb-32 p-16 rounded-[4rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 text-center space-y-12">
                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
                        {t.ctaTitle}
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                        {t.ctaText}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button size="xl" className="w-full h-20 px-12 text-xl font-black rounded-2xl bg-[#fe3d51] text-white hover:bg-[#ff4d61] shadow-2xl">
                                {t.scheduleCall}
                            </Button>
                        </Link>
                        <Link href="/#process" className="w-full sm:w-auto">
                            <Button size="xl" variant="ghost" className="w-full h-20 px-12 text-xl font-black rounded-2xl border border-white/10 text-white hover:bg-white/5">
                                {t.learnProcess}
                            </Button>
                        </Link>
                    </div>
                </section>
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
