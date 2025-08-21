import React from 'react';
import { cn } from '@/lib/utils';

interface RenstoCardProps {
  variant?: 'default' | 'rensto' | 'neon' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  animation?: 'none' | 'hover' | 'pulse' | 'glow';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function RenstoCard({ 
  variant = 'default', 
  size = 'md',
  animation = 'none',
  children, 
  className,
  onClick 
}: RenstoCardProps) {
  const baseClasses = 'rounded-xl backdrop-blur-sm transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-rensto-bg-card border border-rensto-border text-rensto-text-primary',
    rensto: 'bg-rensto-bg-card/80 border border-rensto-blue/20 text-rensto-text-primary shadow-rensto-glow-secondary',
    neon: 'bg-rensto-bg-card/60 border border-rensto-cyan/40 text-rensto-text-primary shadow-rensto-glow-accent',
    gradient: 'bg-gradient-to-br from-rensto-bg-card via-rensto-bg-secondary to-rensto-bg-card border border-rensto-blue/30 text-rensto-text-primary',
    glow: 'bg-rensto-bg-card/90 border border-rensto-blue/50 text-rensto-text-primary shadow-rensto-glow-primary'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const animationClasses = {
    none: '',
    hover: 'hover:scale-105 hover:shadow-rensto-glow-secondary cursor-pointer',
    pulse: 'animate-rensto-pulse',
    glow: 'animate-rensto-glow'
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        animationClasses[animation],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Specialized card variants
export function RenstoStatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  variant = 'rensto',
  className 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'rensto' | 'neon' | 'gradient' | 'glow';
  className?: string;
}) {
  return (
    <RenstoCard variant={variant} className={cn('text-center', className)}>
      <div className="space-y-2">
        <h3 className="text-rensto-text-muted text-sm font-medium">{title}</h3>
        <div className="text-3xl font-bold bg-gradient-to-r from-rensto-blue to-rensto-cyan bg-clip-text text-transparent">
          {value}
        </div>
        {subtitle && (
          <p className="text-rensto-text-muted text-sm">{subtitle}</p>
        )}
        {trend && (
          <div className={cn(
            'flex items-center justify-center gap-1 text-sm font-medium',
            trend.positive ? 'text-green-400' : 'text-red-400'
          )}>
            <span>{trend.positive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </RenstoCard>
  );
}

export function RenstoFeatureCard({ 
  title, 
  description, 
  icon, 
  status = 'active',
  variant = 'rensto',
  className 
}: {
  title: string;
  description: string;
  icon: string;
  status?: 'active' | 'inactive' | 'loading' | 'error';
  variant?: 'default' | 'rensto' | 'neon' | 'gradient' | 'glow';
  className?: string;
}) {
  const statusClasses = {
    active: 'text-green-400',
    inactive: 'text-rensto-text-muted',
    loading: 'text-yellow-400 animate-pulse',
    error: 'text-red-400'
  };

  return (
    <RenstoCard variant={variant} className={cn('group', className)}>
      <div className="flex items-start gap-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-rensto-text-primary group-hover:text-rensto-cyan transition-colors">
              {title}
            </h3>
            <div className={cn('w-2 h-2 rounded-full', statusClasses[status])} />
          </div>
          <p className="text-rensto-text-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </RenstoCard>
  );
}

export default RenstoCard;
