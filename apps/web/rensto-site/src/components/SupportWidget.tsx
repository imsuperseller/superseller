'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    X,
    Send,
    Bot,
    HelpCircle,
    Calendar,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'agent' | 'user';
    content: string;
    timestamp: Date;
}

interface SupportWidgetProps {
    mode?: 'floating' | 'inline' | 'footer';
    initialMessage?: string;
}

export function SupportWidget({
    mode = 'floating',
    initialMessage = "Hi! I'm your Rensto AI assistant. How can I help you automate your business today?"
}: SupportWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'agent', content: initialMessage, timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHandoff, setShowHandoff] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isCustomer, setIsCustomer] = useState<boolean | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-rensto-support', handleOpen);
        return () => window.removeEventListener('open-rensto-support', handleOpen);
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // AI Response Simulation (replace with actual API if needed)
        setTimeout(() => {
            setIsTyping(false);
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "I'm analyzing your request. Since I'm still learning the specifics of your infrastructure, would you like to check our knowledge base or schedule a quick 1:1 call with a human expert?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMsg]);
            setShowHandoff(true);
        }, 1500);
    };

    const checkStatus = async (email: string) => {
        setUserEmail(email);
        // In actual implementation, call /api/customers/check-status?email=...
        // Mock logic: e.g. emails ending in @customer.com are customers
        const result = email.includes('@customer.com');
        setIsCustomer(result);
    };

    if (mode === 'floating' && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-rensto-red to-rensto-orange shadow-rensto-glow-primary flex items-center justify-center text-white z-[60] hover:scale-110 transition-transform"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    const widgetContent = (
        <Card className={`overflow-hidden border-rensto-cyan/30 bg-[#110d28]/95 backdrop-blur-xl ${mode === 'floating' ? 'w-[380px] h-[550px] shadow-2xl' : 'w-full'}`}>
            <CardHeader className="p-4 border-b border-rensto-cyan/20 flex flex-row items-center justify-between bg-gradient-to-r from-rensto-bg-card to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rensto-cyan/10 flex items-center justify-center border border-rensto-cyan/30">
                        <Bot className="w-5 h-5 text-rensto-cyan" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-white">Rensto AI Agent</CardTitle>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-rensto-text-secondary">Always Online</span>
                        </div>
                    </div>
                </div>
                {mode === 'floating' && (
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[calc(100%-70px)]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                ? 'bg-rensto-cyan text-[#0a0a0a] rounded-tr-none'
                                : 'bg-rensto-bg-secondary text-white border border-white/5 rounded-tl-none'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-rensto-bg-secondary p-3 rounded-2xl rounded-tl-none border border-white/5">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-rensto-cyan/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-rensto-cyan/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-rensto-cyan/50 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}

                    {showHandoff && (
                        <div className="space-y-3 pt-2">
                            <Link href="/knowledgebase" className="block">
                                <Button variant="outline" className="w-full justify-between text-xs border-rensto-cyan/20 hover:bg-rensto-cyan/10 group">
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4 text-rensto-cyan" />
                                        Browse Knowledge Base
                                    </div>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </Link>

                            <div className="p-3 rounded-xl bg-gradient-to-br from-rensto-red/10 to-transparent border border-rensto-red/20 space-y-2">
                                <p className="text-[11px] text-rensto-text-secondary font-medium uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-rensto-red" />
                                    Still need help?
                                </p>
                                {isCustomer === null ? (
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-rensto-text-muted">Enter email to see available slots:</p>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="your@email.com"
                                                className="h-8 text-[11px] bg-black/40 border-white/10"
                                                onBlur={(e) => checkStatus(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && checkStatus((e.target as HTMLInputElement).value)}
                                            />
                                            <Button size="sm" className="h-8 px-3 text-[10px]" onClick={() => { }}>Verify</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[11px]">
                                            {isCustomer ? (
                                                <Badge variant="renstoNeon" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Existing Partner</Badge>
                                            ) : (
                                                <Badge variant="renstoSuccess" className="bg-green-500/10 text-green-400 border-green-500/20">First-Time Guest</Badge>
                                            )}
                                        </div>
                                        {isCustomer ? (
                                            <Link href="https://tidycal.com/rensto/paid-consult" className="block">
                                                <Button variant="renstoPrimary" className="w-full text-xs h-9">
                                                    Book 1:1 Consultation ($150/hr)
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="https://tidycal.com/rensto/30-minute-audit" className="block">
                                                <Button variant="renstoSecondary" className="w-full text-xs h-9">
                                                    Book Free 30m Strategy Call
                                                </Button>
                                            </Link>
                                        )}
                                        <p className="text-[10px] text-center text-rensto-text-muted italic">
                                            {isCustomer ? 'Billed by the minute' : 'Limited to first-time consultations'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Message your agent..."
                            className="bg-rensto-bg-secondary border-white/10 focus-visible:ring-rensto-cyan"
                        />
                        <Button
                            size="icon"
                            variant="renstoSecondary"
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="rounded-xl shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="mt-2 text-center">
                        <p className="text-[9px] text-rensto-text-muted flex items-center justify-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Secure AI Support Architecture
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (mode === 'floating') {
        return (
            <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-5 duration-300">
                {widgetContent}
            </div>
        );
    }

    return widgetContent;
}
