import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
    const frame = useCurrentFrame();
    const filterId = `grain-${frame % 60}`;
    return (
        <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <filter id={filterId}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={frame * 2} stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter={`url(#${filterId})`} />
            </svg>
        </AbsoluteFill>
    );
};
