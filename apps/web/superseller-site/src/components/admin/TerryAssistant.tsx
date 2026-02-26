'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Bot,
    X,
    Send,
    Minimize2,
    Maximize2,
    Sparkles,
    Activity,
    ShieldCheck,
    Zap,
    Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    actions?: Array<{ label: string; action: string }>;
}

interface TerryAssistantProps {
    userId: string;
    userName: string;
    currentTab?: string;
}

export default function TerryAssistant({ userId, userName, currentTab }: TerryAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: `Greetings, ${userName.split(' ')[0]}. Command Center is nominal. I'm monitoring the Nexus pulses and Vault integrity. How can I assist your operations today?`,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [userName]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/terry/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    sessionId,
                    userId,
                    context: { currentTab }
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, data.message]);
                if (data.sessionId) setSessionId(data.sessionId);
            }
        } catch (error) {
            console.error('Terry connection failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Bubble */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] z-[60] border border-white/20 group hover:scale-110 transition-transform"
                    >
                        <Bot className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a] animate-pulse"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar Assistant */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className={`fixed right-0 top-0 h-screen w-full md:w-[400px] bg-[#0d0b1a]/90 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[70] flex flex-col ${isMinimized ? 'h-auto bottom-0 top-auto rounded-t-3xl border-t' : ''}`}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                    <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        Terry <Sparkles className="w-3 h-3 text-cyan-400" />
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Supervisor Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages Area */}
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                                >
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-cyan-500 text-black rounded-tr-none'
                                                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>

                                            {msg.actions && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {msg.actions.map((act, i) => (
                                                        <Button
                                                            key={i}
                                                            variant="supersellerSecondary"
                                                            size="sm"
                                                            className="text-[10px] py-1 h-8 rounded-lg bg-white/5 border-white/10"
                                                        >
                                                            {act.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}

                                            <span className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest">
                                                {msg.role === 'assistant' ? 'Terry' : userName.split(' ')[0]} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Activity className="w-3 h-3 animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Terry is thinking...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-6 border-t border-white/5 bg-black/20">
                                    <form onSubmit={handleSendMessage} className="relative">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask Terry anything..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-cyan-300 disabled:text-slate-700 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <ShieldCheck className="w-3 h-3 text-green-500 mb-0.5" />
                                                <span className="text-[7px] font-black text-slate-600 uppercase">Vault</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Zap className="w-3 h-3 text-yellow-500 mb-0.5" />
                                                <span className="text-[7px] font-black text-slate-600 uppercase">Pulse</span>
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                            SuperSeller AI Supervisor v3.2
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
