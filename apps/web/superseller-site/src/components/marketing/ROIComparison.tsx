'use client';

import { Badge } from '@/components/ui/badge-enhanced';
import { useTranslations } from 'next-intl';
import * as framer from 'framer-motion';
const { motion } = framer;

export function ROIComparison() {
  const t = useTranslations('roi');

  // Read rows from translations (5 items)
  const rows = Array.from({ length: 5 }, (_, i) => ({
    task: t(`rows.${i}.task`),
    oldCost: t(`rows.${i}.oldCost`),
    oldTime: t(`rows.${i}.oldTime`),
    aiCost: t(`rows.${i}.aiCost`),
    aiTime: t(`rows.${i}.aiTime`),
  }));

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
            {t('badge')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
            {t('heading1')}{' '}
            <span style={{ color: 'var(--superseller-primary)' }}>{t('heading2')}</span>
          </h2>
          <p className="text-lg text-[var(--superseller-text-secondary)] max-w-xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        {/* Table — desktop grid, mobile stacked cards */}
        <motion.div
          className="rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Desktop header — hidden on mobile */}
          <div className="hidden md:grid grid-cols-5 gap-4 p-5 bg-white/[0.03] border-b border-white/10">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)]">
              {t('colTask')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] text-center">
              {t('colOldCost')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] text-center">
              {t('colOldTime')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center" style={{ color: 'var(--superseller-accent-cyan)' }}>
              {t('colAiCost')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-center" style={{ color: 'var(--superseller-accent-cyan)' }}>
              {t('colAiTime')}
            </div>
          </div>

          {/* Rows — desktop: 5-col grid | mobile: stacked card */}
          {rows.map((row, i) => (
            <div key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-5 gap-4 p-5 items-center">
                <div className="text-white font-medium text-sm">{row.task}</div>
                <div className="text-center text-sm text-red-400/80 line-through">
                  {row.oldCost}
                </div>
                <div className="text-center text-sm text-[var(--superseller-text-muted)]">
                  {row.oldTime}
                </div>
                <div className="text-center text-sm font-bold" style={{ color: 'var(--superseller-accent-cyan)' }}>
                  {row.aiCost}
                </div>
                <div className="text-center text-sm font-bold text-green-400">
                  {row.aiTime}
                </div>
              </div>
              {/* Mobile card */}
              <div className="md:hidden p-4 space-y-2">
                <div className="text-white font-bold text-sm">{row.task}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-[var(--superseller-text-muted)]">{t('colOldCost')}</div>
                  <div className="text-red-400/80 line-through text-right">{row.oldCost}</div>
                  <div className="text-[var(--superseller-text-muted)]">{t('colOldTime')}</div>
                  <div className="text-[var(--superseller-text-muted)] text-right">{row.oldTime}</div>
                  <div style={{ color: 'var(--superseller-accent-cyan)' }}>{t('colAiCost')}</div>
                  <div className="font-bold text-right" style={{ color: 'var(--superseller-accent-cyan)' }}>{row.aiCost}</div>
                  <div style={{ color: 'var(--superseller-accent-cyan)' }}>{t('colAiTime')}</div>
                  <div className="font-bold text-green-400 text-right">{row.aiTime}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="p-5 bg-[var(--superseller-accent-cyan)]/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[var(--superseller-text-secondary)]">
                {t('summary')}
              </p>
              <p className="text-sm font-black" style={{ color: 'var(--superseller-accent-cyan)' }}>
                {t('summaryCta')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
