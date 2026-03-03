import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const PHI = 1.618033988749895;

const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const NUM_PARTICLES = 30;
const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    baseX: seededRandom(i * PHI),
    baseY: seededRandom(i * PHI * PHI),
    size: 1 + seededRandom(i * 7.31) * 3,
    speedX: 0.06 + seededRandom(i * 3.17) * 0.3,
    speedY: 0.05 + seededRandom(i * 5.23) * 0.2,
    phase: seededRandom(i * 11.37) * Math.PI * 2,
    maxOpacity: 0.08 + seededRandom(i * 2.71) * 0.15,
}));

export const ParticleField: React.FC<{ accentColorRgb: string }> = ({ accentColorRgb }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
            {PARTICLES.map((p, i) => {
                const x = (p.baseX * width + Math.sin(frame * 0.02 * p.speedX + p.phase) * 50) % width;
                const y = (p.baseY * height + Math.cos(frame * 0.015 * p.speedY + p.phase * 0.7) * 35) % height;
                const op = p.maxOpacity * (0.4 + Math.sin(frame * 0.04 + i * 2.1) * 0.6);
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute", left: x, top: y,
                            width: p.size, height: p.size, borderRadius: "50%",
                            background: `rgba(${accentColorRgb}, ${op})`,
                            filter: p.size > 2.5 ? "blur(1px)" : undefined,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
