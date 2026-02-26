"use client";
import { Tooltip as SimpleTooltip } from '@/components/ui/tooltip-simple';

import React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
    MessageSquare,
    Calendar,
    Zap,
    Bot,
    Clock,
    CheckSquare,
    ScrollText,
    Mic,
    PackageSearch,
    Newspaper,
    Star,
    Eye,
    Megaphone,
    FileText,
    Share2,
    Bell,
    UserPlus,
    HardHat,
    Hammer,
    RefreshCw,
    Headphones,
    ShoppingBag,
    Truck,
    AlertTriangle,
    RefreshCcw,
    Tag,
    TrendingUp,
    Scale,
    ShieldAlert,
    FileSignature,
    FolderInput,
    Briefcase,
    GraduationCap,
    BookOpen,
    FileBarChart,
    Users,
    CreditCard,
    Stethoscope,
    CalendarPlus,
    ShieldCheck,
    ClipboardList,
    Pill,
    UserCheck,
    Home,
    Umbrella,
    PenTool,
    Sun,
    Utensils,
    Box,
    Heart,
    Instagram,
    Info,
    Check as CheckIcon
} from 'lucide-react';

import nicheEngineData from '@/data/niche_engine.json'; // New data source

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import {
    BlueprintIcon, BrainSystemIcon, BuildIcon, GuardIcon, SkillsIcon,
    OldWayXIcon, NewWayCheckIcon, GuaranteeIcon, SupportIcon
} from '@/components/icons/CustomIcons';

// Comprehensive Icon Map
const iconMap: Record<string, any> = {
    // Lucide Icons
    PhoneIncoming: MessageSquare, // Fallback/Best Fit
    MessageSquareWarning: MessageSquare,
    CalendarCheck: Calendar,
    ScrollText: ScrollText,
    Mic: Mic,
    PackageSearch: PackageSearch,
    Newspaper: Newspaper,
    Star: Star,
    Eye: Eye,
    Megaphone: Megaphone,
    Bot: Bot,
    Zap: Zap,
    Calendar: Calendar,
    FileText: FileText,
    Share2: Share2,
    Bell: Bell,
    UserPlus: UserPlus,
    Instagram: Instagram,
    HardHat: HardHat,
    Hammer: Hammer,
    CheckSquare: CheckSquare,
    RefreshCw: RefreshCw,
    Headphones: Headphones,
    ShoppingBag: ShoppingBag,
    Truck: Truck,
    AlertTriangle: AlertTriangle,
    RefreshCcw: RefreshCcw,
    Tag: Tag,
    TrendingUp: TrendingUp,
    Scale: Scale,
    ShieldAlert: ShieldAlert,
    FileSignature: FileSignature,
    FolderInput: FolderInput,
    Briefcase: Briefcase,
    GraduationCap: GraduationCap,
    BookOpen: BookOpen,
    FileBarChart: FileBarChart,
    Users: Users,
    CreditCard: CreditCard,
    Stethoscope: Stethoscope,
    CalendarPlus: CalendarPlus,
    ShieldCheck: ShieldCheck,
    ClipboardList: ClipboardList,
    Pill: Pill,
    UserCheck: UserCheck,
    Home: Home,
    Umbrella: Umbrella,
    PenTool: PenTool,
    Sun: Sun,
    Utensils: Utensils,
    MessageSquare: MessageSquare,
    Clock: Clock,
    Box: Box,
    Heart: Heart,
    Info: Info,
    Check: CheckIcon, // Explicit mapping for basic check

    // Feature Icons
    Blueprint: BlueprintIcon,
    Brain: BrainSystemIcon,
    Build: BuildIcon,
    Guard: GuardIcon,
    Skills: SkillsIcon,

    // Custom Icons
    OldWayX: OldWayXIcon,
    NewWayCheck: NewWayCheckIcon,
    Guarantee: GuaranteeIcon,
    Support: SupportIcon
};

