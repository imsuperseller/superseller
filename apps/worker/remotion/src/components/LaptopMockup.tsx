import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * CSS-only MacBook-style laptop frame.
 * Children are rendered inside the viewport (the "screen").
 */
export const LaptopMockup: React.FC<{
    accentColorRgb: string;
    children: React.ReactNode;
    scale?: number;
    delay?: number;
}> = ({ accentColorRgb, children, scale = 1, delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const enterFrame = Math.max(0, frame - delay);
    const enterSpring = spring({
        frame: enterFrame,
        fps,
        config: { damping: 14, stiffness: 50, mass: 2.0 },
    });

    const scaleAnim = interpolate(enterSpring, [0, 1], [0.85, 1]);
    const opacity = interpolate(enterSpring, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

    const glowPulse = enterSpring > 0.8 ? 0.6 + Math.sin(frame * 0.06) * 0.4 : 0;

    const screenWidth = 720 * scale;
    const screenHeight = 450 * scale;
    const bezelWidth = 8 * scale;
    const borderRadius = 12 * scale;
    const baseHeight = 16 * scale;
    const cameraDotSize = 5 * scale;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity,
                transform: `scale(${scaleAnim})`,
            }}
        >
            {/* Screen housing */}
            <div
                style={{
                    position: "relative",
                    width: screenWidth + bezelWidth * 2,
                    height: screenHeight + bezelWidth * 2 + cameraDotSize + 6 * scale,
                    borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
                    background: "#1a1a1a",
                    padding: `${cameraDotSize + 6 * scale}px ${bezelWidth}px ${bezelWidth}px`,
                    boxShadow: `
                        0 20px 50px rgba(0,0,0,0.5),
                        0 0 ${25 * glowPulse}px rgba(${accentColorRgb}, ${0.2 * glowPulse}),
                        inset 0 1px 0 rgba(255,255,255,0.08)
                    `,
                }}
            >
                {/* Camera dot */}
                <div
                    style={{
                        position: "absolute",
                        top: 4 * scale,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: cameraDotSize,
                        height: cameraDotSize,
                        borderRadius: "50%",
                        background: "#333",
                        border: "1px solid #444",
                    }}
                />

                {/* Screen viewport */}
                <div
                    style={{
                        width: screenWidth,
                        height: screenHeight,
                        overflow: "hidden",
                        borderRadius: borderRadius - 4,
                        background: "#000",
                        position: "relative",
                    }}
                >
                    {children}
                </div>
            </div>

            {/* Keyboard base — subtle wedge shape */}
            <div
                style={{
                    width: screenWidth + bezelWidth * 2 + 40 * scale,
                    height: baseHeight,
                    background: "linear-gradient(180deg, #2a2a2a, #1f1f1f)",
                    borderRadius: `0 0 ${6 * scale}px ${6 * scale}px`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    position: "relative",
                }}
            >
                {/* Hinge line */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "10%",
                        right: "10%",
                        height: 1,
                        background: "rgba(255,255,255,0.06)",
                    }}
                />
                {/* Center notch / trackpad hint */}
                <div
                    style={{
                        position: "absolute",
                        top: 3 * scale,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 60 * scale,
                        height: 3 * scale,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.04)",
                    }}
                />
            </div>
        </div>
    );
};
