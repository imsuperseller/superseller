'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Schema } from '@/components/seo/Schema';
import {
    Scale,
    Stethoscope,
    Home,
    Truck,
    ShoppingBag,
    Briefcase,
    ArrowRight,
    Zap,
    CheckCircle2,
    Shield,
    Code,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { motion } from 'framer-motion';

const translations = {
    en: {
        badge: "Case Studies",
        title: <>Industry <span className="italic text-cyan-400 text-glow">Infrastructure</span></>,
        subtitle: "We don't do \"one-size-fits-all.\" We engineer sector-specific Engine modkits designed for the unique architectures of high-performing industries.",
        explore: "Explore Solutions",
        blueprintTitle: <>Our Blueprint for <span className="text-cyan-400">Industry Scale</span></>,
        blueprintSubtitle: "We don't just build bots. We architect end-to-end operational systems that understand the nuances of your specific industry.",
        features: [
            {
                title: "Compliance Standardized",
                desc: "Whether it's HIPAA for healthcare, SOC2 for tech, or Bar Association rules for legal—our architects ensure every automation follows your industry's strict security and ethical guidelines.",
                icon: Shield
            },
            {
                title: "Legacy Integration",
                desc: "We connect modern AI agents to the tools you already use. From old SQL databases to niche CRMs like Clio, MyCase, or PatientPop.",
                icon: Code
            },
            {
                title: "Real-Time Intelligence",
                desc: "Your systems don't just store data—they act on it. Automatic lead qualifying, instant contract drafting, and predictive scheduling that keeps your pipeline moving.",
                icon: Zap
            },
            {
                title: "Team Empowerment",
                desc: "Automating the 80% of repetitive tasks allows your high-value talent to focus on strategy, creativity, and relationship building.",
                icon: Users
            }
        ],
        ctaTitle: "Don't see your industry?",
        ctaDesc: "Our systems work for any business. We specialize in taking the work you do manually today and turning it into an automatic tool that works 24/7.",
        customAudit: "Custom Audit",
        browseWorkflows: "Browse All Workflows",
        customPoint: "Custom-made for your specific needs",
        niches: [
            {
                id: 'accounting',
                name: 'Accounting & Finance',
                description: 'Autonomous data entry, tax document processing, and client onboarding engines.',
                stat: 'Audit-Ready 24/7',
                icon: Scale,
                color: 'from-blue-500 to-cyan-500'
            },
            {
                id: 'engineering',
                name: 'Engineering & Construction',
                description: 'Project management automations, resource tracking, and blueprint data extraction.',
                stat: '40% Less Admin',
                icon: Home,
                color: 'from-orange-500 to-red-500'
            },
            {
                id: 'healthcare',
                name: 'Medical Clinics',
                description: 'HIPAA-compliant patient intake, autonomous scheduling, and follow-up engines.',
                stat: '90% Faster Intake',
                icon: Stethoscope,
                color: 'from-emerald-500 to-teal-500'
            },
            {
                id: 'legal',
                name: 'Law Firms',
                description: 'Automatic client booking, document creation, and messaging for busy law offices.',
                stat: 'Zero Missed Leads',
                icon: Shield,
                color: 'from-indigo-500 to-purple-500'
            },
            {
                id: 'ecommerce',
                name: 'E-commerce',
                description: 'Syncing stock, answering customers, and getting reviews on autopilot.',
                stat: '3x More Sales',
                icon: ShoppingBag,
                color: 'from-pink-500 to-rose-500'
            },
            {
                id: 'agencies',
                name: 'Agencies & Consultants',
                description: 'Automatic client onboarding, tracking projects, and simple billing systems.',
                stat: 'Scale Without Hiring',
                icon: Briefcase,
                color: 'from-blue-600 to-blue-400'
            }
        ]
    },
    he: {
        badge: "מקרי בוחן",
        title: <>תשתיות <span className="italic text-cyan-400 text-glow">תעשייתיות</span></>,
        subtitle: "אנחנו לא מאמינים בפתרון אחד לכולם. אנחנו מהנדסים ערכות מנוע ספציפיות לכל סקטור, המותאמות לארכיטקטורה הייחודית של תעשיות מובילות.",
        explore: "גלה פתרונות",
        blueprintTitle: <>התוכנית שלנו <span className="text-cyan-400">לסקייל תעשייתי</span></>,
        blueprintSubtitle: "אנחנו לא סתם בונים בוטים. אנחנו מתכננים מערכות תפעוליות מקצה לקצה שמבינות את הניואנסים של התעשייה הספציפית שלך.",
        features: [
            {
                title: "סטנדרט תאימות",
                desc: "בין אם זה HIPAA לרפואה, SOC2 להייטק, או כללי לשכת עורכי הדין - האדריכלים שלנו מבטיחים שכל אוטומציה עומדת בהנחיות האבטחה והאתיקה המחמירות ביותר.",
                icon: Shield
            },
            {
                title: "אינטגרציה למערכות ליגסי",
                desc: "אנחנו מחברים סוכני AI מודרניים לכלים שאתם כבר משתמשים בהם. ממסדי נתונים ישנים ועד CRM נישתיים כמו חשבשבת, פריוריטי, או סאפ.",
                icon: Code
            },
            {
                title: "מודיעין זמן אמת",
                desc: "המערכות שלכם לא רק שומרות מידע - הן פועלות לפיו. דירוג לידים אוטומטי, ניסוח חוזים מיידי, ותיעוד חכם ששומר על הצנרת שלכם בתנועה.",
                icon: Zap
            },
            {
                title: "העצמת הצוות",
                desc: "אוטומציה של 80% מהמשימות החוזרות מאפשרת לכישרונות המובילים שלכם להתמקד באסטרטגיה, יצירתיות, ובניית מערכות יחסים.",
                icon: Users
            }
        ],
        ctaTitle: "לא מוצאים את התעשייה שלכם?",
        ctaDesc: "המערכות שלנו עובדות עבור כל עסק. אנחנו מתמחים בלקחת את העבודה שאתם עושים ידנית היום ולהפוך אותה לכלי אוטומטי שעובד 24/7.",
        customAudit: "אודיט מותאם אישית",
        browseWorkflows: "צפה בכל התהליכים",
        customPoint: "מותאם אישית לצרכים הספציפיים שלך",
        niches: [
            {
                id: 'accounting',
                name: 'ראיית חשבון ופיננסים',
                description: 'הזנת נתונים אוטונומית, עיבוד מסמכי מס, ומנועי קליטת לקוחות.',
                stat: 'מוכן לביקורת 24/7',
                icon: Scale,
                color: 'from-blue-500 to-cyan-500'
            },
            {
                id: 'engineering',
                name: 'הנדסה ובנייה',
                description: 'אוטומציות לניהול פרויקטים, מעקב משאבים, וחילוץ נתונים מתוכניות.',
                stat: '40% פחות אדמיניסטרציה',
                icon: Home,
                color: 'from-orange-500 to-red-500'
            },
            {
                id: 'healthcare',
                name: 'מרפאות ורפואה',
                description: 'קליטת מטופלים תואמת רגולציה, זימון תורים אוטונומי, ומנועי מעקב.',
                stat: 'קליטה מהירה ב-90%',
                icon: Stethoscope,
                color: 'from-emerald-500 to-teal-500'
            },
            {
                id: 'legal',
                name: 'משרדי עורכי דין',
                description: 'קביעת פגישות אוטומטית, יצירת מסמכים, והודעות למשרדים עמוסים.',
                stat: 'אפס לידים אבודים',
                icon: Shield,
                color: 'from-indigo-500 to-purple-500'
            },
            {
                id: 'ecommerce',
                name: 'אי-קומרס',
                description: 'סנכרון מלאי, מענה ללקוחות, וקבלת ביקורות על טייס אוטומטי.',
                stat: 'פי 3 יותר מכירות',
                icon: ShoppingBag,
                color: 'from-pink-500 to-rose-500'
            },
            {
                id: 'agencies',
                name: 'סוכנויות ויועצים',
                description: 'קליטת לקוחות אוטומטית, מעקב פרויקטים, ומערכות חיוב פשוטות.',
                stat: 'לצמוח בלי לגייס',
                icon: Briefcase,
                color: 'from-blue-600 to-blue-400'
            }
        ]
    }
};

export function NichesPageContent({ lang = 'en' }: { lang?: 'en' | 'he' }) {
    const t = translations[lang];
    const isRtl = lang === 'he';

    const breadcrumbData = {
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rensto.com' },
            { '@type': 'ListItem', position: 2, name: 'Niches', item: 'https://rensto.com/niches' }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)', direction: isRtl ? 'rtl' : 'ltr' }}>
            <AnimatedGridBackground />
            <Header />
            <Schema type="BreadcrumbList" data={breadcrumbData} />

            <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
                    <Badge className="bg-[#fe3d51]/10 text-[#fe3d51] border-[#fe3d51]/20 px-4 py-1.5 uppercase tracking-widest text-[10px] font-mono">
                        {t.badge}
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                        {t.title}
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-sans">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {t.niches.map((niche, index) => (
                        <motion.div
                            key={niche.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={isRtl ? `/he/niches/${niche.id}` : `/niches/${niche.id}`}>
                                <div className="group relative h-full bg-[#1a1438]/40 border border-slate-700/50 rounded-3xl p-8 transition-all hover:border-cyan-500/50 hover:bg-[#1a1438]/60 overflow-hidden">
                                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${niche.color} opacity-5 blur-[100px] group-hover:opacity-10 transition-opacity`} />

                                    <div className="relative z-10 space-y-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                                            <niche.icon className="w-8 h-8 text-white" />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold mb-3 font-sans">{niche.name}</h3>
                                            <p className="text-slate-400 leading-relaxed text-sm font-sans">
                                                {niche.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold font-sans">
                                                {niche.stat}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-white transition-colors font-sans">
                                                {t.explore} <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* New Section: Architectural Depth */}
                <section className="py-24 border-y border-white/5">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-6 font-sans">{t.blueprintTitle}</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto font-sans">
                                {t.blueprintSubtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {t.features.map((feature, i) => (
                                <div key={i} className="space-y-8">
                                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 h-full">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 font-sans">
                                            <feature.icon className="w-5 h-5 text-cyan-400" />
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm leading-relaxed font-sans">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-white/5 via-transparent to-transparent border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold font-sans">{t.ctaTitle}</h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-sans">
                                {t.ctaDesc}
                            </p>
                            <div className="flex gap-4">
                                <Link href="/contact">
                                    <Button size="xl" className="font-bold" variant="renstoPrimary">
                                        {t.customAudit} <Zap className="ml-2 w-5 h-5 fill-current" />
                                    </Button>
                                </Link>
                                <Link href="/marketplace">
                                    <Button variant="renstoNeon" size="xl" className="font-bold">
                                        {t.browseWorkflows}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block w-1/3">
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                                        <span className="text-slate-300 font-sans">{t.customPoint}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer lang={lang} />
        </div>
    );
}

export default function NichesPage() {
    return <NichesPageContent />;
}
