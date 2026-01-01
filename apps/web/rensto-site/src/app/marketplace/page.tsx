'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Template } from '@/types/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
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
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import { CustomizationModal, MOCK_FLOOR_PLAN_SCHEMA } from '@/components/marketplace/CustomizationModal';




const translations = {
    // ... translations
    en: {
        badge: "Automation Marketplace",
        title: <>Build Faster with <span className="text-[#fe3d51]">Pre-Built Tools</span></>,
        subtitle: <>Browse our library of pre-built modkits and component extensions for your Rensto Engines.<span className="block mt-2 font-semibold text-cyan-400">[BETA] All components currently available via Custom Setup only.</span></>,
        searchPlaceholder: "Search workflows, tools, or niches...",
        categories: ['All', 'Lead Machine', 'Autonomous Secretary', 'Knowledge Engine', 'Content Engine', 'Operations', 'Sync'],
        heroTitle: "Build Faster with",
        heroHighlight: "Pre-Built Tools",
        noResultsTitle: "No workflows found",
        noResultsDesc: "Try adjusting your filters or search query.",
        customTitle: <>Need a <span className="text-cyan-400 font-sans italic lowercase">custom</span> system?</>,
        customDesc: "If our ready-made tools don't fit exactly how you work, we can build a custom-made system tailored specifically to your daily business operations.",
        bookDiscovery: "Book Discovery Call",
        askQuestion: "Ask a Question",
        downloads: "downloads",
        customize: "Customize",
        popular: "Popular",
        tags: ['n8n', 'AI Agent', 'Operations', 'CRM']
    },
    he: {
        badge: "חנות האוטומציות",
        title: <>בנו מהר יותר עם <span className="text-[#fe3d51]">כלים מוכנים</span></>,
        subtitle: <>דפדפו בספריית המודולים והרחבות המנוע של רנסטו.<span className="block mt-2 font-semibold text-cyan-400">[בטא] כל הרכיבים זמינים כרגע דרך התקנה מותאמת אישית בלבד.</span></>,
        searchPlaceholder: "חפש תהליכים, כלים, או נישות...",
        categories: ['הכל', 'מנוע לידים', 'מזכירה אוטונומית', 'מנוע ידע', 'מנוע תוכן', 'תפעול', 'סנכרון'],
        heroTitle: "בנו מהר יותר עם",
        heroHighlight: "כלים מוכנים",
        noResultsTitle: "לא נמצאו תהליכים",
        noResultsDesc: "נסו לשנות את מסנני החיפוש.",
        customTitle: <>צריכים מערכת <span className="text-cyan-400 font-sans italic lowercase">מותאמת אישית</span>?</>,
        customDesc: "אם הכלים המוכנים שלנו לא מתאימים בדיוק לאופן העבודה שלכם, אנחנו יכולים לבנות מערכת תפורה אישית לפעילות העסקית היומיומית שלכם.",
        bookDiscovery: "תיאום שיחת אפיון",
        askQuestion: "שאל שאלה",
        downloads: "הורדות",
        customize: "התאמה אישית",
        popular: "פופולרי",
        tags: ['n8n', 'סוכן AI', 'תפעול', 'CRM']
    }
};

