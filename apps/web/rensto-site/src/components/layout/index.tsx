import React from 'react';
import { renstoStyles, animationClasses } from '@/lib/rensto-styles';

// Professional page layout
export const PageLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ children, title, subtitle, actions }) => {
  return (
    <div className={`min-h-screen ${renstoStyles.bgPrimary}`}>
      <div className="container mx-auto px-4 py-8">
        {(title || subtitle || actions) && (
          <div className={`mb-8 p-6 rounded-lg ${renstoStyles.bgCard} border border-rensto-bg-secondary ${animationClasses.fadeIn}`}>
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className={`text-3xl font-bold ${renstoStyles.textPrimary} mb-2`}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className={`text-lg ${renstoStyles.textSecondary}`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={`${animationClasses.fadeIn}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Professional section layout
export const SectionLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}> = ({ children, title, description, className = '' }) => {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className={`text-2xl font-semibold ${renstoStyles.textPrimary} mb-2`}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`text-base ${renstoStyles.textSecondary}`}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

// Professional grid layout
export const GridLayout: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, cols = 3, gap = 'md', className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gridGap = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`}>
      {children}
    </div>
  );
};
