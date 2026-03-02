'use client';

import { NicheHero } from './NicheHero';
import { NicheCrewMapping } from './NicheCrewMapping';
import { NichePainPoints } from './NichePainPoints';
import { PricingSection } from '@/components/pricing/PricingSection';
import { Button } from '@/components/ui/button-enhanced';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Niche } from '@/data/niches';
import * as framer from 'framer-motion';
const { motion } = framer;

interface NichePageProps {
  niche: Niche;
}

export function NichePage({ niche }: NichePageProps) {
  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--superseller-bg-primary)' }}
      dir={niche.direction}
      lang={niche.locale}
    >
      <NicheHero niche={niche} />
      <NichePainPoints niche={niche} />
      <NicheCrewMapping niche={niche} />
      <PricingSection />

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
              Ready to Automate Your{' '}
              <span style={{ color: 'var(--superseller-accent-cyan)' }}>
                {niche.name}
              </span>{' '}
              Business?
            </h2>
            <p className="text-xl text-[var(--superseller-text-secondary)] max-w-lg mx-auto">
              Start with $79/mo. Your AI crew handles the busy work so you can
              focus on growing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pricing">
                <Button
                  size="xl"
                  className="superseller-btn-3d-primary font-black uppercase tracking-[0.15em] rounded-2xl cursor-pointer text-white"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, var(--superseller-primary) 0%, var(--superseller-secondary) 100%)',
                  }}
                >
                  Hire The Crew
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="supersellerNeon"
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
  );
}