const MOCK_TEMPLATES_EN: Template[] = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "Celebrity Selfie Video Generator",
        description: "Create personalized AI video journeys through movie history. Upload a photo and get a merged video where the user stars in iconic scenes.",
        category: "Content Engine",
        price: 297,
        rating: 4.9,
        downloads: 156,
        popular: true,
        features: ["AI Face Swap", "Multi-Scene Stitching", "WhatsApp Delivery"],
        video: "http://172.245.56.50/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace']
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "Meta Ad Library Analyzer",
        description: "Scrapes winning ads from Meta Ad Library and generates detailed replication templates using AI vision analysis.",
        category: "Lead Machine",
        price: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["Ad Scraping", "AI Video Analysis", "Template Generation"],
        video: "http://172.245.56.50/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace']
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "YouTube AI Clone",
        description: "Create an AI persona from any YouTube channel. Extracts transcripts and builds a conversational clone that mimics style and knowledge.",
        category: "Knowledge Engine",
        price: 347,
        rating: 4.7,
        downloads: 64,
        features: ["Transcript Extraction", "Persona Synthesis", "Telegram/WhatsApp Integration"],
        video: "http://172.245.56.50/videos/youtube-clone.mp4",
        tags: ['marketplace']
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Call Audio Lead Analyzer",
        description: "Analyzes call recordings to qualify leads, extract details, and update CRM. Turns raw audio into actionable structured data.",
        category: "Lead Machine",
        price: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["Audio Transcription", "Sentiment Analysis", "CRM Sync"],
        video: "http://172.245.56.50/videos/call-audio-analyzer.mp4",
        tags: ['marketplace']
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Calendar Assistant",
        description: "Autonomous scheduling agent that handles complex booking logic, availability checks, and natural language coordination.",
        category: "Autonomous Secretary",
        price: 147,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "Smart Rescheduling"],
        video: "http://172.245.56.50/videos/calendar-assistant.mp4",
        tags: ['marketplace']
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "Floor Plan to Property Tour",
        description: "Converts 2D floor plans into 3D photorealistic video tours. Perfect for real estate marketing and pre-construction sales.",
        category: "Content Engine",
        price: 397,
        rating: 5.0,
        downloads: 45,
        features: ["2D to 3D Conversion", "Photorealistic Rendering", "Video Walkthrough"],
        video: "http://172.245.56.50/videos/floor-plan-tour.mp4",
        tags: ['marketplace']
    },
    {
        id: "vCxY2DXUZ8vUb30f",
        name: "Monthly CRO Insights Bot",
        description: "Automated Conversion Rate Optimization analyst. Monitors site data, identifies drop-off points, and suggests actionable fixes monthly.",
        category: "Knowledge Engine",
        price: 247,
        rating: 4.8,
        downloads: 112,
        features: ["Drop-off Analysis", "Heatmap Integration", "Monthly Report"],
        video: "http://172.245.56.50/videos/cro-insights.mp4",
        tags: ['marketplace']
    }
];

const MOCK_TEMPLATES_HE: Template[] = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "מחולל סרטוני סלפי מפורסמים",
        description: "צרו מסעות וידאו אישיים בהיסטוריה הקולנועית. העלו תמונה וקבלו סרטון ממוזג בו המשתמש מככב בסצנות אייקוניות.",
        category: "מנוע תוכן",
        price: 297,
        rating: 4.9,
        downloads: 156,
        popular: true,
        features: ["החלפת פנים AI", "חיבור סצנות", "שליחה לוואטסאפ"],
        video: "http://172.245.56.50/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace']
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "מנתח ספריית המודעות של מטא",
        description: "שואב מודעות מנצחות מספריית המודעות של פייסבוק ומייצר תבניות שכפול מפורטות באמצעות ניתוח וידאו AI.",
        category: "מנוע לידים",
        price: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["שאיבת מודעות", "ניתוח וידאו AI", "יצירת תבניות"],
        video: "http://172.245.56.50/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace']
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "משכפל יוטיוברים ב-AI",
        description: "צור פרסונת AI מכל ערוץ יוטיוב. מחלץ תמלולים ובונה שכפול שיחה שמחקה את הסגנון והידע.",
        category: "מנוע ידע",
        price: 347,
        rating: 4.7,
        downloads: 64,
        features: ["חילוץ תמלול", "סינתזת אישיות", "אינטגרציה לטלגרם"],
        video: "http://172.245.56.50/videos/youtube-clone.mp4",
        tags: ['marketplace']
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "מנתח שיחות לידים",
        description: "מנתח הקלטות שיחות כדי להכשיר לידים, לחלץ פרטים ולעדכן CRM. הופך שמע גולמי לנתונים מובנים.",
        category: "מנוע לידים",
        price: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["תמלול אודיו", "ניתוח סנטימנט", "סנכרון CRM"],
        video: "http://172.245.56.50/videos/call-audio-analyzer.mp4",
        tags: ['marketplace']
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "עוזר לוח שנה AI",
        description: "סוכן תזמון אוטונומי המטפל בלוגיקה מורכבת של הזמנות, בדיקות זמינות ותיאום בשפה טבעית.",
        category: "מזכירה אוטונומית",
        price: 147,
        rating: 4.6,
        downloads: 312,
        features: ["פתרון התנגשויות", "שפה טבעית", "תזמון חכם מחדש"],
        video: "http://172.245.56.50/videos/calendar-assistant.mp4",
        tags: ['marketplace']
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "תוכנית קומה לסיור נכס",
        description: "ממיר תוכניות קומה דו-ממדיות לסיורי וידאו פוטוריאליסטיים תלת-ממדיים. מושלם לשיווק נדל\"ן ומכירות על הנייר.",
        category: "מנוע תוכן",
        price: 397,
        rating: 5.0,
        downloads: 45,
        features: ["המרה מ-2D ל-3D", "רינדור פוטוריאליסטי", "סיור וידאו"],
        video: "http://172.245.56.50/videos/floor-plan-tour.mp4",
        tags: ['marketplace']
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "רובוט תובנות CRO חודשי",
        description: "אנליסט אופטימיזציית המרות אוטומטי. מנטר נתוני אתר, מזהה נקודות נטישה ומציע תיקונים חודשיים.",
        category: "מנוע ידע",
        price: 247,
        rating: 4.8,
        downloads: 112,
        features: ["ניתוח נטישה", "אינטגרציית מפות חום", "דוח חודשי"],
        video: "http://172.245.56.50/videos/cro-insights.mp4",
        tags: ['marketplace']
    }
];


