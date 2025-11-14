'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface RenstoTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'accent';
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}

export function RenstoText({ 
  children, 
  variant = 'primary',
  as: Component = 'p',
  size = 'base',
  className = '',
  ...props 
}: RenstoTextProps) {
  const variantStyles = {
    primary: { color: 'var(--rensto-text-primary)' },
    secondary: { color: 'var(--rensto-text-secondary)' },
    muted: { color: 'var(--rensto-text-muted)' },
    accent: { color: 'var(--rensto-text-accent)' },
  };

  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  const styles = variantStyles[variant];

  return (
    <Component
      className={`${sizeStyles[size]} ${className}`}
      style={styles}
      {...props}
    >
      {children}
    </Component>
  );
}

