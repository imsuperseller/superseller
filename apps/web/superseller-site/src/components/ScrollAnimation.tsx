'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as framer from 'framer-motion';
const { motion, useScroll, useTransform, useMotionValueEvent } = framer;

interface ScrollAnimationProps {
  /** Path to the video file (relative to public/) */
  videoSrc: string;
  /** Height of the scroll container as a multiple of viewport height (default: 3) */
  scrollHeight?: number;
  /** Optional overlay content rendered on top of the video */
  children?: React.ReactNode;
  /** CSS class for the outer container */
  className?: string;
  /** Whether to show debug info (scroll %, frame) */
  debug?: boolean;
}

/**
 * Scroll-synced video playback component.
 * Maps scroll position to video.currentTime for Apple-style frame-by-frame animation.
 *
 * Usage:
 *   <ScrollAnimation videoSrc="/videos/crew-reveal.mp4" scrollHeight={4}>
 *     <h2>Your content on top</h2>
 *   </ScrollAnimation>
 *
 * The video plays forward as the user scrolls down, and rewinds when scrolling up.
 * The video element is pinned (sticky) in the viewport while the container scrolls.
 */
export function ScrollAnimation({
  videoSrc,
  scrollHeight = 3,
  children,
  className = '',
  debug = false,
}: ScrollAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress [0,1] to video time
  const updateVideoTime = useCallback(
    (progress: number) => {
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) return;
      // Clamp to avoid edge-case seeks past duration
      const targetTime = Math.min(progress * video.duration, video.duration - 0.01);
      if (Math.abs(video.currentTime - targetTime) > 0.02) {
        video.currentTime = targetTime;
      }
    },
    []
  );

  useMotionValueEvent(scrollYProgress, 'change', updateVideoTime);

  // On mount: preload video, seek to frame 0, pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  // Opacity: fully visible from start, fade out at end
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.9, 1],
    [1, 1, 0]
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${scrollHeight * 100}vh` }}
    >
      {/* Sticky viewport — video pins here while container scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity }}>
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
          />
        </motion.div>

        {/* Overlay content */}
        {children && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {children}
          </div>
        )}

        {/* Debug overlay */}
        {debug && (
          <motion.div
            className="absolute top-4 right-4 z-20 bg-black/80 text-white text-xs font-mono px-3 py-2 rounded-lg"
            style={{ opacity: 0.8 }}
          >
            <DebugInfo scrollYProgress={scrollYProgress} videoRef={videoRef} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

/** Debug component — shows scroll % and video time */
function DebugInfo({
  scrollYProgress,
  videoRef,
}: {
  scrollYProgress: framer.MotionValue<number>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const progress = framer.useMotionValue(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => progress.set(v));

  return (
    <motion.span>
      Scroll: {Math.round(progress.get() * 100)}% | Time:{' '}
      {videoRef.current?.currentTime?.toFixed(2) ?? '0.00'}s
    </motion.span>
  );
}
