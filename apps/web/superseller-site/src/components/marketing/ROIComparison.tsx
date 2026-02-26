'use client';

import { Badge } from '@/components/ui/badge-enhanced';
import { Check, X } from 'lucide-react';
import * as framer from 'framer-motion';
const { motion } = framer;

interface ComparisonRow {
  task: string;
  traditional: { cost: string; time: string };
  superseller: { cost: string; time: string };
}

const COMPARISONS: ComparisonRow[] = [
  {
    task: 'Listing video (60s)',
    traditional: { cost: '$300–$800', time: '3–7 days' },
    superseller: { cost: '~50 credits', time: '~10 min' },
  },
  {
    task: 'Receptionist (24/7)',
    traditional: { cost: '$2,500–$4,000/mo', time: 'Hire + train' },
    superseller: { cost: '~5 credits/call', time: 'Instant' },
  },
  {
    task: 'Social media post',
    traditional: { cost: '$50–$150/post', time: '1–3 days' },
    superseller: { cost: '~10 credits', time: '~2 min' },
  },
  {
    task: 'Qualified lead',
    traditional: { cost: '$25–$75/lead', time: 'Ongoing' },
    superseller: { cost: '~15 credits', time: 'Delivered' },
  },
  {
    task: 'Explainer video',
    traditional: { cost: '$500–$2,000', time: '1–2 weeks' },
    superseller: { cost: '~50 credits', time: '~5 min' },
  },
];

export function ROIComparison() {
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
          <Badge className="bg-[var(--superseller-primary)]/10 text-[var(--superseller-primary)] border-[var(--superseller-primary)]/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
            The Math
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
            The Old Way Costs{' '}
            <span style={{ color: 'var(--superseller-primary)' }}>10x More</span>
          </h2>
          <p className="text-lg text-[var(--superseller-text-secondary)] max-w-xl mx-auto">
            SuperSeller AI replaces expensive agencies, freelancers, and staff with AI
            agents that work faster and cost a fraction.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          className="rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-5 bg-white/[0.03] border-b border-white/10">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)]">
              Task
            </div>
            <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] text-center">
              Old Cost
            </div>
            <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] text-center">
              Old Time
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center" style={{ color: 'var(--superseller-accent-cyan)' }}>
              SuperSeller AI Cost
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center" style={{ color: 'var(--superseller-accent-cyan)' }}>
              SuperSeller AI Time
            </div>
          </div>

          {/* Rows */}
          {COMPARISONS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 md:grid-cols-5 gap-4 p-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center"
            >
              <div className="text-white font-medium text-sm">{row.task}</div>
              <div className="hidden md:block text-center text-sm text-red-400/80 line-through">
                {row.traditional.cost}
              </div>
              <div className="hidden md:block text-center text-sm text-[var(--superseller-text-muted)]">
                {row.traditional.time}
              </div>
              <div className="text-center text-sm font-bold" style={{ color: 'var(--superseller-accent-cyan)' }}>
                {row.superseller.cost}
              </div>
              <div className="text-center text-sm font-bold text-green-400">
                {row.superseller.time}
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="p-5 bg-[var(--superseller-accent-cyan)]/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[var(--superseller-text-secondary)]">
                <strong className="text-white">Example:</strong> A realtor creating 10
                listing videos/mo saves ~$5,000 compared to a video studio.
              </p>
              <p className="text-sm font-black" style={{ color: 'var(--superseller-accent-cyan)' }}>
                SuperSeller AI Starter: $79/mo
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
