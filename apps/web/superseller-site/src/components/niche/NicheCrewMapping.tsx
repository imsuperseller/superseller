'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge-enhanced';
import { CrewIcon } from '@/components/crew/CrewIcon';
import { CREW_MEMBERS } from '@/data/crew';
import type { Niche } from '@/data/niches';
import * as framer from 'framer-motion';
const { motion } = framer;

interface NicheCrewMappingProps {
  niche: Niche;
}

export function NicheCrewMapping({ niche }: NicheCrewMappingProps) {
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
          <Badge className="bg-[var(--superseller-accent-cyan)]/10 text-[var(--superseller-accent-cyan)] border-[var(--superseller-accent-cyan)]/20 px-4 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
            The Solution
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
            Your AI Crew for {niche.name}
          </h2>
          <p className="text-lg text-[var(--superseller-text-secondary)] max-w-xl mx-auto">
            Here&apos;s exactly how each agent solves your problems.
          </p>
        </motion.div>

        <div className="space-y-4">
          {niche.crewMapping.map((mapping, i) => {
            const member = CREW_MEMBERS.find((m) => m.id === mapping.crewId);
            if (!member) return null;

            return (
              <motion.div
                key={mapping.crewId}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 transition-all"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Agent info */}
                  <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `rgba(${member.accentColorRgb}, 0.1)`,
                        border: `1px solid rgba(${member.accentColorRgb}, 0.2)`,
                      }}
                    >
                      <CrewIcon
                        name={member.iconName}
                        className="w-6 h-6"
                        style={{ color: member.accentColor }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {member.name}
                      </h3>
                      <p
                        className="text-xs font-bold uppercase tracking-[0.15em]"
                        style={{ color: member.accentColor }}
                      >
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Pain → Solution */}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-[var(--superseller-text-muted)]">
                      <span className="text-[var(--superseller-primary)] font-bold">
                        Pain:
                      </span>{' '}
                      {mapping.painSolved}
                    </p>
                    <p className="text-sm text-[var(--superseller-text-secondary)]">
                      {mapping.example}
                    </p>
                  </div>

                  {/* Link */}
                  <Link
                    href={member.href}
                    className="shrink-0 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: member.accentColor }}
                  >
                    Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
