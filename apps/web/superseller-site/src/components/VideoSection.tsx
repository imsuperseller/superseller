'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoSectionProps {
    videoUrl?: string;
    title?: string;
    description?: string;
}

export function VideoSection({
    videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder - replace with actual video
    title = 'See How It Works',
    description = 'Watch this 60-second overview of how our custom automation transforms your business'
}: VideoSectionProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLIFrameElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            const iframe = videoRef.current;
            const message = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
            iframe.contentWindow?.postMessage(message, '*');
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section className="py-16 px-4" style={{ background: 'var(--superseller-bg-primary)' }}>
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--superseller-text-primary)' }}>
                        {title}
                    </h2>
                    <p className="text-xl" style={{ color: 'var(--superseller-text-secondary)' }}>
                        {description}
                    </p>
                </div>

                <div
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl"
                    style={{
                        boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
                        paddingBottom: '56.25%' // 16:9 aspect ratio
                    }}
                >
                    <iframe
                        ref={videoRef}
                        className="absolute top-0 left-0 w-full h-full"
                        src={`${videoUrl}?enablejsapi=1`}
                        title="SuperSeller AI Automation Overview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        style={{
                            border: 'none',
                            borderRadius: '1.5rem'
                        }}
                    />

                    {/* Custom play/pause overlay (optional) */}
                    {!isPlaying && (
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={togglePlay}
                            style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                style={{
                                    background: 'var(--superseller-primary)',
                                    boxShadow: '0 0 40px rgba(254, 61, 81, 0.5)'
                                }}
                            >
                                <Play className="w-10 h-10 text-white ml-1" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Video stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-2" style={{ color: 'var(--superseller-primary)' }}>
                            60s
                        </div>
                        <div className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>
                            Quick Overview
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-2" style={{ color: 'var(--superseller-accent-cyan)' }}>
                            5 Steps
                        </div>
                        <div className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>
                            Simple Process
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold mb-2" style={{ color: 'var(--superseller-accent-blue)' }}>
                            100% Free
                        </div>
                        <div className="text-sm" style={{ color: 'var(--superseller-text-secondary)' }}>
                            No Commitment
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
