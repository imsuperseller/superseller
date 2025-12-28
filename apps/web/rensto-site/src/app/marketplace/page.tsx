'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    rating: number;
    downloads: number;
    popular?: boolean;
    image?: string;
    features: string[];
}

const CATEGORIES = [
    'All',
    'Lead Generation',
    'Sales',
    'Operations',
    'AI Agents',
    'Marketing',
    'Sync'
];

export default function MarketplacePage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const response = await fetch(`/api/marketplace/templates?category=${selectedCategory === 'All' ? '' : selectedCategory.toLowerCase().replace(' ', '-')}&search=${searchQuery}`);
                const data = await response.json();
                if (data.success) {
                    setTemplates(data.templates);
                } else {
                    // Mock data fallback if API fails or returns empty
                    setTemplates(MOCK_TEMPLATES);
                }
            } catch (error) {
                console.error('Failed to fetch templates:', error);
                setTemplates(MOCK_TEMPLATES);
            } finally {
                setLoading(false);
            }
        }

        const timer = setTimeout(fetchTemplates, 300);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery]);

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

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <AnimatedGridBackground />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                        Automation Marketplace
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                        Build Faster with <span className="text-[#fe3d51]">Templates</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Browse our library of pre-built n8n workflows and AI agents.
                        <span className="block mt-2 font-semibold text-cyan-400">
                            [BETA] All workflows currently available via Custom Implementation only.
                        </span>
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Search workflows, tools, or niches..."
                            className="bg-[#1a1438]/50 border-slate-700/50 pl-10 focus:border-cyan-500/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex-shrink-0 transition-all ${selectedCategory === cat
                                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-2 border border-slate-700/50 rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`w-8 h-8 ${viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-slate-500'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`w-8 h-8 ${viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-slate-500'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Workflow Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[400px] bg-slate-800/20 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : templates.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        : "flex flex-col gap-4"
                    }>
                        {templates.map((template) => (
                            <WorkflowCard key={template.id} template={template} viewMode={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-slate-700/50 rounded-3xl">
                        <Workflow className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold opacity-70">No workflows found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your filters or search query.</p>
                    </div>
                )}

                {/* Custom Section */}
                <div className="mt-24 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fe3d51]/10 via-transparent to-cyan-500/10 opacity-50" />
                    <div className="absolute inset-0 border border-white/10 rounded-[2rem] group-hover:border-cyan-500/20 transition-colors" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold font-mono uppercase tracking-tight">
                                Need a <span className="text-cyan-400 font-sans italic lowercase">custom</span> architected solution?
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                                If our templates don't fit your exact workflow, we can build a bespoke automation
                                ecosystem tailored specifically to your business operations.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/contact?type=custom">
                                    <Button size="lg" className="bg-[#fe3d51] hover:bg-[#ff4d61] text-white px-8 h-14 text-base font-bold">
                                        Book Discovery Call
                                        <Zap className="ml-2 w-5 h-5 fill-current" />
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" size="lg" className="border-slate-700 hover:bg-white/5 h-14 px-8 text-base">
                                        Ask a Question
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
            </main>

            <Footer />
        </div>
    );
}

function WorkflowCard({ template, viewMode }: { template: Template; viewMode: 'grid' | 'list' }) {
    if (viewMode === 'list') {
        return (
            <Link href={`/marketplace/${template.id}`}>
                <div className="bg-[#1a1438]/40 border border-slate-700/50 p-6 rounded-xl hover:border-cyan-500/50 transition-all flex items-center gap-6 group">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                        <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-1">{template.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-xl font-bold">${template.price}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest">
                            <Download className="w-3 h-3" />
                            {template.downloads} downloads
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
            </Link>
        );
    }

    return (
        <Card className="bg-[#1a1438]/40 border-slate-700/50 overflow-hidden group hover:border-cyan-500/50 transition-all flex flex-col h-full rounded-2xl">
            <div className="h-48 bg-slate-800/50 relative overflow-hidden flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-[#fe3d51]/5" />
                <Zap className="w-16 h-16 text-cyan-500/20 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                {template.popular && (
                    <Badge className="absolute top-4 right-4 bg-orange-500/10 text-orange-400 border-orange-500/20 font-mono text-[10px] uppercase">
                        Popular
                    </Badge>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow space-y-4">
                <div className="space-y-2">
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 text-[10px] uppercase tracking-wider">
                        {template.category}
                    </Badge>
                    <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                        {template.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                    {template.features.slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300">
                            {f}
                        </span>
                    ))}
                </div>

                <div className="pt-4 mt-auto flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-2xl font-bold">${template.price}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            {template.rating} • {template.downloads} downloads
                        </div>
                    </div>

                    <Link href={`/marketplace/${template.id}`}>
                        <Button size="icon" className="rounded-full bg-white/5 hover:bg-cyan-500 hover:text-black border-slate-700">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}

const MOCK_TEMPLATES: Template[] = [
    {
        id: 'whatsapp-router',
        name: 'Omni-Channel Lead Router',
        description: 'Intelligently route incoming business messages to the correct department or CRM.',
        category: 'Operations',
        price: 97,
        rating: 5.0,
        downloads: 245,
        popular: true,
        features: ['Intelligent Routing', 'CRM Integration', 'Multi-Agent Support', 'Analytics']
    },
    {
        id: 'rensto-support-agent',
        name: 'Professional support Agent',
        description: '24/7 AI-powered support agent trained on your company knowledge base.',
        category: 'AI Agents',
        price: 197,
        rating: 4.9,
        downloads: 182,
        popular: true,
        features: ['Gemini RAG', 'Knowledge Base Sync', 'Human Handoff']
    },
    {
        id: 'compliance-audit-agent',
        name: 'Auto-Audit Specialist',
        description: 'Specialized AI agent for document analysis, law compliance, and reporting.',
        category: 'AI Agents',
        price: 247,
        rating: 4.8,
        downloads: 64,
        features: ['Document Analysis', 'Compliance Filtering', 'Security Guardrails']
    },
    {
        id: 'sales-growth-agent',
        name: 'AI Revenue Closer',
        description: 'Automated sales prospecting and qualification for high-volume operations.',
        category: 'Sales',
        price: 197,
        rating: 4.7,
        downloads: 92,
        features: ['Lead Scoring', 'CRM Injection', 'Customer History', 'Upsell Logic']
    }
];
