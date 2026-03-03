import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * CSS-only iPhone-style phone frame.
 * Children are rendered inside the viewport (the "screen").
 */
export const PhoneMockup: React.FC<{
    accentColorRgb: string;
    children: React.ReactNode;
    /** Overall scale factor (derived from composition dimensions) */
    scale?: number;
    /** Delay entrance animation by N frames */
    delay?: number;
}> = ({ accentColorRgb, children, scale = 1, delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const enterFrame = Math.max(0, frame - delay);
    const enterSpring = spring({
        frame: enterFrame,
        fps,
        config: { damping: 12, stiffness: 55, mass: 1.8 },
    });

    const translateY = interpolate(enterSpring, [0, 1], [80, 0]);
    const scaleAnim = interpolate(enterSpring, [0, 1], [0.85, 1]);
    const opacity = interpolate(enterSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

    // Glow pulse when visible
    const glowPulse = enterSpring > 0.8 ? 0.6 + Math.sin(frame * 0.06) * 0.4 : 0;

    const phoneWidth = 320 * scale;
    const phoneHeight = 640 * scale;
    const bezelWidth = 10 * scale;
    const borderRadius = 40 * scale;
    const notchWidth = 100 * scale;
    const notchHeight = 22 * scale;
    const homeBarWidth = 110 * scale;
    const homeBarHeight = 4 * scale;

    return (
        <div
            style={{
                width: phoneWidth,
                height: phoneHeight,
                position: "relative",
                opacity,
                transform: `translateY(${translateY}px) scale(${scaleAnim})`,
            }}
        >
            {/* Accent glow behind phone */}
            <div
                style={{
                    position: "absolute",
                    inset: -30 * scale,
                    borderRadius: borderRadius + 20,
                    background: `radial-gradient(circle, rgba(${accentColorRgb}, ${0.2 * glowPulse}), transparent 70%)`,
                    filter: `blur(${25 * scale}px)`,
                    pointerEvents: "none",
                }}
            />

            {/* Phone body */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius,
                    border: `${bezelWidth}px solid #1a1a1a`,
                    background: "#1a1a1a",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: `
                        0 25px 60px rgba(0,0,0,0.6),
                        0 0 ${30 * glowPulse}px rgba(${accentColorRgb}, ${0.25 * glowPulse}),
                        inset 0 1px 0 rgba(255,255,255,0.05)
                    `,
                }}
            >
                {/* Viewport (screen) */}
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: borderRadius - bezelWidth,
                        position: "relative",
                        background: "#000",
                    }}
                >
                    {children}
                </div>

                {/* Notch */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: notchWidth,
                        height: notchHeight,
                        background: "#1a1a1a",
                        borderRadius: `0 0 ${14 * scale}px ${14 * scale}px`,
                        zIndex: 10,
                    }}
                />

                {/* Home indicator bar */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 6 * scale,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: homeBarWidth,
                        height: homeBarHeight,
                        background: "rgba(255,255,255,0.3)",
                        borderRadius: homeBarHeight / 2,
                        zIndex: 10,
                    }}
                />
            </div>
        </div>
    );
};
