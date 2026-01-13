'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Template } from '@/types/firestore';
import {
    Search,
    Filter,
    Zap,
    Download,
    Star,
    ArrowRight,
    Workflow,
    ShieldCheck,
    Cpu,
    Globe,
    LayoutGrid,
    List,
    Settings2,
    Check,
    Target,
    Brain,
    Bot,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Card } from '@/components/ui/card-enhanced';
import { Input } from '@/components/ui/input-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import { CustomizationModal, MOCK_FLOOR_PLAN_SCHEMA } from '@/components/marketplace/CustomizationModal';

const translations = {
    en: {
        badge: "The Engine Marketplace",
        title: <>Production-Ready <span className="text-[#fe3d51]">Systems</span> That Print Time</>,
        subtitle: <>Amateurs build tools. Pros deploy Engines. Browse our library of production-ready systems architected for maximum ROI and quiet scale.</>,
        searchPlaceholder: "Which Profit Engine do you want to activate?",
        categories: [
            'All',
            'Profit & Sales',
            'High-Speed Comms',
            'Knowledge RAG',
            'Viral Content',
            'Operations',
            'Data Infrastructure'
        ],
        noResultsTitle: "No logic-gates found",
        noResultsDesc: "Adjust your filters or reach out for a custom architect call.",
        customTitle: <>Need a <span className="text-cyan-400 font-sans italic lowercase">custom</span> digital эксперт mirror?</>,
        customDesc: "If our ready-made engines don't fit your logic, we can craft a bespoke ecosystem that evolves with your business.",
        bookDiscovery: "Activate Custom Drive",
        askQuestion: "Talk to a Growth Partner",
        downloads: "activations",
        customize: "Config",
        popular: "Top Winner",
        tags: ['Real Estate', 'SaaS', 'E-commerce', 'Agency'],
        trustBanner: [
            { icon: Check, label: "ROI Verified" },
            { icon: ShieldCheck, label: "Systems Documented" },
            { icon: Bot, label: "Expert Support Hub" }
        ],
        resultsLabel: "Analyzing",
        templatesLabel: "active systems",
        filterByTool: "Sort by Tech Logic",
        clearAll: "Reset Logic [x]",
        explore: "Activate",
        notSureTitle: "Struggling with the Manual Work Tax?",
        notSureDesc: "Our automation architects can audit your current leaks and recommend the right infrastructure to stop the theft of your time.",
        takeQuiz: "2-Minute Profit Audit",
        bookConsult: "Book Free Logic Strategy"
    }
};

interface MarketplaceClientProps {
    initialTemplates: Template[];
}

