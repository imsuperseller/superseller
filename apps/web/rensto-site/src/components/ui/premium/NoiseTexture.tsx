import React from 'react';

export const NoiseTexture = ({ opacity = 0.03 }: { opacity?: number }) => (
    <div
        className="fixed inset-0 z-[100] pointer-events-none mix-blend-overlay"
        style={{ opacity }}
    >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
    </div>
);
