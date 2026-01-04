'use client';

import Link from 'next/link';
import { useState } from 'react';
import * as framer from 'framer-motion';
const { motion } = framer;
import { env } from '@/lib/env';
import { formatCurrency } from '@/lib/utils';
import { Check, Star, Zap, Shield, Users, Loader2, ArrowRight, TrendingUp, Clock, Bot, Rocket, Search, MessageSquare, Target, Workflow } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { QualificationQuiz } from '@/components/marketing/QualificationQuiz';
import { HelpCircle } from 'lucide-react';

const SearchIcon = Search;

const translations = {
  en: {
    title: <>Choose Your <br /><span className="gradient-text">Automation Path</span></>,
    subtitle: "From deep architectural audits to ongoing systems care. Built for businesses that prioritize efficiency and scale.",
    guaranteeTitle: "The Rensto Success Guarantee",
    guaranteeText: "Measurable ROI or We Keep Building Until You See It.",
    qualifyTag: "Strategic Qualification",
    qualifyTitle: <>See if your business is ready for <span className="text-cyan-400">Scale.</span></>,
    qualifyText: "Before deploying an Engine, we need to analyze your current bottlenecks.",
    expert: "Enterprise Standard",
    fixed: "Fixed",
    careTitle: <>Ongoing <span className="text-cyan-400">Scale Plans</span></>,
    careSubtitle: "Dedicated engineering bandwidth to maintain and evolve your automation engine.",
    roiTitle: "The Rensto ROI Guarantee",
    roiText: <>We don&apos;t do regular &quot;trials&quot;. We work with serious founders. If we don&apos;t meet the specific ROI targets agreed upon in your Blueprint, we keep working—completely on our dime—until the system delivers exactly what we promised.</>,
    ctaTitle: "Not Sure Which Option is Right?",
    ctaText: "Let's discuss your specific needs and find the perfect automation solution for your business.",
    scheduleCall: "Schedule a Call",
    learnProcess: "Learn Our Process",
    products: [
      {
        name: 'Automation Audit',
        price: 497,
        description: 'A deep architectural review of your current systems. We identify $25,000+ in annual efficiency leaks—guaranteed.',
        features: ['Operational Bottleneck Audit', 'System Architecture Review', 'High-Impact Automation Map', 'Direct ROI Projections', 'Fixed-Price Implementation Plan'],
        cta: 'Get My Audit',
        popular: false,
        icon: Search,
        workflowId: null // This is a service, not a workflow
      },
      {
        name: 'The Lead Machine',
        price: 997,
        description: 'Autonomous lead generation using call analysis, ad research, and outreach. Includes our Call Audio Analyzer and Meta Ad Library tools.',
        features: ['Call Recording Analysis (Telnyx)', 'Meta Ad Library Research', 'AI Lead Scoring', 'Workiz/CRM Sync', 'Daily Lead Reports'],
        cta: 'Deploy Lead Machine',
        popular: true,
        icon: Target,
        workflowId: 'call-audio-analysis' // Maps to Call Audio Lead Analyzer
      },
      {
        name: 'Autonomous Secretary',
        price: 497,
        description: 'Your AI assistant that manages calendars, answers messages, and handles scheduling via WhatsApp and Telegram 24/7.',
        features: ['AI Calendar Management (TidyCal)', 'WhatsApp Auto-Response', 'Smart Meeting Booking', 'Multi-Language Support', 'Conflict Detection'],
        cta: 'Hire AI Secretary',
        popular: false,
        icon: MessageSquare,
        workflowId: 'calendar-agent' // Maps to AI Calendar Assistant
      },
      {
        name: 'Knowledge Engine',
        price: 1497,
        description: 'Private AI trained on your data. Includes YouTube persona cloning and monthly CRO insights from your analytics.',
        features: ['YouTube AI Clone', 'Monthly CRO Insights Bot', 'GA4/Clarity Integration', 'Custom Knowledge Base', 'Team Training'],
        cta: 'Deploy Knowledge Engine',
        popular: false,
        icon: Workflow,
        workflowId: 'youtuber-cloner' // Primary workflow
      },
      {
        name: 'The Content Engine',
        price: 1497,
        description: 'AI-powered content generation including celebrity-style video generation and property tour creation from floor plans.',
        features: ['Celebrity Selfie Video Generator', 'Floor Plan to Property Tour', 'Multi-Channel Distribution', 'AI Video/Image Generation', 'Weekly Growth Reports'],
        cta: 'See The Results',
        popular: false,
        icon: Users,
        workflowId: 'celebrity-selfie-generator' // Primary workflow
      },
      {
        name: 'Full Ecosystem',
        price: 5497,
        description: 'All four pillars plus premium support, video demos, and custom integrations for end‑to‑end automation.',
        features: ['Automation Audit', 'Lead Machine', 'Autonomous Secretary', 'Knowledge Engine', 'Content Engine', 'Dedicated Implementation Engineer', '24/7 Premium Support'],
        cta: 'Get Full Ecosystem',
        popular: true,
        video: '/videos/full-ecosystem-demo.mp4',
        workflowId: null
      }
    ],
    carePlans: [

      {
        name: 'Starter Care',
        price: 497,
        period: 'month',
        description: 'Perfect for small teams needing monitoring',
        features: ['5 hours of expert help', '24/7 system watch', 'We fix it before it breaks', 'Monthly status updates', 'Direct email access'],
        cta: 'Start Care Plan',
        popular: false
      },
      {
        name: 'Growth Care',
        price: 997,
        period: 'month',
        description: 'Our most popular plan for active scaling',
        features: ['15 hours of expert help', 'Continuous optimizations', 'Quarterly strategy reviews', 'Priority fast-lane support', 'Constant system upgrades'],
        cta: 'Get Growth Care',
        popular: true
      },
      {
        name: 'Scale Care',
        price: 2497,
        period: 'month',
        description: 'A dedicated automation engineer for your team',
        features: ['40 hours of expert help', 'Your own dedicated engineer', 'Full strategic planning', 'Complete deep-dive stats', 'Unlimited custom features'],
        cta: 'Get Scale Care',
        popular: false
      }
    ]
  },
  he: {
    title: <>בחרו את <br /><span className="gradient-text">מסלול האוטומציה</span> שלכם</>,
    subtitle: "מאודיט ארכיטקטוני מעמיק ועד לליווי שוטף. נבנה עבור עסקים שמתעדפים יעילות וצמיחה.",
    guaranteeTitle: "התחייבות להצלחה של רנסטו",
    guaranteeText: "החזר השקעה מדיד או שנמשיך לבנות עד שתראו אותו.",
    qualifyTag: "בדיקת התאמה אסטרטגית",
    qualifyTitle: <>בדקו האם העסק שלכם מוכן <span className="text-cyan-400">לסקייל.</span></>,
    qualifyText: "לפני הטמעת מנוע, אנחנו צריכים לנתח את צווארי הבקבוק הנוכחיים שלכם.",
    expert: "סטנדרט אנטרפרייז",
    fixed: "מחיר קבוע",
    careTitle: <>תוכניות <span className="text-cyan-400">ליווי וצמיחה</span></>,
    careSubtitle: "שעות פיתוח וניהול ייעודיות לתחזוקה ופיתוח המנוע העסקי שלכם.",
    roiTitle: "התחייבות ה-ROI של רנסטו",
    roiText: <>אנחנו לא עושים &quot;ניסיונות&quot;. אנחנו עובדים עם יזמים רציניים. אם לא נעמוד ביעדי ה-ROI שהוגדרו בתוכנית העבודה, נמשיך לעבוד - לחלוטין על חשבוננו - עד שהמערכת תספק בדיוק את מה שהבטחנו.</>,
    ctaTitle: "לא בטוחים מה מתאים לכם?",
    ctaText: "בואו נדבר על הצרכים הספציפיים שלכם ונמצא את פתרון האוטומציה המושלם עבור העסק.",
    scheduleCall: "תיאום שיחה",
    learnProcess: "למדו על התהליך",
    products: [
      {
        name: 'Automation Audit',
        price: 497,
        description: 'בדיקת עומק למערכות הקיימות. אנחנו מזהים דליפות יעילות בשווי $25,000+ בשנה - בהתחייבות.',
        features: ['סקירת צווארי בקבוק תפעוליים', 'סקירת ארכיטקטורת מערכת', 'מפת אוטומציה בעלת אימפקט גבוה', 'תחזיות ROI ישירות', 'תוכנית הטמעה במחיר קבוע'],
        cta: 'הזמן אודיט',
        popular: false,
        icon: Search,
        workflowId: null
      },
      {
        name: 'The Lead Machine',
        price: 997,
        description: 'יצירת לידים אוטונומית באמצעות ניתוח שיחות, מחקר פרסומות ופניות. כולל מנתח שיחות וכלי Meta Ad Library.',
        features: ['ניתוח הקלטות שיחות (Telnyx)', 'מחקר Meta Ad Library', 'דירוג לידים AI', 'סנכרון Workiz/CRM', 'דוחות לידים יומיים'],
        cta: 'הטמע את מנוע הלידים',
        popular: true,
        icon: Target,
        workflowId: 'call-audio-analysis'
      },
      {
        name: 'Autonomous Secretary',
        price: 497,
        description: 'העוזרת ה-AI שלכם שמנהלת יומנים, עונה להודעות ומתזמנת פגישות בוואטסאפ וטלגרם 24/7.',
        features: ['ניהול יומן AI (TidyCal)', 'מענה אוטומטי בוואטסאפ', 'קביעת פגישות חכמה', 'תמיכה רב-לשונית', 'זיהוי התנגשויות'],
        cta: 'גייס מזכירה אוטונומית',
        popular: false,
        icon: MessageSquare,
        workflowId: 'calendar-agent'
      },
      {
        name: 'Knowledge Engine',
        price: 1497,
        description: 'AI פרטי מאומן על הנתונים שלכם. כולל שכפול פרסונה מיוטיוב ותובנות CRO חודשיות.',
        features: ['שכפול AI מיוטיוב', 'בוט תובנות CRO חודשי', 'אינטגרציית GA4/Clarity', 'בסיס ידע מותאם', 'הדרכת צוות'],
        cta: 'הטמע את מנוע הידע',
        popular: false,
        icon: Workflow,
        workflowId: 'youtuber-cloner'
      },
      {
        name: 'The Content Engine',
        price: 1497,
        description: 'יצירת תוכן מונעת AI כולל סרטוני וידאו בסגנון כוכבים וסיורי נכסים מתוכניות קומה.',
        features: ['מחולל סרטוני סלפי עם כוכבים', 'תוכנית קומה לסיור נכס', 'הפצה רב-ערוצית', 'יצירת וידאו/תמונות AI', 'דוחות צמיחה שבועיים'],
        cta: 'צפה בתוצאות',
        popular: false,
        icon: Users,
        workflowId: 'celebrity-selfie-generator'
      },
      {
        name: 'Full Ecosystem',
        price: 5497,
        description: 'כל ארבעת העמודים בתוספת תמיכה פרימיום, הדגמות וידאו ואינטגרציות מותאמות אישית לאוטומציה מקצה לקצה.',
        features: ['אודיט אוטומציה', 'מכונת לידים', 'מזכירה אוטונומית', 'מנוע ידע', 'מנוע תוכן', 'מהנדס הטמעה ייעודי', 'תמיכת פרימיום 24/7'],
        cta: 'קבל מערכת אקולוגית מלאה',
        popular: true,
        video: '/videos/full-ecosystem-demo.mp4',
        workflowId: null
      }
    ],
    carePlans: [

      {
        name: 'Starter Care',
        price: 497,
        period: 'חודש',
        description: 'מושלם לצוותים קטנים הזקוקים לניטור',
        features: ['5 שעות מומחה', 'ניטור מערכת 24/7', 'תיקון תקלות לפני שהן קורות', 'עדכוני סטטוס חודשיים', 'גישה ישירה במייל'],
        cta: 'התחל תוכנית שירות',
        popular: false
      },
      {
        name: 'Growth Care',
        price: 997,
        period: 'חודש',
        description: 'התוכנית הפופולרית ביותר לצמיחה אקטיבית',
        features: ['15 שעות מומחה', 'אופטימיזציות שוטפות', 'סקירות אסטרטגיה רבעוניות', 'תמיכה במסלול מהיר', 'שדרוגי מערכת קבועים'],
        cta: 'בחר בתוכנית צמיחה',
        popular: true
      },
      {
        name: 'Scale Care',
        price: 2497,
        period: 'חודש',
        description: 'מהנדס אוטומציה ייעודי לצוות שלכם',
        features: ['40 שעות מומחה', 'מהנדס ייעודי משלכם', 'תכנון אסטרטגי מלא', 'סטטיסטיקות עומק', 'פיצ׳רים מותאמים ללא הגבלה'],
        cta: 'בחר בתוכנית סקייל',
        popular: false
      }
    ]
  }
};

