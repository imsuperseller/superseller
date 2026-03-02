'use client';

import { useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import NextImage from 'next/image';
import { gsap } from 'gsap';
import { Shield, Clock, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button-enhanced';

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
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent1/20" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent1/10 rounded-full blur-3xl superseller-animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent2/10 rounded-full blur-3xl superseller-animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 px-4">

        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left Column: Copy */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 mx-auto lg:mx-0"
              style={{
                background: 'rgba(244, 121, 32, 0.1)',
                border: '1px solid var(--superseller-primary)',
                color: 'var(--superseller-primary)'
              }}
            >
              <Shield className="w-4 h-4" />
              Specialized Business Automation
            </div>

            <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic text-white">
              Every missed call is a <span className="text-cyan-400">job you gave away.</span>
            </h1>

            <p ref={subtitleRef} className="text-xl md:text-2xl text-muted mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Stop the Manual Work Tax. Deploy autonomous agents that handle sales, support, and operations 24/7.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link href="/offers">
                <Button size="xl" className="font-bold px-8 py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  See Plans & Tokens <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/process">
                <Button size="xl" variant="outline" className="font-bold px-8 py-6 text-lg border-white/20 hover:bg-white/10 text-white">
                  Watch 60s Overview
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Proof (Split Screen) */}
          <div className="lg:w-1/2 w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d0922]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

              {/* Visual Header */}
              <div className="flex border-b border-white/10">
                <div className="w-1/2 p-3 text-center bg-red-950/20 border-r border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">Your Current Reality</span>
                </div>
                <div className="w-1/2 p-3 text-center bg-cyan-950/20">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">The New Standard</span>
                </div>
              </div>

              {/* Visual Content */}
              <div className="flex h-[320px]">
                {/* Chaos Side */}
                <div className="w-1/2 relative overflow-hidden group">
                  <NextImage
                    src="/images/hero/chaos.png"
                    alt="Chaos"
                    fill
                    className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 grayscale"
                  />
                  <div className="absolute inset-0 bg-red-950/40" />
                  <div className="relative z-10 p-6 flex flex-col gap-4 h-full">
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5 opacity-50 blur-[0.5px]">
                        <div className="h-2 w-1/3 bg-slate-700 rounded mb-2"></div>
                        <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                      </div>
                      <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30 flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-[10px] text-red-300 font-bold uppercase">Manual Error Tax</span>
                      </div>
                      <div className="mt-8 text-center">
                        <span className="text-2xl font-black text-white/50 block mb-1">CHAOS</span>
                        <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Business Liability</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Side - The Stitch Dashboard */}
                <div className="w-1/2 relative overflow-hidden group bg-black">
                  <NextImage
                    src="/images/hero/dashboard.png"
                    alt="SuperSeller AI Dashboard"
                    fill
                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="relative z-10 p-6 flex flex-col gap-4 h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30 flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md">
                        <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                          <Check className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-[10px] text-white font-black uppercase tracking-widest">A.N.T. Automation Active</div>
                          <div className="text-[9px] text-cyan-200/80">Profit efficiency +42%</div>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-1 w-8 bg-cyan-500 rounded-full" />
                          <span className="text-2xl font-black text-white tracking-widest uppercase italic">ORDER</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 font-black">SuperSeller AI Master Pattern</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted rounded-full mt-2 superseller-animate-pulse" />
          </div>
        </div>

      </div>
    </section>
  );
}
