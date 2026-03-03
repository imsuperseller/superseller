import React from "react";
import {
    AbsoluteFill,
    Audio,
    Sequence,
    interpolate,
    interpolateColors,
    spring,
    useCurrentFrame,
    useVideoConfig,
    staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { LightLeak } from "@remotion/light-leaks";
import { whoosh, pageTurn } from "@remotion/sfx";
import { FONT_FAMILY, DISPLAY_FONT_FAMILY } from "./config/fonts";
import { sec } from "./config/timing";

// ─── Props ──────────────────────────────────────────────────────
export type CrewDemoProps = {
    crewName: string;
    crewRole: string;
    crewTagline: string;
    crewDescription: string;
    accentColor: string;
    accentColorRgb: string;
    icon: string;
    features: string[];
    creditsPerTask: number;
    taskUnit: string;
    screenshots?: string[];
    status: "live" | "coming-soon" | "beta";
};

// ─── Scene Timing (seconds) ─────────────────────────────────────
const INTRO_DUR = 4;
const TAGLINE_DUR = 4;
const FEATURES_DUR = 7;
const SHOWCASE_DUR = 5;
const OUTRO_DUR = 5;
const TOTAL = INTRO_DUR + TAGLINE_DUR + FEATURES_DUR + SHOWCASE_DUR + OUTRO_DUR; // 25s

// ─── Deterministic random ────────────────────────────────────────
const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};

// ─── Particle data ───────────────────────────────────────────────
const PHI = 1.618033988749895;
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

// ─── Shared Sub-components ──────────────────────────────────────

const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
    const frame = useCurrentFrame();
    const filterId = `grain-d-${frame % 60}`;
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

const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.4 }) => (
    <AbsoluteFill
        style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${intensity}) 100%)`,
            pointerEvents: "none",
        }}
    />
);

const ParticleFieldScene: React.FC<{ accentColorRgb: string }> = ({ accentColorRgb }) => {
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

// ─── Glass Panel ─────────────────────────────────────────────────
const GlassPanel: React.FC<{
    accentColorRgb: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}> = ({ accentColorRgb, children, style }) => (
    <div
        style={{
            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.08), rgba(255,255,255,0.03))`,
            border: `1px solid rgba(${accentColorRgb}, 0.15)`,
            borderRadius: 24,
            backdropFilter: "blur(12px)",
            boxShadow: `
                0 20px 60px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.06)
            `,
            padding: "50px 60px",
            ...style,
        }}
    >
        {children}
    </div>
);

