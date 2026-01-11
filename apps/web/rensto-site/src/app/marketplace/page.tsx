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
        badge: "Automation Marketplace",
        title: <>Production-Ready <span className="text-[#fe3d51]">Engines</span> for Growing Businesses</>,
        subtitle: <>Skip the development phase. Browse our library of tested, production-ready systems activated for speed and reliability.</>,
        searchPlaceholder: "What outcome do you want to automate today?",
        categories: [
            'All',
            'Lead & Sales',
            'Comms & Email',
            'Knowledge & Research',
            'Creative Content',
            'Operations',
            'Sync & Data'
        ],
        noResultsTitle: "No workflows found",
        noResultsDesc: "Try adjusting your filters or search query.",
        customTitle: <>Need a <span className="text-cyan-400 font-sans italic lowercase">custom</span> infrastructure?</>,
        customDesc: "If our ready-made tools don't fit exactly how you work, we can deploy a custom ecosystem tailored specifically to your daily business operations.",
        bookDiscovery: "Schedule Strategic Call",
        askQuestion: "Talk to a Partner",
        downloads: "activations",
        customize: "Config",
        popular: "Popular",
        tags: ['Real Estate', 'SaaS', 'E-commerce', 'Agency'],
        trustBanner: [
            { icon: Check, label: "Tested & Documented" },
            { icon: ShieldCheck, label: "Success Guaranteed" },
            { icon: Bot, label: "Live Expert Support" }
        ],
        resultsLabel: "Showing",
        templatesLabel: "systems",
        filterByTool: "Filter by tool",
        clearAll: "Clear All [x]",
        explore: "Explore",
        notSureTitle: "Not sure where to start?",
        notSureDesc: "Our automation partners can help you audit your current processes and recommend the right infrastructure for your specific business goals.",
        takeQuiz: "2-Minute ROI Quiz",
        bookConsult: "Book Free Strategic Audit"
    },
    he: {
        badge: "חנות האוטומציות",
        title: <>אוטומציות <span className="text-[#fe3d51]">מוכנות להפעלה</span> לעסקים קטנים</>,
        subtitle: <>דלגו על שלב הפיתוח. ספריית אוטומציות שנבדקו בשטח ומוכנות לעבודה מיידית בארגון שלכם.</>,
        searchPlaceholder: "מה תרצו לאוטומט היום?",
        categories: [
            'הכל',
            'לידים ומכירות',
            'תקשורת ואימייל',
            'ניהול ידע ומחקר',
            'תוכן יצירתי',
            'תפעול',
            'סנכרון ונתונים'
        ],
        noResultsTitle: "לא נמצאו תהליכים",
        noResultsDesc: "נסו לשנות את מסנני החיפוש.",
        customTitle: <>צריכים מערכת <span className="text-cyan-400 font-sans italic lowercase">מותאמת אישית</span>?</>,
        customDesc: "אם הכלים המוכנים שלנו לא מתאימים בדיוק לאופן העבודה שלכם, אנחנו יכולים לבנות מערכת תפורה אישית לפעילות העסקית היומיומית שלכם.",
        bookDiscovery: "תיאום שיחת אפיון",
        askQuestion: "שאל שאלה",
        downloads: "הורדות",
        customize: "הגדרות",
        popular: "פופולרי",
        tags: ['נדל"ן', 'SaaS', 'E-commerce', 'אייג\'נסי'],
        trustBanner: [
            { icon: Check, label: "נבדק ומתועד" },
            { icon: ShieldCheck, label: "שביעות רצון מובטחת" },
            { icon: Bot, label: "תמיכה מומחית" }
        ],
        resultsLabel: "מציג",
        templatesLabel: "תבניות",
        filterByTool: "סינון לפי כלי",
        clearAll: "נקה הכל [x]",
        explore: "פרטים נוספים",
        notSureTitle: "לא בטוחים מאיפה להתחיל?",
        notSureDesc: "מומחי האוטומציה שלנו יכולים לעזור לכם לאפיין את התהליכים הקיימים ולהמליץ על המערכות המתאימות למטרות העסקיות שלכם.",
        takeQuiz: "בדיקת התאמה (2 דקות)",
        bookConsult: "תיאום שיחת ייעוץ"
    }
};