export function OffersPageContent({ lang = 'en' }: { lang?: 'en' | 'he' }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);

  const t = translations[lang];
  const isRtl = lang === 'he';

  const handleCheckout = async (productId: string, flowType: string) => {
    // If we don't have an email yet, show the modal first
    if (!email && !showEmailModal) {
      setShowEmailModal(productId);
      return;
    }

    setLoading(productId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowType,
          productId,
          customerEmail: email,
          tier: 'standard'
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data.error);
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(null);
    }
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is included in the Rensto Automation Audit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Rensto Automation Audit includes a comprehensive process analysis, identification of specific automation opportunities, a detailed implementation roadmap, and direct ROI projections for your business."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer a satisfaction guarantee for your services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, for our Automation Audit, we guarantee you'll identify $25,000+ in annual savings within 2 hours, or we will provide a 100% refund. Our sprint planning also includes an ROI guarantee."
        }
      },
      {
        "@type": "Question",
        "name": "What are the ongoing Care Plans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our Care Plans (Starter, Growth, and Scale) provide monthly support hours, system monitoring, performance optimization, and dedicated engineering time to keep your automations running perfectly."
        }
      },
      {
        "@type": "Question",
        "name": "How do I know which automation plan is right for my business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend starting with our Automation Audit to identify high-impact opportunities, or scheduling a call with our team to discuss your specific business needs and scaling goals."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)', direction: isRtl ? 'rtl' : 'ltr' }}>
      <Header />
      <main className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden min-h-[60vh] flex items-center">
          <AnimatedGridBackground />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white text-balance leading-tight">
                {t.title}
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8 font-sans">
                {t.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Success Guarantee Banner */}
        <section className="py-12 bg-[#0d0922] border-y border-white/5">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-sans">{t.guaranteeTitle}</h3>
                <p className="text-slate-500 text-sm font-sans">{t.guaranteeText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Qualification Engine - Unified Funnel */}
        <section id="qualify" className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0a061e]/30">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 text-sm font-bold font-sans">
                <HelpCircle className="w-4 h-4" />
                {t.qualifyTag}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-sans">
                {t.qualifyTitle}
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-sans">
                {t.qualifyText}
              </p>
            </div>
            <QualificationQuiz lang={lang} />
          </div>
        </section>

        {/* One-Time Services */}
        <section id="one-time" className="py-24 px-4 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.products.map((product, index) => {
                const Icon = product.icon; // Assuming product.icon is a LucideReact component
                return (
                  <motion.div
                    key={index}
                    id={product.name === 'Automation Audit' ? 'audit' : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${product.popular
                      ? 'border-cyan-500 bg-cyan-500/[0.03] shadow-[0_0_40px_rgba(6,182,212,0.1)]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                      }`}
                  >
                    {product.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap"
                        style={{ background: 'var(--rensto-gradient-primary)', color: 'white' }}>
                        {t.expert}
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        {product.video ? (
                          <video src={product.video} className="w-12 h-12 object-cover rounded-md" muted loop playsInline />
                        ) : (
                          Icon && (
                            <Icon className="w-6 h-6 text-cyan-400" />
                          )
                        )}
                        <h3 className="text-2xl font-bold text-white font-sans">{product.name}</h3>
                      </div>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-white font-sans">{formatCurrency(product.price)}</span>
                        <span className="text-slate-500 text-xs uppercase tracking-widest font-sans">{t.fixed}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed mb-6 font-sans">{product.description}</p>
                    </div>

                    <ul className="space-y-3 mb-6 flex-grow">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
                          <span className="text-xs text-slate-300 leading-tight font-sans">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {product.workflowId && (
                      <Link
                        href={isRtl ? `/he/marketplace/${product.workflowId}` : `/marketplace/${product.workflowId}`}
                        className="block text-center text-xs text-cyan-400 hover:text-cyan-300 mb-4 underline underline-offset-2 transition-colors"
                      >
                        {isRtl ? 'צפה ב-Workflows הכלולים →' : 'View Included Workflows →'}
                      </Link>
                    )}

                    <Button
                      size="xl"
                      onClick={() => {
                        if (product.name === 'Automation Audit') {
                          handleCheckout('automation-audit', 'service-purchase');
                        } else if (product.name === 'Full Ecosystem') {
                          handleCheckout('full-ecosystem', 'service-purchase');
                        }
                        else {
                          // All Engines scroll to qualification first
                          document.getElementById('qualify')?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      variant={product.popular ? 'renstoPrimary' : 'renstoSecondary'}
                      disabled={loading === product.name.toLowerCase().replace(/\s+/g, '-')}
                      className="w-full font-bold h-14"
                    >
                      {loading === product.name.toLowerCase().replace(/\s+/g, '-') ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {product.cta}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Care Plans */}
        <section id="care-plans" className="py-24 px-4 relative bg-[#0d0922]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white font-sans">
                {t.careTitle}
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-sans">
                {t.careSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {t.carePlans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-10 rounded-[2.5rem] border transition-all duration-300 flex flex-col h-full ${plan.popular
                    ? 'border-cyan-500 bg-cyan-500/[0.05] shadow-[0_0_50px_rgba(6,182,212,0.15)] scale-105 z-10'
                    : 'border-white/5 bg-white/[0.03]'
                    }`}
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-1 font-sans">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-widest font-sans">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white font-sans">{formatCurrency(plan.price)}</span>
                      <span className="text-slate-500 text-sm font-sans">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-cyan-400" />
                        </div>
                        <span className="text-sm text-slate-300 font-medium font-sans">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {getStripeLink(plan.name) ? (
                    <Link href={getStripeLink(plan.name)!} className="w-full">
                      <Button
                        size="xl"
                        variant={plan.popular ? 'renstoPrimary' : 'renstoSecondary'}
                        className="w-full font-bold h-16 rounded-2xl"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/contact" className="w-full">
                      <Button
                        size="xl"
                        variant="renstoNeon"
                        className="w-full font-bold h-16 rounded-2xl"
                      >
                        Schedule Discovery
                      </Button>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Seal */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="p-12 rounded-[3rem] border border-cyan-500/30 bg-cyan-500/[0.02] relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
              <Shield className="w-16 h-16 text-cyan-500 mx-auto mb-8" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-sans">{t.roiTitle}</h2>
              <p className="text-slate-400 text-lg leading-relaxed font-sans">
                {t.roiText}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-gradient-to-r from-accent1/20 to-accent2/20">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-sans">
              {t.ctaTitle}
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto font-sans">
              {t.ctaText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" variant="renstoPrimary">
                <Link href="/contact">
                  {t.scheduleCall}
                </Link>
              </Button>
              <Button asChild size="xl" variant="renstoSecondary">
                <Link href={isRtl ? '/he/#process' : '/#process'}>
                  {t.learnProcess}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />

      {/* Email Capture Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#110d28] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">Secure Your Spot</h3>
            <p className="text-gray-400 mb-6">
              Enter your email to proceed to secure payment. We&apos;ll use this to deliver your {showEmailModal === 'automation-audit' ? 'Audit Report' : 'Sprint Blueprint'}.
            </p>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white focus:border-red-500/50 outline-none transition-all"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowEmailModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCheckout(showEmailModal, 'service-purchase')}
                disabled={!email || !!loading}
                className="flex-1 font-bold"
                style={{ background: 'var(--rensto-gradient-primary)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OffersPage() {
  return <OffersPageContent />;
}

function getStripeLink(productName: string): string | undefined {
  const links = {
    'Automation Audit': env.NEXT_PUBLIC_STRIPE_LINK_AUDIT,
    'The Lead Machine': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
    'The Content Engine': env.NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER,
    'Autonomous Secretary': env.NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE,
    'Knowledge Engine': env.NEXT_PUBLIC_STRIPE_LINK_SPRINT,
    'Full Ecosystem': env.NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM,
    'Starter Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER,
    'Growth Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH,
    'Scale Care': env.NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE,
  };

  return links[productName as keyof typeof links];
}
