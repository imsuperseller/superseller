'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface RenstoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: ReactNode;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RenstoButton({ 
  variant = 'primary', 
  children, 
  showArrow = false,
  size = 'md',
  className = '',
  ...props 
}: RenstoButtonProps) {
  const baseStyles = 'font-bold transition-all duration-200 flex items-center justify-center gap-2 rounded-lg hover:-translate-y-0.5';
  
  const sizeStyles = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };

  const variantStyles = {
    primary: {
      background: 'var(--rensto-gradient-primary)',
      color: '#ffffff',
      boxShadow: 'var(--rensto-glow-primary)',
    },
    secondary: {
      background: 'transparent',
      border: '2px solid var(--rensto-primary)',
      color: 'var(--rensto-primary)',
    },
    accent: {
      background: 'var(--rensto-gradient-secondary)',
      color: '#ffffff',
      boxShadow: 'var(--rensto-glow-secondary)',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={styles}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight className="w-5 h-5" />}
    </button>
  );
}

