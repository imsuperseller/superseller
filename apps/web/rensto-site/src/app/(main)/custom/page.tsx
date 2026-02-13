'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { Loader2, Rocket, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function CustomPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col bg-[#0f0c29]"
            style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
        >
            {mounted && <NoiseTexture opacity={0.03} />}
            {mounted && <AnimatedGridBackground />}
            <Header />
            <main className="flex-grow">
                {/* Hero */}
                <section className="py-24 px-4 relative overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="container mx-auto max-w-4xl text-center relative z-10"
                    >
                        <Badge className="mb-8 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2">
                            <Rocket className="w-4 h-4 mr-2" />
                            Custom Solutions
                        </Badge>
                        <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic mb-8">
                            Architect Your<br />
                            <span className="text-cyan-400">Infinite Engine</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
                            Stop building tools. Start architecting high-leverage systems that
                            decouple your time from your revenue.
                        </p>
                    </motion.div>
                </section>

                {/* Qualification Quiz */}
                <section className="py-16 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <QualificationQuiz />
                    </div>
                </section>

                {/* What You Get */}
                <section className="py-24 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                                The Architecture
                            </h2>
                        </motion.div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'The Audit', desc: 'A 30-min diagnostic session to identify your biggest revenue leaks and leverage points.' },
                                { title: 'The Blueprint', desc: 'A logical ROI-first architecture designed to replace human overhead with silent engines.' },
                                { title: 'Deployment', desc: 'We stress-test and activate your engine, ensuring it produces results from day one.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-500 group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                                        <Check className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tight">{item.title}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 px-4 bg-gradient-to-r from-red-500/10 to-cyan-500/10 border-t border-white/5">
                    <div className="container mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Prefer to Talk to a Human?
                        </h2>
                        <p className="text-slate-400 mb-8">
                            Schedule a call with our team to discuss your project.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact">
                                <Button size="xl" variant="renstoPrimary">
                                    Schedule an Audit
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/offers">
                                <Button size="xl" variant="renstoSecondary">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
