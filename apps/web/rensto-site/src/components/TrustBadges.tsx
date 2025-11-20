'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Award, Users, TrendingUp, CheckCircle } from 'lucide-react';

export function TrustBadges() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const badges = [
        {
            icon: Shield,
            label: 'Enterprise Security',
            description: 'Bank-level encryption',
            color: 'var(--rensto-accent-cyan)'
        },
        {
            icon: Lock,
            label: 'GDPR Compliant',
            description: 'Data protection certified',
            color: 'var(--rensto-primary)'
        },
        {
            icon: Award,
            label: '99.9% Uptime',
            description: 'Guaranteed reliability',
            color: 'var(--rensto-accent-blue)'
        },
        {
            icon: CheckCircle,
            label: 'Custom Built',
            description: 'Tailored to your needs',
            color: 'var(--rensto-accent-cyan)'
        },
        {
            icon: TrendingUp,
            label: 'Proven Results',
            description: 'Real business impact',
            color: 'var(--rensto-primary)'
        },
        {
            icon: Users,
            label: 'Expert Team',
            description: 'Dedicated specialists',
            color: 'var(--rensto-accent-blue)'
        }
    ];

    return (
        <section className="py-12 px-4">
            <div className="container mx-auto">
                <div
                    className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    {badges.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={index}
                                className="relative group"
                                style={{
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                <div
                                    className="relative overflow-hidden rounded-xl p-4 text-center border border-white/10 bg-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
                                    style={{
                                        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)'
                                    }}
                                >
                                    {/* Icon */}
                                    <div className="flex justify-center mb-3">
                                        <div
                                            className="p-3 rounded-lg transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                background: `rgba(${badge.color === 'var(--rensto-primary)' ? '254, 61, 81' : badge.color === 'var(--rensto-accent-cyan)' ? '95, 251, 253' : '30, 174, 247'}, 0.15)`,
                                                border: `1px solid rgba(${badge.color === 'var(--rensto-primary)' ? '254, 61, 81' : badge.color === 'var(--rensto-accent-cyan)' ? '95, 251, 253' : '30, 174, 247'}, 0.3)`
                                            }}
                                        >
                                            <Icon
                                                className="w-6 h-6"
                                                style={{ color: badge.color }}
                                            />
                                        </div>
                                    </div>

                                    {/* Label */}
                                    <div className="text-sm font-bold mb-1" style={{ color: 'var(--rensto-text-primary)' }}>
                                        {badge.label}
                                    </div>

                                    {/* Description */}
                                    <div className="text-xs" style={{ color: 'var(--rensto-text-secondary)' }}>
                                        {badge.description}
                                    </div>

                                    {/* Hover glow effect */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle at center, ${badge.color}15 0%, transparent 70%)`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
