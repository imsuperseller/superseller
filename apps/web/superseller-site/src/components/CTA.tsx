'use client';

import { useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { gsap } from 'gsap';
import { env } from '@/lib/env';

export function CTA() {
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ctaRef.current) return;

    gsap.fromTo(
      ctaRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <section ref={ctaRef} className="section bg-gradient-to-r from-accent1/20 to-accent2/20">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
          Join thousands of businesses using our universal automation platform. Works for any industry, any size.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link 
            href="/pricing"
            className="btn-primary text-lg px-8 py-4"
          >
            Start Free Trial
          </Link>
          <Link 
            href="/contact"
            className="btn-secondary text-lg px-8 py-4"
          >
            View Pricing
          </Link>
        </div>

        <div className="text-sm text-muted">
          <p>📍 Based in Torrance • ⚡ Response within 24 hours</p>
          <p className="mt-1">📧 {env.NEXT_PUBLIC_CONTACT_EMAIL}</p>
        </div>
      </div>
    </section>
  );
}
