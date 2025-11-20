'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';

interface YouTubeVideoModalProps {
  videoId: string | null;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function YouTubeVideoModal({ 
  videoId, 
  isOpen, 
  onClose, 
  title = 'Demo Video' 
}: YouTubeVideoModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoId) {
    return null;
  }

  // YouTube embed URL with privacy-enhanced mode
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxHeight: '90vh',
          boxShadow: '0 0 40px rgba(254, 61, 81, 0.3)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(254, 61, 81, 0.2)' }}>
          <h3 className="text-xl font-bold" style={{ color: 'var(--rensto-text-primary)' }}>
            {title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:opacity-80"
            style={{ color: 'var(--rensto-text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

