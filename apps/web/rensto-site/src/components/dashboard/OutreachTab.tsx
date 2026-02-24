'use client';

import React, { useState } from 'react';
import {
    Send,
    Mail,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    PlayCircle,
    PauseCircle,
    Settings,
    Plus,
    ArrowRight,
    Sparkles,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { SERVICE_DISPLAY_NAMES, SERVICE_DESCRIPTIONS } from '@/types/entitlements';

export interface CampaignStats {
    sent: number;
    delivered: number;
    opened: number;
    replied: number;
}

export interface Campaign {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'both';
    status: 'active' | 'paused' | 'completed' | 'draft';
    stats: CampaignStats;
    lastActivity: string;
}

export interface OutreachTabProps {
    campaigns: Campaign[];
    isLocked: boolean;
    onUpgradeClick: () => void;
}

export default function OutreachTab({ campaigns, isLocked, onUpgradeClick }: OutreachTabProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused'>('all');

    const filteredCampaigns = campaigns.filter(c => {
        if (activeFilter === 'all') return true;
        return c.status === activeFilter;
    });

    const totalStats = campaigns.reduce(
        (acc, c) => ({
            sent: acc.sent + c.stats.sent,
            delivered: acc.delivered + c.stats.delivered,
            opened: acc.opened + c.stats.opened,
            replied: acc.replied + c.stats.replied,
        }),
        { sent: 0, delivered: 0, opened: 0, replied: 0 }
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#22c55e';
            case 'paused': return '#f7931e';
            case 'completed': return '#5ffbfd';
            case 'draft': return '#6b7280';
            default: return '#6b7280';
        }
    };

    // Locked state - show upsell
    if (isLocked) {
        return (
            <div className="space-y-6">
                <div
                    className="rounded-xl p-8 text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(30, 174, 247, 0.1) 0%, rgba(95, 251, 253, 0.05) 100%)',
                        border: '1px solid rgba(30, 174, 247, 0.2)'
                    }}
                >
                    <div className="absolute top-4 right-4 opacity-10">
                        <Send className="w-32 h-32 text-[#1eaef7]" />
                    </div>
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {SERVICE_DISPLAY_NAMES['lead-machine']}
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        {SERVICE_DESCRIPTIONS['lead-machine']}
                    </p>
                    <Button
                        onClick={onUpgradeClick}
                        className="bg-gradient-to-r from-[#1eaef7] to-[#5ffbfd] hover:brightness-110 text-white font-bold px-8"
                    >
                        Unlock from $199/mo
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
                    { label: 'Sent', value: totalStats.sent, icon: Send, color: '#1eaef7' },
                    { label: 'Delivered', value: totalStats.delivered, icon: CheckCircle2, color: '#22c55e' },
                    { label: 'Opened', value: totalStats.opened, icon: Mail, color: '#f7931e' },
                    { label: 'Replied', value: totalStats.replied, icon: MessageSquare, color: '#5ffbfd' },
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
                        <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            {/* Campaign List Header */}
            <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                <div className="flex gap-2">
                    {['all', 'active', 'paused'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as typeof activeFilter)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeFilter === filter
                                ? 'bg-[#5ffbfd]/20 text-[#5ffbfd] border border-[#5ffbfd]'
                                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                <Button variant="renstoSecondary" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Campaign
                </Button>
            </div>

            {/* Campaign List */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map(campaign => (
                        <div
                            key={campaign.id}
                            className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-white/5 transition-colors"
                            style={{ borderColor: 'var(--rensto-bg-secondary)' }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: getStatusColor(campaign.status) + '20' }}
                                >
                                    {campaign.type === 'email' && <Mail className="w-5 h-5" style={{ color: getStatusColor(campaign.status) }} />}
                                    {campaign.type === 'sms' && <MessageSquare className="w-5 h-5" style={{ color: getStatusColor(campaign.status) }} />}
                                    {campaign.type === 'both' && <Send className="w-5 h-5" style={{ color: getStatusColor(campaign.status) }} />}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{campaign.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {campaign.stats.sent} sent • {campaign.stats.opened} opened • {campaign.stats.replied} replied
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                    style={{
                                        backgroundColor: getStatusColor(campaign.status) + '20',
                                        color: getStatusColor(campaign.status)
                                    }}
                                >
                                    {campaign.status}
                                </span>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <Send className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-2">No campaigns yet</p>
                        <p className="text-sm text-gray-500 mb-6">Create your first outreach campaign to start engaging leads</p>
                        <Button variant="renstoSecondary" size="sm" className="mx-auto">
                            <Plus className="w-4 h-4 mr-1" />
                            Create Campaign
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
