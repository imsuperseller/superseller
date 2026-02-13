'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail, Download, Zap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'default';

    const content = {
        audit: {
            title: "Audit Received!",
            subtitle: "Our AI brain is currently analyzing your industry...",
            message: "We've received your request for a Free Automation Audit. We'll send the detailed report to your inbox within the next 60 seconds.",
            icon: <Mail className="w-16 h-16 text-red-500" />,
            nextStep: "Check your email (and spam folder) for a message from Rensto AI."
        },
        checklist: {
            title: "Download Starting!",
            subtitle: "Your AI Readiness Checklist is on its way...",
            message: "If your download hasn't started automatically, click the button below to grab your PDF.",
            icon: <Download className="w-16 h-16 text-cyan-400" />,
            nextStep: "Read the checklist to prepare your business for autonomous agents."
        },
        'case-study': {
            title: "Success Story Unlocked",
            subtitle: "See how automation works in the real world...",
            message: "You now have access to our private case study: 'The Zero-Labor Law Firm'. Discover the exact workflows utilized.",
            icon: <Zap className="w-16 h-16 text-purple-400" />,
            nextStep: "Browse our marketplace to see these workflows in action."
        },
        default: {
            title: "Thank You!",
            subtitle: "We'll be in touch shortly.",
            message: "Thank you for your interest in Rensto. We're excited to help you automate your business.",
            icon: <CheckCircle2 className="w-16 h-16 text-green-400" />,
            nextStep: "Join our community or explore our solutions."
        }
    };

    const activeContent = content[type as keyof typeof content] || content.default;

    return (
        <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 shadow-2xl">
                    {activeContent.icon}
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {activeContent.title}
            </h1>
            <p className="text-xl text-cyan-400 mb-8 font-medium">
                {activeContent.subtitle}
            </p>

            <div className="bg-[#1a162f] rounded-3xl p-8 border border-white/5 shadow-xl mb-12">
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {activeContent.message}
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{activeContent.nextStep}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto font-bold h-14 px-8"
                        style={{
                            background: 'linear-gradient(135deg, #FE3D51 0%, #FF6B7D 100%)',
                            boxShadow: '0 8px 20px rgba(254, 61, 81, 0.3)'
                        }}
                    >
                        Explore Marketplace <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </Link>
                <a
                    href="https://wa.me/1234567890?text=I%20just%20received%20my%20lead%20magnet%20and%20want%20to%20chat%20about%20automation!"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto font-bold h-14 px-8 border-green-500/30 text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Chat on WhatsApp
                    </Button>
                </a>
            </div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
                <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
                    <ThankYouContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
