'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
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
    Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const ArchitectWidget = dynamic(() => import('@/components/ArchitectWidget'), {
    loading: () => <div className="h-[300px] flex items-center justify-center bg-white/5 rounded-xl border border-white/10 animate-pulse text-xs text-gray-500 italic">Initializing Architect...</div>,
    ssr: false
});

// Pricing Configuration
const BASE_PLAN = {
    price: 249,
    setup: 499,
    features: [
        '1 WhatsApp Number (Session)',
        'Text Inbound & Outbound',
        'n8n Brain Connection (1 Pipeline)',
        'Business Hours Auto-reply',
        'Anti-Ban Safety (Rate Limiting)',
        'Basic Transaction Logging'
    ]
};

const ADDONS = [
    {
        id: 'media',
        name: 'Media Messaging Pack',
        description: 'Send & receive images, video, audio, PDFs. Includes auto-download.',
        price: 79,
        setup: 199,
        icon: MessageSquare
    },
    {
        id: 'handoff',
        name: 'Human Handoff Inbox',
        description: 'Sync with Chatwoot/Zendesk for seamless human takeover.',
        price: 199,
        setup: 399,
        icon: Users
    },
    {
        id: 'groups',
        name: 'Groups Automation',
        description: 'Listen, post, and moderate in WhatsApp Groups.',
        price: 149,
        setup: 299,
        icon: Users
    },
    {
        id: 'broadcast',
        name: 'Broadcast Pack',
        description: 'Automate Channels & Status updates (Stories).',
        price: 199,
        setup: 299,
        icon: Megaphone
    },
    {
        id: 'interactive',
        name: 'Interactive Pack',
        description: 'Polls, buttons, list messages, and funnels.',
        price: 99,
        setup: 199,
        icon: Radio
    },
    {
        id: 'presence',
        name: 'Presence Timing',
        description: 'Typing indicators & online status for realistic feel.',
        price: 99,
        setup: 199,
        icon: Clock
    },
    {
        id: 'labels',
        name: 'Business Labels',
        description: 'Auto-apply labels & sync with CRM stages.',
        price: 79,
        setup: 199,
        icon: LayoutGrid
    },
    {
        id: 'read_ops',
        name: 'Read Operations',
        description: 'Auto-mark as read, bulk read, unread alerts.',
        price: 79,
        setup: 199,
        icon: CheckCircle2
    },
    {
        id: 'profile',
        name: 'Profile Management',
        description: 'Programmatic updates to name, bio, and profile pic.',
        price: 49,
        setup: 99,
        icon: UserCircle
    },
    {
        id: 'security',
        name: 'Security Hardening',
        description: 'IP Allowlisting, HMAC verification, Audit Logs.',
        price: 149,
        setup: 399,
        icon: Lock
    },
    {
        id: 'reliability',
        name: 'Reliability & Scale',
        description: 'Dedicated GOWS engine, session recovery, load shaping.',
        price: 249,
        setup: 499,
        icon: Server
    }
];

