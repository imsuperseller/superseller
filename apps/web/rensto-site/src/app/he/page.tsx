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
    Shield
} from 'lucide-react';

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
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold text-center text-white mb-16">מי שכבר עברו לאוטומציה מלאה:</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <LocalTestimonial
                                name="מאור להם הכהן"
                                role="עו״ד, MLH Law"
                                text="ההסכמים שלנו נוצרים עכשיו באופן מיידי דרך וואטסאפ. זה שינה את כל זרימת העבודה שלי."
                                logo="MAOR LAHAM"
                            />
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
