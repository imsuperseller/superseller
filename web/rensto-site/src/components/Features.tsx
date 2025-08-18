'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Shield, Clock, Users, Code, TrendingUp } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: Zap,
    title: "Speed with Safety",
    description: "Production-ready in days with security-first approach and automated testing."
  },
  {
    icon: Shield,
    title: "Client Ownership",
    description: "You own the infrastructure. No vendor lock-in, complete documentation provided."
  },
  {
    icon: Clock,
    title: "Fixed Pricing",
    description: "No hourly billing surprises. Clear scope, deliverables, and money-back guarantee."
  },
  {
    icon: Code,
    title: "n8n-First",
    description: "Visual workflow builder with 400+ integrations and self-hosted options."
  },
  {
    icon: Users,
    title: "WIP Limits",
    description: "Max 2 concurrent builds ensures 100% focus on your project for faster delivery."
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description: "80% reduction in manual tasks, 10+ hours saved weekly for our clients."
  }
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !featuresRef.current) return;

    const featureCards = featuresRef.current.querySelectorAll('.feature-card');

    gsap.fromTo(
      featureCards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="section bg-card/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Rensto?
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            We deliver automations that actually work, with a process that&apos;s transparent and results you can measure.
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card card group hover:scale-105 transition-transform duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="card">
            <div className="text-3xl font-bold gradient-text mb-2">80%</div>
            <div className="text-muted">Reduction in manual tasks</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold gradient-text mb-2">10+</div>
            <div className="text-muted">Hours saved per week</div>
          </div>
          <div className="card">
            <div className="text-3xl font-bold gradient-text mb-2">3</div>
            <div className="text-muted">Days to production</div>
          </div>
        </div>
      </div>
    </section>
  );
}
