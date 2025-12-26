'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TypeformEmbedProps {
  formId: string;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TypeformEmbed({ formId, height = 600, className = '', style = {} }: TypeformEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Typeform initialization logic if needed
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: `${height}px`, ...style }}
    >
      <div
        data-tf-widget={formId}
        data-tf-opacity="100"
        data-tf-iframe-props={`title=${encodeURIComponent('Typeform')}`}
        data-tf-transitive-search-params
        data-tf-medium="snippet"
        style={{ width: '100%', height: '100%' }}
      />
      <Script
        src="https://embed.typeform.com/next/embed.js"
        strategy="lazyOnload"
      />
    </div>
  );
}

interface TypeformButtonProps {
  formId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function TypeformButton({ formId, children, className = '', style = {} }: TypeformButtonProps) {
  const openForm = () => {
    window.open(
      `https://form.typeform.com/to/${formId}`,
      '_blank',
      'width=800,height=600'
    );
  };

  return (
    <button
      onClick={openForm}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

