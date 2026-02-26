'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge-enhanced';
import { CrewIcon } from './CrewIcon';
import { CrewCardVisual } from './CrewCardVisual';
import type { CrewMember } from '@/data/crew';
import * as framer from 'framer-motion';
const { motion, useMotionValue, useTransform, useSpring } = framer;

interface CrewMemberCardProps {
  member: CrewMember;
  index?: number;
}

export function CrewMemberCard({ member, index = 0 }: CrewMemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position tracking for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  // Mouse-following spotlight
  const spotlightX = useTransform(mouseX, [-0.5, 0.5], ['20%', '80%']);
  const spotlightY = useTransform(mouseY, [-0.5, 0.5], ['20%', '80%']);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ perspective: 800 }}
    >
      <Link href={member.href} className="group block cursor-pointer">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            ['--card-accent' as string]: member.accentColor,
            ['--card-accent-rgb' as string]: member.accentColorRgb,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 transition-colors duration-500 hover:border-opacity-30"
        >
          {/* Mouse-following spotlight */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-[2rem]"
            style={{
              background: useTransform(
                [spotlightX, spotlightY],
                ([x, y]) =>
                  `radial-gradient(circle at ${x} ${y}, rgba(${member.accentColorRgb}, 0.12), transparent 60%)`
              ),
            }}
          />

          {/* Hover glow — outer */}
          <div
            className="absolute -inset-1 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
            style={{
              background: `radial-gradient(ellipse at center, rgba(${member.accentColorRgb}, 0.15), transparent 70%)`,
            }}
          />

          {/* Themed SVG illustration */}
          <CrewCardVisual
            crewId={member.id}
            accentColor={member.accentColor}
            accentColorRgb={member.accentColorRgb}
          />

          {/* Top row: icon + status */}
          <div className="flex items-start justify-between mb-6">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `rgba(${member.accentColorRgb}, 0.1)`,
                border: `1px solid rgba(${member.accentColorRgb}, 0.2)`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CrewIcon
                name={member.iconName}
                className="w-7 h-7"
                style={{ color: member.accentColor }}
              />
            </motion.div>
            {member.status === 'live' ? (
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
                Live
              </Badge>
            ) : (
              <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                Coming Soon
              </Badge>
            )}
          </div>

          {/* Name + role */}
          <h3 className="text-xl font-black text-white tracking-tight mb-1">
            {member.name}
          </h3>
          <p
            className="text-sm font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: member.accentColor }}
          >
            {member.role}
          </p>

          {/* Tagline */}
          <p className="text-sm text-white/60 leading-relaxed mb-6 min-h-[2.5rem]">
            {member.tagline}
          </p>

          {/* Credits badge + CTA */}
          <div className="flex items-center justify-between">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: `rgba(${member.accentColorRgb}, 0.1)`,
                color: member.accentColor,
              }}
            >
              <span>~{member.creditsPerTask} credits</span>
              <span className="opacity-50">/ {member.taskUnit}</span>
            </div>

            <motion.span
              className="text-sm font-bold"
              style={{ color: member.accentColor }}
              initial={{ opacity: 0, x: -8 }}
              animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              Learn more &rarr;
            </motion.span>
          </div>

          {/* Bottom accent line that fills on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: member.accentColor }}
            initial={{ scaleX: 0 }}
            animate={isHovered ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