// ─── Animated Gradient Background ────────────────────────────────
const AnimatedBg: React.FC<{ accentColorRgb: string }> = ({ accentColorRgb }) => {
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

// ─── Scene: Crew Intro ──────────────────────────────────────────
const CrewIntro: React.FC<{
    name: string;
    role: string;
    icon: string;
    accentColor: string;
    accentColorRgb: string;
    status: string;
    scale: number;
}> = ({ name, role, icon, accentColor, accentColorRgb, status, scale }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const iconSpring = spring({ frame, fps, config: { damping: 10, stiffness: 50, mass: 2.0 } });
    const nameFrame = Math.max(0, frame - sec(0.6));
    const nameSpring = spring({ frame: nameFrame, fps, config: { damping: 14, stiffness: 60, mass: 1.5 } });
    const roleFrame = Math.max(0, frame - sec(1.0));
    const roleSpring = spring({ frame: roleFrame, fps, config: { damping: 18, stiffness: 70, mass: 1.2 } });

    // Pulsing glow
    const glowPulse = 0.6 + Math.sin(frame * 0.08) * 0.4;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                background: `radial-gradient(circle at 50% 50%, rgba(${accentColorRgb}, 0.08), transparent 60%)`,
            }}
        >
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                {/* Icon with glow ring */}
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            position: "absolute",
                            inset: -20,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, rgba(${accentColorRgb}, ${0.2 * glowPulse}), transparent 70%)`,
                            filter: `blur(${12 * glowPulse}px)`,
                        }}
                    />
                    <div
                        style={{
                            width: 170 * scale,
                            height: 170 * scale,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.2), rgba(${accentColorRgb}, 0.05))`,
                            border: `2.5px solid rgba(${accentColorRgb}, 0.5)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 75 * scale,
                            opacity: iconSpring,
                            transform: `scale(${interpolate(iconSpring, [0, 1], [0.3, 1])})`,
                            boxShadow: `
                                0 0 ${40 * glowPulse}px rgba(${accentColorRgb}, 0.3),
                                inset 0 1px 0 rgba(255,255,255,0.1)
                            `,
                        }}
                    >
                        {icon}
                    </div>
                </div>

                {/* Name */}
                <div
                    style={{
                        opacity: nameSpring,
                        transform: `translateY(${interpolate(nameSpring, [0, 1], [25, 0])}px)`,
                    }}
                >
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 76 * scale,
                            color: "#FFFFFF",
                            textShadow: `0 0 35px rgba(${accentColorRgb}, 0.3)`,
                        }}
                    >
                        {name}
                    </span>
                </div>

                {/* Role + status */}
                <div
                    style={{
                        opacity: roleSpring,
                        transform: `translateY(${interpolate(roleSpring, [0, 1], [15, 0])}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    <span
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 30 * scale,
                            color: accentColor,
                            textTransform: "uppercase",
                            letterSpacing: 6,
                        }}
                    >
                        {role}
                    </span>
                    {status === "live" && (
                        <div
                            style={{
                                background: "rgba(34, 197, 94, 0.12)",
                                border: "1px solid rgba(34, 197, 94, 0.25)",
                                borderRadius: 20,
                                padding: "5px 16px",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: FONT_FAMILY,
                                    fontWeight: 800,
                                    fontSize: 13 * scale,
                                    color: "#22c55e",
                                    textTransform: "uppercase",
                                    letterSpacing: 3,
                                }}
                            >
                                Live
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene: Tagline ──────────────────────────────────────────────
const TaglineScene: React.FC<{
    tagline: string;
    description: string;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ tagline, description, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const tagSpring = spring({ frame, fps, config: { damping: 12, stiffness: 50, mass: 2.0 } });
    const descFrame = Math.max(0, frame - sec(1.0));
    const descSpring = spring({ frame: descFrame, fps, config: { damping: 16, stiffness: 60, mass: 1.5 } });

    // Animated accent line
    const lineWidth = interpolate(tagSpring, [0.2, 1], [0, 100], { extrapolateLeft: "clamp" });

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                padding: "0 100px",
            }}
        >
            <GlassPanel accentColorRgb={accentColorRgb} style={{ maxWidth: 1100, textAlign: "center" }}>
                <div
                    style={{
                        opacity: tagSpring,
                        transform: `translateY(${interpolate(tagSpring, [0, 1], [30, 0])}px)`,
                    }}
                >
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 54 * scale,
                            color: "#FFFFFF",
                            lineHeight: 1.25,
                        }}
                    >
                        {tagline}
                    </span>
                </div>
                {/* Accent line */}
                <div
                    style={{
                        width: `${lineWidth}%`,
                        maxWidth: 300,
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                        margin: "20px auto",
                        borderRadius: 2,
                    }}
                />
                <div
                    style={{
                        opacity: descSpring,
                        transform: `translateY(${interpolate(descSpring, [0, 1], [20, 0])}px)`,
                    }}
                >
                    <span
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: 25 * scale,
                            color: "rgba(255,255,255,0.55)",
                            lineHeight: 1.65,
                        }}
                    >
                        {description}
                    </span>
                </div>
            </GlassPanel>
        </AbsoluteFill>
    );
};

// ─── Scene: Feature List ─────────────────────────────────────────
const FeatureList: React.FC<{
    features: string[];
    accentColor: string;
    accentColorRgb: string;
}> = ({ features, accentColor, accentColorRgb }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
            <GlassPanel accentColorRgb={accentColorRgb} style={{ maxWidth: 900 }}>
                <div
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 800,
                        fontSize: 34,
                        color: accentColor,
                        textTransform: "uppercase",
                        letterSpacing: 5,
                        marginBottom: 20,
                    }}
                >
                    What You Get
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                    {features.map((feature, i) => {
                        const featureFrame = Math.max(0, frame - sec(0.3 + i * 0.5));
                        const featureSpring = spring({
                            frame: featureFrame,
                            fps,
                            config: { damping: 14, stiffness: 55, mass: 1.5 },
                        });

                        // Check mark fill animation
                        const checkFill = interpolate(featureSpring, [0.5, 1], [0, 1], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        });

                        return (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 18,
                                    opacity: featureSpring,
                                    transform: `translateX(${interpolate(featureSpring, [0, 1], [-40, 0])}px)`,
                                }}
                            >
                                {/* Animated check circle */}
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        border: `2px solid ${accentColor}`,
                                        background: `rgba(${accentColorRgb}, ${0.15 + checkFill * 0.2})`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        boxShadow: checkFill > 0.5
                                            ? `0 0 12px rgba(${accentColorRgb}, 0.4)`
                                            : "none",
                                    }}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        style={{ opacity: checkFill }}
                                    >
                                        <path
                                            d="M2 7L5.5 10.5L12 3.5"
                                            stroke={accentColor}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <span
                                    style={{
                                        fontFamily: FONT_FAMILY,
                                        fontWeight: 500,
                                        fontSize: 26,
                                        color: "rgba(255,255,255,0.9)",
                                    }}
                                >
                                    {feature}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </GlassPanel>
        </AbsoluteFill>
    );
};

