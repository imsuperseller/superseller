import React from 'react';
import { cn } from '@/lib/utils';

interface RenstoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'neon' | 'gradient' | 'glow';
  animation?: 'none' | 'pulse' | 'glow' | 'shimmer';
  showTagline?: boolean;
  className?: string;
}

export function RenstoLogo({ 
  size = 'md', 
  variant = 'default', 
  animation = 'none',
  showTagline = false,
  className 
}: RenstoLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantClasses = {
    default: 'text-rensto-blue',
    neon: 'text-rensto-cyan drop-shadow-[0_0_10px_rgba(95,251,253,0.7)]',
    gradient: 'bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue bg-clip-text text-transparent',
    glow: 'text-rensto-blue drop-shadow-[0_0_20px_rgba(30,174,247,0.5)]'
  };

  const animationClasses = {
    none: '',
    pulse: 'animate-rensto-pulse',
    glow: 'animate-rensto-glow',
    shimmer: 'animate-rensto-shimmer'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Rensto Logo SVG */}
      <svg 
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          animationClasses[animation],
          'transition-all duration-300'
        )}
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="renstoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fe3d51', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#bf5700', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#1eaef7', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Stylized R Logo */}
        <path 
          d="M20 15 L20 85 L40 85 L40 55 L70 85 L85 85 L55 50 L75 15 L55 15 L40 50 L40 15 Z" 
          fill={variant === 'gradient' ? 'url(#renstoGradient)' : 'currentColor'}
          filter={variant === 'glow' ? 'url(#glow)' : undefined}
          className="transition-all duration-300"
        />
        
        {/* Additional brand elements */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="none" 
          stroke={variant === 'neon' ? '#5ffbfd' : 'rgba(30,174,247,0.2)'} 
          strokeWidth="1"
          className="transition-all duration-300"
        />
      </svg>

      {/* Tagline */}
      {showTagline && (
        <div className="flex flex-col">
          <span className={cn(
            'font-bold tracking-tight',
            taglineSizeClasses[size],
            variant === 'gradient' ? 'bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue bg-clip-text text-transparent' : 'text-rensto-text-primary'
          )}>
            RENSTO
          </span>
          <span className={cn(
            'text-rensto-text-muted font-medium',
            taglineSizeClasses[size],
            'text-xs'
          )}>
            Automations that ship
          </span>
        </div>
      )}
    </div>
  );
}

export default RenstoLogo;
