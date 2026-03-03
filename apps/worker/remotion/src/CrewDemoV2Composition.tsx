import React from "react";
import {
    AbsoluteFill,
    Audio,
    Sequence,
    interpolate,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { whoosh, pageTurn } from "@remotion/sfx";
import { FONT_FAMILY, DISPLAY_FONT_FAMILY } from "./config/fonts";
import { sec } from "./config/timing";
import { AnimatedBg, ParticleField, FilmGrain, Vignette, GlassPanel } from "./components/shared";
import { ProductDemoScene } from "./components/ProductDemoScene";
import type { CrewDemoV2Props } from "./types/crew-demo-v2-props";

// ─── Scene Timing (seconds) ─────────────────────────────────────
const INTRO_DUR = 3;
const DEMO_DUR = 10;
const FEATURES_DUR = 5;
const OUTRO_DUR = 4;
const TOTAL = INTRO_DUR + DEMO_DUR + FEATURES_DUR + OUTRO_DUR; // 22s

// ─── Scene: Agent Intro ──────────────────────────────────────────
const AgentIntro: React.FC<{
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

    const iconSpring = spring({ frame, fps, config: { damping: 10, stiffness: 60, mass: 1.8 } });
    const nameFrame = Math.max(0, frame - sec(0.4));
    const nameSpring = spring({ frame: nameFrame, fps, config: { damping: 14, stiffness: 65, mass: 1.3 } });
    const roleFrame = Math.max(0, frame - sec(0.7));
    const roleSpring = spring({ frame: roleFrame, fps, config: { damping: 16, stiffness: 70, mass: 1.2 } });

    const glowPulse = 0.6 + Math.sin(frame * 0.1) * 0.4;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                background: `radial-gradient(circle at 50% 50%, rgba(${accentColorRgb}, 0.1), transparent 60%)`,
            }}
        >
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                {/* Icon with glow ring */}
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            position: "absolute",
                            inset: -20,
                            borderRadius: "50%",
                            background: `radial-gradient(circle, rgba(${accentColorRgb}, ${0.25 * glowPulse}), transparent 70%)`,
                            filter: `blur(${14 * glowPulse}px)`,
                        }}
                    />
                    <div
                        style={{
                            width: 150 * scale,
                            height: 150 * scale,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.2), rgba(${accentColorRgb}, 0.05))`,
                            border: `2.5px solid rgba(${accentColorRgb}, 0.5)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 65 * scale,
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
                        transform: `translateY(${interpolate(nameSpring, [0, 1], [20, 0])}px)`,
                    }}
                >
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 72 * scale,
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
                        transform: `translateY(${interpolate(roleSpring, [0, 1], [12, 0])}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                    }}
                >
                    <span
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 26 * scale,
                            color: accentColor,
                            textTransform: "uppercase",
                            letterSpacing: 5,
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
                                padding: "4px 14px",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: FONT_FAMILY,
                                    fontWeight: 800,
                                    fontSize: 12 * scale,
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

// ─── Scene: Features + Credits (combined) ────────────────────────
const FeaturesAndCredits: React.FC<{
    features: string[];
    creditsPerTask: number;
    taskUnit: string;
    crewName: string;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ features, creditsPerTask, taskUnit, crewName, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const isVertical = height > width;

    const containerSpring = spring({ frame, fps, config: { damping: 12, stiffness: 50, mass: 1.8 } });

    // Animated counter for credits
    const counterFrame = Math.max(0, frame - sec(0.5));
    const counterSpring = spring({ frame: counterFrame, fps, config: { damping: 14, stiffness: 55, mass: 1.5 } });
    const counterProgress = interpolate(counterSpring, [0.2, 0.9], [0, creditsPerTask], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const glowPulse = 0.5 + Math.sin(frame * 0.1) * 0.5;

    return (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: `0 ${60 * scale}px` }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: isVertical ? "column" : "row",
                    alignItems: "center",
                    gap: isVertical ? 30 * scale : 50 * scale,
                    opacity: containerSpring,
                    transform: `scale(${interpolate(containerSpring, [0, 1], [0.9, 1])})`,
                }}
            >
                {/* Features list */}
                <GlassPanel accentColorRgb={accentColorRgb} style={{ flex: 1, maxWidth: isVertical ? "100%" : 550 * scale, padding: `${30 * scale}px ${40 * scale}px` }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 * scale }}>
                        {features.slice(0, 4).map((feature, i) => {
                            const featureFrame = Math.max(0, frame - sec(0.3 + i * 0.4));
                            const featureSpring = spring({
                                frame: featureFrame,
                                fps,
                                config: { damping: 14, stiffness: 55, mass: 1.3 },
                            });
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
                                        gap: 14 * scale,
                                        opacity: featureSpring,
                                        transform: `translateX(${interpolate(featureSpring, [0, 1], [-30, 0])}px)`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 24 * scale,
                                            height: 24 * scale,
                                            borderRadius: "50%",
                                            border: `2px solid ${accentColor}`,
                                            background: `rgba(${accentColorRgb}, ${0.15 + checkFill * 0.2})`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            boxShadow: checkFill > 0.5 ? `0 0 10px rgba(${accentColorRgb}, 0.4)` : "none",
                                        }}
                                    >
                                        <svg width={12 * scale} height={12 * scale} viewBox="0 0 14 14" fill="none" style={{ opacity: checkFill }}>
                                            <path d="M2 7L5.5 10.5L12 3.5" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: FONT_FAMILY,
                                            fontWeight: 500,
                                            fontSize: 22 * scale,
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

                {/* Credits counter */}
                <GlassPanel
                    accentColorRgb={accentColorRgb}
                    style={{ textAlign: "center", minWidth: isVertical ? 250 * scale : 280 * scale, padding: `${30 * scale}px ${40 * scale}px` }}
                >
                    <div
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 72 * scale,
                            color: accentColor,
                            textShadow: `0 0 ${25 + 15 * glowPulse}px rgba(${accentColorRgb}, ${0.3 + 0.2 * glowPulse})`,
                            lineHeight: 1,
                        }}
                    >
                        ~{Math.round(counterProgress)}
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 600,
                            fontSize: 18 * scale,
                            color: "rgba(255,255,255,0.5)",
                            textTransform: "uppercase",
                            letterSpacing: 4,
                            marginTop: 8 * scale,
                        }}
                    >
                        Credits / {taskUnit}
                    </div>
                </GlassPanel>
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene: CTA Outro ────────────────────────────────────────────
const CtaOutro: React.FC<{
    crewName: string;
    accentColor: string;
    accentColorRgb: string;
    creditsPerTask: number;
    taskUnit: string;
    scale: number;
}> = ({ crewName, accentColor, accentColorRgb, creditsPerTask, taskUnit, scale }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const ctaSpring = spring({ frame, fps, config: { damping: 12, stiffness: 55, mass: 1.8 } });
    const btnFrame = Math.max(0, frame - sec(0.6));
    const btnSpring = spring({ frame: btnFrame, fps, config: { damping: 14, stiffness: 60, mass: 1.4 } });
    const poweredFrame = Math.max(0, frame - sec(1.2));
    const poweredSpring = spring({ frame: poweredFrame, fps, config: { damping: 18, stiffness: 70, mass: 1.2 } });

    const fadeOut = interpolate(frame, [durationInFrames - sec(0.8), durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

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
                    gap: 30,
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
                            fontSize: 58 * scale,
                            color: "#FFFFFF",
                        }}
                    >
                        Become a{" "}
                    </span>
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 58 * scale,
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
                        transform: `translateY(${interpolate(btnSpring, [0, 1], [18, 0])}px)`,
                    }}
                >
                    <div
                        style={{
                            background: `linear-gradient(135deg, #f47920, ${accentColor})`,
                            borderRadius: 18,
                            padding: `${20 * scale}px ${55 * scale}px`,
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
                                fontSize: 26 * scale,
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
                <div style={{ opacity: poweredSpring * 0.4, marginTop: 10 }}>
                    <span
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: 16 * scale,
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
export const CrewDemoV2Composition: React.FC<CrewDemoV2Props> = (props) => {
    const {
        crewName,
        crewRole,
        crewTagline,
        accentColor,
        accentColorRgb,
        icon,
        features,
        creditsPerTask,
        taskUnit,
        status,
        demoVideoUrl,
        deviceType,
        annotations,
    } = props;

    const { width, height } = useVideoConfig();
    const scale = Math.min(width / 1920, height / 1080);

    return (
        <AbsoluteFill>
            {/* Layer 1: Animated gradient background */}
            <AnimatedBg accentColorRgb={accentColorRgb} />

            {/* Layer 2: Particles */}
            <ParticleField accentColorRgb={accentColorRgb} />

            {/* Content: TransitionSeries */}
            <TransitionSeries>
                {/* ── Scene 1: Agent Intro (3s) ── */}
                <TransitionSeries.Sequence durationInFrames={sec(INTRO_DUR)}>
                    <AgentIntro
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

                {/* ── Scene 2: Product Demo (10s) — THE HERO ── */}
                <TransitionSeries.Sequence durationInFrames={sec(DEMO_DUR)}>
                    <ProductDemoScene
                        demoVideoUrl={demoVideoUrl}
                        deviceType={deviceType}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        annotations={annotations}
                        headline={crewTagline}
                    />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: sec(0.5) })}
                />

                {/* ── Scene 3: Features + Credits (5s) ── */}
                <TransitionSeries.Sequence durationInFrames={sec(FEATURES_DUR)}>
                    <FeaturesAndCredits
                        features={features}
                        creditsPerTask={creditsPerTask}
                        taskUnit={taskUnit}
                        crewName={crewName}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        scale={scale}
                    />
                </TransitionSeries.Sequence>

                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: sec(0.6) })}
                />

                {/* ── Scene 4: CTA Outro (4s) ── */}
                <TransitionSeries.Sequence durationInFrames={sec(OUTRO_DUR)}>
                    <CtaOutro
                        crewName={crewName}
                        accentColor={accentColor}
                        accentColorRgb={accentColorRgb}
                        creditsPerTask={creditsPerTask}
                        taskUnit={taskUnit}
                        scale={scale}
                    />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* Film Grain */}
            <FilmGrain opacity={0.04} />

            {/* Vignette */}
            <Vignette intensity={0.35} />

            {/* ── Audio: Suno Music ── */}
            <Audio
                src={staticFile("audio/crew-theme-2.mp3")}
                volume={(f) => {
                    const totalFrames = sec(TOTAL);
                    if (f < sec(1)) return interpolate(f, [0, sec(1)], [0, 0.28]);
                    if (f > totalFrames - sec(2)) return interpolate(f, [totalFrames - sec(2), totalFrames], [0.28, 0], { extrapolateRight: "clamp" });
                    return 0.28;
                }}
            />

            {/* ── SFX: Whoosh on slide transition into demo ── */}
            <Sequence from={sec(INTRO_DUR - 0.3)} durationInFrames={sec(1)}>
                <Audio src={whoosh} volume={0.25} />
            </Sequence>

            {/* ── SFX: Page turn on features scene ── */}
            <Sequence from={sec(INTRO_DUR + DEMO_DUR - 0.3)} durationInFrames={sec(1)}>
                <Audio src={pageTurn} volume={0.2} />
            </Sequence>
        </AbsoluteFill>
    );
};
