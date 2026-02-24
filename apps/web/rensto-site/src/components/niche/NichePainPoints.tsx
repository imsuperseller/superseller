'use client';

import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';
import type { Niche } from '@/data/niches';
import * as framer from 'framer-motion';
const { motion } = framer;

interface NichePainPointsProps {
  niche: Niche;
}

export function NichePainPoints({ niche }: NichePainPointsProps) {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-12 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-[var(--rensto-primary)]/10 text-[var(--rensto-primary)] border-[var(--rensto-primary)]/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
            The Problem
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Sound Familiar?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {niche.pains.map((pain, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 p-6 rounded-2xl border border-[var(--rensto-primary)]/10 bg-[var(--rensto-primary)]/5"
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <AlertTriangle
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: 'var(--rensto-primary)' }}
              />
              <p className="text-[var(--rensto-text-secondary)] font-medium">
                {pain}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
