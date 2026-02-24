'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Schema } from '@/components/seo/Schema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CrewHero } from '@/components/crew/CrewHero';
import { CrewGrid } from '@/components/crew/CrewGrid';
import { ROIComparison } from '@/components/marketing/ROIComparison';
import { PricingSection } from '@/components/pricing/PricingSection';
import { CreditSlider } from '@/components/pricing/CreditSlider';
import { NICHES } from '@/data/niches';
import { NicheIcon } from '@/components/niche/NicheIcon';
import { CREW_MEMBERS } from '@/data/crew';
import * as framer from 'framer-motion';
const { motion, AnimatePresence } = framer;

// FAQ — adapted for The Crew positioning
const faqs = [
  {
    q: 'What are credits and how do they work?',
    a: 'Credits are your universal currency across all crew members. Each task costs a set number of credits — for example, a listing video costs ~50 credits, a marketplace listing costs ~25 credits, a phone call costs ~5 credits. Buy a plan, use credits on any combination of services you need.',
  },
  {
    q: 'Do I need to use all crew members?',
    a: 'No. Use whichever agents solve your biggest problems. A realtor might only use Forge and FrontDesk. A contractor might focus on Market and Scout. Your credits work across all of them.',
  },
  {
    q: 'How is this different from hiring freelancers?',
    a: 'Freelancers cost more, take days, and require back-and-forth. Your AI crew works in minutes, 24/7, with zero project management overhead. A single listing video that costs $300–$800 from a studio costs ~50 credits here.',
  },
  {
    q: 'Can I try before I commit?',
    a: 'Contact us for a demo with your actual business data. We\'ll show you exactly what each crew member produces for your specific industry.',
  },
  {
    q: 'What happens to unused credits?',
    a: 'Credits never expire as long as you maintain an active subscription. They roll over month to month.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Each business gets isolated data. We use enterprise-grade PostgreSQL with row-level security, encrypted storage on Cloudflare R2, and never share your content or business data.',
  },
  {
    q: 'Which crew members are live right now?',
    a: 'Forge (video producer), Spoke (spokesperson), and Market (marketplace automation) are fully live and producing content today. FrontDesk, Scout, Buzz, and Cortex are launching soon — join now to be first in line.',
  },
  {
    q: 'Do I own the content that\'s created?',
    a: 'Yes. Every video, post, and asset created by your AI crew is 100% yours. Download in any format, use anywhere, no watermarks.',
  },
];

export default function HomePageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqData = {
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const breadcrumbData = {
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rensto.com',
      },
    ],
  };

  return (
    <>
      <Schema type="FAQPage" data={faqData} />
      <Schema type="BreadcrumbList" data={breadcrumbData} />

      <Header />

      <main className="min-h-screen" style={{ background: 'var(--rensto-bg-primary)' }}>
        {/* 1. Hero */}
        <CrewHero />

        {/* 2. The Crew — 6 product cards */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              className="text-center mb-16 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-white/5 text-white/60 border-white/10 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                The Crew
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                Meet Your AI Team
              </h2>
              <p className="text-lg text-[var(--rensto-text-secondary)] max-w-xl mx-auto">
                Six specialized agents. Each one replaces an expensive hire or agency.
              </p>
            </motion.div>
            <CrewGrid />
          </div>
        </section>

        {/* 3. ROI Comparison */}
        <ROIComparison />

        {/* 4. Pick Your Industry */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              className="text-center mb-12 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-[var(--rensto-secondary)]/10 text-[var(--rensto-secondary)] border-[var(--rensto-secondary)]/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                Built For Your Business
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                Pick Your Industry
              </h2>
              <p className="text-lg text-[var(--rensto-text-secondary)] max-w-xl mx-auto">
                Each niche gets custom solutions mapped to your specific pains.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {NICHES.map((niche, i) => (
                <motion.div
                  key={niche.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    href={`/${niche.slug}`}
                    className="group block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[var(--rensto-accent-cyan)]/30 hover:bg-white/[0.04] transition-all duration-300 text-center cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--rensto-accent-cyan)]/5 border border-[var(--rensto-accent-cyan)]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--rensto-accent-cyan)]/10 group-hover:border-[var(--rensto-accent-cyan)]/25 transition-all duration-300">
                      <NicheIcon
                        name={niche.iconName}
                        className="w-5 h-5 text-[var(--rensto-text-muted)] group-hover:text-[var(--rensto-accent-cyan)] transition-colors duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight group-hover:text-[var(--rensto-accent-cyan)] transition-colors">
                      {niche.name}
                    </h3>
                    <p className="text-xs text-[var(--rensto-text-muted)] mt-2 line-clamp-2">
                      {niche.pains[0]}
                    </p>
                    <span className="inline-block mt-3 text-xs font-bold text-[var(--rensto-accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity">
                      See solutions &rarr;
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Pricing */}
        <PricingSection />

        {/* 5b. Credit Slider */}
        <section className="pb-24 px-4">
          <CreditSlider />
        </section>

        {/* 6. FAQ */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              className="text-center mb-12 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                Questions?
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <div
                    className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left p-5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-bold text-white">{faq.q}</h3>
                        <motion.div
                          animate={{ rotate: openFaq === i ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <ChevronDown className="w-5 h-5 text-[var(--rensto-text-muted)] shrink-0" />
                        </motion.div>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-[var(--rensto-text-secondary)] px-5 pb-5 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
                Ready to Hire{' '}
                <span style={{ color: 'var(--rensto-accent-cyan)' }}>The Crew</span>?
              </h2>
              <p className="text-xl text-[var(--rensto-text-secondary)] max-w-lg mx-auto">
                Start with $79/mo. Use credits on any combination of AI agents.
                Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/pricing">
                  <Button
                    size="xl"
                    className="rensto-btn-3d-primary font-black uppercase tracking-[0.15em] rounded-2xl cursor-pointer text-white"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, var(--rensto-primary) 0%, var(--rensto-secondary) 100%)',
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="renstoNeon"
                    size="xl"
                    className="rounded-2xl font-black uppercase tracking-[0.15em] cursor-pointer"
                  >
                    Talk to Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
