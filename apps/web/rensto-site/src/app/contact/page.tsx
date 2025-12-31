'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { env } from '@/lib/env';
import { ContactForm } from '@/components/ContactForm';
import { Mail, MapPin, Clock, Phone, ArrowRight, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { Button } from '@/components/ui/button-enhanced';

const contactInfo = [
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
];

const faqs = [
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
    answer: 'We offer a money-back guarantee. If you\'re not satisfied with our work, we\'ll refund your investment.'
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rensto-bg-primary)' }}>
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden min-h-[50vh] flex items-center">
          <AnimatedGridBackground />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                Let&apos;s Architect <br />
                <span className="gradient-text">Your Automation</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                Ready to reclaim your time? Whether you need a simple bot or a complex business OS,
                our lead architects are ready to design your path.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

              {/* Left Column: Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-7 bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-white mb-4">Brief Your Architect</h2>
                  <p className="text-slate-500">Submit your project details and we&apos;ll get back to you with a roadmap.</p>
                </div>
                <ContactForm />
              </motion.div>

              {/* Right Column: Info & Actions */}
              <div className="lg:col-span-5 space-y-8">

                {/* Voice AI Action */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/[0.03] group hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                      <Phone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Instant Voice Support</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Available 24/7</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Want to experience our tech right now? Call our Voice AI Agent.
                    He can answer questions, explain our process, and even book your audit session.
                  </p>
                  <a href="tel:14699299314" className="block">
                    <Button variant="renstoPrimary" className="w-full h-14 font-bold rounded-xl text-lg">
                      Call +1 (469) 929-9314
                    </Button>
                  </a>
                </motion.div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-6"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        <info.icon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{info.title}</h4>
                        {info.link ? (
                          <Link href={info.link} className="text-white font-medium hover:text-cyan-400 transition-colors block truncate">
                            {info.value}
                          </Link>
                        ) : (
                          <p className="text-white font-medium">{info.value}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                  <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Connect Elsewhere</h4>
                  <div className="flex flex-wrap gap-3">
                    {['LinkedIn', 'X', 'YouTube'].map((social) => (
                      <button key={social} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        {social}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 relative bg-[#070416]">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Pre-Consultation <span className="text-cyan-400">FAQ</span></h2>
              <p className="text-slate-500">Everything you need to know before we hop on a call.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 relative bg-gradient-to-b from-transparent to-cyan-500/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white uppercase tracking-tighter">
              The Path to <span className="gradient-text">Freedom</span> Starts Here
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/offers">
                <Button size="xl" variant="renstoPrimary">View Systems & Pricing</Button>
              </Link>
              <Link href="/process">
                <Button size="xl" variant="renstoSecondary">Learn Our Methodology</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
