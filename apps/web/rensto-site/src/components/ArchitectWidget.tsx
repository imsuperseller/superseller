'use client';

import { useState } from 'react';
import { Bot, UserCircle2, Send } from 'lucide-react';

export default function ArchitectWidget() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "I'm analyzing your potential configuration. Any questions about compatibility or features?" }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsThinking(true);

        try {
            const res = await fetch('/api/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await res.json();

            if (!res.ok) {
                setMessages(prev => [...prev, { role: 'ai', text: data.error || "I'm having trouble connecting right now. Please try again." }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please check your network." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col h-[300px]">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white'}`}>
                            {msg.role === 'ai' ? <Bot size={14} /> : <UserCircle2 size={14} />}
                        </div>
                        <div className={`text-xs p-3 rounded-xl max-w-[85%] leading-relaxed ${msg.role === 'ai'
                            ? 'bg-cyan-500/5 border border-cyan-500/10 text-cyan-100'
                            : 'bg-white/10 text-white'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            <Bot size={14} />
                        </div>
                        <div className="text-xs p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 flex items-center gap-1">
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Ask about your build..."
                    className="w-full bg-[#0b081a] border border-white/10 rounded-lg pl-3 pr-10 py-3 text-xs text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 hover:bg-white/10 rounded-md text-cyan-400 transition-colors disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
