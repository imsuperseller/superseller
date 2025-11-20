'use client';

import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
    result: string;
}

// Fallback testimonials (same as API fallback)
const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
        quote: "Rensto transformed our lead management process. What used to take 3 hours daily now happens automatically in minutes.",
        author: "Michael Chen",
        role: "Operations Director",
        company: "Premier HVAC Services",
        rating: 5,
        result: "Saved 15hrs/week"
    },
    {
        quote: "The custom Voice AI agent handles our appointment scheduling flawlessly. Our booking rate increased by 40% in the first month.",
        author: "Sarah Martinez",
        role: "Practice Manager",
        company: "Wellness Dental Group",
        rating: 5,
        result: "+40% bookings"
    },
    {
        quote: "Best investment we've made. The automation system paid for itself in 6 weeks and continues to save us thousands monthly.",
        author: "David Thompson",
        role: "CEO",
        company: "Thompson Insurance Agency",
        rating: 5,
        result: "6-week ROI"
    }
];

export function TestimonialSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch testimonials from API
        fetch('/api/testimonials')
            .then(res => res.json())
            .then(data => {
                if (data.testimonials && data.testimonials.length > 0) {
                    setTestimonials(data.testimonials);
                }
            })
            .catch(error => {
                console.error('Error fetching testimonials:', error);
                // Keep fallback testimonials on error
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const current = testimonials[currentIndex];

    if (isLoading) {
        return (
            <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="text-xl" style={{ color: 'var(--rensto-text-secondary)' }}>
                        Loading testimonials...
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4" style={{ background: 'var(--rensto-bg-secondary)' }}>
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--rensto-text-primary)' }}>
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-xl" style={{ color: 'var(--rensto-text-secondary)' }}>
                        See how custom automation transformed their businesses
                    </p>
                </div>

                <div className="relative">
                    {/* Main testimonial card */}
                    <div
                        className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-white/10 bg-black/40 backdrop-blur-xl"
                        style={{
                            boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
                        }}
                    >
                        {/* Quote icon */}
                        <div className="absolute top-8 left-8 opacity-10">
                            <Quote className="w-24 h-24" style={{ color: 'var(--rensto-primary)' }} />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Rating */}
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(current.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-5 h-5 fill-current"
                                        style={{ color: '#FFD700' }}
                                    />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-xl md:text-2xl font-medium text-center mb-8 leading-relaxed" style={{ color: 'var(--rensto-text-primary)' }}>
                                &ldquo;{current.quote}&rdquo;
                            </blockquote>

                            {/* Author info */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                                <div className="text-center md:text-left">
                                    <div className="font-bold text-lg" style={{ color: 'var(--rensto-text-primary)' }}>
                                        {current.author}
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--rensto-text-secondary)' }}>
                                        {current.role} at {current.company}
                                    </div>
                                </div>
                                <div
                                    className="px-4 py-2 rounded-full text-sm font-bold"
                                    style={{
                                        background: 'rgba(95, 251, 253, 0.15)',
                                        color: 'var(--rensto-accent-cyan)',
                                        border: '1px solid rgba(95, 251, 253, 0.3)'
                                    }}
                                >
                                    {current.result}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={prevTestimonial}
                            className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20"
                            style={{
                                boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)'
                            }}
                        >
                            <ChevronLeft className="w-6 h-6" style={{ color: 'var(--rensto-text-primary)' }} />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20"
                            style={{
                                boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)'
                            }}
                        >
                            <ChevronRight className="w-6 h-6" style={{ color: 'var(--rensto-text-primary)' }} />
                        </button>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'w-8' : ''
                                    }`}
                                style={{
                                    background: index === currentIndex
                                        ? 'var(--rensto-primary)'
                                        : 'rgba(255, 255, 255, 0.3)'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
