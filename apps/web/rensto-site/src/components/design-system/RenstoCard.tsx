'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface RenstoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'neon' | 'gradient';
  hover?: boolean;
}

export function RenstoCard({ 
  children, 
  variant = 'default',
  hover = true,
  className = '',
  ...props 
}: RenstoCardProps) {
  const baseStyles = 'rounded-xl border-2 p-6 transition-all duration-300';
  
  const variantStyles = {
    default: {
      background: 'var(--rensto-bg-card)',
      borderColor: 'rgba(254, 61, 81, 0.2)',
      boxShadow: 'var(--rensto-glow-accent)',
    },
    neon: {
      background: 'var(--rensto-bg-card)',
      borderColor: 'var(--rensto-accent-cyan)',
      boxShadow: 'var(--rensto-glow-neon)',
    },
    gradient: {
      background: 'linear-gradient(135deg, var(--rensto-bg-card) 0%, var(--rensto-bg-secondary) 100%)',
      borderColor: 'rgba(95, 251, 253, 0.3)',
      boxShadow: 'var(--rensto-glow-accent)',
    },
  };

  const hoverStyles = hover 
    ? 'hover:-translate-y-1 hover:border-red-500 hover:shadow-[var(--rensto-glow-primary)]'
    : '';

  const styles = variantStyles[variant];

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
}

