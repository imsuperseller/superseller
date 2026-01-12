'use client';

import React, { useState } from 'react';
import {
    Phone,
    PhoneCall,
    PhoneIncoming,
    PhoneMissed,
    Clock,
    Calendar,
    Settings,
    MessageSquare,
    CheckCircle2,
    Lock,
    ArrowRight,
    Volume2,
    User,
    CalendarCheck,
    Smartphone,
    Bot,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { SERVICE_DISPLAY_NAMES, SERVICE_DESCRIPTIONS } from '@/types/entitlements';

export interface CallLog {
    id: string;
    caller: string;
    callerPhone: string;
    duration: number; // seconds
    outcome: 'answered' | 'voicemail' | 'missed' | 'transferred';
    timestamp: string;
    recordingUrl?: string;
    summary?: string;
}

export interface WhatsAppThread {
    id: string;
    customerName: string;
    lastMessage: string;
    timestamp: string;
    status: 'replied' | 'pending' | 'human_needed';
}

export interface Booking {
    id: string;
    customerName: string;
    serviceName: string;
    dateTime: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export interface SecretaryConfig {
    agentName: string;
    voiceId: string;
    greeting: string;
    tone?: string;
    businessContext?: string;
    calendarLink?: string;
    n8nWebhookId?: string;
    availability: {
        enabled: boolean;
        hours: string;
    };
    whatsappEnabled: boolean;
    calendarEnabled: boolean;
    transferNumber?: string;
}

export interface SecretaryTabProps {
    callLogs: CallLog[];
    whatsappThreads?: WhatsAppThread[];
    bookings?: Booking[];
    config?: SecretaryConfig;
    isLocked: boolean;
    onUpgradeClick: () => void;
    clientId: string;
}

type TabType = 'voice' | 'whatsapp' | 'calendar' | 'config';

export default function SecretaryTab({
    callLogs,
    whatsappThreads = [],
    bookings = [],
    config,
    isLocked,
    onUpgradeClick,
    clientId
}: SecretaryTabProps) {
    const [activeView, setActiveView] = useState<TabType>('voice');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const stats = {
        totalCalls: callLogs.length,
        missedCalls: callLogs.filter(c => c.outcome === 'missed').length,
        waPending: whatsappThreads.filter(t => t.status === 'human_needed').length,
        upcomingBookings: bookings.filter(b => b.status === 'confirmed').length
    };

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'answered': return '#22c55e';
            case 'transferred': return '#1eaef7';
            case 'voicemail': return '#f7931e';
            case 'missed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Locked state
    if (isLocked) {
        return (
            <div className="space-y-6">
                <div
                    className="rounded-xl p-8 text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(95, 251, 253, 0.05) 100%)',
                        border: '1px solid rgba(147, 51, 234, 0.2)'
                    }}
                >
                    <div className="absolute top-4 right-4 opacity-10">
                        <Bot className="w-32 h-32 text-purple-500" />
                    </div>
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {SERVICE_DISPLAY_NAMES.voice}
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        {SERVICE_DESCRIPTIONS.voice}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {[
                            'Voice AI Answering',
                            'WhatsApp Auto-Replies',
                            'AI Calendar Assistant',
                            'Human-in-Loop Fallback'
                        ].map(feature => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                {feature}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={onUpgradeClick}
                        className="bg-gradient-to-r from-purple-600 to-[#5ffbfd] hover:brightness-110 text-white font-bold px-8"
                    >
                        Unlock for $249/mo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Calls', value: stats.totalCalls, icon: Phone, color: '#9333ea' },
                    { label: 'Missed Calls', value: stats.missedCalls, icon: PhoneMissed, color: '#ef4444' },
                    { label: 'WhatsApp Alerts', value: stats.waPending, icon: MessageSquare, color: '#22c55e' },
                    { label: 'Active Bookings', value: stats.upcomingBookings, icon: CalendarCheck, color: '#5ffbfd' },
                ].map(stat => (
                    <div
                        key={stat.label}
                        className="rounded-xl p-4"
                        style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                            <span className="text-sm text-gray-400">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* View Multi-Toggle */}
            <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                        { id: 'voice', label: 'Voice Logs', icon: Phone },
                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                        { id: 'calendar', label: 'Bookings', icon: Calendar },
                        { id: 'config', label: 'Agent Settings', icon: Settings },
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id as TabType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeView === view.id
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500'
                                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <view.icon className="w-4 h-4" />
                            {view.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div
                className="rounded-xl overflow-hidden min-h-[400px]"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                {activeView === 'voice' && (
                    <div className="divide-y divide-white/5">
                        {callLogs.length > 0 ? (
                            callLogs.map(call => (
                                <div key={call.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: getOutcomeColor(call.outcome) + '20' }}
                                        >
                                            {call.outcome === 'answered' && <PhoneCall className="w-5 h-5 text-green-500" />}
                                            {call.outcome === 'missed' && <PhoneMissed className="w-5 h-5 text-red-500" />}
                                            {call.outcome === 'voicemail' && <Volume2 className="w-5 h-5 text-orange-500" />}
                                            {call.outcome === 'transferred' && <PhoneIncoming className="w-5 h-5 text-blue-400" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{call.caller}</p>
                                            <p className="text-sm text-gray-400">{call.callerPhone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-300">{formatDuration(call.duration)}</p>
                                        <p className="text-xs text-gray-500">{call.timestamp}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-24 text-center">
                                <Phone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400">No voice calls yet</p>
                                <p className="text-sm text-gray-500 mt-1">Your AI Secretary is ready to answer calls 24/7</p>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'whatsapp' && (
                    <div className="divide-y divide-white/5">
                        {whatsappThreads.length > 0 ? (
                            whatsappThreads.map(thread => (
                                <div key={thread.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white group-hover:text-green-400 transition-colors">{thread.customerName}</p>
                                            <p className="text-sm text-gray-400 truncate max-w-xs">{thread.lastMessage}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${thread.status === 'human_needed'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                            : thread.status === 'replied'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                            }`}>
                                            {thread.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{thread.timestamp}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-24 text-center">
                                <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400">No WhatsApp messages yet</p>
                                <p className="text-sm text-gray-500 mt-1">Direct inquiries from your AI agent will appear here</p>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'calendar' && (
                    <div className="divide-y divide-white/5">
                        {bookings.length > 0 ? (
                            bookings.map(booking => (
                                <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#5ffbfd]/10 flex items-center justify-center">
                                            <CalendarCheck className="w-5 h-5 text-[#5ffbfd]" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{booking.customerName}</p>
                                            <p className="text-sm text-gray-400">{booking.serviceName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-300 font-medium">{booking.dateTime}</p>
                                        <span className={`text-[10px] font-bold ${booking.status === 'confirmed' ? 'text-green-400' : 'text-gray-500'
                                            }`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-24 text-center">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400">No bookings yet</p>
                                <p className="text-sm text-gray-500 mt-1">Appointments scheduled by your AI agent will be listed here</p>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'config' && (
                    <div className="p-6 space-y-8">
                        {/* Header & Edit Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-purple-400" />
                                    Secretary Intelligence
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Configure how your AI agent answers and behaves.</p>
                            </div>
                            {!isEditing && (
                                <Button
                                    variant="renstoSecondary"
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs"
                                >
                                    <Settings className="w-3 h-3 mr-2" />
                                    Edit Configuration
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-6 max-w-3xl bg-black/20 p-6 rounded-xl border border-white/10">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Identity Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Identity & Voice</h4>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Agent Name</label>
                                            <input
                                                type="text"
                                                id="agentName"
                                                defaultValue={config?.agentName}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                                placeholder="e.g. Sarah"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Tone / Personality</label>
                                            <select
                                                id="tone"
                                                defaultValue={config?.tone || 'professional'}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                            >
                                                <option value="professional">Professional & Polished</option>
                                                <option value="friendly">Friendly & Casual</option>
                                                <option value="empathetic">Empathetic (Healthcare/Legal)</option>
                                                <option value="energetic">Energetic & Sales-Focus</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Greeting Message</label>
                                            <textarea
                                                id="greeting"
                                                defaultValue={config?.greeting}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none min-h-[80px]"
                                                placeholder="Hello, thanks for calling..."
                                            />
                                        </div>
                                    </div>

                                    {/* Logistics Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Logistics & Handling</h4>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Human Transfer Number</label>
                                            <input
                                                type="text"
                                                id="transferNumber"
                                                defaultValue={config?.transferNumber}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                                placeholder="+1 (555) ..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Calendar / Booking Link</label>
                                            <input
                                                type="text"
                                                id="calendarLink"
                                                defaultValue={config?.calendarLink}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                                placeholder="e.g. Calendly, Acuity, or Bookings link..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Business Hours Mode</label>
                                            <select
                                                id="scheduleMode"
                                                defaultValue={config?.availability?.enabled ? 'custom' : 'always'}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                            >
                                                <option value="always">24/7 Always On</option>
                                                <option value="custom">Office Hours Only (M-F 9-5)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Knowledge / Context Section */}
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-[#5ffbfd] uppercase tracking-wider mb-4">Business Context (Brain)</h4>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Quick Reference Info (FAQs, Prices, Parking)</label>
                                        <p className="text-xs text-gray-500 mb-2">Paste essential info the agent needs to know. For complex analysis, upgrade to the Knowledge Engine pillar.</p>
                                        <textarea
                                            id="businessContext"
                                            defaultValue={config?.businessContext}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#5ffbfd] outline-none min-h-[120px] font-mono text-sm"
                                            placeholder="Parking is free in the back lot.&#10;Consultations cost $150.&#10;We accept Visa and Mastercard."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <label className="text-sm font-medium text-gray-500">System: n8n Webhook ID</label>
                                    <input
                                        type="text"
                                        id="n8nWebhookId"
                                        defaultValue={config?.n8nWebhookId}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-gray-400 focus:border-purple-500 outline-none font-mono text-xs"
                                        placeholder="UUID from n8n"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                                        disabled={isSaving}
                                        onClick={async () => {
                                            setIsSaving(true);
                                            try {
                                                const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value || '';

                                                const updatedConfig = {
                                                    agentName: getVal('agentName'),
                                                    greeting: getVal('greeting'),
                                                    tone: getVal('tone'),
                                                    transferNumber: getVal('transferNumber'),
                                                    calendarLink: getVal('calendarLink'),
                                                    businessContext: getVal('businessContext'),
                                                    n8nWebhookId: getVal('n8nWebhookId'),
                                                    availability: {
                                                        enabled: getVal('scheduleMode') === 'custom',
                                                        hours: '9-5 M-F' // Mock for now
                                                    }
                                                };

                                                const res = await fetch('/api/secretary/config', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        clientId,
                                                        config: updatedConfig
                                                    })
                                                });

                                                if (!res.ok) throw new Error('Failed to save');
                                                window.location.reload();
                                            } catch (err) {
                                                console.error(err);
                                                alert('Failed to save configuration');
                                            } finally {
                                                setIsSaving(false);
                                                setIsEditing(false);
                                            }
                                        }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Configuration'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="text-gray-400 hover:text-white"
                                        disabled={isSaving}
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                        <div className="flex justify-between items-start mb-2">
                                            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">Agent Persona</label>
                                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded capitalize">
                                                {config?.tone || 'Professional'}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium text-lg">{config?.agentName || 'Rensto AI Assistant'}</p>
                                        <p className="text-sm text-gray-400 mt-2 italic">"{config?.greeting || 'Hello, how can I help you today?'}"</p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                        <label className="text-xs font-bold text-[#5ffbfd] uppercase tracking-wider block mb-2">Knowledge Base</label>
                                        {config?.businessContext ? (
                                            <div className="text-sm text-gray-300 whitespace-pre-line line-clamp-4">
                                                {config.businessContext}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                No business context provided
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                        <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">Logistics</label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Transfer Number</span>
                                                <span className="text-sm text-white font-mono">{config?.transferNumber || 'Disabled'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Schedule Mode</span>
                                                <span className="text-sm text-white">{config?.availability?.enabled ? 'Office Hours (custom)' : '24/7 Always On'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400">Calendar Link</span>
                                                {config?.calendarLink ? (
                                                    <a href={config.calendarLink} target="_blank" className="text-sm text-[#5ffbfd] hover:underline truncate max-w-[150px]">
                                                        Active Link
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Not Set</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Premium Upsell Small */}
            <div className="bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 p-4 rounded-r-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold text-sm">Need a dedicated phone number?</h4>
                        <p className="text-gray-400 text-xs mt-0.5">We can provision local numbers for your business in 50+ countries.</p>
                    </div>
                    <Button size="sm" variant="renstoSecondary" className="text-xs h-8">
                        Get Number
                    </Button>
                </div>
            </div>
        </div>
    );
}
