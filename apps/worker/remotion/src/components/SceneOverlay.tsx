import React from "react";
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { FONT_FAMILY, DISPLAY_FONT_FAMILY } from "../config/fonts";
import { sec } from "../config/timing";
import type { SceneOverlayConfig } from "../types/crew-demo-v3-props";

/**
 * SceneOverlay — text + branding floating ON full-screen AI video.
 * Semi-transparent gradient bands for legibility. 5 layout variants.
 */
export const SceneOverlay: React.FC<{
    config: SceneOverlayConfig;
    accentColor: string;
    accentColorRgb: string;
    icon: string;
    scale: number;
}> = ({ config, accentColor, accentColorRgb, icon, scale }) => {
    switch (config.layout) {
        case "hero-intro":
            return <HeroIntro config={config} accentColor={accentColor} accentColorRgb={accentColorRgb} icon={icon} scale={scale} />;
        case "core-action":
            return <CoreAction config={config} accentColor={accentColor} accentColorRgb={accentColorRgb} scale={scale} />;
        case "result-showcase":
            return <ResultShowcase config={config} accentColor={accentColor} accentColorRgb={accentColorRgb} scale={scale} />;
        case "scale-impact":
            return <ScaleImpact config={config} accentColor={accentColor} accentColorRgb={accentColorRgb} scale={scale} />;
        case "cta-outro":
            return <CtaOutro config={config} accentColor={accentColor} accentColorRgb={accentColorRgb} scale={scale} />;
        default:
            return null;
    }
};

// ─── Shared gradient band component ─────────────────────────────
const GradientBand: React.FC<{
    position: "bottom" | "top" | "center";
    children: React.ReactNode;
    style?: React.CSSProperties;
}> = ({ position, children, style }) => {
    const positionStyles: Record<string, React.CSSProperties> = {
        bottom: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "80px 60px 50px",
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        },
        top: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "50px 60px 80px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        },
        center: {
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            padding: "40px 60px",
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.7) 70%, transparent)",
        },
    };

    return (
        <div style={{ ...positionStyles[position], ...style }}>
            {children}
        </div>
    );
};

// ─── Layout 1: Hero Intro ───────────────────────────────────────
// Agent name + role + LIVE badge, bottom-aligned
const HeroIntro: React.FC<{
    config: SceneOverlayConfig;
    accentColor: string;
    accentColorRgb: string;
    icon: string;
    scale: number;
}> = ({ config, accentColor, accentColorRgb, icon, scale }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const iconSpring = spring({ frame, fps, config: { damping: 10, stiffness: 60, mass: 1.8 } });
    const nameFrame = Math.max(0, frame - sec(0.3));
    const nameSpring = spring({ frame: nameFrame, fps, config: { damping: 14, stiffness: 65, mass: 1.3 } });
    const roleFrame = Math.max(0, frame - sec(0.6));
    const roleSpring = spring({ frame: roleFrame, fps, config: { damping: 16, stiffness: 70, mass: 1.2 } });
    const badgeFrame = Math.max(0, frame - sec(0.9));
    const badgeSpring = spring({ frame: badgeFrame, fps, config: { damping: 18, stiffness: 75, mass: 1.1 } });

    return (
        <AbsoluteFill>
            <GradientBand position="bottom">
                <div style={{ display: "flex", alignItems: "center", gap: 24 * scale }}>
                    {/* Icon */}
                    <div
                        style={{
                            width: 80 * scale,
                            height: 80 * scale,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.3), rgba(${accentColorRgb}, 0.1))`,
                            border: `2px solid rgba(${accentColorRgb}, 0.6)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 38 * scale,
                            opacity: iconSpring,
                            transform: `scale(${interpolate(iconSpring, [0, 1], [0.3, 1])})`,
                            boxShadow: `0 0 25px rgba(${accentColorRgb}, 0.4)`,
                        }}
                    >
                        {icon}
                    </div>

                    <div>
                        {/* Name */}
                        <div
                            style={{
                                opacity: nameSpring,
                                transform: `translateY(${interpolate(nameSpring, [0, 1], [15, 0])}px)`,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: DISPLAY_FONT_FAMILY,
                                    fontWeight: 700,
                                    fontSize: 64 * scale,
                                    color: "#FFFFFF",
                                    textShadow: `0 0 30px rgba(${accentColorRgb}, 0.4)`,
                                }}
                            >
                                {config.headline}
                            </span>
                        </div>

                        {/* Role + badge */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14 * scale,
                                opacity: roleSpring,
                                transform: `translateY(${interpolate(roleSpring, [0, 1], [10, 0])}px)`,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: FONT_FAMILY,
                                    fontWeight: 700,
                                    fontSize: 22 * scale,
                                    color: accentColor,
                                    textTransform: "uppercase",
                                    letterSpacing: 4,
                                }}
                            >
                                {config.subtitle}
                            </span>
                            {config.showLiveBadge && (
                                <div
                                    style={{
                                        opacity: badgeSpring,
                                        transform: `scale(${interpolate(badgeSpring, [0, 1], [0.5, 1])})`,
                                        background: "rgba(34, 197, 94, 0.15)",
                                        border: "1px solid rgba(34, 197, 94, 0.3)",
                                        borderRadius: 20,
                                        padding: "4px 14px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: FONT_FAMILY,
                                            fontWeight: 800,
                                            fontSize: 11 * scale,
                                            color: "#22c55e",
                                            textTransform: "uppercase",
                                            letterSpacing: 3,
                                        }}
                                    >
                                        LIVE
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GradientBand>
        </AbsoluteFill>
    );
};

