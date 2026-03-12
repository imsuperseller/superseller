import React from "react";
import {
    AbsoluteFill,
    Img,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Sequence,
} from "remotion";
import { PLAYFAIR_FONT_FAMILY, FONT_FAMILY } from "./config/fonts";
import { KenBurnsSlide } from "./components/KenBurnsSlide";
import { getKenBurnsConfig } from "./config/ken-burns-patterns";
import type { HairShowreelProps } from "./types/hair-showreel-props";
import { sec } from "./config/timing";

const INTRO_DURATION = sec(3);
const PHOTO_DURATION = sec(2.5);  // Per photo (shorter for showreel feel)
const CROSSFADE = sec(0.5);       // Crossfade overlap between photos
const OUTRO_DURATION = sec(3);

export const HairShowreelComposition: React.FC<HairShowreelProps> = ({
    photos,
    businessName,
    tagline,
    accentColor,
    bgColor,
    ctaText,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // ─── Intro (0 → INTRO_DURATION) ─────────────────────────────
    const introOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const introScale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });

    // ─── Photo section starts after intro ───────────────────────
    const photoSectionStart = INTRO_DURATION;

    // ─── Outro ──────────────────────────────────────────────────
    const outroStart = durationInFrames - OUTRO_DURATION;
    const outroOpacity = interpolate(frame, [outroStart, outroStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor }}>
            {/* ─── Intro card ─────────────────────────────────── */}
            <Sequence from={0} durationInFrames={INTRO_DURATION + CROSSFADE}>
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: introOpacity,
                        transform: `scale(${interpolate(introScale, [0, 1], [0.9, 1])})`,
                    }}
                >
                    {/* Decorative line */}
                    <div style={{
                        width: 80,
                        height: 2,
                        backgroundColor: accentColor,
                        marginBottom: 30,
                        opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }),
                    }} />
                    <div style={{
                        fontFamily: PLAYFAIR_FONT_FAMILY,
                        fontSize: 72,
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: 2,
                        textAlign: "center",
                    }}>
                        {businessName}
                    </div>
                    <div style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 24,
                        color: accentColor,
                        letterSpacing: 4,
                        textTransform: "uppercase",
                        marginTop: 16,
                        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
                    }}>
                        {tagline}
                    </div>
                    {/* Decorative line */}
                    <div style={{
                        width: 80,
                        height: 2,
                        backgroundColor: accentColor,
                        marginTop: 30,
                        opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" }),
                    }} />
                </AbsoluteFill>
            </Sequence>

            {/* ─── Photo slides with Ken Burns ─────────────────── */}
            {photos.map((photo, i) => {
                const slideStart = photoSectionStart + i * (PHOTO_DURATION - CROSSFADE);
                const slideEnd = slideStart + PHOTO_DURATION;

                // Fade in/out for crossfade
                const fadeIn = interpolate(frame, [slideStart, slideStart + CROSSFADE], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                });
                const fadeOut = interpolate(frame, [slideEnd - CROSSFADE, slideEnd], [1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                });
                const slideOpacity = Math.min(fadeIn, fadeOut);

                // Alternate Ken Burns patterns
                const kbConfig = getKenBurnsConfig(
                    i % 2 === 0 ? "interior_living" : "interior_kitchen",
                    i
                );

                return (
                    <Sequence key={i} from={slideStart} durationInFrames={PHOTO_DURATION}>
                        <AbsoluteFill style={{ opacity: slideOpacity }}>
                            <KenBurnsSlide imageUrl={photo.url} config={kbConfig} />
                            {/* Subtle vignette overlay */}
                            <AbsoluteFill style={{
                                background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
                            }} />
                        </AbsoluteFill>
                    </Sequence>
                );
            })}

            {/* ─── Persistent gold accent bar (bottom) ─────────── */}
            {frame > INTRO_DURATION && frame < outroStart && (
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: accentColor,
                    opacity: 0.8,
                }} />
            )}

            {/* ─── Outro card ─────────────────────────────────── */}
            <Sequence from={outroStart} durationInFrames={OUTRO_DURATION}>
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: bgColor,
                        opacity: outroOpacity,
                    }}
                >
                    <div style={{
                        fontFamily: PLAYFAIR_FONT_FAMILY,
                        fontSize: 56,
                        fontWeight: 700,
                        color: "#fff",
                        textAlign: "center",
                        marginBottom: 24,
                    }}>
                        {businessName}
                    </div>
                    <div style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 28,
                        fontWeight: 600,
                        color: accentColor,
                        letterSpacing: 3,
                        textTransform: "uppercase",
                        padding: "12px 40px",
                        border: `2px solid ${accentColor}`,
                    }}>
                        {ctaText}
                    </div>
                </AbsoluteFill>
            </Sequence>
        </AbsoluteFill>
    );
};