export function MarketplacePageContent({ lang = 'en' }: { lang?: 'en' | 'he' }) {
    const t = translations[lang];
    const isRtl = lang === 'he';
    const router = useRouter(); // Initialize router
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(t.categories[0]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [customizeModal, setCustomizeModal] = useState<{ open: boolean; template: Template | null }>({
        open: false,
        template: null
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                // Fetch from Firestore 'templates' collection
                const templatesRef = collection(db, 'templates');
                const snapshot = await getDocs(templatesRef);

                const remoteTemplates: Record<string, Partial<Template>> = {};
                snapshot.forEach(doc => {
                    remoteTemplates[doc.id] = doc.data() as Partial<Template>;
                });

                const baseTemplates = isRtl ? MOCK_TEMPLATES_HE : MOCK_TEMPLATES_EN;

                // Merge data: prioritize Firestore -> MOCK
                // But only if Firestore doc exists with same ID
                // Filter out ANY template that does not have the 'marketplace' tag
                // This applies to both base templates (if we add internal ones to MOCK) 
                // and remote templates (which might override or be new).
                // Logic:
                // 1. Merge remote data into base templates.
                // 2. Filter the result.

                let mergedTemplates = baseTemplates.map(template => {
                    const remote = remoteTemplates[template.id];
                    if (remote) {
                        return {
                            ...template,
                            ...remote,
                            video: remote.video || template.video,
                            tags: remote.tags || template.tags // Merge tags
                        };
                    }
                    return template;
                });

                // Filter for 'marketplace' tag
                let filteredTemplates = mergedTemplates.filter(t =>
                    t.tags && t.tags.includes('marketplace')
                );

                if (selectedCategory !== 'All' && selectedCategory !== t.categories[0]) {
                    filteredTemplates = filteredTemplates.filter(t =>
                        t.category.toLowerCase() === selectedCategory.toLowerCase()
                    );
                }

                if (searchQuery) {
                    const searchLower = searchQuery.toLowerCase();
                    filteredTemplates = filteredTemplates.filter(t =>
                        t.name.toLowerCase().includes(searchLower) ||
                        t.description.toLowerCase().includes(searchLower)
                    );
                }

                setTemplates(filteredTemplates);
            } catch (error) {
                console.error("Error fetching templates, using fallback:", error);

                // FALLBACK Logic same as before
                let baseTemplates = isRtl ? MOCK_TEMPLATES_HE : MOCK_TEMPLATES_EN;
                if (selectedCategory !== 'All' && selectedCategory !== 'הכל') {
                    baseTemplates = baseTemplates.filter(t =>
                        t.category.toLowerCase() === selectedCategory.toLowerCase()
                    );
                }
                if (searchQuery) {
                    const searchLower = searchQuery.toLowerCase();
                    baseTemplates = baseTemplates.filter(t =>
                        t.name.toLowerCase().includes(searchLower) ||
                        t.description.toLowerCase().includes(searchLower)
                    );
                }
                setTemplates(baseTemplates);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [selectedCategory, searchQuery, selectedTag, isRtl]);


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
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)', direction: isRtl ? 'rtl' : 'ltr' }}>
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />
            <AnimatedGridBackground />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                        {t.badge}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                        {t.title}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-sans">
                        {t.subtitle}
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder={t.searchPlaceholder}
                            className="bg-[#1a1438]/50 border-slate-700/50 pl-10 focus:border-cyan-500/50"
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

                    {/* Tag Filter (Dynamic based on data) */}
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
                            <WorkflowCard
                                key={template.id}
                                template={template}
                                onClick={handleCardClick}
                                isRtl={isRtl}
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

                {/* Custom Section */}
                <div className="mt-24 p-8 md:p-12 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fe3d51]/10 via-transparent to-cyan-500/10 opacity-50" />
                    <div className="absolute inset-0 border border-white/10 rounded-[2rem] group-hover:border-cyan-500/20 transition-colors" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold font-mono uppercase tracking-tight">
                                {t.customTitle}
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-xl font-sans">
                                {t.customDesc}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/contact?type=custom">
                                    <Button size="xl" variant="renstoPrimary" className="px-8 font-bold w-full sm:w-auto">
                                        {t.bookDiscovery}
                                        <Zap className="ml-2 w-5 h-5 fill-current" />
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="renstoNeon" size="xl" className="w-full sm:w-auto">
                                        {t.askQuestion}
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

            <Footer lang={lang} />

            {/* Customization Modal */}
            {customizeModal.template && (
                <CustomizationModal
                    isOpen={customizeModal.open}
                    onClose={() => setCustomizeModal({ open: false, template: null })}
                    workflowName={customizeModal.template.name}
                    workflowId={customizeModal.template.id}
                    parametersSchema={MOCK_FLOOR_PLAN_SCHEMA}
                    estimatedTime="24-48 hours"
                    complexity="Intermediate"
                    perRunCost={customizeModal.template.price * 0.1}
                />
            )}
        </div>
    );
}