// ─── Layout 2: Core Action ──────────────────────────────────────
// Single feature headline, center-bottom aligned
const CoreAction: React.FC<{
    config: SceneOverlayConfig;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ config, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const headlineFrame = Math.max(0, frame - sec(0.4));
    const headlineSpring = spring({ frame: headlineFrame, fps, config: { damping: 12, stiffness: 55, mass: 1.5 } });

    return (
        <AbsoluteFill>
            <GradientBand position="bottom" style={{ padding: "60px 60px 45px" }}>
                <div
                    style={{
                        opacity: headlineSpring,
                        transform: `translateY(${interpolate(headlineSpring, [0, 1], [20, 0])}px)`,
                    }}
                >
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 42 * scale,
                            color: "#FFFFFF",
                            lineHeight: 1.3,
                            textShadow: `0 2px 20px rgba(0,0,0,0.5), 0 0 25px rgba(${accentColorRgb}, 0.2)`,
                        }}
                    >
                        {config.headline}
                    </span>
                </div>
                {config.subtitle && (
                    <div
                        style={{
                            marginTop: 10 * scale,
                            opacity: headlineSpring * 0.7,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 500,
                                fontSize: 20 * scale,
                                color: accentColor,
                                textTransform: "uppercase",
                                letterSpacing: 3,
                            }}
                        >
                            {config.subtitle}
                        </span>
                    </div>
                )}
            </GradientBand>
        </AbsoluteFill>
    );
};

// ─── Layout 3: Result Showcase ──────────────────────────────────
// 2-3 bullet callouts, right-aligned with accent dots
const ResultShowcase: React.FC<{
    config: SceneOverlayConfig;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ config, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();
    const bullets = config.bullets || [];

    return (
        <AbsoluteFill>
            <GradientBand position="bottom" style={{ padding: "70px 60px 45px" }}>
                {/* Headline */}
                {(() => {
                    const hSpring = spring({ frame, fps, config: { damping: 14, stiffness: 60, mass: 1.4 } });
                    return (
                        <div
                            style={{
                                marginBottom: 18 * scale,
                                opacity: hSpring,
                                transform: `translateX(${interpolate(hSpring, [0, 1], [-20, 0])}px)`,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: DISPLAY_FONT_FAMILY,
                                    fontWeight: 700,
                                    fontSize: 36 * scale,
                                    color: "#FFFFFF",
                                    textShadow: "0 2px 15px rgba(0,0,0,0.5)",
                                }}
                            >
                                {config.headline}
                            </span>
                        </div>
                    );
                })()}

                {/* Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 * scale, maxWidth: width * 0.6 }}>
                    {bullets.map((bullet, i) => {
                        const bFrame = Math.max(0, frame - sec(0.3 + i * 0.3));
                        const bSpring = spring({ frame: bFrame, fps, config: { damping: 14, stiffness: 55, mass: 1.3 } });
                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12 * scale,
                                    opacity: bSpring,
                                    transform: `translateX(${interpolate(bSpring, [0, 1], [-15, 0])}px)`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 8 * scale,
                                        height: 8 * scale,
                                        borderRadius: "50%",
                                        background: accentColor,
                                        boxShadow: `0 0 10px rgba(${accentColorRgb}, 0.5)`,
                                        flexShrink: 0,
                                    }}
                                />
                                <span
                                    style={{
                                        fontFamily: FONT_FAMILY,
                                        fontWeight: 600,
                                        fontSize: 22 * scale,
                                        color: "rgba(255,255,255,0.95)",
                                        textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                                    }}
                                >
                                    {bullet}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </GradientBand>
        </AbsoluteFill>
    );
};

// ─── Layout 4: Scale/Impact ─────────────────────────────────────
// Animated counter + unit label, centered with glow
const ScaleImpact: React.FC<{
    config: SceneOverlayConfig;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ config, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const counterTarget = config.counterValue || 0;
    const counterFrame = Math.max(0, frame - sec(0.3));
    const counterSpring = spring({ frame: counterFrame, fps, config: { damping: 14, stiffness: 55, mass: 1.5 } });
    const counterProgress = interpolate(counterSpring, [0.1, 0.85], [0, counterTarget], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const headlineSpring = spring({ frame, fps, config: { damping: 12, stiffness: 50, mass: 1.6 } });
    const glowPulse = 0.5 + Math.sin(frame * 0.1) * 0.5;

    return (
        <AbsoluteFill>
            <GradientBand position="center">
                <div style={{ textAlign: "center" }}>
                    {/* Counter */}
                    <div
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 96 * scale,
                            color: accentColor,
                            textShadow: `0 0 ${30 + 20 * glowPulse}px rgba(${accentColorRgb}, ${0.3 + 0.2 * glowPulse})`,
                            lineHeight: 1,
                            opacity: counterSpring,
                        }}
                    >
                        ~{Math.round(counterProgress)}
                    </div>

                    {/* Unit */}
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 600,
                            fontSize: 20 * scale,
                            color: "rgba(255,255,255,0.6)",
                            textTransform: "uppercase",
                            letterSpacing: 5,
                            marginTop: 8 * scale,
                            opacity: counterSpring,
                        }}
                    >
                        {config.counterUnit}
                    </div>

                    {/* Headline below counter */}
                    <div
                        style={{
                            marginTop: 20 * scale,
                            opacity: headlineSpring * 0.8,
                            transform: `translateY(${interpolate(headlineSpring, [0, 1], [10, 0])}px)`,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 500,
                                fontSize: 22 * scale,
                                color: "rgba(255,255,255,0.75)",
                                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                            }}
                        >
                            {config.headline}
                        </span>
                    </div>
                </div>
            </GradientBand>
        </AbsoluteFill>
    );
};

