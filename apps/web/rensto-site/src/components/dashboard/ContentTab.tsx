'use client';

import React, { useState } from 'react';
import {
    FileText,
    Calendar,
    Image,
    Video,
    Edit,
    Eye,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    ArrowRight,
    Lock,
    Sparkles,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { SERVICE_DISPLAY_NAMES, SERVICE_DESCRIPTIONS } from '@/types/entitlements';

export interface ContentItem {
    id: string;
    title: string;
    type: 'blog' | 'social' | 'email' | 'video';
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    scheduledDate?: string;
    publishedUrl?: string;
    platform?: string;
}

export interface ContentStats {
    total: number;
    published: number;
    scheduled: number;
    drafts: number;
}

export interface ContentTabProps {
    content: ContentItem[];
    isLocked: boolean;
    onUpgradeClick: () => void;
}

export default function ContentTab({ content, isLocked, onUpgradeClick }: ContentTabProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'scheduled' | 'draft'>('all');

    const filteredContent = content.filter(c => {
        if (activeFilter === 'all') return true;
        return c.status === activeFilter;
    });

    const stats: ContentStats = {
        total: content.length,
        published: content.filter(c => c.status === 'published').length,
        scheduled: content.filter(c => c.status === 'scheduled').length,
        drafts: content.filter(c => c.status === 'draft').length,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return '#22c55e';
            case 'scheduled': return '#1eaef7';
            case 'draft': return '#f7931e';
            case 'failed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'blog': return FileText;
            case 'social': return Image;
            case 'video': return Video;
            case 'email': return FileText;
            default: return FileText;
        }
    };

    // Locked state - show upsell
    if (isLocked) {
        return (
            <div className="space-y-6">
                <div
                    className="rounded-xl p-8 text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(95, 251, 253, 0.05) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}
                >
                    <div className="absolute top-4 right-4 opacity-10">
                        <FileText className="w-32 h-32 text-amber-500" />
                    </div>
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {SERVICE_DISPLAY_NAMES.content}
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        {SERVICE_DESCRIPTIONS.content}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {['Blog Posts', 'Social Media', 'Email Newsletters', 'Video Scripts'].map(feature => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                {feature}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={onUpgradeClick}
                        className="bg-gradient-to-r from-amber-500 to-[#5ffbfd] hover:brightness-110 text-white font-bold px-8"
                    >
                        Unlock from $997/mo
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
                    { label: 'Total Content', value: stats.total, icon: FileText, color: '#f59e0b' },
                    { label: 'Published', value: stats.published, icon: CheckCircle2, color: '#22c55e' },
                    { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: '#1eaef7' },
                    { label: 'Drafts', value: stats.drafts, icon: Edit, color: '#f7931e' },
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

            {/* Filter & Actions */}
            <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                <div className="flex gap-2">
                    {['all', 'published', 'scheduled', 'draft'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as typeof activeFilter)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeFilter === filter
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500'
                                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
            <Button
                variant="renstoSecondary"
                size="sm"
                onClick={() => {
                    // In a real app, open a modal to select topic/type
                    // For MVP, we'll trigger a default "Blog Post" about "Industry Trends"
                    fetch('/api/content/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            clientId: 'current-user', // Should be passed in or handled by session
                            type: 'blog',
                            topic: 'Top trends in my industry for 2026'
                        })
                    }).then(() => alert('Content generation started! Check back in a few minutes.'));
                }}
            >
                <Sparkles className="w-4 h-4 mr-1" />
                Generate Content
            </Button>


            {/* Content List */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                {filteredContent.length > 0 ? (
                    filteredContent.map(item => {
                        const TypeIcon = getTypeIcon(item.type);
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-white/5 transition-colors"
                                style={{ borderColor: 'var(--rensto-bg-secondary)' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: getStatusColor(item.status) + '20' }}
                                    >
                                        <TypeIcon className="w-5 h-5" style={{ color: getStatusColor(item.status) }} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{item.title}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <span className="capitalize">{item.type}</span>
                                            {item.platform && (
                                                <>
                                                    <span>•</span>
                                                    <span>{item.platform}</span>
                                                </>
                                            )}
                                            {item.scheduledDate && (
                                                <>
                                                    <span>•</span>
                                                    <Clock className="w-3 h-3" />
                                                    <span>{item.scheduledDate}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                        style={{
                                            backgroundColor: getStatusColor(item.status) + '20',
                                            color: getStatusColor(item.status)
                                        }}
                                    >
                                        {item.status}
                                    </span>
                                    {item.publishedUrl && (
                                        <a
                                            href={item.publishedUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-2">No content yet</p>
                        <p className="text-sm text-gray-500 mb-6">Generate your first blog post or social content</p>
                        <Button variant="renstoSecondary" size="sm">
                            <Sparkles className="w-4 h-4 mr-1" />
                            Generate Content
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}
