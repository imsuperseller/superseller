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
import { LightLeak } from "@remotion/light-leaks";
import { whoosh, whip } from "@remotion/sfx";
import { FONT_FAMILY, DISPLAY_FONT_FAMILY } from "./config/fonts";
import { sec } from "./config/timing";

// ─── Crew Member Data ────────────────────────────────────────────
const CREW = [
    { id: "forge", name: "Forge", role: "Video Producer", color: "#f47920", colorRgb: "244, 121, 32", letter: "F" },
    { id: "spoke", name: "Spoke", role: "Spokesperson", color: "#f59e0b", colorRgb: "245, 158, 11", letter: "S" },
    { id: "frontdesk", name: "FrontDesk", role: "AI Receptionist", color: "#06b6d4", colorRgb: "6, 182, 212", letter: "D" },
    { id: "scout", name: "Scout", role: "Lead Hunter", color: "#8b5cf6", colorRgb: "139, 92, 246", letter: "Sc" },
    { id: "buzz", name: "Buzz", role: "Content Creator", color: "#ec4899", colorRgb: "236, 72, 153", letter: "B" },
    { id: "cortex", name: "Cortex", role: "Analyst", color: "#10b981", colorRgb: "16, 185, 129", letter: "C" },
    { id: "market", name: "Market", role: "Marketplace", color: "#3b82f6", colorRgb: "59, 130, 246", letter: "M" },
];

// Circular grid layout positions (relative to center)
const GRID_POSITIONS = [
    { x: 0, y: -300 },     // top — Forge
    { x: 260, y: -150 },   // top-right — Spoke
    { x: 260, y: 150 },    // bottom-right — FrontDesk
    { x: 0, y: 300 },      // bottom — Scout
    { x: -260, y: 150 },   // bottom-left — Buzz
    { x: -260, y: -150 },  // top-left — Cortex
    { x: 0, y: 0 },        // center — Market
];

// ─── Props ──────────────────────────────────────────────────────
export type CrewRevealProps = {
    tagline?: string;
};

// ─── Timing (seconds) ───────────────────────────────────────────
const FADE_IN_END = 0.5;
const LOGO_START = 0.3;
const LOGO_PULSE_START = 1.8;
const EXPLODE_AT = 3.0;
const ICONS_START = 3.4;
const ICONS_STAGGER = 0.15;
const LABELS_START = 5.8;
const TAGLINE_START = 7.2;
const FADE_OUT_START = 9.0;
const TOTAL = 10;

// ─── Deterministic random ────────────────────────────────────────
const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
};

// ─── Particle data (precomputed) ─────────────────────────────────
const PHI = 1.618033988749895;
const NUM_PARTICLES = 45;
const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    baseX: seededRandom(i * PHI),
    baseY: seededRandom(i * PHI * PHI),
    size: 1.5 + seededRandom(i * 7.31) * 3.5,
    speedX: 0.08 + seededRandom(i * 3.17) * 0.35,
    speedY: 0.06 + seededRandom(i * 5.23) * 0.25,
    phase: seededRandom(i * 11.37) * Math.PI * 2,
    maxOpacity: 0.12 + seededRandom(i * 2.71) * 0.2,
}));

// Explosion burst particles
const NUM_BURST = 16;
const BURST_PARTICLES = Array.from({ length: NUM_BURST }, (_, i) => ({
    angle: (i / NUM_BURST) * Math.PI * 2 + seededRandom(i * 6.7) * 0.3,
    speed: 180 + seededRandom(i * 9.1) * 280,
    size: 2.5 + seededRandom(i * 4.3) * 4,
    colorIndex: i % CREW.length,
}));

// ─── Animated Gradient Background ────────────────────────────────
const AnimatedGradientBg: React.FC = () => {
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
        <AbsoluteFill
            style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }}
        />
    );
};