const MOCK_TEMPLATES_EN: Template[] = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "Celebrity Selfie Video Generator",
        outcomeHeadline: "Drive High-Engagement Brand Awareness with Viral AI Video Experiences",
        description: "Empower your audience to become the star of your brand's cinematic journey. This automated engine generates high-fidelity AI video experiences where users are seamlessly integrated into iconic scenes, perfect for viral marketing campaigns and hyper-personalized customer engagement.",
        category: "Creative Content",
        price: 297,
        rating: 5.0,
        downloads: 156,
        popular: true,
        features: ["AI Face Swap", "Multi-Scene Stitching", "WhatsApp Delivery"],
        tools: ['whatsapp', 'n8n', 'higgsfield'],
        video: "/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "Meta Ad Library Analyzer",
        outcomeHeadline: "Scale Your Ads with Proven, Competitor-Tested Creative Patterns",
        description: "Eliminate guesswork from your creative strategy. This engine scrapes active high-performance ads from the Meta Ad Library and uses AI vision to reverse-engineer their winning hooks, scripts, and visual patterns for your own brand.",
        category: "Lead & Sales",
        price: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["Ad Scraping", "AI Video Analysis", "Template Generation"],
        tools: ['meta', 'openai', 'n8n'],
        video: "/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "YouTube AI Clone",
        outcomeHeadline: "Convert Thousands of Hours of Video Into Your Private Intelligence Engine",
        description: "Transform any YouTube channel into a searchable, conversational persona. This system extracts full transcript data and synthesizes a custom LLM persona that mirrors an expert's knowledge base and communication style, accessible via Telegram.",
        category: "Knowledge & Research",
        price: 347,
        rating: 4.7,
        downloads: 64,
        features: ["Transcript Extraction", "Persona Synthesis", "Telegram Integration"],
        tools: ['youtube', 'telegram', 'perplexity'],
        video: "/videos/youtube-clone.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "Voice AI Lead Analyzer",
        outcomeHeadline: "Scale Your Sales with Autonomous Voice AI Intelligence",
        description: "Part of the Rensto Voice AI Agent pillar. This engine automatically transcribes call recordings, scores lead intent using sentiment analysis, and syncs qualified opportunities directly to your CRM with intelligent categorization.",
        category: "Lead & Sales",
        price: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["Voice Transcription", "Sentiment Analysis", "CRM Integration"],
        tools: ['telnyx', 'workiz', 'openai'],
        video: "/videos/call-audio-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "AI Appointment Assistant",
        outcomeHeadline: "Eliminate Scheduling Friction with an Autonomous Booking Representative",
        description: "Delegate your entire calendar management to an agent that actually understands your business. Handles complex multi-timezone booking, natural language rescheduling requests, and human-in-the-loop approval workflows.",
        category: "Operations",
        price: 147,
        rating: 4.6,
        downloads: 312,
        features: ["Conflict Resolution", "Natural Language", "Smart Rescheduling"],
        tools: ['google', 'slack', 'n8n'],
        video: "/videos/calendar-assistant.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "Floor Plan to Property Tour",
        outcomeHeadline: "Sell Properties Faster with Photorealistic AI Video Walkthroughs",
        description: "Transform flat 2D floor plans into immersive 4K cinematic walkthroughs. This spatial AI engine renders photorealistic room textures in multiple architectural styles and stitches them into a high-production property tour.",
        category: "Creative Content",
        price: 397,
        rating: 5.0,
        downloads: 45,
        features: ["2D to 3D Conversion", "Photorealistic Rendering", "Video Walkthrough"],
        tools: ['n8n', 'openai', 'midjourney'],
        video: "/videos/floor-plan-tour.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "Monthly CRO Insights Bot",
        outcomeHeadline: "Automate Your Growth Strategy with Continuous UX Audits",
        description: "Turn your GA4 and Clarity data into a prioritized growth roadmap. This system autonomously identifies revenue leaks, rage clicks, and conversion bottlenecks, delivering actionable CRO recommendations directly to your team via Slack.",
        category: "Knowledge & Research",
        price: 247,
        rating: 4.8,
        downloads: 112,
        features: ["Drop-off Analysis", "Heatmap Integration", "Monthly Report"],
        tools: ['google', 'n8n', 'openai'],
        video: "/videos/cro-insights.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    }
];