// ─── Scene: Showcase / Pricing ───────────────────────────────────
const ShowcaseScene: React.FC<{
    crewName: string;
    accentColor: string;
    accentColorRgb: string;
    creditsPerTask: number;
    taskUnit: string;
}> = ({ crewName, accentColor, accentColorRgb, creditsPerTask, taskUnit }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const cardSpring = spring({ frame, fps, config: { damping: 12, stiffness: 50, mass: 2.0 } });

    // Animated counter for credits
    const counterProgress = interpolate(cardSpring, [0.3, 0.9], [0, creditsPerTask], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Pulsing glow on the credit number
    const glowPulse = 0.5 + Math.sin(frame * 0.1) * 0.5;

    return (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
                style={{
                    opacity: cardSpring,
                    transform: `scale(${interpolate(cardSpring, [0, 1], [0.85, 1])})`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 40,
                }}
            >
                <GlassPanel
                    accentColorRgb={accentColorRgb}
                    style={{ textAlign: "center", minWidth: 500 }}
                >
                    {/* Credits number */}
                    <div
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 90,
                            color: accentColor,
                            textShadow: `0 0 ${30 + 20 * glowPulse}px rgba(${accentColorRgb}, ${0.3 + 0.2 * glowPulse})`,
                            lineHeight: 1,
                        }}
                    >
                        ~{Math.round(counterProgress)}
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 600,
                            fontSize: 24,
                            color: "rgba(255,255,255,0.6)",
                            textTransform: "uppercase",
                            letterSpacing: 5,
                            marginTop: 8,
                        }}
                    >
                        Credits Per {taskUnit.charAt(0).toUpperCase() + taskUnit.slice(1)}
                    </div>
                </GlassPanel>

                {/* Supporting text */}
                <div
                    style={{
                        textAlign: "center",
                        maxWidth: 550,
                        opacity: interpolate(cardSpring, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
                    }}
                >
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: 22,
                            color: "rgba(255,255,255,0.45)",
                            lineHeight: 1.6,
                        }}
                    >
                        {crewName} works 24/7 so you don&apos;t have to.
                        <br />
                        No contracts. No overhead. Just results.
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene: Outro CTA ────────────────────────────────────────────
const CrewOutro: React.FC<{
    crewName: string;
    accentColor: string;
    accentColorRgb: string;
    creditsPerTask: number;
    taskUnit: string;
    scale: number;
}> = ({ crewName, accentColor, accentColorRgb, creditsPerTask, taskUnit, scale }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const ctaSpring = spring({ frame, fps, config: { damping: 12, stiffness: 50, mass: 2.0 } });
    const btnFrame = Math.max(0, frame - sec(0.8));
    const btnSpring = spring({ frame: btnFrame, fps, config: { damping: 14, stiffness: 60, mass: 1.5 } });
    const poweredFrame = Math.max(0, frame - sec(1.5));
    const poweredSpring = spring({ frame: poweredFrame, fps, config: { damping: 18, stiffness: 70, mass: 1.2 } });

    const fadeOut = interpolate(frame, [durationInFrames - sec(1), durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Button glow pulse
    const btnGlow = 0.6 + Math.sin(frame * 0.12) * 0.4;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                opacity: fadeOut,
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 35,
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
                            fontSize: 62 * scale,
                            color: "#FFFFFF",
                        }}
                    >
                        Become a{" "}
                    </span>
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 62 * scale,
                            color: "#f47920",
                            textShadow: "0 0 30px rgba(244, 121, 32, 0.3)",
                        }}
                    >
                        Super Seller
                    </span>
                </div>

                {/* CTA Button */}
                <div
                    style={{
                        opacity: btnSpring,
                        transform: `translateY(${interpolate(btnSpring, [0, 1], [20, 0])}px)`,
                    }}
                >
                    <div
                        style={{
                            background: `linear-gradient(135deg, #f47920, ${accentColor})`,
                            borderRadius: 18,
                            padding: "22px 65px",
                            boxShadow: `
                                0 8px 35px rgba(244, 121, 32, ${0.25 + 0.15 * btnGlow}),
                                0 0 ${20 * btnGlow}px rgba(244, 121, 32, ${0.15 * btnGlow})
                            `,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 800,
                                fontSize: 30 * scale,
                                color: "#FFFFFF",
                                textTransform: "uppercase",
                                letterSpacing: 3,
                            }}
                        >
                            Hire {crewName} — ${creditsPerTask} Credits/{taskUnit}
                        </span>
                    </div>
                </div>

                {/* Powered by */}
                <div style={{ opacity: poweredSpring * 0.4, marginTop: 15 }}>
                    <span
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: 17 * scale,
                            color: "rgba(255,255,255,0.35)",
                        }}
                    >
                        Powered by SuperSeller AI — superseller.agency
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ─── Main Composition ────────────────────────────────────────────
export const CrewDemoComposition: React.FC<CrewDemoProps> = (props) => {
    const {
        crewName,
        crewRole,
        crewTagline,
        crewDescription,
        accentColor,
        accentColorRgb,
        icon,
        features,
        creditsPerTask,
        taskUnit,
        status,
    } = props;

    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const scale = Math.min(width / 1920, height / 1080);

    return (
        <AbsoluteFill>
            {/* Layer 1: Animated gradient background */}
            <AnimatedBg accentColorRgb={accentColorRgb} />

            {/* Layer 2: Particles */}
            <ParticleFieldScene accentColorRgb={accentColorRgb} />

            {/* Content: TransitionSeries */}
            <TransitionSeries>
                {/* ── Scene 1: Crew Intro ── */}
                <TransitionSeries.Sequence durationInFrames={sec(INTRO_DUR)}>
                    <CrewIntro
                        name={crewName}
                        role={crewRole}
                        icon={icon}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        status={status}
                        scale={scale}
                    />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={slide({ direction: "from-right" })}
                    timing={linearTiming({ durationInFrames: sec(0.5) })}
                />

                {/* ── Scene 2: Tagline + Description ── */}
                <TransitionSeries.Sequence durationInFrames={sec(TAGLINE_DUR)}>
                    <TaglineScene
                        tagline={crewTagline}
                        description={crewDescription}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        scale={scale}
                    />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: sec(0.5) })}
                />

                {/* ── Scene 3: Features ── */}
                <TransitionSeries.Sequence durationInFrames={sec(FEATURES_DUR)}>
                    <FeatureList
                        features={features}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                    />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: sec(0.5) })}
                />

                {/* ── Scene 4: Credits Showcase ── */}
                <TransitionSeries.Sequence durationInFrames={sec(SHOWCASE_DUR)}>
                    <ShowcaseScene
                        crewName={crewName}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        creditsPerTask={creditsPerTask}
                        taskUnit={taskUnit}
                    />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: sec(0.7) })}
                />

                {/* ── Scene 5: Outro CTA ── */}
                <TransitionSeries.Sequence durationInFrames={sec(OUTRO_DUR)}>
                    <CrewOutro
                        crewName={crewName}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        creditsPerTask={creditsPerTask}
                        taskUnit={taskUnit}
                        scale={scale}
                    />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* Light Leak overlay — subtle, mostly in intro and outro */}
            <Sequence from={0} durationInFrames={sec(INTRO_DUR + 1)}>
                <AbsoluteFill style={{ opacity: 0.1, pointerEvents: "none" }}>
                    <LightLeak durationInFrames={sec(INTRO_DUR + 1)} seed={17} hueShift={15} />
                </AbsoluteFill>
            </Sequence>
            <Sequence from={sec(TOTAL - OUTRO_DUR - 1)} durationInFrames={sec(OUTRO_DUR + 1)}>
                <AbsoluteFill style={{ opacity: 0.08, pointerEvents: "none" }}>
                    <LightLeak durationInFrames={sec(OUTRO_DUR + 1)} seed={73} hueShift={40} />
                </AbsoluteFill>
            </Sequence>

            {/* Film Grain */}
            <FilmGrain opacity={0.04} />

            {/* Vignette */}
            <Vignette intensity={0.35} />

            {/* ── Audio: Suno Music ── */}
            <Audio
                src={staticFile("audio/crew-theme-1.mp3")}
                startFrom={sec(15)}
                volume={(f) => {
                    const totalFrames = sec(TOTAL);
                    if (f < sec(1)) return interpolate(f, [0, sec(1)], [0, 0.28]);
                    if (f > totalFrames - sec(2.5)) return interpolate(f, [totalFrames - sec(2.5), totalFrames], [0.28, 0], { extrapolateRight: "clamp" });
                    return 0.28;
                }}
            />

            {/* ── SFX: Whoosh on slide transitions ── */}
            <Sequence from={sec(INTRO_DUR - 0.3)} durationInFrames={sec(1)}>
                <Audio src={whoosh} volume={0.25} />
            </Sequence>

            {/* ── SFX: Page turn on feature scene ── */}
            <Sequence from={sec(INTRO_DUR + TAGLINE_DUR - 0.3)} durationInFrames={sec(1)}>
                <Audio src={pageTurn} volume={0.2} />
            </Sequence>
        </AbsoluteFill>
    );
};
