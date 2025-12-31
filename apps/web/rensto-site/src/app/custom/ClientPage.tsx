'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button-enhanced';
import {
    Zap,
    CheckCircle,
    ArrowRight,
    Globe,
    Brain,
    Loader2
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import {
    BlueprintIcon,
    BuildIcon,
    SupportIcon,
    BrainSystemIcon,
    SkillsIcon,
    GuardIcon,
    GuaranteeIcon,
    OldWayXIcon,
    NewWayCheckIcon
} from '@/components/icons/CustomIcons';
import { Header } from '@/components/Header';
import { ElevenLabsWidget } from '@/components/ElevenLabsWidget';

// Types for the flow state
type FlowState = 'IDLE' | 'BOOTING' | 'INTERRUPTION' | 'QUALIFIED' | 'GENERATING_SOLUTION' | 'PROPOSAL' | 'REVEAL' | 'GENERATING';



export default function CustomSolutionsPage() {
    const router = useRouter();
    const [flowState, setFlowState] = useState<FlowState>('IDLE');
    const [url, setUrl] = useState('');
    const [bootLogs, setBootLogs] = useState<string[]>([]);
    const [interruptionStep, setInterruptionStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [emailInput, setEmailInput] = useState('');
    const [scanPhase, setScanPhase] = useState(0);

    const terminalRef = useRef<HTMLDivElement>(null);

    // Gatekeeper-style qualification questions
    const questions = [
        {
            id: 'revenue-qualification',
            text: "QUALIFICATION CHECK: Are you currently generating revenue, or still in pre-launch phase?",
            options: [
                "Generating $10K+/month",
                "Generating $1K-$10K/month",
                "Pre-revenue but funded",
                "Just exploring ideas"
            ],
            type: 'choice' as const,
            gatekeeperHint: "We work best with businesses already generating revenue.",
            scoreMap: { "Generating $10K+/month": 30, "Generating $1K-$10K/month": 25, "Pre-revenue but funded": 15, "Just exploring ideas": 5 }
        },
        {
            id: 'timeline-commitment',
            text: "COMMITMENT CHECK: When do you need this operational?",
            options: [
                "This week - urgent",
                "This month",
                "This quarter",
                "Just researching"
            ],
            type: 'choice' as const,
            gatekeeperHint: "Our approach works best with fast implementers who take action.",
            scoreMap: { "This week - urgent": 30, "This month": 25, "This quarter": 15, "Just researching": 5 }
        },
        {
            id: 'investment-readiness',
            text: "INVESTMENT READINESS: Have you set aside budget for automation this quarter?",
            options: [
                "Yes, $5K+ ready to invest",
                "Yes, $1K-$5K allocated",
                "Need to see ROI first",
                "No budget yet"
            ],
            type: 'choice' as const,
            gatekeeperHint: "Serious buyers have pre-allocated resources.",
            scoreMap: { "Yes, $5K+ ready to invest": 30, "Yes, $1K-$5K allocated": 20, "Need to see ROI first": 10, "No budget yet": 0 }
        },
        {
            id: 'email',
            text: "Last step: Where should we send your custom blueprint?",
            type: 'email' as const,
            gatekeeperHint: "This is how we deliver your personalized strategy."
        }
    ];

    // Calculate qualification score
    const calculateQualificationScore = (ans: Record<string, string>) => {
        let score = 0;
        questions.forEach(q => {
            if (q.scoreMap && ans[q.id]) {
                score += q.scoreMap[ans[q.id] as keyof typeof q.scoreMap] || 0;
            }
        });
        return score;
    };

    // Get qualification message
    const getQualificationMessage = (ans: Record<string, string>) => {
        const score = calculateQualificationScore(ans);
        if (score >= 70) return { title: "EXCELLENT MATCH", subtitle: "You're exactly who we build for.", color: "text-green-400" };
        if (score >= 40) return { title: "GOOD POTENTIAL", subtitle: "We can likely help you.", color: "text-yellow-400" };
        return { title: "EARLY STAGE", subtitle: "Consider our resources first.", color: "text-orange-400" };
    };

    // Scroll to terminal when starting the flow
    const scrollToTerminal = () => {
        terminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Deep Scan Sequence Logic
    useEffect(() => {
        if (flowState === 'BOOTING') {
            const scanPhases = [
                { label: 'Initializing Rensto Core...', progress: 10 },
                { label: 'Connecting to target...', progress: 20 },
                { label: 'Scanning digital infrastructure...', progress: 35 },
                { label: 'Detecting technology stack...', progress: 50 },
                { label: 'Analyzing traffic patterns...', progress: 65 },
                { label: 'Calculating automation potential...', progress: 80 },
                { label: 'Optimization opportunity detected!', progress: 95 },
                { label: 'ANALYSIS COMPLETE', progress: 100 }
            ];

            let currentPhase = 0;
            setScanPhase(0);
            setBootLogs([]);

            const interval = setInterval(() => {
                if (currentPhase < scanPhases.length) {
                    setScanPhase(currentPhase);
                    setBootLogs(prev => [...prev, scanPhases[currentPhase].label]);
                    currentPhase++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => setFlowState('INTERRUPTION'), 800);
                }
            }, 600);

            return () => clearInterval(interval);
        }
    }, [flowState]);

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
            setUrl(formattedUrl);
            setFlowState('BOOTING');
            scrollToTerminal();
        }
    };

    const handleInterruptionAnswer = async (answer: string) => {
        const currentQuestion = questions[interruptionStep];
        const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
        setAnswers(updatedAnswers);

        if (interruptionStep < questions.length - 1) {
            setInterruptionStep(prev => prev + 1);
        } else {
            setFlowState('QUALIFIED');
        }
    };

    const handleProceedFromQualified = () => {
        // Parse client name from URL
        const email = answers.email || '';
        let clientName = 'YOUR BUSINESS';
        try {
            const hostname = url.replace(/^https?:\/\//, '').split('/')[0];
            const cleanHost = hostname.replace(/^www\./, '');
            const namePart = cleanHost.split('.')[0];
            if (namePart) clientName = namePart.toUpperCase();
        } catch (e) {
            console.warn('Failed to parse client name', e);
        }

        // Send lead to n8n workflow (fire-and-forget)
        fetch('/api/leads/intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: clientName,
                email: email,
                website: url,
                message: `Revenue: ${answers['revenue-qualification'] || 'N/A'}, Timeline: ${answers['timeline-commitment'] || 'N/A'}, Budget: ${answers['investment-readiness'] || 'N/A'}`,
                company: clientName,
                source: 'rensto-custom-page',
                consent: true
            })
        }).catch(err => console.error('[Custom Page] Lead intake error:', err));

        // Redirect to audit page
        router.push(`/offers#audit?client=${encodeURIComponent(clientName)}&email=${encodeURIComponent(email)}`);
    };



    return (
        <div className="min-h-screen flex flex-col text-white font-sans selection:bg-rensto-red/30" style={{ background: 'var(--rensto-bg-primary)' }}>

            {/* Header */}
            <Header />

            {/* ===== HERO SECTION ===== */}
            <section className="py-24 px-4 relative overflow-hidden min-h-[80vh] flex items-center">
                <AnimatedGridBackground />
                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">Custom AI Systems for Business Owners</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{
                        background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Custom AI Automation:<br />Architect Your Empire.
                    </h1>
                    <p className="text-xl mb-12 max-w-3xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                        We build tailored AI Automation Systems that scale your operations,
                        eliminate manual work, and integrate perfectly with your CRM.
                    </p>
                    <Button
                        onClick={() => {
                            const el = document.getElementById('terminal');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-white px-10 py-7 text-xl rounded-xl font-bold"
                        style={{
                            background: 'var(--rensto-gradient-secondary)',
                            boxShadow: 'var(--rensto-glow-secondary)'
                        }}
                    >
                        See Your System Built Live
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </section>

            {/* ===== LIVE DEMO TERMINAL (MOVED UP) ===== */}
            <section id="terminal" ref={terminalRef} className="py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10"
                        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(30, 174, 247, 0.2) 0%, transparent 70%)' }} />
                </div>
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-4">See It In Action</h2>
                    <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                        Enter your website below. **Hope**, our AI assistant, will analyze your business and show you exactly what your custom system could look like.
                    </p>

                    {/* STATE: IDLE (URL Input) */}
                    {flowState === 'IDLE' && (
                        <div className="max-w-lg mx-auto">
                            <form onSubmit={handleUrlSubmit} className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Globe className="w-5 h-5" style={{ color: 'var(--rensto-text-muted)' }} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="yourwebsite.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-12 pr-4 py-5 rounded-xl text-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-white placeholder:text-slate-600"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-2 bottom-2 px-6 rounded-lg text-white font-semibold transition-all flex items-center gap-2 hover:opacity-90"
                                    style={{
                                        background: 'var(--rensto-gradient-secondary)',
                                        boxShadow: 'var(--rensto-glow-secondary)'
                                    }}
                                >
                                    Analyze
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STATE: BOOTING - Deep Scan Visual */}
                    {flowState === 'BOOTING' && (
                        <div className="relative rounded-3xl p-8 backdrop-blur-xl border overflow-hidden" style={{
                            background: 'linear-gradient(135deg, rgba(30, 174, 247, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                            borderColor: 'rgba(30, 174, 247, 0.4)',
                            boxShadow: '0 0 80px rgba(30, 174, 247, 0.2)'
                        }}>
                            {/* Animated background pulse */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-ping opacity-10" style={{ background: 'var(--rensto-blue)' }} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full animate-pulse opacity-20" style={{ background: 'var(--rensto-cyan)' }} />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30, 174, 247, 0.2)' }}>
                                        <Brain className="w-5 h-5" style={{ color: 'var(--rensto-blue)' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">RENSTO DEEP SCAN</h3>
                                        <p className="text-xs" style={{ color: 'var(--rensto-text-muted)' }}>Analyzing {url.replace(/^https?:\/\//, '').split('/')[0]}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-400 font-mono">ACTIVE</span>
                                </div>
                            </div>

                            {/* Circular Progress Indicator */}
                            <div className="flex flex-col items-center justify-center py-8 relative z-10">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="rgba(30, 174, 247, 0.2)" strokeWidth="8" fill="none" />
                                        <circle
                                            cx="80" cy="80" r="70"
                                            stroke="url(#scanGradient-custom)"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 70}`}
                                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - (scanPhase + 1) / 8)}`}
                                            className="transition-all duration-500 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="scanGradient-custom" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="var(--rensto-blue)" />
                                                <stop offset="100%" stopColor="var(--rensto-cyan)" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold" style={{ color: 'var(--rensto-cyan)' }}>
                                            {Math.round(((scanPhase + 1) / 8) * 100)}%
                                        </span>
                                        <span className="text-xs" style={{ color: 'var(--rensto-text-muted)' }}>SCANNING</span>
                                    </div>
                                </div>

                                <p className="mt-6 text-lg font-medium animate-pulse" style={{ color: 'var(--rensto-text-primary)' }}>
                                    {bootLogs[bootLogs.length - 1] || 'Initializing...'}
                                </p>
                            </div>

                            {/* Detection Log */}
                            <div className="mt-4 p-4 rounded-xl font-mono text-xs space-y-1 max-h-32 overflow-y-auto relative z-10" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                {bootLogs.map((log, i) => (
                                    <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200" style={{ color: i === bootLogs.length - 1 ? 'var(--rensto-cyan)' : 'var(--rensto-text-muted)' }}>
                                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                        <span>{log}</span>
                                    </div>
                                ))}
                                {bootLogs.length < 8 && (
                                    <div className="flex items-center gap-2 animate-pulse" style={{ color: 'var(--rensto-blue)' }}>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STATE: INTERRUPTION (Questions) */}
                    {flowState === 'INTERRUPTION' && (
                        <div className="bg-slate-900/90 border border-cyan-500/50 rounded-2xl p-8 shadow-[0_0_100px_rgba(6,182,212,0.2)] backdrop-blur-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                                <div className="h-full transition-all duration-500 ease-out" style={{ width: `${((interruptionStep + 1) / questions.length) * 100}%`, background: 'var(--rensto-cyan)' }} />
                            </div>

                            <p className="text-sm mb-2" style={{ color: 'var(--rensto-text-muted)' }}>
                                Question {interruptionStep + 1} of {questions.length}
                            </p>

                            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--rensto-text-primary)' }}>
                                {questions[interruptionStep].text}
                            </h3>

                            {questions[interruptionStep].type === 'choice' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {questions[interruptionStep].options?.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleInterruptionAnswer(option)}
                                            className="p-4 rounded-xl border text-left transition-all hover:scale-[1.02] hover:border-cyan-500/50"
                                            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {questions[interruptionStep].type === 'email' && (
                                <div className="max-w-md mx-auto">
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && emailInput && handleInterruptionAnswer(emailInput)}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 mb-4"
                                    />
                                    <Button
                                        onClick={() => emailInput && handleInterruptionAnswer(emailInput)}
                                        disabled={!emailInput}
                                        className="w-full"
                                        style={{ background: 'var(--rensto-gradient-secondary)' }}
                                    >
                                        Get My Blueprint <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STATE: QUALIFIED */}
                    {flowState === 'QUALIFIED' && (
                        <div className="rounded-2xl p-8 backdrop-blur-xl border text-center" style={{
                            background: 'linear-gradient(135deg, rgba(95, 251, 253, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                            borderColor: 'rgba(95, 251, 253, 0.4)'
                        }}>
                            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(95, 251, 253, 0.2)' }}>
                                <CheckCircle className="w-8 h-8" style={{ color: 'var(--rensto-cyan)' }} />
                            </div>
                            <h3 className={`text-2xl font-bold mb-2 ${getQualificationMessage(answers).color}`}>
                                {getQualificationMessage(answers).title}
                            </h3>
                            <p className="mb-8" style={{ color: 'var(--rensto-text-secondary)' }}>
                                {getQualificationMessage(answers).subtitle}
                            </p>
                            <Button
                                onClick={handleProceedFromQualified}
                                className="text-white px-8 py-4 text-lg rounded-xl font-bold"
                                style={{
                                    background: 'var(--rensto-gradient-secondary)',
                                    boxShadow: 'var(--rensto-glow-secondary)'
                                }}
                            >
                                View Your Custom Plan <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== OLD WAY VS NEW WAY ===== */}
            <section className="py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--rensto-primary)' }} />
                    <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--rensto-cyan)' }} />
                </div>
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(254, 61, 81, 0.1)', color: 'var(--rensto-primary)', border: '1px solid rgba(254, 61, 81, 0.3)' }}>
                            The Truth Nobody Tells You
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                            The Old Way vs. The New Way
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                            You&apos;ve tried hiring. You&apos;ve tried freelancers. Here&apos;s why those approaches keep failing—and what actually works.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* The Old Way */}
                        <div className="group relative">
                            <div className="absolute inset-0 rounded-3xl blur-xl opacity-30" style={{ background: 'rgba(239, 68, 68, 0.3)' }} />
                            <div className="relative rounded-3xl p-8 backdrop-blur-xl border h-full" style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                borderColor: 'rgba(239, 68, 68, 0.3)'
                            }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                                        <OldWayXIcon size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-red-400">The Old Way</h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Hire employees ($50k+/year each)",
                                        "Train for 3-6 months before productivity",
                                        "Manage egos, sick days, turnover",
                                        "Scale linearly (2x work = 2x cost)",
                                        "Knowledge leaves when they leave"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <OldWayXIcon size={28} className="flex-shrink-0" />
                                            <span style={{ color: 'var(--rensto-text-secondary)' }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* The Rensto Way */}
                        <div className="group relative">
                            <div className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" style={{ background: 'rgba(95, 251, 253, 0.3)' }} />
                            <div className="relative rounded-3xl p-8 backdrop-blur-xl border h-full transition-all duration-300 group-hover:translate-y-[-4px]" style={{
                                background: 'linear-gradient(135deg, rgba(95, 251, 253, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                borderColor: 'rgba(95, 251, 253, 0.3)'
                            }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(95, 251, 253, 0.2)' }}>
                                        <NewWayCheckIcon size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold" style={{ color: 'var(--rensto-cyan)' }}>The Rensto Way</h3>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "One-time build (fixed cost)",
                                        "Operational in 2-4 weeks",
                                        "Works 24/7, never complains",
                                        "Scales infinitely (10x output = same cost)",
                                        "Your IP, your system, forever"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <NewWayCheckIcon size={28} className="flex-shrink-0" />
                                            <span style={{ color: 'var(--rensto-text-secondary)' }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW WE BUILD YOUR SYSTEM ===== */}
            <section id="process" className="py-24 px-4 relative overflow-hidden" style={{ background: 'var(--rensto-bg-secondary)' }}>
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(30, 174, 247, 0.1)', color: 'var(--rensto-blue)', border: '1px solid rgba(30, 174, 247, 0.3)' }}>
                            The Process
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                            How We Build Your System
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                            Three simple steps. No fluff. Just results.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { Icon: BlueprintIcon, title: '1. Blueprint', description: 'We analyze your business, identify bottlenecks, and design a custom AI system tailored to your needs.' },
                            { Icon: BuildIcon, title: '2. Build', description: 'Our engineers construct your system using battle-tested components. Ready in 2-4 weeks.' },
                            { Icon: SupportIcon, title: '3. Support', description: 'We maintain your system, handle updates, and ensure 99.9% uptime. You focus on growth.' }
                        ].map((step, i) => (
                            <div key={i} className="group relative">
                                <div className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" style={{ background: 'rgba(30, 174, 247, 0.2)' }} />
                                <div className="relative rounded-3xl p-8 backdrop-blur-xl border h-full transition-all duration-300 group-hover:translate-y-[-4px]" style={{
                                    background: 'linear-gradient(135deg, rgba(30, 174, 247, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                    borderColor: 'rgba(30, 174, 247, 0.3)'
                                }}>
                                    <div className="w-20 h-20 flex items-center justify-center mb-6">
                                        <step.Icon size={64} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--rensto-text-primary)' }}>{step.title}</h3>
                                    <p style={{ color: 'var(--rensto-text-secondary)' }}>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ===== PRICING ===== */}
            < section id="pricing" className="py-24 px-4 relative overflow-hidden" >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, var(--rensto-bg-primary) 0%, var(--rensto-bg-secondary) 50%, var(--rensto-bg-primary) 100%)' }} />
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: 'rgba(191, 87, 0, 0.1)', color: 'var(--rensto-orange)', border: '1px solid rgba(191, 87, 0, 0.3)' }}>
                            Investment
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>Investment Structure</h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--rensto-text-secondary)' }}>
                            Think of it like hiring a superhuman employee. You pay once to &quot;create&quot; them,
                            then a small monthly fee to keep them healthy and operational.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                Icon: BrainSystemIcon,
                                title: 'Automation Audit',
                                price: '$497',
                                description: 'AI-driven analysis. Identify $25k+ in savings. Guaranteed.',
                                gradient: 'linear-gradient(135deg, rgba(30, 174, 247, 0.15) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                borderColor: 'rgba(30, 174, 247, 0.4)',
                                iconColor: 'var(--rensto-blue)',
                                glowColor: 'rgba(30, 174, 247, 0.3)',
                                popular: false,
                                href: '/offers#audit'
                            },
                            {
                                Icon: SkillsIcon,
                                title: 'Sprint Planning',
                                price: '$1,497',
                                description: 'Full architecture & implementation plan with ready-to-sign contract.',
                                gradient: 'linear-gradient(135deg, rgba(254, 61, 81, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                borderColor: 'rgba(254, 61, 81, 0.3)',
                                iconColor: 'var(--rensto-primary)',
                                glowColor: 'rgba(254, 61, 81, 0.2)',
                                popular: true,
                                href: '/offers'
                            },
                            {
                                Icon: GuardIcon,
                                title: 'Care Plan',
                                price: 'From $497/mo',
                                description: 'Continuous monitoring, updates, and active optimization.',
                                gradient: 'linear-gradient(135deg, rgba(95, 251, 253, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                                borderColor: 'rgba(95, 251, 253, 0.3)',
                                iconColor: 'var(--rensto-cyan)',
                                glowColor: 'rgba(95, 251, 253, 0.2)',
                                popular: false,
                                href: '/offers'
                            }
                        ].map((tier) => (
                            <Link key={tier.title} href={tier.href} className="group relative">
                                <div className="absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" style={{ background: tier.glowColor }} />
                                <div
                                    className="relative rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 group-hover:translate-y-[-4px] h-full flex flex-col"
                                    style={{ background: tier.gradient, borderColor: tier.borderColor }}
                                >
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg"
                                            style={{ background: 'var(--rensto-gradient-primary)', color: 'white' }}>
                                            Most Popular
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 flex items-center justify-center">
                                            <tier.Icon size={56} />
                                        </div>
                                        <h3 className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>{tier.title}</h3>
                                    </div>
                                    <p className="text-3xl font-bold mb-4" style={{ color: tier.iconColor }}>{tier.price}</p>
                                    <p style={{ color: 'var(--rensto-text-secondary)' }}>{tier.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== GUARANTEE ===== */}
            < section className="py-24 px-4 relative overflow-hidden" >
                <div className="container mx-auto max-w-3xl text-center relative z-10">
                    <div className="rounded-3xl p-6 sm:p-10 backdrop-blur-xl border" style={{
                        background: 'linear-gradient(135deg, rgba(95, 251, 253, 0.1) 0%, rgba(17, 13, 40, 0.95) 100%)',
                        borderColor: 'rgba(95, 251, 253, 0.3)',
                        boxShadow: '0 0 60px rgba(95, 251, 253, 0.15)'
                    }}>
                        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <GuaranteeIcon size={72} />
                        </div>
                        <div className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                            Rensto Success Guarantee
                        </div>
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                            ROI or We Keep Working
                        </h2>
                        <p style={{ color: 'var(--rensto-text-secondary)' }}>
                            We don&apos;t do &quot;trials&quot;. We work with committed partners. If the system doesn&apos;t meet the specific ROI targets defined in your Blueprint, we keep optimizing—completely on our own dime—until it does.
                        </p>
                    </div>
                </div>
            </section >

            {/* Cross-linking to WhatsApp */}
            <section className="py-12 px-4 text-center border-t border-white/5">
                <div className="container mx-auto">
                    <p className="text-gray-500 text-sm mb-4 italic">
                        Looking for a rapidly deployable, pre-configured solution?
                    </p>
                    <Link
                        href="/whatsapp"
                        className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold transition-colors"
                    >
                        Check out the WhatsApp Agent Operating System →
                    </Link>
                </div>
            </section>

            <Footer />
            <ElevenLabsWidget />
        </div >
    );
}
