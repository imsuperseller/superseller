'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button-enhanced';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import {
    Check,
    Zap,
    ArrowLeft,
    MessageCircle,
    TrendingUp,
    Code,
    Users,
    Shield,
    Target,
    Mic,
    MessageSquare,
    User,
    ArrowRight
} from 'lucide-react';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { Badge } from '@/components/ui/badge';

export default function HebrewLandingPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)', direction: 'rtl' }}>
            <Header />
            <main className="flex-grow">
                {/* Hero section in Hebrew */}
                <section className="py-24 px-4 relative overflow-hidden border-b border-white/5">
                    <div className="container mx-auto text-center relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <BadgeHebrew />
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                                תפסיקו לעבוד {' '}
                                <span className="text-cyan-400">בשביל העסק שלכם.</span>
                                <span className="block text-3xl md:text-5xl text-slate-400 mt-2">
                                    תגרמו לו לעבוד בשבילכם.
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto">
                                אנחנו בונים מערכות אוטומציה מבוססות AI שמטפלות במכירות, בתמיכה ובתפעול שלכם 24/7.
                            </p>

                            <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
                                <Button
                                    size="xl"
                                    variant="renstoSecondary"
                                    onClick={() => document.getElementById('qualify-he')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="font-bold w-full sm:w-auto text-xl"
                                >
                                    בדקו התאמה לאוטומציה
                                </Button>
                                <Link href="/whatsapp">
                                    <Button
                                        size="xl"
                                        variant="renstoNeon"
                                        className="w-full sm:w-auto text-xl"
                                    >
                                        לצפייה בדמו וואטסאפ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hebrew Comparison Table */}
                <section className="py-24 px-4 border-t border-white/5 bg-[#0a061e]/20">
                    <div className="container mx-auto">
                        <ComparisonTable />
                    </div>
                </section>

                {/* The 4 Pillars in Hebrew */}
                <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0a061e]/30">
                    <div className="container mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                                4 מנועי <span className="text-cyan-400">הצמיחה</span> שלכם
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                                מערכות אוטנומיות מקצה לקצה שבונות לכם אימפריה בזמן שאתם מתמקדים באסטרטגיה.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <HebrewPillarCard
                                name="מנוע הלידים"
                                tagline="The Lead Machine"
                                description="מערכת אאוטבואונד שעובדת 24/7, מוצאת לידים, מעשירה נתונים ושולחת פניות מותאמות אישית."
                                vsHuman="מחליף צוות של 3 אנשי מכירות במחיר של ארוחת ערב."
                                icon={Target}
                                href="/offers"
                            />
                            <HebrewPillarCard
                                name="המזכירה האוטונומית"
                                tagline="Autonomous Secretary"
                                description="בינה מלאכותית שעונה לוואטסאפ, קובעת פגישות ומנהלת לקוחות בצורה מושלמת."
                                vsHuman="זמינה 24/7. לעולם לא מפספסת פנייה. לעולם לא חולה."
                                icon={MessageSquare}
                                href="/whatsapp"
                            />
                            <HebrewPillarCard
                                name="מנוע הידע"
                                tagline="Knowledge Engine"
                                description="חיבור ה-AI לנתוני החברה שלכם. מערכת אינטליגנציה פרטית שמכירה כל פרויקט ונהל עבודה."
                                vsHuman="העובד עם הזיכרון המושלם שלא צריך ללמד אותו פעמיים."
                                icon={Mic}
                                href="/contact"
                            />
                            <HebrewPillarCard
                                name="מנוע התוכן"
                                tagline="The Content Engine"
                                description="מערכות אוטונומיות שמייצרות, עורכות ומפיצות תוכן סמכותי בכל הערוצים החברתיים."
                                vsHuman="סוכנות תוכן שלמה בתוך קופסה - בשבריר מהעלות."
                                icon={Users}
                                href="/offers"
                            />
                        </div>
                    </div>
                </section>

                {/* Hebrew Qualification Section */}
                <section id="qualify-he" className="py-24 px-4 bg-[#0a061e]/30">
                    <div className="container mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                האם העסק שלך מוכן <span className="text-cyan-400">לאוטומציה?</span>
                            </h2>
                            <p className="text-xl text-slate-400">
                                ענו על 3 שאלות וקבלו ניתוח פוטנציאל חיסכון בזמן וכסף.
                            </p>
                        </div>
                        {/* Note: The Quiz component is currently in English, but we'll use it as the core engine */}
                        <div>
                            <QualificationQuiz lang="he" />
                        </div>
                    </div>
                </section>

                {/* Local Social Proof */}
                <section className="py-20 px-4 border-t border-white/5">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold text-center text-white mb-16">מי שכבר עברו לאוטומציה מלאה:</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                            <LocalTestimonial
                                name="בן גינתי"
                                role="מנכ״ל, Tax4US"
                                text="הצוות האוטונומי של רנסטו מטפל בעדכוני הוורדפרס שלנו כאילו יש לנו צוות פיתוח מלא בכוננות 24/7."
                                logo="TAX4US"
                            />
                            <LocalTestimonial
                                name="אביעד חזות"
                                role="מנכ״ל, ארדן ניהול והנדסה"
                                text="האוטומציות בניהול הפרויקטים חסכו לנו 40% מהעבודה האדמיניסטרטיבית. ההשקעה הטובה ביותר שעשינו."
                                logo="ARDAN"
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

function BadgeHebrew() {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold mb-8">
            <Zap className="w-4 h-4" />
            אוטומציה עסקית מתקדמת
        </div>
    );
}

function LocalTestimonial({ name, role, text, logo }: any) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-right">
            <div className="text-cyan-400 font-black text-xs tracking-tighter mb-4 opacity-50">{logo}</div>
            <p className="text-slate-300 mb-6 leading-relaxed italic">״{text}״</p>
            <div className="font-bold text-white">{name}</div>
            <div className="text-sm text-slate-500">{role}</div>
        </div>
    );
}

function HebrewPillarCard({ name, tagline, description, vsHuman, icon: Icon, href }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col h-full group hover:border-cyan-500/50 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="mb-4">
                <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-1">{tagline}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 h-[4.5rem]">
                    {description}
                </p>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex items-center gap-3">
                    <User className="w-4 h-4 text-red-400 shrink-0 opacity-50" />
                    <span className="text-[11px] text-red-200/80 italic leading-tight">
                        {vsHuman}
                    </span>
                </div>
            </div>
            <div className="mt-auto pt-6">
                <Link href={href}>
                    <Button variant="ghost" className="w-full text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/10 gap-2">
                        למידע נוסף
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
