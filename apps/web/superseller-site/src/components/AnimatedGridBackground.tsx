'use client';

import React from 'react';

interface AnimatedGridBackgroundProps {
    className?: string;
}

export function AnimatedGridBackground({ className = '' }: AnimatedGridBackgroundProps) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Base gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30, 174, 247, 0.15), transparent 70%)'
                }}
            />

            {/* Animated grid lines */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(30, 174, 247, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(30, 174, 247, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    animation: 'gridMove 20s linear infinite'
                }}
            />

            {/* Floating particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: `${2 + (i % 4)}px`,
                            height: `${2 + (i % 4)}px`,
                            left: `${(i * 5) % 100}%`,
                            top: `${(i * 7) % 100}%`,
                            background: i % 3 === 0
                                ? 'var(--superseller-cyan)'
                                : i % 3 === 1
                                    ? 'var(--superseller-blue)'
                                    : 'var(--superseller-primary)',
                            opacity: 0.3 + (i % 3) * 0.1,
                            animation: `particleFloat ${10 + (i % 10)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* Glowing orbs */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-30"
                style={{
                    background: 'var(--superseller-blue)',
                    top: '-10%',
                    right: '-10%',
                    animation: 'orbPulse 8s ease-in-out infinite'
                }}
            />
            <div
                className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
                style={{
                    background: 'var(--superseller-cyan)',
                    bottom: '-5%',
                    left: '-5%',
                    animation: 'orbPulse 10s ease-in-out infinite',
                    animationDelay: '2s'
                }}
            />
            <div
                className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-15"
                style={{
                    background: 'var(--superseller-primary)',
                    top: '50%',
                    left: '30%',
                    animation: 'orbPulse 12s ease-in-out infinite',
                    animationDelay: '4s'
                }}
            />

            {/* Scan line effect */}
            <div
                className="absolute left-0 right-0 h-[2px] opacity-30"
                style={{
                    background: 'linear-gradient(90deg, transparent, var(--superseller-cyan), transparent)',
                    animation: 'scanLine 10s linear infinite'
                }}
            />
        </div>
    );
}