export default function WhatsAppPage() {
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [extraNumbers, setExtraNumbers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id)
                ? prev.filter(a => a !== id)
                : [...prev, id]
        );
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
                    productId: 'managed-base',
                    customerEmail: email,
                    selectedAddons,
                    extraNumbers
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

        // Add-ons
        selectedAddons.forEach(id => {
            const addon = ADDONS.find(a => a.id === id);
            if (addon) {
                monthly += addon.price;
                setup += addon.setup;
            }
        });

        // Extra Numbers Logic ($149/mo + $99 setup per extra number)
        if (extraNumbers > 0) {
            monthly += (149 * extraNumbers);
            setup += (99 * extraNumbers);
        }

        return { monthly, setup };
    }, [selectedAddons, extraNumbers]);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#110d28] to-[#110d28]" />

                    <div className="container relative mx-auto px-4 text-center z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-sm font-medium mb-6 animate-fadeIn">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span>No Contracts. Cancel Anytime. You Control the Cost.</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            Your 24/7 AI-Powered <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
                                WhatsApp Sales Agent
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            Automate customer engagement with a human-like WhatsApp AI Agent.
                            Scale sales, support, and CRM workflows instantly. Zero commitments.
                        </p>

                        <div className="flex flex-col md:flex-row gap-8 items-stretch max-w-6xl mx-auto">
                            {/* Video Placeholder - Dominant */}
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
                                    <div className="text-3xl font-bold text-white mb-4">$249<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                                    <ul className="space-y-3 text-gray-300 mb-6 flex-1">
                                        {BASE_PLAN.features.map((feature, i) => (
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

                {/* Configurator Section */}
                <section className="py-20 bg-zinc-950 border-t border-white/5">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-12">

                            {/* Left: Add-on Menu */}
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold mb-2">Build Your Agent</h2>
                                <p className="text-gray-400 mb-8">Select capabilities to add to your base platform.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ADDONS.map(addon => (
                                        <button
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`
                                            relative p-4 rounded-xl text-left transition-all duration-200 border
                                            ${selectedAddons.includes(addon.id)
                                                    ? 'bg-green-500/10 border-green-500/50 ring-1 ring-green-500/20'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                                        `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`p-2 rounded-lg ${selectedAddons.includes(addon.id) ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                                                    <addon.icon className="w-5 h-5" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">+${addon.price}<span className="text-xs text-gray-500">/mo</span></div>
                                                    <div className="text-xs text-gray-500">+${addon.setup} setup</div>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold mb-1">{addon.name}</h3>
                                            <p className="text-xs text-gray-400">{addon.description}</p>

                                            {selectedAddons.includes(addon.id) && (
                                                <div className="absolute top-4 right-4 text-green-500">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Extra Numbers Toggle */}
                                <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Smartphone className="w-4 h-4 text-gray-400" />
                                                Extra WhatsApp Numbers
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Need more than one number? Add sessions here.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                                            <button
                                                onClick={() => setExtraNumbers(Math.max(0, extraNumbers - 1))}
                                                className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-mono">{extraNumbers}</span>
                                            <button
                                                onClick={() => setExtraNumbers(extraNumbers + 1)}
                                                className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right mt-2 text-xs text-gray-500">
                                        +$149/mo + $99 setup per extra number
                                    </div>
                                </div>
                            </div>

                            {/* Right: Sticky Summary */}
                            <div className="lg:w-96">
                                <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                                    <h3 className="text-xl font-bold mb-6">Estimated Cost</h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Monthly Subscription</span>
                                            <span className="text-2xl font-bold">${totals.monthly}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                                            <span className="text-gray-400">One-time Setup</span>
                                            <span className="font-mono text-gray-300">${totals.setup}</span>
                                        </div>

                                        <div className="py-2">
                                            <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Plan Summary</div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">Base Platform</span>
                                                {selectedAddons.map(id => (
                                                    <span key={id} className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs border border-green-500/20">
                                                        {ADDONS.find(a => a.id === id)?.name}
                                                    </span>
                                                ))}
                                                {extraNumbers > 0 && (
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">
                                                        +{extraNumbers} Extra Numbers
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rensto Architect Widget */}
                                    <div className="mb-6 bg-[#110d28] rounded-xl border border-cyan-500/30 p-4 shadow-[0_0_15px_rgba(34,211,238,0.1)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-50">
                                            <Bot size={40} className="text-cyan-500/10" />
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                                                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
                                                </div>
                                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Rensto Architect</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/10 italic">
                                                Ask me anything...
                                            </span>
                                        </div>
                                        <ArchitectWidget />
                                    </div>

                                    <Button
                                        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
                                        onClick={handleCheckout}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Reserving Slot...' : 'Start System Build'}
                                    </Button>

                                    <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed">
                                        Setup includes 100% done-for-you configuration, webhook wiring, and testing.
                                        Monthly fee covers hosting, monitoring, and updates.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-20 bg-black">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Can I use my existing WhatsApp number?</h3>
                                <p className="text-gray-400 text-sm">Yes. We connect your existing number to our engine via QR code scan (Linked Device). You can still use the WhatsApp mobile app normally while our agent runs in the background.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Is this legal / safe from bans?</h3>
                                <p className="text-gray-400 text-sm">We use advanced rate-limiting and human-like delays (Type II Architecture) to keep your number safe. However, standard WhatsApp Terms of Service apply—spamming cold leads is never recommended.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">How does CRM integration work?</h3>
                                <p className="text-gray-400 text-sm">Our "WhatsApp OS" is natively built to sync with HubSpot, Pipedrive, Salesforce, and more. When a lead gives their details in chat, our agent automatically creates/updates the contact in your CRM in real-time.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Can the AI handle images and voice notes?</h3>
                                <p className="text-gray-400 text-sm">Yes. By adding the "Media Pack", your AI can analyze incoming images (receipts, screenshots) and listen to voice notes to extract intent, providing a truly human-like experience.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Does it support international numbers?</h3>
                                <p className="text-gray-400 text-sm">Absolutely. We support WhatsApp numbers from over 190 countries. There are no extra fees for international messaging beyond the standard platform subscription.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Is a Meta API Approval required?</h3>
                                <p className="text-gray-400 text-sm">No. We use a high-stability "Linked Device" architecture which bypasses the need for the official Meta Cloud API approvals, allowing you to get live in minutes rather than weeks.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Can a human take over the chat?</h3>
                                <p className="text-gray-400 text-sm">Yes. You can jump into any conversation from your phone or desktop at any time. The AI will pause automatically when it detects human intervention to avoid double-responses.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">How long does setup take?</h3>
                                <p className="text-gray-400 text-sm">Once you complete the system build and pay the setup fee, our team begins calibration. Most systems are live and connected to your CRM within 2-3 business days.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">What happens if I need custom AI logic?</h3>
                                <p className="text-gray-400 text-sm">The "Base Platform" includes access to our standard Logic Brain. If you require deep research capabilities, custom database lookups, or unique tool-calling, these can be built as custom extensions.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                                <h3 className="font-bold mb-2">Is there a limit to how many messages I can send?</h3>
                                <p className="text-gray-400 text-sm">The Base Platform includes up to 2,000 monthly active sessions. For massive operations, we offer enterprise-grade scaling with no message caps—contact our team for details.</p>
                            </div>
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

// ArchitectWidget removed and moved to src/components/ArchitectWidget.tsx for dynamic loading

