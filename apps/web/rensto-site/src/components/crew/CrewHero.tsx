'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';
import { Badge } from '@/components/ui/badge-enhanced';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import * as framer from 'framer-motion';
const { motion, useScroll, useTransform } = framer;

export function CrewHero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: background moves slower, content fades & scales
  // Dead zone: content stays fully visible for first 35% of scroll, then fades
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35, 0.85], [1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.35, 0.85], [0, 0, -50]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35, 0.8], [1, 1, 0.96]);

  // Stagger line animation config — faster entrances
  const lineVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background — parallax shift */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: backgroundY }}>
        <AnimatedGridBackground />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 scale-110"
          style={{ backgroundImage: 'url(/images/hero/homepage-hero.webp)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--rensto-bg-primary)]/50 to-[var(--rensto-bg-primary)]" />
      </motion.div>

      {/* Content — fades + scales on scroll */}
      <motion.div
        className="container mx-auto px-6 py-24 text-center max-w-5xl"
        style={{ opacity: contentOpacity, y: contentY, scale: heroScale }}
      >
        <div className="space-y-8" style={{ perspective: '800px' }}>
          {/* Eyebrow — slides in first */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Badge className="bg-[var(--rensto-accent-cyan)]/10 text-[var(--rensto-accent-cyan)] border-[var(--rensto-accent-cyan)]/20 px-5 py-2 uppercase tracking-[0.3em] text-[10px] font-black">
              6 AI Agents. One Subscription.
            </Badge>
          </motion.div>

          {/* Headline — each line staggers in with 3D perspective */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            {[
              { text: 'Fire Your', className: 'text-white' },
              { text: 'Video Studio.', style: { color: 'var(--rensto-primary)' } },
              { text: 'Fire Your', className: 'text-white/40' },
              { text: 'Receptionist.', style: { color: 'var(--rensto-accent-cyan)' } },
            ].map((line, i) => (
              <motion.span
                key={i}
                className={`block ${line.className || ''}`}
                style={line.style}
                custom={i}
                variants={lineVariants}
                initial="hidden"
                animate="visible"
              >
                {line.text}
              </motion.span>
            ))}
          </h1>

          {/* Sub — fades in after headline */}
          <motion.p
            className="text-xl md:text-2xl text-[var(--rensto-text-secondary)] max-w-2xl mx-auto font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          >
            Meet your AI crew. Six autonomous agents that produce videos, answer
            calls, generate leads, create content, and run your knowledge base
            &mdash; starting at{' '}
            <span className="text-white font-black">$299/mo</span>.
          </motion.p>

          {/* CTAs — slide up with spring */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, type: 'spring', stiffness: 120 }}
          >
            <Link href="/pricing">
              <Button
                size="xl"
                className="rensto-btn-3d-primary font-black uppercase tracking-[0.15em] rounded-2xl cursor-pointer text-white"
                style={{
                  backgroundImage: 'linear-gradient(135deg, var(--rensto-primary) 0%, var(--rensto-secondary) 100%)',
                }}
              >
                Hire The Crew
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/crew">
              <Button
                variant="renstoNeon"
                size="xl"
                className="rounded-2xl font-black uppercase tracking-[0.15em] cursor-pointer"
              >
                Meet Each Agent
              </Button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            className="text-sm text-[var(--rensto-text-muted)] pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            No contracts. Cancel anytime. Credits never expire while subscribed.
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