const MOCK_TEMPLATES_HE: Template[] = [
    {
        id: '4OYGXXMYeJFfAo6X',
        name: "מחולל סרטוני סלפי מפורסמים",
        outcomeHeadline: "צרו מודעות ויראלית ומודעות למותג באמצעות חוויות וידאו AI",
        description: "העצימו את הקהל שלכם להפוך לכוכב המסע הקולנועי של המותג שלכם. מנוע אוטומטי המייצר חוויות וידאו AI באיכות גבוהה שבהן המשתמשים משולבים בצורה חלקה בסצנות אייקוניות.",
        category: "תוכן יצירתי",
        price: 297,
        rating: 5.0,
        downloads: 156,
        popular: true,
        features: ["החלפת פנים AI", "חיבור סצנות", "שליחה לוואטסאפ"],
        tools: ['whatsapp', 'n8n', 'higgsfield'],
        video: "/videos/celebrity-selfie-generator.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: '8GC371u1uBQ8WLmu',
        name: "מנתח ספריית המודעות של מטא",
        outcomeHeadline: "שדרגו את הפרסום שלכם עם דפוסי קריאייטיב מוכחים שנבדקו אצל המתחרים",
        description: "הסירו את חוסר הוודאות מאסטרטגיית הקריאייטיב שלכם. מנוע זה סורק מודעות בעלות ביצועים גבוהים מספריית המודעות של מטא ומשתמש בבינה מלאכותית ויזואלית כדי לפצח את הוקים, התסריטים והדפוסים הוויזואליים המנצחים עבור המותג שלכם.",
        category: "לידים ומכירות",
        price: 197,
        rating: 4.8,
        downloads: 89,
        popular: true,
        features: ["שאיבת מודעות", "ניתוח וידאו AI", "יצירת תבניות"],
        tools: ['meta', 'openai', 'n8n'],
        video: "/videos/meta-ad-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: '5pMi01SwffYB6KeX',
        name: "משכפל יוטיוברים ב-AI",
        outcomeHeadline: "הפכו אלפי שעות וידאו למנוע אינטליגנציה פרטי",
        description: "הפכו כל ערוץ יוטיוב לפרסונה חיפושית ושיחתית. המערכת מחלצת נתוני תמלול מלאים ומסנתזת פרסונת LLM מותאמת אישית שמשקפת את בסיס הידע וסגנון התקשורת של המומחה, נגישה דרך טלגרם.",
        category: "ניהול ידע ומחקר",
        price: 347,
        rating: 4.7,
        downloads: 64,
        features: ["חילוץ תמלול", "סינתזת אישיות", "אינטגרציה לטלגרם"],
        tools: ['youtube', 'telegram', 'perplexity'],
        video: "/videos/youtube-clone.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: 'U6EZ2iLQ4zCGg31H',
        name: "מנתח לידים ב-Voice AI",
        outcomeHeadline: "שדרגו את המכירות שלכם עם אינטליגנציה קולית אוטונומית",
        description: "חלק מעמוד ה-Voice AI Agent של Rensto. מנוע זה מתמלל אוטומטית הקלטות שיחות, מדרג כוונת ליד באמצעות ניתוח סנטימנט ומסנכרן הזדמנויות כשירות ישירות ל-CRM שלכם.",
        category: "לידים ומכירות",
        price: 497,
        rating: 4.9,
        downloads: 203,
        popular: true,
        features: ["תמלול קולי", "ניתוח סנטימנט", "סנכרון CRM"],
        tools: ['telnyx', 'workiz', 'openai'],
        video: "/videos/call-audio-analyzer.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: '5Fl9WUjYTpodcloJ',
        name: "עוזר קביעת פגישות ב-AI",
        outcomeHeadline: "בטלו את החיכוך בתזמון פגישות עם נציג הזמנות אוטונומי",
        description: "האצילו את כל ניהול היומן שלכם לסוכן שבאמת מבין את העסק שלכם. מטפל בהזמנות מורכבות במספר אזורי זמן, בקשות תזמון בשפה טבעית ותהליכי אישור אנושיים.",
        category: "תפעול",
        price: 147,
        rating: 4.6,
        downloads: 312,
        features: ["פתרון התנגשויות", "שפה טבעית", "תזמון חכם מחדש"],
        tools: ['google', 'slack', 'n8n'],
        video: "/videos/calendar-assistant.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: 'stj8DmATqe66D9j4',
        name: "תוכנית קומה לסיור נכס",
        outcomeHeadline: "מכרו נכסים מהר יותר עם סיורי וידאו פוטוריאליסטיים ב-AI",
        description: "הפכו תוכניות קומה 2D שטוחות לסיורים קולנועיים סוחפים ב-4K. מנוע spatial AI זה מרנדר טקסטורות חדרים פוטוריאליסטיות במגוון סגנונות אדריכליים ומחבר אותם לסיור נכס באיכות הפקה גבוהה.",
        category: "תוכן יצירתי",
        price: 397,
        rating: 5.0,
        downloads: 45,
        features: ["המרה מ-2D ל-3D", "רינדור פוטוריאליסטי", "סיור וידאו"],
        tools: ['n8n', 'openai', 'midjourney'],
        video: "/videos/floor-plan-tour.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    },
    {
        id: 'vCxY2DXUZ8vUb30f',
        name: "מנתח שיפור המרות חודשי",
        outcomeHeadline: "הפכו את אסטרטגיית הצמיחה שלכם לאוטומטית עם ביקורות UX רציפות",
        description: "הפכו את נתוני ה-GA4 והקלאריטי שלכם למפת דרכים מתועדפת לצמיחה. מערכת זו מזהה באופן אוטונומי דליפות הכנסה, הקלקות של תסכול וצווארי בקבוק בהמרות, ומספקת המלצות CRO מעשיות ישירות לצוות שלכם.",
        category: "ניהול ידע ומחקר",
        price: 247,
        rating: 4.8,
        downloads: 112,
        features: ["ניתוח נטישה", "אינטגרציה למפות חום", "דו\"ח חודשי"],
        tools: ['google', 'n8n', 'openai'],
        video: "/videos/cro-insights.mp4",
        tags: ['marketplace'],
        readinessStatus: 'Active'
    }
];


export function MarketplacePageContent() {
    const t = translations.en;
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
                const templatesRef = collection(db, 'templates');
                const snapshot = await getDocs(templatesRef);

                const allTemplates: Template[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data() as Template;
                    allTemplates.push({
                        ...data,
                        id: doc.id,
                        businessImpact: data.businessImpact,
                        roiExample: data.roiExample,
                    });
                });

                // Filter for 'marketplace' tag
                let filteredTemplates = allTemplates.filter(t => {
                    const tags = Array.isArray(t.tags) ? t.tags : [];
                    return tags.some(tag => tag.toLowerCase() === 'marketplace');
                });

                // Apply Filters
                if (selectedCategory !== 'All' && selectedCategory !== t.categories[0]) {
                    filteredTemplates = filteredTemplates.filter(t =>
                        (t.category || '').toLowerCase() === selectedCategory.toLowerCase()
                    );
                }

                if (searchQuery) {
                    const searchLower = searchQuery.toLowerCase();
                    filteredTemplates = filteredTemplates.filter(t =>
                        (t.name || '').toLowerCase().includes(searchLower) ||
                        (t.description || '').toLowerCase().includes(searchLower) ||
                        ((t as any).outcomeHeadline || '').toLowerCase().includes(searchLower)
                    );
                }

                if (selectedTag) {
                    const tagLower = selectedTag.toLowerCase();
                    filteredTemplates = filteredTemplates.filter(t =>
                        (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase() === tagLower)) ||
                        (Array.isArray((t as any).tools) && (t as any).tools.some((tool: string) => tool.toLowerCase() === tagLower))
                    );
                }

                // If Firestore is empty, fallback to mocks
                if (filteredTemplates.length === 0) {
                    throw new Error("No templates found in Firestore");
                }

                setTemplates(filteredTemplates);
            } catch (error) {
                console.error("Error fetching templates, using fallback:", error);
                setTemplates(MOCK_TEMPLATES_EN);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [selectedCategory, searchQuery, selectedTag]);


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
                            {t.resultsLabel} <span className="text-white px-2 py-0.5 bg-white/5 rounded-md mx-1">{templates.length}</span> {t.templatesLabel}
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
                {
                    loading ? (
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
                    )
                }

                {/* Custom Section & Lead Gen Escape */}
                <div className="mt-32 space-y-8">
                    {/* Confused User Section */}
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

                    {/* Classic Custom Section */}
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

            {/* Customization Modal */}
            {
                customizeModal.template && (
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
                )
            }
        </div >
    );
}