// ─── Floating Particle Field ─────────────────────────────────────
const ParticleField: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Global particle opacity: fade in at start, fade out at end
    const globalOpacity = interpolate(
        frame,
        [0, sec(1), sec(FADE_OUT_START), durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    return (
        <AbsoluteFill style={{ overflow: "hidden", opacity: globalOpacity }}>
            {PARTICLES.map((p, i) => {
                const x = (p.baseX * width + Math.sin(frame * 0.02 * p.speedX + p.phase) * 60) % width;
                const y = (p.baseY * height + Math.cos(frame * 0.015 * p.speedY + p.phase * 0.7) * 45) % height;
                const op = p.maxOpacity * (0.4 + Math.sin(frame * 0.04 + i * 2.1) * 0.6);

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: p.size,
                            height: p.size,
                            borderRadius: "50%",
                            background: `rgba(244, 121, 32, ${op})`,
                            filter: p.size > 3.5 ? "blur(1.5px)" : undefined,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

// ─── Film Grain Overlay ──────────────────────────────────────────
const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
    const frame = useCurrentFrame();
    const filterId = `grain-${frame % 60}`;

    return (
        <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <filter id={filterId}>
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.65"
                        numOctaves="3"
                        seed={frame * 2}
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter={`url(#${filterId})`} />
            </svg>
        </AbsoluteFill>
    );
};

// ─── Vignette ────────────────────────────────────────────────────
const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.5 }) => (
    <AbsoluteFill
        style={{
            background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${intensity}) 100%)`,
            pointerEvents: "none",
        }}
    />
);

// ─── Main Composition ────────────────────────────────────────────
export const CrewRevealComposition: React.FC<CrewRevealProps> = ({
    tagline = "Seven Agents. Zero Overhead.",
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const centerX = width / 2;
    const centerY = height / 2;
    const scaleX = width / 1920;
    const scaleY = height / 1080;
    const s = Math.min(scaleX, scaleY);

    // ── Global fade in/out ──
    const fadeIn = interpolate(frame, [0, sec(FADE_IN_END)], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(frame, [sec(FADE_OUT_START), durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    const globalOpacity = Math.min(fadeIn, fadeOut);

    // ── Phase 1: Logo appear ──
    const logoFrame = Math.max(0, frame - sec(LOGO_START));
    const logoSpring = spring({
        frame: logoFrame,
        fps,
        config: { damping: 14, stiffness: 80, mass: 1.5 },
    });

    // Logo pulse before explosion
    const pulseFrame = Math.max(0, frame - sec(LOGO_PULSE_START));
    const pulse = frame > sec(LOGO_PULSE_START) && frame < sec(EXPLODE_AT)
        ? Math.sin(pulseFrame * 0.4) * 0.06
        : 0;

    // Logo glow intensity builds before explosion
    const glowBuild = interpolate(
        frame,
        [sec(LOGO_PULSE_START), sec(EXPLODE_AT)],
        [0.3, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // ── Phase 2: Explosion ──
    const explodeFrame = Math.max(0, frame - sec(EXPLODE_AT));
    const explodeSpring = spring({
        frame: explodeFrame,
        fps,
        config: { damping: 6, stiffness: 200, mass: 0.5 },
    });

    // Logo scale: normal → pulse → explode → disappear
    const logoScale = interpolate(
        explodeSpring,
        [0, 0.2, 1],
        [1 + pulse, 2.2, 0],
        { extrapolateRight: "clamp" }
    );
    const logoOpacity = interpolate(
        explodeSpring,
        [0, 0.3, 1],
        [1, 0.4, 0],
        { extrapolateRight: "clamp" }
    );

    // Flash
    const flashOpacity = interpolate(explodeSpring, [0, 0.1, 0.4], [0, 0.9, 0], {
        extrapolateRight: "clamp",
    });
    const flashScale = interpolate(explodeSpring, [0, 0.4], [0.5, 4], {
        extrapolateRight: "clamp",
    });

    // Explosion rings (3 at different speeds)
    const ring1Scale = interpolate(explodeSpring, [0, 1], [0, 9]);
    const ring1Opacity = interpolate(explodeSpring, [0, 0.15, 1], [0, 0.7, 0], { extrapolateRight: "clamp" });

    const ring2p = Math.max(0, explodeSpring - 0.08);
    const ring2Scale = interpolate(ring2p, [0, 0.92], [0, 7]);
    const ring2Opacity = interpolate(ring2p, [0, 0.12, 0.92], [0, 0.4, 0], { extrapolateRight: "clamp" });

    const ring3p = Math.max(0, explodeSpring - 0.16);
    const ring3Scale = interpolate(ring3p, [0, 0.84], [0, 5.5]);
    const ring3Opacity = interpolate(ring3p, [0, 0.1, 0.84], [0, 0.25, 0], { extrapolateRight: "clamp" });

    // ── Phase 3: Crew icons fly out ──
    const crewElements = CREW.map((member, i) => {
        const iconStartFrame = sec(ICONS_START + i * ICONS_STAGGER);
        const iconFrame = Math.max(0, frame - iconStartFrame);
        // Heavy spring for luxury feel
        const iconSpring = spring({
            frame: iconFrame,
            fps,
            config: { damping: 10, stiffness: 55, mass: 2.2 },
        });

        const pos = GRID_POSITIONS[i];
        const targetX = pos.x * scaleX;
        const targetY = pos.y * scaleY;

        const x = interpolate(iconSpring, [0, 1], [0, targetX]);
        const y = interpolate(iconSpring, [0, 1], [0, targetY]);
        const scale = interpolate(iconSpring, [0, 1], [0, 1]);
        const opacity = interpolate(iconSpring, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

        // Glow pulse after settling
        const settledFrame = Math.max(0, iconFrame - sec(0.8));
        const glowPulse = 0.6 + Math.sin(settledFrame * 0.12 + i * 1.5) * 0.4;

        // Label appears after all icons settle
        const labelFrame = Math.max(0, frame - sec(LABELS_START + i * 0.1));
        const labelSpring = spring({
            frame: labelFrame,
            fps,
            config: { damping: 18, stiffness: 70, mass: 1.2 },
        });

        const iconSize = 110 * s;
        const fontSize = 30 * s;

        return (
            <div
                key={member.id}
                style={{
                    position: "absolute",
                    left: centerX + x - iconSize / 2,
                    top: centerY + y - iconSize / 2,
                    width: iconSize,
                    height: iconSize,
                    opacity,
                    transform: `scale(${scale})`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {/* Outer glow ring */}
                <div
                    style={{
                        position: "absolute",
                        inset: -16,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, rgba(${member.colorRgb}, ${0.25 * glowPulse}), transparent 70%)`,
                        filter: `blur(${10 * glowPulse}px)`,
                    }}
                />
                {/* Icon circle with glass effect */}
                <div
                    style={{
                        width: iconSize,
                        height: iconSize,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, rgba(${member.colorRgb}, 0.2), rgba(${member.colorRgb}, 0.05))`,
                        border: `2px solid rgba(${member.colorRgb}, 0.5)`,
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `
                            0 0 ${24 * glowPulse}px rgba(${member.colorRgb}, 0.35),
                            inset 0 1px 0 rgba(255,255,255,0.1)
                        `,
                    }}
                >
                    <span
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: iconSize * 0.38,
                            color: member.color,
                            textShadow: `0 0 15px rgba(${member.colorRgb}, 0.6)`,
                        }}
                    >
                        {member.letter}
                    </span>
                </div>
                {/* Label below icon */}
                <div
                    style={{
                        marginTop: 12,
                        opacity: labelSpring,
                        transform: `translateY(${interpolate(labelSpring, [0, 1], [10, 0])}px)`,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                    }}
                >
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 800,
                            fontSize,
                            color: member.color,
                            textShadow: `0 0 20px rgba(${member.colorRgb}, 0.5)`,
                        }}
                    >
                        {member.name}
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: fontSize * 0.55,
                            color: "rgba(255,255,255,0.45)",
                            marginTop: 3,
                        }}
                    >
                        {member.role}
                    </div>
                </div>
            </div>
        );
    });

    // ── Phase 4: Tagline ──
    const taglineFrame = Math.max(0, frame - sec(TAGLINE_START));
    const taglineSpring = spring({
        frame: taglineFrame,
        fps,
        config: { damping: 12, stiffness: 60, mass: 1.8 },
    });

    // Animated underline
    const underlineWidth = interpolate(taglineSpring, [0.3, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ opacity: globalOpacity }}>
            {/* Layer 1: Animated gradient background */}
            <AnimatedGradientBg />

            {/* Layer 2: Subtle animated grid */}
            <AbsoluteFill style={{ opacity: 0.04 }}>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                        transform: `translateY(${Math.sin(frame * 0.008) * 5}px)`,
                    }}
                />
            </AbsoluteFill>

            {/* Layer 3: Floating particles */}
            <ParticleField />

            {/* ── Explosion Flash ── */}
            {explodeSpring > 0 && explodeSpring < 0.5 && (
                <div
                    style={{
                        position: "absolute",
                        left: centerX - 60,
                        top: centerY - 60,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(244,121,32,0.5), transparent 70%)",
                        transform: `scale(${flashScale})`,
                        opacity: flashOpacity,
                    }}
                />
            )}

            {/* ── Explosion Rings ── */}
            {explodeSpring > 0 && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            left: centerX - 50,
                            top: centerY - 50,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            border: "2px solid rgba(244, 121, 32, 0.7)",
                            transform: `scale(${ring1Scale})`,
                            opacity: ring1Opacity,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: centerX - 50,
                            top: centerY - 50,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            border: "1.5px solid rgba(255, 255, 255, 0.5)",
                            transform: `scale(${ring2Scale})`,
                            opacity: ring2Opacity,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: centerX - 50,
                            top: centerY - 50,
                            width: 100,
                            height: 100,
                            borderRadius: "50%",
                            border: "1px solid rgba(78, 205, 196, 0.4)",
                            transform: `scale(${ring3Scale})`,
                            opacity: ring3Opacity,
                        }}
                    />
                </>
            )}

            {/* ── Explosion Burst Particles ── */}
            {explodeSpring > 0 && explodeSpring < 0.95 &&
                BURST_PARTICLES.map((p, i) => {
                    const dist = explodeSpring * p.speed * s;
                    const px = centerX + Math.cos(p.angle) * dist;
                    const py = centerY + Math.sin(p.angle) * dist;
                    const op = interpolate(explodeSpring, [0, 0.15, 0.95], [0, 0.9, 0], { extrapolateRight: "clamp" });
                    const crewColor = CREW[p.colorIndex].colorRgb;

                    return (
                        <div
                            key={`burst-${i}`}
                            style={{
                                position: "absolute",
                                left: px - p.size / 2,
                                top: py - p.size / 2,
                                width: p.size,
                                height: p.size,
                                borderRadius: "50%",
                                background: `rgba(${crewColor}, ${op * 0.85})`,
                                boxShadow: `0 0 ${p.size * 3}px rgba(${crewColor}, ${op * 0.5})`,
                            }}
                        />
                    );
                })}

            {/* ── Logo (text-based) ── */}
            <AbsoluteFill
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: logoOpacity,
                    transform: `scale(${logoScale * logoSpring})`,
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 90 * s,
                            color: "#f47920",
                            textShadow: `0 0 ${40 + 30 * glowBuild}px rgba(244, 121, 32, ${0.4 + 0.3 * glowBuild})`,
                            letterSpacing: -2,
                        }}
                    >
                        SUPER SELLER
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: 26 * s,
                            color: `rgba(255,255,255,${0.3 + 0.15 * glowBuild})`,
                            letterSpacing: 10,
                            textTransform: "uppercase",
                            marginTop: 10,
                        }}
                    >
                        Your AI Crew
                    </div>
                </div>
            </AbsoluteFill>

            {/* ── Crew member icons ── */}
            {crewElements}

            {/* ── Tagline at bottom ── */}
            <div
                style={{
                    position: "absolute",
                    bottom: 85 * scaleY,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    opacity: taglineSpring,
                    transform: `translateY(${interpolate(taglineSpring, [0, 1], [25, 0])}px)`,
                }}
            >
                <div
                    style={{
                        fontFamily: DISPLAY_FONT_FAMILY,
                        fontWeight: 700,
                        fontSize: 52 * s,
                        color: "#FFFFFF",
                        textTransform: "uppercase",
                        letterSpacing: -0.5,
                        textShadow: "0 2px 30px rgba(0,0,0,0.6)",
                    }}
                >
                    {tagline}
                </div>
                {/* Animated underline */}
                <div
                    style={{
                        width: `${underlineWidth}%`,
                        maxWidth: 400 * s,
                        height: 3,
                        background: "linear-gradient(90deg, transparent, #f47920, #4ecdc4, transparent)",
                        margin: "12px auto 0",
                        borderRadius: 2,
                    }}
                />
            </div>

            {/* ── Light Leak Overlay ── */}
            <AbsoluteFill style={{ opacity: 0.12, pointerEvents: "none" }}>
                <LightLeak durationInFrames={durationInFrames} seed={42} hueShift={25} />
            </AbsoluteFill>

            {/* ── Film Grain ── */}
            <FilmGrain opacity={0.05} />

            {/* ── Vignette ── */}
            <Vignette intensity={0.45} />

            {/* ── Audio: Suno Music ── */}
            <Audio
                src={staticFile("audio/crew-theme-1.mp3")}
                volume={(f) => {
                    if (f < sec(0.5)) return interpolate(f, [0, sec(0.5)], [0, 0.35]);
                    if (f > sec(FADE_OUT_START)) return interpolate(f, [sec(FADE_OUT_START), sec(TOTAL)], [0.35, 0], { extrapolateRight: "clamp" });
                    return 0.35;
                }}
            />

            {/* ── SFX: Whip on explosion ── */}
            <Sequence from={sec(EXPLODE_AT)} durationInFrames={sec(1.5)}>
                <Audio src={whip} volume={0.55} />
            </Sequence>

            {/* ── SFX: Whoosh on icons flying out ── */}
            <Sequence from={sec(ICONS_START)} durationInFrames={sec(1.5)}>
                <Audio src={whoosh} volume={0.3} />
            </Sequence>
        </AbsoluteFill>
    );
};
