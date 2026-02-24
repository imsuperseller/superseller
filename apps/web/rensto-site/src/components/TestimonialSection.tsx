'use client';

import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Heart, Send, X } from 'lucide-react';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
    result: string;
    avatar?: string | null;
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formData, setFormData] = useState({
        author: '',
        role: '',
        company: '',
        quote: '',
        rating: 5,
        result: ''
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    setIsModalOpen(false);
                    setSubmitSuccess(false);
                    setFormData({ author: '', role: '', company: '', quote: '', rating: 5, result: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Testimonial submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
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
                                {current.avatar && (
                                    <img
                                        src={current.avatar}
                                        alt={current.author}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                                    />
                                )}
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
                    <div className="flex justify-between items-center mt-8">
                        <div className="flex gap-4">
                            <button
                                onClick={prevTestimonial}
                                className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20"
                                style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)' }}
                            >
                                <ChevronLeft className="w-6 h-6" style={{ color: 'var(--rensto-text-primary)' }} />
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="p-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20"
                                style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)' }}
                            >
                                <ChevronRight className="w-6 h-6" style={{ color: 'var(--rensto-text-primary)' }} />
                            </button>
                        </div>

                        {/* Spread the Love Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, var(--rensto-primary) 0%, #ff6b6b 100%)',
                                color: 'white',
                                boxShadow: '0 10px 30px -10px rgba(254, 61, 81, 0.5)'
                            }}
                        >
                            <Heart className="w-5 h-5 fill-current" />
                            Spread the Love
                        </button>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'w-8' : ''}`}
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

            {/* Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg bg-[#1a1438] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8">
                            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--rensto-text-primary)' }}>
                                Share Your Experience
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Your feedback helps us build the future of business automation.
                            </p>

                            {submitSuccess ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart className="w-10 h-10 text-green-500 fill-current" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2">Thank You!</h4>
                                    <p className="text-gray-400">Your testimonial was sent for approval. It will be live soon!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#fe3d51] transition-colors"
                                                placeholder="John Doe"
                                                value={formData.author}
                                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Company</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#fe3d51] transition-colors"
                                                placeholder="Acme Corp"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Role</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#fe3d51] transition-colors"
                                                placeholder="CEO"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Result (e.g. Saved 10h/wk)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#fe3d51] transition-colors"
                                                placeholder="+30% growth"
                                                value={formData.result}
                                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Quote</label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#fe3d51] transition-colors resize-none"
                                            placeholder="Tell us how Rensto helped you..."
                                            value={formData.quote}
                                            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className="transition-transform active:scale-90"
                                                >
                                                    <Star className={`w-6 h-6 ${formData.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-[#fe3d51] hover:bg-[#ff4d5d] active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Sending...' : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Testimonial
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
