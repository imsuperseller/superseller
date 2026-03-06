'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { Schema } from '@/components/seo/Schema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CrewHero } from '@/components/crew/CrewHero';
import { CrewGrid } from '@/components/crew/CrewGrid';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { ROIComparison } from '@/components/marketing/ROIComparison';
import { PricingSection } from '@/components/pricing/PricingSection';
import { CreditSlider } from '@/components/pricing/CreditSlider';
import { NICHES } from '@/data/niches';
import { NicheIcon } from '@/components/niche/NicheIcon';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import * as framer from 'framer-motion';
const { motion, AnimatePresence } = framer;

export default function HomePageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useTranslations();

  // Get FAQ items from translations
  const faqItems = Array.from({ length: 8 }, (_, i) => ({
    q: t(`faq.items.${i}.q`),
    a: t(`faq.items.${i}.a`),
  }));

  const faqData = {
    mainEntity: faqItems.map((faq) => ({
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
        item: 'https://superseller.agency',
      },
    ],
  };

  return (
    <>
      <Schema type="FAQPage" data={faqData} />
      <Schema type="BreadcrumbList" data={breadcrumbData} />

      <Header />

      <main className="min-h-screen" style={{ background: 'var(--superseller-bg-primary)' }}>
        {/* 1. Hero */}
        <CrewHero />

        {/* 1b. Crew Reveal — scroll-synced animation (hidden on mobile to avoid blank gap) */}
        <div className="hidden md:block">
          <ScrollAnimation
            videoSrc="https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/crew-videos/showcase/crew-reveal.mp4"
            scrollHeight={2}
            className="bg-[#0d1b2e]"
          />
        </div>

        {/* 2. The Crew — 7 product cards */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <ScrollReveal className="text-center mb-16 space-y-4">
              <Badge className="bg-white/5 text-white/60 border-white/10 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                {t('crewSection.badge')}
              </Badge>
              <TextReveal as="h2" className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                {t('crewSection.heading')}
              </TextReveal>
              <p className="text-lg text-[var(--superseller-text-secondary)] max-w-xl mx-auto">
                {t('crewSection.description')}
              </p>
            </ScrollReveal>
            <CrewGrid />
          </div>
        </section>

        {/* 3. ROI Comparison */}
        <ROIComparison />

        {/* 4. Pick Your Industry */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <ScrollReveal className="text-center mb-12 space-y-4">
              <Badge className="bg-[var(--superseller-secondary)]/10 text-[var(--superseller-secondary)] border-[var(--superseller-secondary)]/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
                {t('industries.badge')}
              </Badge>
              <TextReveal as="h2" className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                {t('industries.heading')}
              </TextReveal>
              <p className="text-lg text-[var(--superseller-text-secondary)] max-w-xl mx-auto">
                {t('industries.description')}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {NICHES.map((niche, i) => (
                <ScrollReveal
                  key={niche.slug}
                  delay={i * 0.05}
                  duration={0.5}
                >
                  <Link
                    href={`/${niche.slug}` as any}
                    className="group block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[var(--superseller-accent-cyan)]/30 hover:bg-white/[0.04] transition-all duration-300 text-center cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--superseller-accent-cyan)]/5 border border-[var(--superseller-accent-cyan)]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--superseller-accent-cyan)]/10 group-hover:border-[var(--superseller-accent-cyan)]/25 transition-all duration-300">
                      <NicheIcon
                        name={niche.iconName}
                        className="w-5 h-5 text-[var(--superseller-text-muted)] group-hover:text-[var(--superseller-accent-cyan)] transition-colors duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight group-hover:text-[var(--superseller-accent-cyan)] transition-colors">
                      {niche.name}
                    </h3>
                    <p className="text-xs text-[var(--superseller-text-muted)] mt-2 line-clamp-2">
                      {niche.pains[0]}
                    </p>
                    <span className="inline-block mt-3 text-xs font-bold text-[var(--superseller-accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('crewSection.seeSolutions')} &rarr;
                    </span>
                  </Link>
                </ScrollReveal>
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
            <ScrollReveal className="text-center mb-12 space-y-4">
              <TextReveal as="h2" className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                {t('faq.heading')}
              </TextReveal>
            </ScrollReveal>

            <div className="space-y-3">
              {faqItems.map((faq, i) => (
                <ScrollReveal
                  key={i}
                  delay={i * 0.04}
                  duration={0.5}
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
                          <ChevronDown className="w-5 h-5 text-[var(--superseller-text-muted)] shrink-0" />
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
                          <p className="text-sm text-[var(--superseller-text-secondary)] px-5 pb-5 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <ScrollReveal className="space-y-8">
              <TextReveal as="h2" className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
                {t('cta.heading')}
              </TextReveal>
              <p className="text-xl text-[var(--superseller-text-secondary)] max-w-lg mx-auto">
                {t('cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/pricing">
                  <Button
                    size="xl"
                    className="superseller-btn-3d-primary font-black uppercase tracking-[0.15em] rounded-2xl cursor-pointer text-white"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, var(--superseller-primary) 0%, var(--superseller-secondary) 100%)',
                    }}
                  >
                    {t('cta.primaryBtn')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="supersellerNeon"
                    size="xl"
                    className="rounded-2xl font-black uppercase tracking-[0.15em] cursor-pointer"
                  >
                    {t('cta.secondaryBtn')}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
