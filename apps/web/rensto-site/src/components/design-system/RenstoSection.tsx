'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface RenstoSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  title?: string;
  subtitle?: string;
}

export function RenstoSection({ 
  children, 
  variant = 'primary',
  title,
  subtitle,
  className = '',
  ...props 
}: RenstoSectionProps) {
  const variantStyles = {
    primary: {
      background: 'var(--rensto-bg-primary)',
    },
    secondary: {
      background: 'var(--rensto-bg-secondary)',
    },
  };

  const styles = variantStyles[variant];

  return (
    <section
      className={`py-16 px-4 ${className}`}
      style={styles}
      {...props}
    >
      <div className="container mx-auto">
        {title && (
          <div className="text-center mb-12">
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ color: 'var(--rensto-text-primary)' }}
            >
              {title}
            </h2>
            {subtitle && (
              <p 
                className="text-xl max-w-3xl mx-auto"
                style={{ color: 'var(--rensto-text-secondary)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