// ─── Layout 5: CTA Outro ────────────────────────────────────────
// "Become a Super Seller" + hire button + powered-by
const CtaOutro: React.FC<{
    config: SceneOverlayConfig;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ config, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const ctaSpring = spring({ frame, fps, config: { damping: 12, stiffness: 55, mass: 1.8 } });
    const btnFrame = Math.max(0, frame - sec(0.5));
    const btnSpring = spring({ frame: btnFrame, fps, config: { damping: 14, stiffness: 60, mass: 1.4 } });
    const poweredFrame = Math.max(0, frame - sec(1.0));
    const poweredSpring = spring({ frame: poweredFrame, fps, config: { damping: 18, stiffness: 70, mass: 1.2 } });

    const fadeOut = interpolate(frame, [durationInFrames - sec(0.6), durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const btnGlow = 0.6 + Math.sin(frame * 0.12) * 0.4;

    return (
        <AbsoluteFill style={{ opacity: fadeOut }}>
            {/* Dark overlay for CTA readability */}
            <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />

            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
                <div
                    style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 28,
                        opacity: ctaSpring,
                        transform: `scale(${interpolate(ctaSpring, [0, 1], [0.85, 1])})`,
                    }}
                >
                    {/* Main CTA */}
                    <div>
                        <span
                            style={{
                                fontFamily: DISPLAY_FONT_FAMILY,
                                fontWeight: 700,
                                fontSize: 54 * scale,
                                color: "#FFFFFF",
                            }}
                        >
                            Become a{" "}
                        </span>
                        <span
                            style={{
                                fontFamily: DISPLAY_FONT_FAMILY,
                                fontWeight: 700,
                                fontSize: 54 * scale,
                                color: "#f47920",
                                textShadow: "0 0 30px rgba(244, 121, 32, 0.4)",
                            }}
                        >
                            Super Seller
                        </span>
                    </div>

                    {/* Button */}
                    <div
                        style={{
                            opacity: btnSpring,
                            transform: `translateY(${interpolate(btnSpring, [0, 1], [15, 0])}px)`,
                        }}
                    >
                        <div
                            style={{
                                background: `linear-gradient(135deg, #f47920, ${accentColor})`,
                                borderRadius: 16,
                                padding: `${18 * scale}px ${50 * scale}px`,
                                boxShadow: `
                                    0 8px 30px rgba(244, 121, 32, ${0.25 + 0.15 * btnGlow}),
                                    0 0 ${18 * btnGlow}px rgba(244, 121, 32, ${0.15 * btnGlow})
                                `,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: FONT_FAMILY,
                                    fontWeight: 800,
                                    fontSize: 24 * scale,
                                    color: "#FFFFFF",
                                    textTransform: "uppercase",
                                    letterSpacing: 3,
                                }}
                            >
                                {config.headline}
                            </span>
                        </div>
                    </div>

                    {/* Powered by */}
                    <div style={{ opacity: poweredSpring * 0.4, marginTop: 8 }}>
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 400,
                                fontSize: 15 * scale,
                                color: "rgba(255,255,255,0.35)",
                            }}
                        >
                            {config.subtitle || "Powered by SuperSeller AI — superseller.agency"}
                        </span>
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
