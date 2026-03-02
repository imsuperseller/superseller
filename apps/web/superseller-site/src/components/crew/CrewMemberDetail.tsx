'use client';

import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, Check, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';
import { Button } from '@/components/ui/button-enhanced';
import { CrewIcon } from './CrewIcon';
import { CrewProductPreview } from './CrewProductPreview';
import type { CrewMember } from '@/data/crew';
import { NICHES } from '@/data/niches';
import * as framer from 'framer-motion';
const { motion } = framer;

interface CrewMemberDetailProps {
  member: CrewMember;
}

export function CrewMemberDetail({ member }: CrewMemberDetailProps) {
  // Find niches where this crew member is mapped
  const relevantNiches = NICHES.filter((niche) =>
    niche.crewMapping.some((m) => m.crewId === member.id)
  ).map((niche) => ({
    ...niche,
    mapping: niche.crewMapping.find((m) => m.crewId === member.id)!,
  }));

  return (
    <div className="space-y-16">
      {/* Back link */}
      <Link
        href="/crew"
        className="inline-flex items-center gap-2 text-sm text-[var(--superseller-text-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to The Crew
      </Link>

      {/* Hero */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `rgba(${member.accentColorRgb}, 0.1)`,
              border: `1px solid rgba(${member.accentColorRgb}, 0.2)`,
            }}
          >
            <CrewIcon name={member.iconName} className="w-8 h-8" style={{ color: member.accentColor }} />
          </div>
          <div>
            {member.status === 'live' ? (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Live
              </Badge>
            ) : (
              <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Coming Soon
              </Badge>
            )}
            <p
              className="text-sm font-bold uppercase tracking-[0.15em]"
              style={{ color: member.accentColor }}
            >
              {member.role}
            </p>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
          {member.name}
        </h1>

        <p className="text-xl text-[var(--superseller-text-secondary)] max-w-2xl leading-relaxed">
          {member.description}
        </p>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            background: `rgba(${member.accentColorRgb}, 0.1)`,
            color: member.accentColor,
            border: `1px solid rgba(${member.accentColorRgb}, 0.2)`,
          }}
        >
          ~{member.creditsPerTask} credits per {member.taskUnit}
        </div>
      </motion.div>

      {/* Cinematic Showcase Video (V3/V2) — autoplay hero */}
      {member.showcaseVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden border"
            style={{ borderColor: `rgba(${member.accentColorRgb}, 0.2)` }}
          >
            <video
              src={member.showcaseVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full object-cover"
            />
            {/* Subtle gradient overlay at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
              style={{
                background: `linear-gradient(to top, rgba(13,27,46,0.8), transparent)`,
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Product preview mock-up */}
      <CrewProductPreview member={member} />

      {/* Real Output Example — for live products with actual demos */}
      {member.demoVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
            <Play className="w-5 h-5" style={{ color: member.accentColor }} />
            Real Output
          </h2>
          <div
            className="relative rounded-2xl overflow-hidden border"
            style={{ borderColor: `rgba(${member.accentColorRgb}, 0.15)` }}
          >
            <video
              src={member.demoVideo}
              controls
              playsInline
              muted
              preload="metadata"
              className="w-full max-h-[480px] object-contain bg-black"
            />
          </div>
          {member.demoCaption && (
            <p className="text-sm text-[var(--superseller-text-muted)] mt-3 text-center italic">
              {member.demoCaption}
            </p>
          )}
        </motion.div>
      )}

      {/* Try Free CTA — for products without real output demos */}
      {!member.demoVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <div
            className="relative rounded-2xl overflow-hidden border p-8 text-center"
            style={{
              borderColor: `rgba(${member.accentColorRgb}, 0.2)`,
              background: `linear-gradient(135deg, rgba(${member.accentColorRgb}, 0.06), rgba(${member.accentColorRgb}, 0.02))`,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: `rgba(${member.accentColorRgb}, 0.1)`,
                border: `1px solid rgba(${member.accentColorRgb}, 0.2)`,
              }}
            >
              <CrewIcon name={member.iconName} className="w-8 h-8" style={{ color: member.accentColor }} />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
              Try {member.name} Free
            </h3>
            <p className="text-[var(--superseller-text-secondary)] max-w-md mx-auto mb-6">
              {member.status === 'coming-soon'
                ? `Be the first to experience ${member.name}. Get your first ${member.taskUnit} free — no credit card required. See real results with your own data.`
                : `Try ${member.name} with your own data. Your first ${member.taskUnit} is free — see exactly what ${member.name} produces before committing.`}
            </p>
            <Link href="/pricing">
              <Button
                size="xl"
                className="superseller-btn-3d-accent font-black uppercase tracking-[0.15em] rounded-2xl cursor-pointer text-white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${member.accentColor} 0%, ${member.accentColor}99 100%)`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 15px rgba(${member.accentColorRgb}, 0.35)`,
                }}
              >
                {member.status === 'coming-soon' ? 'Get Early Access' : 'Try Free'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">
          What It Does
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {member.features.map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]"
            >
              <Check
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: member.accentColor }}
              />
              <span className="text-sm text-[var(--superseller-text-secondary)]">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Niche Examples */}
      {relevantNiches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">
            How Industries Use {member.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantNiches.map((niche) => (
              <Link
                key={niche.slug}
                href={`/${niche.slug}`}
                className="group block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[var(--superseller-accent-cyan)] transition-colors">
                  {niche.name}
                </h3>
                <p className="text-sm text-[var(--superseller-text-muted)] mb-3">
                  <strong className="text-[var(--superseller-text-secondary)]">
                    Pain:
                  </strong>{' '}
                  {niche.mapping.painSolved}
                </p>
                <p className="text-sm" style={{ color: member.accentColor }}>
                  {niche.mapping.example}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        className="text-center py-12 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
          Ready to Hire{' '}
          <span style={{ color: member.accentColor }}>{member.name}</span>?
        </h2>
        <p className="text-[var(--superseller-text-secondary)]">
          {member.name} is included in every plan. Start with Starter at
          $79/mo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing">
            <Button
              size="xl"
              className="superseller-btn-3d-accent font-black uppercase tracking-[0.15em] rounded-2xl cursor-pointer text-white"
              style={{
                backgroundImage: `linear-gradient(135deg, ${member.accentColor} 0%, ${member.accentColor}99 100%)`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 15px rgba(${member.accentColorRgb}, 0.35), 0 8px 30px rgba(${member.accentColorRgb}, 0.15)`,
              }}
            >
              Get Started
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
  );
}
