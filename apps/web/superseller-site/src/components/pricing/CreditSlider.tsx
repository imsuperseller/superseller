'use client';

import { useState, useMemo } from 'react';
import { PRICING_PLANS } from '@/data/pricing';
import { CREDIT_COSTS } from '@/data/pricing';
import { CREW_MEMBERS } from '@/data/crew';
import * as framer from 'framer-motion';
const { motion } = framer;

interface SliderRow {
  crewId: keyof typeof CREDIT_COSTS;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const SLIDERS: SliderRow[] = [
  { crewId: 'forge', label: 'Videos produced', unit: 'videos/mo', min: 0, max: 40, step: 1, defaultValue: 5 },
  { crewId: 'spoke', label: 'Spokesperson videos', unit: 'videos/mo', min: 0, max: 40, step: 1, defaultValue: 2 },
  { crewId: 'frontdesk', label: 'AI-answered calls', unit: 'calls/mo', min: 0, max: 200, step: 5, defaultValue: 30 },
  { crewId: 'scout', label: 'Leads delivered', unit: 'leads/mo', min: 0, max: 100, step: 5, defaultValue: 10 },
  { crewId: 'buzz', label: 'Social posts', unit: 'posts/mo', min: 0, max: 60, step: 1, defaultValue: 8 },
  { crewId: 'cortex', label: 'Knowledge queries', unit: 'queries/mo', min: 0, max: 200, step: 10, defaultValue: 20 },
];

export function CreditSlider() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(SLIDERS.map((s) => [s.crewId, s.defaultValue]))
  );

  const totalCredits = useMemo(() => {
    return SLIDERS.reduce((sum, slider) => {
      const count = values[slider.crewId] ?? 0;
      const cost = CREDIT_COSTS[slider.crewId].credits;
      return sum + count * cost;
    }, 0);
  }, [values]);

  const recommendedPlan = useMemo(() => {
    const plan = PRICING_PLANS.find((p) => p.credits >= totalCredits);
    return plan ?? PRICING_PLANS[PRICING_PLANS.length - 1];
  }, [totalCredits]);

  return (
    <motion.div
      className="max-w-2xl mx-auto rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 text-center">
        Build Your Crew
      </h3>
      <p className="text-sm text-[var(--superseller-text-muted)] text-center mb-8">
        Adjust the sliders to see which plan fits your needs
      </p>

      <div className="space-y-6">
        {SLIDERS.map((slider) => {
          const member = CREW_MEMBERS.find((m) => m.id === slider.crewId);
          const val = values[slider.crewId] ?? 0;
          const credits = val * CREDIT_COSTS[slider.crewId].credits;

          return (
            <div key={slider.crewId} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">{slider.label}</span>
                <span className="text-[var(--superseller-text-muted)] tabular-nums">
                  {val} {slider.unit}{' '}
                  <span className="text-xs opacity-50">({credits} cr)</span>
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={val}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [slider.crewId]: Number(e.target.value),
                  }))
                }
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${member?.accentColor ?? 'var(--superseller-accent-cyan)'} 0%, ${member?.accentColor ?? 'var(--superseller-accent-cyan)'} ${((val - slider.min) / (slider.max - slider.min)) * 100}%, rgba(255,255,255,0.1) ${((val - slider.min) / (slider.max - slider.min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Result */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[var(--superseller-text-muted)] text-sm font-bold uppercase tracking-[0.15em]">
            Total credits needed
          </span>
          <span className="text-2xl font-black text-white tabular-nums">
            {totalCredits.toLocaleString()}
          </span>
        </div>

        <div
          className="p-4 rounded-xl text-center"
          style={{
            background: recommendedPlan.popular
              ? 'rgba(95, 251, 253, 0.05)'
              : 'rgba(255, 255, 255, 0.02)',
            border: recommendedPlan.popular
              ? '1px solid rgba(95, 251, 253, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--superseller-text-muted)] mb-1">
            Recommended Plan
          </p>
          <p className="text-lg font-black text-white">
            {recommendedPlan.name}{' '}
            <span style={{ color: 'var(--superseller-accent-cyan)' }}>
              ${recommendedPlan.price}/mo
            </span>
          </p>
          <p className="text-xs text-[var(--superseller-text-muted)] mt-1">
            {recommendedPlan.credits.toLocaleString()} credits &mdash;{' '}
            {totalCredits > 0
              ? `${Math.round(((recommendedPlan.credits - totalCredits) / recommendedPlan.credits) * 100)}% headroom`
              : 'select your needs above'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
