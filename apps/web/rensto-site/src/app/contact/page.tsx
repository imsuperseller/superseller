'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { env } from '@/lib/env';
import { ContactForm } from '@/components/ContactForm';
import { Mail, MapPin, Clock, Phone, ArrowRight, Shield, HelpCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Button } from '@/components/ui/button-enhanced';
import { NoiseTexture, GlowContainer } from '@/components/ui/premium';

const translations = {
  en: {
    heroTitle: <>Let&apos;s Deploy <br /><span className="text-cyan-400">Your Ecosystem</span></>,
    heroText: "Ready to reclaim your time? Whether you need a simple Engine or a complex business infrastructure, our automation partners are ready to design your path.",
    briefTitle: "Your Business Outcome",
    briefText: "Submit your requirements and we'll get back to you with a roadmap.",
    voiceTitle: "Instant Voice Support",
    voiceSubtitle: "Available 24/7",
    voiceText: "Want to experience our tech right now? Call our Voice AI Agent. He can answer questions, explain our process, and even book your strategic audit.",
    voiceCta: "Call +1 (469) 929-9314",
    connectElsewhere: "Connect Elsewhere",
    faqTitle: <>Pre-Consultation <span className="text-cyan-400">FAQ</span></>,
    faqSubtitle: "Everything you need to know before we hop on a call.",
    ctaTitle: <>The Path to <span className="text-cyan-400">Freedom</span> Starts Here</>,
    ctaSystem: "View Infrastructure & ROI",
    ctaProcess: "Learn Our Methodology",
    contactInfo: [
      {
        icon: Mail,
        title: 'Email',
        value: env.NEXT_PUBLIC_CONTACT_EMAIL,
        link: `mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`,
        description: 'For general inquiries and support'
      },
      {
        icon: MapPin,
        title: 'Location',
        value: 'Plano, TX',
        link: 'https://maps.google.com/?q=Plano,TX',
        description: 'Serving clients nationwide'
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
        answer: 'We include 30 days of post-deployment support. For ongoing changes, we offer Care Plans starting at $497/month.'
      },
      {
        question: 'Can you integrate with my existing systems?',
        answer: 'Absolutely! n8n supports 400+ integrations. We can connect to your CRM, email, databases, APIs, and more.'
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
                  {['LinkedIn', 'X', 'YouTube'].map((social) => (
                    <button key={social} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase italic tracking-widest">
                      {social}
                    </button>
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
            <Link href="/offers" className="w-full sm:w-auto">
              <Button size="xl" className="w-full h-20 px-12 text-xl font-black rounded-2xl bg-[#fe3d51] text-white hover:bg-[#ff4d61] shadow-2xl transition-all">
                {t.ctaSystem}
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link href="/#process" className="w-full sm:w-auto">
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
