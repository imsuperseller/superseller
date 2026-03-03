import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedBg: React.FC<{ accentColorRgb?: string }> = ({ accentColorRgb }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const color1 = interpolateColors(
        frame,
        [0, durationInFrames * 0.3, durationInFrames * 0.6, durationInFrames],
        ["#0a1628", "#100a28", "#0a2018", "#0a1628"]
    );
    const color2 = interpolateColors(
        frame,
        [0, durationInFrames * 0.5, durationInFrames],
        ["#0d1b2e", "#180d2e", "#0d1b2e"]
    );
    const angle = interpolate(frame, [0, durationInFrames], [135, 200]);

    return (
        <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }} />
    );
};
