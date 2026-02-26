'use client';

import { Badge } from '@/components/ui/badge-enhanced';
import { NicheIcon } from './NicheIcon';
import type { Niche } from '@/data/niches';
import * as framer from 'framer-motion';
const { motion } = framer;

interface NicheHeroProps {
  niche: Niche;
}

export function NicheHero({ niche }: NicheHeroProps) {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--superseller-bg-secondary)] to-[var(--superseller-bg-primary)] -z-10" />

      {/* Hero background image (if available) */}
      {niche.heroImage && (
        <div
          className="absolute inset-0 -z-[8] bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${niche.heroImage})` }}
        />
      )}

      {/* Large faded icon watermark behind text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-[5]">
        <NicheIcon
          name={niche.iconName}
          className="w-[28rem] h-[28rem] text-white/[0.02]"
          strokeWidth={0.5}
        />
      </div>

      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Niche icon badge */}
          <motion.div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: 'rgba(var(--superseller-accent-cyan-rgb, 95, 251, 253), 0.08)',
              border: '1px solid rgba(var(--superseller-accent-cyan-rgb, 95, 251, 253), 0.15)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NicheIcon
              name={niche.iconName}
              className="w-8 h-8"
              style={{ color: 'var(--superseller-accent-cyan)' }}
            />
          </motion.div>

          <Badge className="bg-[var(--superseller-accent-cyan)]/10 text-[var(--superseller-accent-cyan)] border-[var(--superseller-accent-cyan)]/20 px-5 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
            AI Crew for {niche.name}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            {niche.headline}
          </h1>

          <p className="text-xl text-[var(--superseller-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {niche.subheadline}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
