'use client';

import { useEffect, useRef } from 'react';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { PRICING_PLANS } from '@/data/pricing';
import type { PricingPlan } from '@/data/pricing';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import * as framer from 'framer-motion';
const { motion, useMotionValue, useTransform, animate, useInView } = framer;

interface PricingSectionProps {
  showHeader?: boolean;
  className?: string;
}

/** Animated number counter component */
function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      });
      return controls.stop;
    }
  }, [isInView, value, duration, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function PricingSection({ showHeader = true, className = '' }: PricingSectionProps) {
  const t = useTranslations('pricing');

  return (
    <section className={`py-24 px-4 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--superseller-bg-primary)] to-transparent opacity-80 -z-10" />

      <div className="container mx-auto max-w-7xl">
        {showHeader && (
          <motion.div
            className="text-center mb-16 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-[var(--superseller-accent-cyan)]/10 text-[var(--superseller-accent-cyan)] border-[var(--superseller-accent-cyan)]/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
              {t('badge')}
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              {t('heading1')}{' '}
              <span style={{ color: 'var(--superseller-accent-cyan)' }}>{t('heading2')}</span>
              <br />
              {t('heading3')}
            </h2>
            <p className="text-xl text-[var(--superseller-text-secondary)] max-w-2xl mx-auto font-medium leading-relaxed">
              {t('description')}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* Credit cost reference */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              {t('creditRef')}
            </h3>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-3 p-4 bg-white/5 border-b border-white/10 font-bold text-[10px] uppercase tracking-[0.2em] text-[var(--superseller-text-muted)]">
              <div>{t('colCrewMember')}</div>
              <div className="text-center">{t('colCredits')}</div>
              <div className="text-right">{t('colPer')}</div>
            </div>
            {PRICING_PLANS[0].creditExamples.map((ex, j) => (
              <motion.div
                key={j}
                className="grid grid-cols-3 p-4 border-b border-white/5 hover:bg-white/[0.03] items-center text-sm transition-colors"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: j * 0.06 }}
              >
                <div className="text-white font-medium">{ex.task}</div>
                <div className="text-center font-mono font-bold" style={{ color: 'var(--superseller-accent-cyan)' }}>
                  ~{ex.credits}
                </div>
                <div className="text-right text-[var(--superseller-text-muted)]">
                  {ex.unit}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const t = useTranslations('pricing');
  const planT = useTranslations(`pricing.plans.${plan.id}`);

  // Get features from translations
  const features = plan.features.map((_, i) => planT(`features.${i}`));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className={`h-full ${plan.popular ? 'md:-translate-y-4' : ''}`}
      whileHover={{ y: plan.popular ? -20 : -4, transition: { duration: 0.3 } }}
    >
      <div
        className={`relative overflow-hidden rounded-[2rem] border bg-white/[0.02] backdrop-blur-xl p-8 transition-all duration-500 h-full flex flex-col ${
          plan.popular
            ? 'border-[var(--superseller-accent-cyan)]/40 shadow-[0_0_40px_rgba(95,251,253,0.1)]'
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        {plan.popular && (
          <>
            <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--superseller-accent-cyan)] to-transparent" />
            {/* Animated glow pulse for popular card */}
            <motion.div
              className="absolute inset-0 rounded-[2rem] -z-10"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(95,251,253,0.05)',
                  '0 0 40px rgba(95,251,253,0.12)',
                  '0 0 20px rgba(95,251,253,0.05)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Badge or spacer */}
        <div className="h-8 mb-2">
          {plan.popular && (
            <Badge className="bg-[var(--superseller-accent-cyan)]/10 text-[var(--superseller-accent-cyan)] border-[var(--superseller-accent-cyan)]/20 text-[10px] font-black uppercase tracking-[0.2em]">
              {t('mostPopular')}
            </Badge>
          )}
        </div>

        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
          {plan.name}
        </h3>

        {/* Price with animated counter */}
        <div className="flex items-baseline gap-1 mt-4 mb-2">
          <span className="text-5xl font-black text-white">
            $<AnimatedNumber value={plan.price} duration={1.2} />
          </span>
          <span className="text-[var(--superseller-text-muted)] font-medium">{t('month')}</span>
        </div>

        <p className="text-sm text-[var(--superseller-text-secondary)] mb-6">
          {planT('tagline')}
        </p>

        {/* Credits highlight with animated number */}
        <div className="p-4 rounded-xl bg-[var(--superseller-accent-cyan)]/5 border border-[var(--superseller-accent-cyan)]/10 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--superseller-accent-cyan)]/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" style={{ color: 'var(--superseller-accent-cyan)' }} />
          </div>
          <div>
            <div className="font-black text-white text-lg">
              <AnimatedNumber value={plan.credits} /> {t('credits')}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--superseller-accent-cyan)' }}>
              {t('monthlyCapacity')}
            </div>
          </div>
        </div>

        {/* Features with staggered checkmarks */}
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-3 text-sm text-[var(--superseller-text-secondary)]"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
            >
              <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/pricing" className="mt-auto block">
          <Button
            className={`w-full font-black text-lg h-14 rounded-2xl uppercase tracking-[0.1em] cursor-pointer ${
              plan.popular
                ? 'superseller-btn-3d-primary text-white'
                : 'superseller-btn-3d-glass bg-white/5 text-white border border-white/10'
            }`}
            style={
              plan.popular
                ? {
                    backgroundImage: 'linear-gradient(135deg, var(--superseller-primary) 0%, var(--superseller-secondary) 100%)',
                  }
                : undefined
            }
          >
            {planT('cta')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