function WorkflowCard({ template, viewMode, onCustomize, t, onClick }: { template: Template; viewMode: 'grid' | 'list'; onCustomize?: () => void; t: any; onClick?: (id: string) => void }) {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Start video playback on mount
    useEffect(() => {
        if (template.video && videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay was prevented - that's ok, video will show first frame
            });
        }
    }, [template.video]);

    // Reset to beginning on hover for better UX
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
                            {(template as any).outcomeHeadline || template.name}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-1 font-medium">{template.description}</p>
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
            className="bg-white/[0.02] border-white/5 overflow-hidden group hover:border-cyan-500/50 transition-all flex flex-col h-full rounded-[2.5rem] cursor-pointer relative shadow-2xl"
            onClick={() => onClick?.(template.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="h-56 bg-slate-900 relative overflow-hidden flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-[#fe3d51]/10 opacity-30 group-hover:opacity-50 transition-opacity" />

                {/* Video Thumbnail */}
                {template.video ? (
                    <video
                        ref={videoRef}
                        src={template.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="w-16 h-16 text-cyan-500/20" strokeWidth={1} />
                    </div>
                )}

                {/* Tool Icons Floating */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {(template as any).tools?.map((tool: string) => (
                        <div key={tool} className="w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-xs shadow-xl transform -translate-x-12 group-hover:translate-x-0 transition-transform duration-500" style={{ transitionDelay: `${(template as any).tools.indexOf(tool) * 50}ms` }}>
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

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-4 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Active System</span>
                    </div>
                </div>

                {template.popular && (
                    <Badge className="absolute top-4 right-4 bg-[#fe3d51] text-white border-none font-black text-[9px] uppercase z-20 shadow-xl px-3 py-1 rounded-full tracking-widest">
                        {t.popular}
                    </Badge>
                )}

                {/* Hover Play Icon Hint */}
                <div className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-500 pointer-events-none ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                    <div className="w-16 h-16 rounded-[2rem] bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                        <ArrowRight className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-grow relative z-10">
                <div className="space-y-3">
                    <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 text-[9px] font-black uppercase tracking-[0.2em] px-0 border-none">
                        {template.category}
                    </Badge>
                    <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight leading-tight">
                        {(template as any).outcomeHeadline || template.name}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                        {template.description}
                    </p>
                </div>

                <div className="pt-8 mt-auto flex items-center justify-between border-t border-white/5">
                    <div className="space-y-1">
                        <div className="text-3xl font-black text-white tracking-tighter">${template.price}</div>
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


export default function MarketplacePage() {
    return <MarketplacePageContent />;
}
