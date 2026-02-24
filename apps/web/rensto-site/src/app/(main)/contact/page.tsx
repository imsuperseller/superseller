'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { env } from '@/lib/env';
import { ContactForm } from '@/components/ContactForm';
import { Mail, Clock, Phone, ArrowRight, HelpCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Button } from '@/components/ui/button-enhanced';
import { NoiseTexture, GlowContainer } from '@/components/ui/premium';

const translations = {
  en: {
    heroTitle: <>Talk To <br /><span className="text-cyan-400">The Crew</span></>,
    heroText: "Ready to hire your AI team? Tell us about your business and we'll show you which agents fit your workflow — starting at $79/mo.",
    briefTitle: "Get Started",
    briefText: "Tell us about your business and we'll match you with the right crew.",
    voiceTitle: "Instant Voice Support",
    voiceSubtitle: "Available 24/7",
    voiceText: "Want to experience our tech right now? Call our Voice AI Agent. It can answer questions, explain our process, and even book your strategic audit.",
    voiceCta: "Call +1 (469) 929-9314",
    connectElsewhere: "Connect Elsewhere",
    faqTitle: <>Pre-Consultation <span className="text-cyan-400">FAQ</span></>,
    faqSubtitle: "Everything you need to know before we hop on a call.",
    ctaTitle: <>Your AI Crew <span className="text-cyan-400">Awaits</span></>,
    ctaSystem: "See Pricing & Plans",
    ctaProcess: "Meet The Crew",
    contactInfo: [
      {
        icon: Mail,
        title: 'Email',
        value: env.NEXT_PUBLIC_CONTACT_EMAIL,
        link: `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`,
        description: 'For general inquiries and support'
      },
      {
        icon: Clock,
        title: 'Response Time',
        value: '24 hours',
        link: null,
        description: 'We typically respond within 24 hours'
      },
      {
        icon: Phone,
        title: 'Schedule Call',
        value: 'Book Online',
        link: env.NEXT_PUBLIC_TYPEFORM_CONTACT_URL || '/contact',
        description: 'Schedule a consultation call'
      }
    ],
    faqs: [
      {
        question: 'How quickly can you start a project?',
        answer: 'We can typically start within 1-2 weeks of project approval. Our WIP limits ensure we have capacity for new projects.'
      },
      {
        question: 'Do you work with international clients?',
        answer: 'Yes, we work with clients worldwide. All communication and project management is done remotely with regular video calls.'
      },
      {
        question: 'What if I need changes after deployment?',
        answer: 'We include 30 days of post-deployment support. For ongoing needs, our Starter plan at $79/month gives you 500 credits across all six AI agents.'
      },
      {
        question: 'Can you integrate with my existing systems?',
        answer: 'Absolutely! Our system supports 400+ integrations. We can connect to your CRM, email, databases, custom software, and more.'
      },
      {
        question: 'Do you provide training for my team?',
        answer: 'Yes, we include comprehensive training in our process. We train both end users and administrators on your automations.'
      },
      {
        question: 'What if I\'m not satisfied with the results?',
        answer: 'We offer a Success Guarantee. If our automation doesn\'t deliver the measurable impact we promised, we\'ll keep building until it does or provide a full refund of your setup fee.'
      }
    ]
  }
};

export function ContactPageContent({ mounted }: { mounted: boolean }) {
  const t = translations.en;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#0f0c29]"
      style={{ background: 'radial-gradient(circle at top center, #1a1438 0%, #0f0c29 100%)' }}
    >
      {mounted && <NoiseTexture opacity={0.3} />}

      {/* Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[160px] rounded-full animate-pulse" />
      </div>

      {mounted && <AnimatedGridBackground />}
      {mounted && <Header />}
      <main className="flex-grow container mx-auto px-6 relative z-10 pt-12 pb-32">
        {/* Hero Section */}
        <section className="py-24 text-center max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic mb-8">
              {t.heroTitle}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              {t.heroText}
            </p>
          </motion.div>
        </section>

        {/* Contact Form & Info */}
        <section className="mb-48">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left Column: Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <GlowContainer>
                <div className="bg-white/[0.03] border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                  <div className="mb-12 space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{t.briefTitle}</h2>
                    <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest">{t.briefText}</p>
                  </div>
                  <ContactForm lang="en" />
                </div>
              </GlowContainer>
            </motion.div>

            {/* Right Column: Info & Actions */}
            <div className="lg:col-span-5 space-y-12">

              {/* Voice AI Action */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-[3rem] border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-2xl group hover:bg-cyan-500/10 transition-all duration-500"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 transition-all">
                    <Phone className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{t.voiceTitle}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.voiceSubtitle}</p>
                  </div>
                </div>
                <p className="text-slate-400 font-semibold leading-relaxed mb-10 group-hover:text-slate-300 transition-colors">
                  {t.voiceText}
                </p>
                <a href="tel:14699299314" className="block">
                  <Button className="w-full h-20 text-xl font-black rounded-2xl bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-3">
                    {t.voiceCta}
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </a>
              </motion.div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 gap-6">
                {t.contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex items-center gap-8 group hover:bg-white/[0.05] transition-all duration-500"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all shrink-0">
                      <info.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{info.title}</h4>
                      {info.link ? (
                        <Link href={info.link} className="text-xl font-black text-white hover:text-cyan-400 transition-colors block truncate italic uppercase">
                          {info.value}
                        </Link>
                      ) : (
                        <p className="text-xl font-black text-white italic uppercase">{info.value}</p>
                      )}
                      <p className="text-xs text-slate-500 font-bold">{info.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">{t.connectElsewhere}</h4>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Instagram', href: 'https://www.instagram.com/myrensto', icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    )},
                    { name: 'Facebook', href: 'https://www.facebook.com/myrensto', icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    )},
                    { name: 'TikTok', href: 'https://www.tiktok.com/@myrensto', icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                    )},
                    { name: 'X', href: 'https://twitter.com/rensto', icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    )},
                    { name: 'YouTube', href: env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@rensto', icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    )},
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all uppercase tracking-widest"
                    >
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">{social.icon}</span>
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-48">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">{t.faqTitle}</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">{t.faqSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-12 rounded-[3.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 group"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0 group-hover:bg-cyan-500/20 transition-all">
                    <HelpCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{faq.question}</h3>
                    <p className="text-slate-400 font-semibold leading-relaxed group-hover:text-slate-300 transition-colors">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-32 p-20 rounded-[4rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-tight">
            {t.ctaTitle}
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="xl" className="w-full h-20 px-12 text-xl font-black rounded-2xl bg-[#fe3d51] text-white hover:bg-[#ff4d61] shadow-2xl transition-all">
                {t.ctaSystem}
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link href="/crew" className="w-full sm:w-auto">
              <Button size="xl" variant="ghost" className="w-full h-20 px-12 text-xl font-black rounded-2xl border border-white/10 text-white hover:bg-white/5 shadow-2xl transition-all">
                {t.ctaProcess}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return <ContactPageContent mounted={mounted} />;
}
