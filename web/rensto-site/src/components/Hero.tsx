'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { env } from '@/lib/env';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
    )
    .fromTo(
      subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    )
    .fromTo(
      ctaRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );

    // Parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      if (heroRef.current) {
        gsap.set(heroRef.current, { y: rate });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent1/20" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent1/10 rounded-full blur-3xl rensto-animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent2/10 rounded-full blur-3xl rensto-animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 text-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold logo-glow mb-4">
            {env.NEXT_PUBLIC_SITE_NAME}
          </h1>
        </div>

        {/* Main headline */}
        <h2 
          ref={titleRef}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
        >
          Automations that ship in{' '}
          <span className="gradient-text">days</span>
          <br />
          not months
        </h2>

        {/* Subtitle */}
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-muted mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Transform your manual processes into intelligent workflows. 
          Built for SMBs and Amazon sellers who need results fast.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href={env.NEXT_PUBLIC_STRIPE_LINK_AUDIT || '/offers'}
            className="btn-primary text-lg px-8 py-4"
          >
            Get Started - $499
          </Link>
          <Link 
            href="/process"
            className="btn-secondary text-lg px-8 py-4"
          >
            See How It Works
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-muted text-sm">
          <p>Trusted by Amazon sellers and SMBs nationwide</p>
          <p className="mt-2">📍 Plano, TX • ⚡ Production-ready in days</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted rounded-full mt-2 rensto-animate-pulse" />
        </div>
      </div>
    </section>
  );
}
