import React from 'react';
import { cn } from '@/lib/utils';

interface RenstoButtonProps {
  variant?: 'primary' | 'secondary' | 'neon' | 'ghost' | 'brand' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'shimmer' | 'glow' | 'pulse';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function RenstoButton({ 
  variant = 'primary', 
  size = 'md',
  animation = 'none',
  children, 
  className,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left'
}: RenstoButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-rensto-red to-rensto-orange text-white border border-transparent hover:shadow-rensto-glow-primary hover:scale-105 focus:ring-rensto-red',
    secondary: 'bg-gradient-to-r from-rensto-blue to-rensto-cyan text-white border border-transparent hover:shadow-rensto-glow-secondary hover:scale-105 focus:ring-rensto-blue',
    neon: 'bg-transparent text-rensto-cyan border border-rensto-cyan hover:bg-rensto-cyan/10 hover:shadow-rensto-glow-accent hover:scale-105 focus:ring-rensto-cyan',
    ghost: 'bg-transparent text-rensto-text-primary hover:bg-rensto-bg-secondary hover:text-rensto-cyan focus:ring-rensto-blue',
    brand: 'bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue text-white border border-transparent hover:shadow-rensto-glow-primary hover:scale-105 focus:ring-rensto-red',
    gradient: 'bg-gradient-to-r from-rensto-blue via-rensto-cyan to-rensto-blue text-white border border-transparent hover:shadow-rensto-glow-secondary hover:scale-105 focus:ring-rensto-blue'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const animationClasses = {
    none: '',
    shimmer: 'animate-rensto-shimmer bg-gradient-to-r from-rensto-red via-rensto-orange to-rensto-blue bg-[length:200%_100%]',
    glow: 'animate-rensto-glow',
    pulse: 'animate-rensto-pulse'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <button 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        animationClasses[animation],
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizeClasses[size])} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </button>
  );
}

// Specialized button variants
export function RenstoIconButton({ 
  icon, 
  variant = 'ghost',
  size = 'md',
  animation = 'none',
  className,
  onClick,
  disabled = false,
  loading = false,
  title
}: {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'neon' | 'ghost' | 'brand' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'shimmer' | 'glow' | 'pulse';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  return (
    <RenstoButton
      variant={variant}
      size={size}
      animation={animation}
      className={cn('p-0', sizeClasses[size], className)}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      title={title}
    >
      <span className={iconSizeClasses[size]}>{icon}</span>
    </RenstoButton>
  );
}

export function RenstoActionButton({ 
  action, 
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false
}: {
  action: 'create' | 'edit' | 'delete' | 'save' | 'cancel' | 'export' | 'import';
  variant?: 'primary' | 'secondary' | 'neon' | 'ghost' | 'brand' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const actionConfig = {
    create: { icon: '➕', text: 'Create' },
    edit: { icon: '✏️', text: 'Edit' },
    delete: { icon: '🗑️', text: 'Delete' },
    save: { icon: '💾', text: 'Save' },
    cancel: { icon: '❌', text: 'Cancel' },
    export: { icon: '📤', text: 'Export' },
    import: { icon: '📥', text: 'Import' }
  };

  const config = actionConfig[action];

  return (
    <RenstoButton
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      icon={config.icon}
    >
      {config.text}
    </RenstoButton>
  );
}

export default RenstoButton;
