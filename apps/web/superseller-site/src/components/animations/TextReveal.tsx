'use client';

import { useRef, type ElementType } from 'react';
import * as framer from 'framer-motion';
const { motion, useInView } = framer;

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
}

export function TextReveal({ children, className, as: Tag = 'h2', delay = 0.1 }: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}
