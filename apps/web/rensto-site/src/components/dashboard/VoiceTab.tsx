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
    Play,
    Pause,
    Volume2,
    ArrowRight,
    Lock,
    CheckCircle2
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

export interface VoiceAgentConfig {
    name: string;
    voiceId: string;
    greeting: string;
    availability: {
        enabled: boolean;
        hours: string;
    };
    transferNumber?: string;
}

export interface VoiceTabProps {
    callLogs: CallLog[];
    config?: VoiceAgentConfig;
    isLocked: boolean;
    onUpgradeClick: () => void;
}

export default function VoiceTab({ callLogs, config, isLocked, onUpgradeClick }: VoiceTabProps) {
    const [activeView, setActiveView] = useState<'logs' | 'config'>('logs');

    const callStats = {
        total: callLogs.length,
        answered: callLogs.filter(c => c.outcome === 'answered').length,
        missed: callLogs.filter(c => c.outcome === 'missed').length,
        avgDuration: callLogs.length > 0
            ? Math.round(callLogs.reduce((acc, c) => acc + c.duration, 0) / callLogs.length)
            : 0,
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

    // Locked state - show upsell
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
                        <Phone className="w-32 h-32 text-purple-500" />
                    </div>
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {SERVICE_DISPLAY_NAMES['autonomous-secretary']}
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        {SERVICE_DESCRIPTIONS['autonomous-secretary']}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {['24/7 Availability', 'Natural Voice AI', 'Call Recording', 'Lead Capture'].map(feature => (
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
                        Unlock from $249/mo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Calls', value: callStats.total, icon: Phone, color: '#9333ea' },
                    { label: 'Answered', value: callStats.answered, icon: PhoneCall, color: '#22c55e' },
                    { label: 'Missed', value: callStats.missed, icon: PhoneMissed, color: '#ef4444' },
                    { label: 'Avg Duration', value: formatDuration(callStats.avgDuration), icon: Clock, color: '#5ffbfd' },
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

            {/* View Toggle */}
            <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                <div className="flex gap-2">
                    {[
                        { id: 'logs', label: 'Call Logs', icon: PhoneCall },
                        { id: 'config', label: 'Agent Config', icon: Settings },
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id as typeof activeView)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === view.id
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

            {/* Call Logs View */}
            {activeView === 'logs' && (
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                >
                    {callLogs.length > 0 ? (
                        callLogs.map(call => (
                            <div
                                key={call.id}
                                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-white/5 transition-colors"
                                style={{ borderColor: 'var(--rensto-bg-secondary)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: getOutcomeColor(call.outcome) + '20' }}
                                    >
                                        {call.outcome === 'answered' && <PhoneCall className="w-5 h-5" style={{ color: getOutcomeColor(call.outcome) }} />}
                                        {call.outcome === 'missed' && <PhoneMissed className="w-5 h-5" style={{ color: getOutcomeColor(call.outcome) }} />}
                                        {call.outcome === 'voicemail' && <Volume2 className="w-5 h-5" style={{ color: getOutcomeColor(call.outcome) }} />}
                                        {call.outcome === 'transferred' && <PhoneIncoming className="w-5 h-5" style={{ color: getOutcomeColor(call.outcome) }} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{call.caller}</p>
                                        <p className="text-sm text-gray-400">{call.callerPhone}</p>
                                        {call.summary && <p className="text-xs text-gray-500 mt-1">{call.summary}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">{formatDuration(call.duration)}</p>
                                    <p className="text-xs text-gray-500">{call.timestamp}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <Phone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400 mb-2">No calls yet</p>
                            <p className="text-sm text-gray-500 mb-6">Your AI agent is ready to take calls 24/7</p>
                            <Button variant="renstoSecondary" size="sm" onClick={() => setActiveView('config')}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configure Agent
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Config View */}
            {activeView === 'config' && config && (
                <div
                    className="rounded-xl p-6 space-y-6"
                    style={{ backgroundColor: 'var(--rensto-bg-card)' }}
                >
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Agent Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400">Agent Name</label>
                                <p className="text-white font-medium">{config.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Greeting</label>
                                <p className="text-white">{config.greeting}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="text-sm text-gray-400">Availability</label>
                                    <p className="text-white">{config.availability.enabled ? config.availability.hours : 'Disabled'}</p>
                                </div>
                                {config.transferNumber && (
                                    <div>
                                        <label className="text-sm text-gray-400">Transfer To</label>
                                        <p className="text-white">{config.transferNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button variant="renstoSecondary">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Configuration
                    </Button>
                </div>
            )}
        </div>
    );
}
