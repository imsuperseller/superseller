'use client';

import React, { useState } from 'react';
import {
    Brain,
    FileText,
    Globe,
    Upload,
    Search,
    Trash2,
    CheckCircle2,
    Clock,
    Lock,
    ArrowRight,
    Database,
    Sparkles,
    RefreshCw,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { SERVICE_DISPLAY_NAMES, SERVICE_DESCRIPTIONS } from '@/types/entitlements';
import { toast } from 'sonner';

export interface IndexedDocument {
    id: string;
    name: string;
    type: 'pdf' | 'url' | 'text';
    status: 'indexed' | 'processing' | 'failed';
    indexedAt: string;
    size?: string;
}

export interface KnowledgeStats {
    totalDocuments: number;
    totalChunks: number;
    lastUpdated: string;
    storageUsed: string;
}

export interface KnowledgeTabProps {
    documents: IndexedDocument[];
    stats?: KnowledgeStats;
    isLocked: boolean;
    clientId: string;
    onUpgradeClick: () => void;
}

type ViewType = 'documents' | 'query';

export default function KnowledgeTab({
    documents,
    stats,
    isLocked,
    clientId,
    onUpgradeClick
}: KnowledgeTabProps) {
    const [activeView, setActiveView] = useState<ViewType>('documents');
    const [queryText, setQueryText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isIndexingUrl, setIsIndexingUrl] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlToIndex, setUrlToIndex] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientId', clientId);

        try {
            const res = await fetch('/api/knowledge/index', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                toast.success('File uploaded and indexing started!');
            } else {
                toast.error(data.error || 'Failed to upload file');
            }
        } catch (err) {
            toast.error('Network error during upload');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleUrlIndex = async () => {
        if (!urlToIndex) return;

        setIsIndexingUrl(true);
        try {
            const res = await fetch('/api/knowledge/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlToIndex,
                    clientId: clientId
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('URL submitted for indexing!');
                setShowUrlInput(false);
                setUrlToIndex('');
            } else {
                toast.error(data.error || 'Failed to index URL');
            }
        } catch (err) {
            toast.error('Network error during indexing');
        } finally {
            setIsIndexingUrl(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'indexed': return '#22c55e';
            case 'processing': return '#f7931e';
            case 'failed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return FileText;
            case 'url': return Globe;
            case 'text': return Database;
            default: return FileText;
        }
    };

    // Locked state
    if (isLocked) {
        return (
            <div className="space-y-6">
                <div
                    className="rounded-xl p-8 text-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(95, 251, 253, 0.05) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                >
                    <div className="absolute top-4 right-4 opacity-10">
                        <Brain className="w-32 h-32 text-blue-500" />
                    </div>
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {SERVICE_DISPLAY_NAMES.knowledge}
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        {SERVICE_DESCRIPTIONS.knowledge}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {[
                            'PDF Intelligence',
                            'URL Indexing',
                            'LightRAG Graph',
                            'Instant Queries'
                        ].map(feature => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                {feature}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={onUpgradeClick}
                        className="bg-gradient-to-r from-blue-600 to-[#5ffbfd] hover:brightness-110 text-white font-bold px-8"
                    >
                        Unlock for $199/mo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Documents', value: stats?.totalDocuments || documents.length, icon: FileText, color: '#3b82f6' },
                    { label: 'Chunks', value: stats?.totalChunks || 'N/A', icon: Database, color: '#22c55e' },
                    { label: 'Last Updated', value: stats?.lastUpdated || 'Never', icon: Clock, color: '#f7931e' },
                    { label: 'Storage', value: stats?.storageUsed || '0 MB', icon: Brain, color: '#5ffbfd' },
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

            {/* View Toggle & Actions */}
            <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                <div className="flex gap-2">
                    {[
                        { id: 'documents', label: 'Manage Documents', icon: FileText },
                        { id: 'query', label: 'Test Query', icon: Search },
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id as ViewType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === view.id
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <view.icon className="w-4 h-4" />
                            {view.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
                    >
                        <Globe className="w-4 h-4" />
                        Index URL
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleFileUpload}
                    />
                    <Button
                        variant="renstoSecondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <Upload className={`w-4 h-4 mr-1 ${isUploading ? 'animate-bounce' : ''}`} />
                        {isUploading ? 'Uploading...' : 'Upload PDF'}
                    </Button>
                </div>
            </div>

            {/* URL Input Bar */}
            {showUrlInput && (
                <div
                    className="rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2"
                    style={{ backgroundColor: 'var(--rensto-bg-card)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                >
                    <Globe className="w-5 h-5 text-blue-400" />
                    <input
                        type="url"
                        value={urlToIndex}
                        onChange={(e) => setUrlToIndex(e.target.value)}
                        placeholder="https://example.com/documentation"
                        className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowUrlInput(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            onClick={handleUrlIndex}
                            disabled={isIndexingUrl}
                        >
                            {isIndexingUrl ? 'Indexing...' : 'Index'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div
                className="rounded-xl overflow-hidden min-h-[400px]"
                style={{ backgroundColor: 'var(--rensto-bg-card)' }}
            >
                {activeView === 'documents' && (
                    <div className="divide-y divide-white/5">
                        {documents.length > 0 ? (
                            documents.map(doc => {
                                const TypeIcon = getTypeIcon(doc.type);
                                return (
                                    <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: getStatusColor(doc.status) + '20' }}
                                            >
                                                <TypeIcon className="w-5 h-5" style={{ color: getStatusColor(doc.status) }} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{doc.name}</p>
                                                <p className="text-sm text-gray-400">
                                                    {doc.type.toUpperCase()} • {doc.size || 'Unknown size'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                                                style={{
                                                    backgroundColor: getStatusColor(doc.status) + '20',
                                                    color: getStatusColor(doc.status)
                                                }}
                                            >
                                                {doc.status}
                                            </span>
                                            <button className="text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-24 text-center">
                                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400 mb-2">No documents indexed yet</p>
                                <p className="text-sm text-gray-500 mb-6">Upload PDFs or index web pages to build your knowledge base.</p>
                                <Button
                                    variant="renstoSecondary"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Upload className="w-4 h-4 mr-1" />
                                    {isUploading ? 'Uploading...' : 'Upload First Document'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'query' && (
                    <div className="p-6">
                        <div className="mb-6">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Test Your Knowledge Base
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={queryText}
                                    onChange={(e) => setQueryText(e.target.value)}
                                    placeholder="Ask a question about your indexed documents..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                                <Button variant="renstoSecondary">
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Query
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-xl border border-white/5 p-6 bg-white/[0.02] min-h-[200px] flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Query results will appear here...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Integration Status */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 border border-white/5" style={{ backgroundColor: 'var(--rensto-bg-card)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-400" />
                            LightRAG Status
                        </h4>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">CONNECTED</span>
                    </div>
                    <p className="text-sm text-gray-400">Graph-based retrieval for complex knowledge.</p>
                </div>
                <div className="rounded-xl p-4 border border-white/5" style={{ backgroundColor: 'var(--rensto-bg-card)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Gemini File Search
                        </h4>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <p className="text-sm text-gray-400">Fast semantic search on uploaded documents.</p>
                </div>
            </div>
        </div>
    );
}