export default function NicheTemplatePage() {
    const params = useParams();
    const slug = params.slug as string;

    const niche = nicheEngineData.find((n) => n.slug === slug);
    const modules = niche?.phases || { core: [], ops: [], growth: [] };

    const coreModules = modules.core || [];
    const opsModules = modules.ops || [];
    const growthModules = modules.growth || [];

    // State for selected add-ons
    const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);

    if (!niche) {
        return notFound();
    }

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Calculate Totals
    const baseSetup = niche?.basePrice?.setup || 2500;
    const baseMonthly = niche?.basePrice?.monthly || 497;

    const allAddons = [...opsModules, ...growthModules];

    const addonsSetup = allAddons
        .filter((m: any) => selectedAddons.includes(m.id))
        .reduce((sum: number, m: any) => sum + (m.price || 0), 0);

    const addonsMonthly = allAddons
        .filter((m: any) => selectedAddons.includes(m.id))
        .reduce((sum: number, m: any) => sum + (m.monthly || 0), 0);

    const totalSetup = baseSetup + addonsSetup;
    const totalMonthly = baseMonthly + addonsMonthly;

    return (
        <div className="min-h-screen text-white selection:bg-[#3B82F6] selection:text-white relative flex flex-col font-sans" style={{ background: 'var(--superseller-bg-primary)' }}>
            <AnimatedGridBackground />
            <Header />

            <main className="pt-32 pb-40 flex-grow">
                {/* Hero Section */}
                <section className="px-6 mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-8 uppercase tracking-wider">
                        System Configurator
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        Build Your AI-Powered {niche.title}
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                        Deploy an industry-specific AI Automation system designed for {niche.title}.
                        Select your core modules and scale your operations with intelligent workflows.
                    </p>

                    {/* @ts-ignore - dynamic data access */}
                    {niche.hero.youtubeId && (
                        <div className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                            <iframe
                                width="100%"
                                height="100%"
                                // @ts-ignore
                                src={`https://www.youtube.com/embed/${niche.hero.youtubeId}?rel=0&modestbranding=1`}
                                title="System Walkthrough"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    )}
                </section>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">

                    {/* LEFT COLUMN: Modules List */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Phase 1: CORE (Locked) */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 bg-[#0F172A]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm sticky top-24 z-10 lg:static lg:bg-transparent lg:p-0 lg:border-none">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]">1</div>
                                <h2 className="text-xl md:text-2xl font-bold">Core System <span className="hidden md:inline text-sm font-normal text-gray-500 ml-2">(Essential Foundation)</span></h2>
                            </div>
                            <div className="grid gap-4">
                                {coreModules.map((item: any) => {
                                    const Icon = iconMap[item.icon] || Bot;
                                    const Card = (
                                        <div className="p-6 rounded-2xl bg-[#0F172A] border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden group">
                                            {/* "Included" Badge */}
                                            <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider">INCLUDED</div>

                                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div key={item.id}>
                                            <SimpleTooltip content={item.tech || ""} side="top" className="w-full">
                                                {Card}
                                            </SimpleTooltip>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Phase 2: OPS (Selectable) */}
                        {opsModules.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 bg-[#0F172A]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm sticky top-24 z-10 lg:static lg:bg-transparent lg:p-0 lg:border-none">
                                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">2</div>
                                    <h2 className="text-xl md:text-2xl font-bold">Operations Add-ons <span className="hidden md:inline text-sm font-normal text-gray-500 ml-2">(Efficiency & Scale)</span></h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {opsModules.map((item: any) => {
                                        const isSelected = selectedAddons.includes(item.id);
                                        const Icon = iconMap[item.icon] || Bot;

                                        const Card = (
                                            <div
                                                onClick={() => toggleAddon(item.id)}
                                                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6 relative group select-none h-full
                                                    ${isSelected
                                                        ? 'bg-[#0F172A] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] opacity-100 transform scale-[1.01]'
                                                        : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className={`absolute top-6 right-6 h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-300
                                                    ${isSelected ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-gray-600 bg-transparent'}`}>
                                                    {isSelected && <CheckIcon size={14} className="text-black stroke-[3]" />}
                                                </div>

                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                                    ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-500'}`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="pr-12">
                                                    <h3 className={`font-bold text-lg mb-1 transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>{item.title}</h3>
                                                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                                                    <div className={`mt-3 text-xs font-mono font-bold tracking-wider transition-colors ${isSelected ? 'text-cyan-400' : 'text-gray-600'}`}>
                                                        +${item.price} SETUP
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <div key={item.id}>
                                                <SimpleTooltip content={item.tech || ""} side="top" className="w-full h-full">
                                                    {Card}
                                                </SimpleTooltip>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Phase 3: GROWTH (Selectable) */}
                        {growthModules.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6 bg-[#0F172A]/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm sticky top-24 z-10 lg:static lg:bg-transparent lg:p-0 lg:border-none">
                                    <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/50 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">3</div>
                                    <h2 className="text-xl md:text-2xl font-bold">Growth Add-ons <span className="hidden md:inline text-sm font-normal text-gray-500 ml-2">(Retention & Referrals)</span></h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {growthModules.map((item: any) => {
                                        const isSelected = selectedAddons.includes(item.id);
                                        const Icon = iconMap[item.icon] || Bot;

                                        const Card = (
                                            <div
                                                onClick={() => toggleAddon(item.id)}
                                                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6 relative group select-none h-full
                                                    ${isSelected
                                                        ? 'bg-[#0F172A] border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] opacity-100 transform scale-[1.01]'
                                                        : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-100 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className={`absolute top-6 right-6 h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-300
                                                    ${isSelected ? 'bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-gray-600 bg-transparent'}`}>
                                                    {isSelected && <CheckIcon size={14} className="text-white stroke-[3]" />}
                                                </div>

                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                                    ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500'}`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div className="pr-12">
                                                    <h3 className={`font-bold text-lg mb-1 transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>{item.title}</h3>
                                                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                                                    <div className={`mt-3 text-xs font-mono font-bold tracking-wider transition-colors ${isSelected ? 'text-purple-400' : 'text-gray-600'}`}>
                                                        +${item.price} SETUP
                                                    </div>
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <div key={item.id}>
                                                <SimpleTooltip content={item.tech || ""} side="top" className="w-full h-full">
                                                    {Card}
                                                </SimpleTooltip>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Summary */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-32 p-6 rounded-3xl border border-white/10 bg-[#0F172A]/90 backdrop-blur-xl shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Your Build
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-gray-400">Core System Setup</span>
                                    <span className="font-mono text-white text-base">${baseSetup.toLocaleString()}</span>
                                </div>
                                {addonsSetup > 0 && (
                                    <div className="flex justify-between text-sm items-center animate-in fade-in slide-in-from-right-4">
                                        <span className="text-cyan-400 flex items-center gap-2">
                                            <div className="flex -space-x-1">
                                                {selectedAddons.length > 0 && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                                                {selectedAddons.length > 2 && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                                            </div>
                                            Add-ons ({selectedAddons.length})
                                        </span>
                                        <span className="font-mono text-cyan-400 text-base">+${addonsSetup.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="h-px bg-white/10 my-4" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-white font-medium">One-Time Setup</span>
                                    <span className="font-mono text-3xl font-bold text-green-400">${totalSetup.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-gray-400">Monthly Support</span>
                                    <span className="font-mono text-white font-bold">${totalMonthly}/mo</span>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight mt-2 flex gap-2">
                                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                                    Includes server maintenance and 24/7 uptime monitoring.
                                </p>
                            </div>

                            <Link href={`/custom/onboarding/new-client?addons=${selectedAddons.join(',')}`}>
                                <div className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 group relative overflow-hidden flex items-center justify-center cursor-pointer">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative">Book Implementation</span>
                                </div>
                            </Link>
                            <p className="text-center text-xs text-gray-600 mt-4">
                                100% Satisfaction Guarantee. Cancel anytime.
                            </p>

                            {/* ROI Anchor */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Cost of Inaction</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 opacity-70 grayscale hover:grayscale-0 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-500/20 text-red-400 p-1.5 rounded">
                                                <OldWayXIcon size={16} />
                                            </div>
                                            <div className="text-sm">
                                                <div className="text-gray-300 font-medium">Standard Hire</div>
                                                <div className="text-[10px] text-gray-500">9-5, Sick Days, Training</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-red-400 font-bold font-mono">$3,500<span className="text-[10px] opacity-70">/mo</span></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
                                        <div className="flex items-center gap-3 relative">
                                            <div className="bg-green-500/20 text-green-400 p-1.5 rounded">
                                                <NewWayCheckIcon size={16} />
                                            </div>
                                            <div className="text-sm">
                                                <div className="text-white font-bold">SuperSeller AI System</div>
                                                <div className="text-[10px] text-green-400/80">24/7/365, Instant Scale</div>
                                            </div>
                                        </div>
                                        <div className="text-right relative">
                                            <div className="text-green-400 font-bold font-mono text-lg">${totalMonthly}<span className="text-[10px] opacity-70">/mo</span></div>
                                        </div>
                                    </div>

                                    <div className="text-center text-[10px] text-gray-500 mt-2">
                                        <span className="text-green-400 font-bold">Save ${(3500 - totalMonthly).toLocaleString()}/mo</span> vs hiring human staff.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Testimonials: Coming Soon */}
                <section className="max-w-7xl mx-auto px-6 mt-32 w-full text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                        <Star size={14} className="text-yellow-500" />
                        <span>Case Studies & Testimonials Coming Soon</span>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-7xl mx-auto px-6 mt-32 w-full">
                    <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
                    <div className="grid md:grid-cols-2 gap-6 w-full">
                        {/* @ts-ignore */}
                        {(niche.faqs || [
                            {
                                question: "Do I need to pay for software licenses?",
                                answer: "We host the core automation on our servers. You only pay for your own communication costs (Twilio/WhatsApp/OpenAI), which typically runs $20-$50/month depending on volume."
                            },
                            {
                                question: "Is there a contract?",
                                answer: "No. We operate on a month-to-month basis. You can pause or cancel your support subscription at any time."
                            },
                            {
                                question: "How long does implementation take?",
                                answer: "Once we have your credentials and assets, we can typically go live within 3-5 business days."
                            },
                            {
                                question: "How do you handle sales tax?",
                                answer: "Our payments are processed via PayPal, which automatically calculates and collects applicable sales tax based on your location (e.g., Texas regulations) at checkout."
                            },
                            {
                                question: "Can I customize the AI's response style?",
                                answer: "Yes. During the \"Business Logic\" onboarding step, you can define the tone (e.g., Professional, Friendly, Urgent) and specific instructions for how the AI usually speaks to your clients."
                            },
                            {
                                question: "Do I need a new phone number?",
                                answer: "Not necessarily. We can integrate with your existing business line for WhatsApp/SMS, or provide a dedicated tracking number if you prefer to keep them separate."
                            },
                            {
                                question: "What if the AI makes a mistake?",
                                answer: "The system is designed to \"fail safe\". If the AI isn't sure, it politely asks for your team's help or forwards the call/message directly to a human, ensuring no lead is ever lost."
                            },
                            {
                                question: "Does it speak Spanish?",
                                answer: "Yes! The AI is fully multilingual. It can detect the customer's language (English, Spanish, French, etc.) and switch instantly to converse fluently with them."
                            },
                            {
                                question: "Can I see the conversations?",
                                answer: "Absolutely. You have a full dashboard where you can read every transcript, listen to call recordings, and jump in to take over a conversation whenever you want."
                            },
                            {
                                question: "How do I get paid?",
                                answer: "For services booked through the automation, we integrate with your PayPal or CRM payment link. Funds go directly to your bank account; we never touch your transaction money."
                            }
                        ]).map((faq: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-400">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