export default function MarketplaceClient({ initialTemplates }: MarketplaceClientProps) {
    const t = translations.en;
    const router = useRouter();
    useEffect(() => {
        console.log('MarketplaceClient: initialTemplates:', initialTemplates);
    }, [initialTemplates]);

    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(t.categories[0]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [customizeModal, setCustomizeModal] = useState<{ open: boolean; template: Template | null }>({
        open: false,
        template: null
    });

    const filteredTemplates = React.useMemo(() => {
        let results = [...initialTemplates];

        // Apply Filters
        if (selectedCategory !== 'All' && selectedCategory !== t.categories[0]) {
            results = results.filter(t =>
                (t.category || '').toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            results = results.filter(t =>
                (t.name || '').toLowerCase().includes(searchLower) ||
                (t.description || '').toLowerCase().includes(searchLower) ||
                ((t as any).outcomeHeadline || '').toLowerCase().includes(searchLower)
            );
        }

        if (selectedTag) {
            const tagLower = selectedTag.toLowerCase();
            results = results.filter(t =>
                (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase() === tagLower)) ||
                (Array.isArray((t as any).tools) && (t as any).tools.some((tool: string) => tool.toLowerCase() === tagLower))
            );
        }

        return results;
    }, [initialTemplates, selectedCategory, searchQuery, selectedTag, t.categories]);

    const breadcrumbData = {
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://rensto.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Marketplace',
                item: 'https://rensto.com/marketplace'
            }
        ]
    };

    const handleCardClick = (id: string) => {
        router.push(`/marketplace/${id}`);
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <AnimatedGridBackground />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <div className="flex justify-center mb-4">
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black">
                            {t.badge}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 tracking-tighter leading-[0.9]">
                        {t.title}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        {t.subtitle}
                    </p>

                    {/* Trust Banner */}
                    <div className="flex flex-wrap justify-center items-center gap-8 pt-6 opacity-60">
                        {t.trustBanner.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 group cursor-none">
                                <item.icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick App Filters */}
                <div className="mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 text-center">{(t as any).filterByTool}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
                            { id: 'gmail', label: 'Gmail', icon: '📧' },
                            { id: 'slack', label: 'Slack', icon: '💬' },
                            { id: 'meta', label: 'Meta', icon: '🔵' },
                            { id: 'openai', label: 'OpenAI', icon: '🤖' },
                            { id: 'youtube', label: 'YouTube', icon: '🎬' }
                        ].map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setSelectedTag(selectedTag === tool.id ? null : tool.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${selectedTag === tool.id
                                    ? 'bg-white/10 border-cyan-500/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                                    }`}
                            >
                                <span className="text-sm">{tool.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between sticky top-24 z-30 bg-black/40 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder={t.searchPlaceholder}
                            className="bg-white/5 border-white/5 pl-11 h-12 rounded-2xl focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium text-white placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {t.categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setSelectedTag(null); // Clear tag when switching category
                                }}
                                className={`flex-shrink-0 transition-all ${selectedCategory === cat
                                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar ml-0 lg:ml-4 border-l lg:border-slate-700/50 lg:pl-4">
                        {t.tags.map((tag) => (
                            <Badge
                                key={tag}
                                className={`cursor-pointer transition-all whitespace-nowrap px-3 py-1 ${selectedTag === tag
                                    ? 'bg-[#fe3d51] text-white'
                                    : 'bg-white/5 text-slate-500 hover:text-white'
                                    }`}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            >
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-2 border border-white/5 bg-white/[0.02] rounded-2xl p-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`w-9 h-9 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`w-9 h-9 rounded-xl transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Results Count & Clear Filters */}
                <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {t.resultsLabel} <span className="text-white px-2 py-0.5 bg-white/5 rounded-md mx-1">{filteredTemplates.length}</span> {t.templatesLabel}
                        </span>
                        {(selectedCategory !== 'All' || searchQuery || selectedTag) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg ml-2"
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setSearchQuery('');
                                    setSelectedTag(null);
                                }}
                            >
                                {(t as any).clearAll}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Workflow Grid */}
                {filteredTemplates.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        : "flex flex-col gap-4"
                    }>
                        {filteredTemplates.map((template) => (
                            <WorkflowCard
                                key={template.id}
                                template={template}
                                onClick={handleCardClick}
                                viewMode={viewMode}
                                t={t}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-slate-700/50 rounded-3xl">
                        <Workflow className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold opacity-70 font-sans">{t.noResultsTitle}</h3>
                        <p className="text-slate-500 mt-2 font-sans">{t.noResultsDesc}</p>
                    </div>
                )}

                {/* Custom Section & Lead Gen Escape */}
                <div className="mt-32 space-y-8">
                    <div className="p-12 rounded-[3rem] bg-cyan-500/5 border border-cyan-500/20 relative overflow-hidden text-center">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                            <div className="flex justify-center">
                                <span className="text-3xl">🤔</span>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{(t as any).notSureTitle}</h2>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed">
                                {(t as any).notSureDesc}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link href="/contact?type=quiz">
                                    <Button size="xl" className="bg-white text-black hover:bg-slate-200 font-black px-10 rounded-2xl w-full sm:w-auto">
                                        {(t as any).takeQuiz}
                                    </Button>
                                </Link>
                                <Link href="/contact?type=discovery">
                                    <Button size="xl" variant="renstoSecondary" className="font-black px-10 rounded-2xl w-full sm:w-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                        {(t as any).bookConsult}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 rounded-[3rem] relative overflow-hidden group border border-white/5 bg-white/[0.01]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fe3d51]/5 via-transparent to-cyan-500/5 opacity-50" />
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6 text-center lg:text-left">
                                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                                    {t.customTitle}
                                </h2>
                                <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium">
                                    {t.customDesc}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link href="/custom">
                                        <Button size="xl" variant="renstoPrimary" className="px-12 font-black w-full sm:w-auto rounded-2xl h-16">
                                            {t.bookDiscovery}
                                            <Zap className="ml-2 w-5 h-5 fill-current" />
                                        </Button>
                                    </Link>
                                    <Link href="/contact">
                                        <Button variant="ghost" size="xl" className="w-full sm:w-auto text-slate-400 hover:text-cyan-400 font-black transition-colors">
                                            {(t as any).askQuestion}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="lg:w-1/3 flex justify-center">
                                <div className="w-64 h-64 relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full animate-pulse" />
                                    <Cpu className="w-full h-full text-cyan-400/80 relative z-10" strokeWidth={1} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            <Footer />

            {customizeModal.template && (
                <CustomizationModal
                    isOpen={customizeModal.open}
                    onClose={() => setCustomizeModal({ open: false, template: null })}
                    workflowName={customizeModal.template?.name || ''}
                    workflowId={customizeModal.template?.id || ''}
                    parametersSchema={(customizeModal.template?.configurationSchema?.map(f => ({
                        id: f.id,
                        label: f.label,
                        type: (f.type === 'textarea' || f.type === 'boolean') ? 'text' : f.type as any,
                        placeholder: f.placeholder,
                        required: f.required,
                        options: f.options,
                        hint: f.helperText
                    })) as any) || MOCK_FLOOR_PLAN_SCHEMA}
                    estimatedTime="24-48 hours"
                    complexity="Intermediate"
                    perRunCost={(customizeModal.template?.price || 97) * 0.1}
                />
            )}
        </div >
    );
}

function WorkflowCard({ template, viewMode, onCustomize, t, onClick }: { template: Template; viewMode: 'grid' | 'list'; onCustomize?: () => void; t: any; onClick?: (id: string) => void }) {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (template.video && videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, [template.video]);

    useEffect(() => {
        if (template.video && videoRef.current && isHovered) {
            videoRef.current.currentTime = 0;
        }
    }, [isHovered, template.video]);

    if (viewMode === 'list') {
        return (
            <div
                onClick={() => onClick?.(template.id)}
                className="cursor-pointer"
            >
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:border-cyan-500/50 transition-all flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors relative overflow-hidden shrink-0">
                        {template.video ? (
                            <video
                                src={template.video}
                                className="w-full h-full object-cover opacity-60"
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <Zap className="w-8 h-8 text-cyan-400" />
                        )}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-black text-lg text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                            {typeof ((template as any).outcomeHeadline || template.name) === 'object' ? template.name : ((template as any).outcomeHeadline || template.name)}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-1 font-medium">{typeof template.description === 'object' ? '' : template.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {(template as any).tools?.map((tool: string) => (
                            <div key={tool} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
                                {tool === 'whatsapp' && '📱'}
                                {tool === 'gmail' && '📧'}
                                {tool === 'slack' && '💬'}
                                {tool === 'meta' && '🔵'}
                                {tool === 'openai' && '🤖'}
                                {tool === 'n8n' && '⚡'}
                                {tool === 'youtube' && '🎬'}
                            </div>
                        ))}
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0 px-6">
                        <div className="text-2xl font-black text-white">${template.price}</div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            <Download className="w-3 h-3" />
                            {template.downloads} {t.downloads}
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-cyan-500 group-hover:text-black transition-all">
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Card
            className="group relative h-full flex flex-col overflow-hidden bg-white/[0.01] border-white/5 hover:border-cyan-500/40 transition-all duration-500 rounded-[2.5rem] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.(template.id)}
        >
            <div className="relative aspect-video overflow-hidden bg-slate-900">
                {template.video ? (
                    <video
                        ref={videoRef}
                        src={template.video}
                        className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}`}
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-16 h-16 text-cyan-400 opacity-20 group-hover:scale-110 transition-transform" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-white/10 backdrop-blur-md border-white/10 text-white font-black text-[10px] uppercase tracking-widest">
                        {template.category}
                    </Badge>
                </div>

                {template.popular && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-2 bg-cyan-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                            <Star className="w-3 h-3 fill-black" />
                            {(t as any).popular}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 flex flex-col flex-grow space-y-4">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                        {typeof ((template as any).outcomeHeadline || template.name) === 'object' ? template.name : ((template as any).outcomeHeadline || template.name)}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3">
                        {typeof template.description === 'object' ? '' : template.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {(template.features as any[])?.slice(0, 3).map((f: any, i: number) => {
                        if (!f) return null;
                        const featureText = typeof f === 'string' ? f : (f.title || '');
                        if (typeof featureText === 'object') return null; // Safety check
                        return (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-cyan-500" />
                                {featureText}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                    <div className="space-y-1">
                        <div className="text-3xl font-black text-white leading-none">${template.price}</div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            {template.rating} • {template.downloads} {t.downloads}
                        </div>
                    </div>

                    <Button size="xl" className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs px-6">
                        {(t as any).explore}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