function WorkflowCard({ template, viewMode, onCustomize, t, isRtl, onClick }: { template: Template; viewMode: 'grid' | 'list'; onCustomize?: () => void; t: any; isRtl: boolean; onClick?: (id: string) => void }) {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (template.video && videoRef.current) {
            if (isHovered) {
                videoRef.current.currentTime = 0;
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Auto-play was prevented
                    });
                }
            } else {
                videoRef.current.pause();
            }
        }
    }, [isHovered, template.video]);

    if (viewMode === 'list') {
        return (
            <div
                onClick={() => onClick?.(template.id)}
                className="cursor-pointer"
            >
                <div className="bg-[#1a1438]/40 border border-slate-700/50 p-6 rounded-xl hover:border-cyan-500/50 transition-all flex items-center gap-6 group">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors relative overflow-hidden">
                        {template.video ? (
                            <video
                                src={template.video}
                                className="w-full h-full object-cover opacity-80"
                                muted
                                loop
                                playsInline
                            />
                        ) : (
                            <Zap className="w-6 h-6 text-cyan-400" />
                        )}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors font-sans">{template.name}</h3>
                        <p className="text-slate-400 text-sm line-clamp-1 font-sans">{template.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-xl font-bold font-sans text-white">${template.price}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-sans">
                            <Download className="w-3 h-3" />
                            {template.downloads} {t.downloads}
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        );
    }

    return (
        <Card
            className="bg-[#1a1438]/40 border-slate-700/50 overflow-hidden group hover:border-cyan-500/50 transition-all flex flex-col h-full rounded-2xl cursor-pointer"
            onClick={() => onClick?.(template.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="h-48 bg-slate-800/50 relative overflow-hidden flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-[#fe3d51]/5" />

                {/* Video Background on Hover */}
                {template.video ? (
                    <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <video
                            ref={videoRef}
                            src={template.video}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-60 mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
                    </div>
                ) : null}

                <Zap className={`w-16 h-16 text-cyan-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10 ${isHovered && template.video ? 'opacity-0' : 'opacity-100'}`} strokeWidth={1} />

                {template.popular && (
                    <Badge className="absolute top-4 right-4 bg-orange-500/10 text-orange-400 border-orange-500/20 font-mono text-[10px] uppercase z-20">
                        {t.popular}
                    </Badge>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow relative z-10 bg-[#1a1438]/40">
                <div className="space-y-2">
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 text-[10px] uppercase tracking-wider font-sans">
                        {template.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors font-sans line-clamp-1">{template.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-sans">
                        {template.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center mt-4 mb-auto">
                    {template.features.slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-300 font-sans whitespace-nowrap">
                            {f}
                        </span>
                    ))}
                </div>


                <div className="pt-4 mt-auto flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-2xl font-bold font-sans text-white">${template.price}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-mono font-sans">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            {template.rating} • {template.downloads} {t.downloads}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCustomize?.();
                            }}
                        >
                            <Settings2 className="w-3 h-3 mr-1" />
                            {t.customize}
                        </Button>
                        <Button size="icon" className="rounded-full bg-white/5 hover:bg-cyan-500 hover:text-black border-slate-700">
                            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}


export default function MarketplacePage() {
    return <MarketplacePageContent />;
}
