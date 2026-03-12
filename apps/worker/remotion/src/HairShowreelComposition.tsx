import React from "react";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    OffthreadVideo,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { PLAYFAIR_FONT_FAMILY, FONT_FAMILY } from "./config/fonts";
import { KenBurnsSlide } from "./components/KenBurnsSlide";
import { getKenBurnsConfig } from "./config/ken-burns-patterns";
import { FilmGrain } from "./components/shared/FilmGrain";
import { Vignette } from "./components/shared/Vignette";
import type { HairShowreelProps } from "./types/hair-showreel-props";
import { sec } from "./config/timing";

const INTRO_DURATION = sec(3.5);
const CLIP_DURATION = sec(4);
const PHOTO_DURATION = sec(3);
const TRANSITION_FRAMES = sec(0.6);
const OUTRO_DURATION = sec(3.5);

// ─── Transition variety ──────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSITION_PATTERNS: Array<() => any> = [
    () => fade(),
    () => slide({ direction: "from-right" }),
    () => wipe({ direction: "from-left" }),
    () => slide({ direction: "from-bottom" }),
    () => fade(),
    () => wipe({ direction: "from-right" }),
    () => slide({ direction: "from-left" }),
    () => fade(),
];

// ─── Warm film color grading ─────────────────────────────────────
const COLOR_GRADE_STYLE: React.CSSProperties = {
    filter: "saturate(1.1) contrast(1.05) brightness(1.02)",
    // Warm tone via overlay
};

const WarmOverlay: React.FC = () => (
    <AbsoluteFill
        style={{
            background: "linear-gradient(180deg, rgba(201,169,110,0.06) 0%, rgba(0,0,0,0) 40%, rgba(201,169,110,0.04) 100%)",
            mixBlendMode: "overlay",
            pointerEvents: "none",
        }}
    />
);

// ─── Intro Card (standalone for TransitionSeries) ────────────────
const IntroCard: React.FC<{
    businessName: string;
    tagline: string;
    accentColor: string;
    bgColor: string;
}> = ({ businessName, tagline, accentColor, bgColor }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const scale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: bgColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity,
                transform: `scale(${interpolate(scale, [0, 1], [0.9, 1])})`,
            }}
        >
            <div style={{
                width: 80, height: 2, backgroundColor: accentColor, marginBottom: 30,
                opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }),
            }} />
            <div style={{
                fontFamily: PLAYFAIR_FONT_FAMILY, fontSize: 72, fontWeight: 700,
                color: "#fff", letterSpacing: 2, textAlign: "center",
            }}>
                {businessName}
            </div>
            <div style={{
                fontFamily: FONT_FAMILY, fontSize: 24, color: accentColor,
                letterSpacing: 4, textTransform: "uppercase", marginTop: 16,
                opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                {tagline}
            </div>
            <div style={{
                width: 80, height: 2, backgroundColor: accentColor, marginTop: 30,
                opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" }),
            }} />
        </AbsoluteFill>
    );
};

// ─── Motion Clip Scene ───────────────────────────────────────────
const MotionClipScene: React.FC<{ url: string }> = ({ url }) => {
    const frame = useCurrentFrame();
    // Subtle slow zoom for cinematic feel
    const zoom = interpolate(frame, [0, 120], [1.0, 1.04], {
        extrapolateRight: "clamp",
    });
    return (
        <AbsoluteFill style={COLOR_GRADE_STYLE}>
            <OffthreadVideo
                src={url}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${zoom})`,
                }}
                muted
            />
            <Vignette intensity={0.35} />
            <WarmOverlay />
        </AbsoluteFill>
    );
};

// ─── Photo Scene (Ken Burns fallback) ────────────────────────────
const PhotoScene: React.FC<{ url: string; index: number }> = ({ url, index }) => {
    const kbConfig = getKenBurnsConfig(
        index % 2 === 0 ? "interior_living" : "interior_kitchen",
        index
    );
    return (
        <AbsoluteFill style={COLOR_GRADE_STYLE}>
            <KenBurnsSlide imageUrl={url} config={kbConfig} />
            <Vignette intensity={0.45} />
            <WarmOverlay />
        </AbsoluteFill>
    );
};

// ─── Outro Card (standalone for TransitionSeries) ────────────────
const OutroCard: React.FC<{
    businessName: string;
    ctaText: string;
    accentColor: string;
    bgColor: string;
}> = ({ businessName, ctaText, accentColor, bgColor }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const btnScale = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 14, stiffness: 80 } });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: bgColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity,
            }}
        >
            <div style={{
                fontFamily: PLAYFAIR_FONT_FAMILY, fontSize: 56, fontWeight: 700,
                color: "#fff", textAlign: "center", marginBottom: 24,
            }}>
                {businessName}
            </div>
            <div style={{
                fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 600,
                color: accentColor, letterSpacing: 3, textTransform: "uppercase",
                padding: "12px 40px", border: `2px solid ${accentColor}`,
                transform: `scale(${interpolate(btnScale, [0, 1], [0.8, 1])})`,
            }}>
                {ctaText}
            </div>
        </AbsoluteFill>
    );
};

// ─── Main Composition ────────────────────────────────────────────
export const HairShowreelComposition: React.FC<HairShowreelProps> = ({
    photos,
    motionClips = [],
    audioUrl,
    businessName,
    tagline,
    accentColor,
    bgColor,
    ctaText,
}) => {
    const { durationInFrames } = useVideoConfig();

    const transitionTiming = linearTiming({ durationInFrames: TRANSITION_FRAMES });

    const getTransition = (index: number) => {
        return TRANSITION_PATTERNS[index % TRANSITION_PATTERNS.length]();
    };

    // Build segments: prefer motion clips, fall back to Ken Burns photos
    type Segment = { type: "clip"; url: string; index: number } | { type: "photo"; url: string; index: number };
    const segments: Segment[] = [];

    if (motionClips.length >= photos.length) {
        // All photos have motion — use only clips
        motionClips.forEach((clip, i) => {
            segments.push({ type: "clip", url: clip.url, index: i });
        });
    } else if (motionClips.length > 0) {
        // Mix: interleave clips with remaining photos as Ken Burns
        const clipSet = new Set(motionClips.map((_, i) => i));
        for (let i = 0; i < Math.max(photos.length, motionClips.length); i++) {
            if (i < motionClips.length) {
                segments.push({ type: "clip", url: motionClips[i].url, index: i });
            }
            if (i < photos.length && i >= motionClips.length) {
                segments.push({ type: "photo", url: photos[i].url, index: i });
            } else if (i < photos.length && i < motionClips.length) {
                // Skip photo when we have its motion clip
            }
        }
        // If we have fewer clips than photos, add remaining photos
        if (segments.length < photos.length) {
            for (let i = motionClips.length; i < photos.length; i++) {
                segments.push({ type: "photo", url: photos[i].url, index: i });
            }
        }
    } else {
        // No clips — all Ken Burns
        photos.forEach((p, i) => segments.push({ type: "photo", url: p.url, index: i }));
    }

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor }}>
            {/* ─── Background music ────────────────────────────── */}
            {audioUrl && (
                <Audio
                    src={audioUrl}
                    volume={(f) => {
                        const fadeIn = interpolate(f, [0, 45], [0, 0.65], { extrapolateRight: "clamp" });
                        const fadeOut = interpolate(f, [durationInFrames - 75, durationInFrames], [0.65, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                        return Math.min(fadeIn, fadeOut);
                    }}
                />
            )}

            {/* ─── Timeline with real transitions ─────────────── */}
            <TransitionSeries>
                {/* Intro */}
                <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
                    <IntroCard
                        businessName={businessName}
                        tagline={tagline}
                        accentColor={accentColor}
                        bgColor={bgColor}
                    />
                </TransitionSeries.Sequence>

                {/* Content segments */}
                {segments.map((seg, i) => {
                    const duration = seg.type === "clip" ? CLIP_DURATION : PHOTO_DURATION;
                    return (
                        <React.Fragment key={`seg-${i}`}>
                            <TransitionSeries.Transition
                                presentation={getTransition(i)}
                                timing={transitionTiming}
                            />
                            <TransitionSeries.Sequence durationInFrames={duration}>
                                {seg.type === "clip" ? (
                                    <MotionClipScene url={seg.url} />
                                ) : (
                                    <PhotoScene url={seg.url} index={seg.index} />
                                )}
                            </TransitionSeries.Sequence>
                        </React.Fragment>
                    );
                })}

                {/* Outro */}
                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: sec(0.8) })}
                />
                <TransitionSeries.Sequence durationInFrames={OUTRO_DURATION}>
                    <OutroCard
                        businessName={businessName}
                        ctaText={ctaText}
                        accentColor={accentColor}
                        bgColor={bgColor}
                    />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* ─── Global overlays ─────────────────────────────── */}
            <FilmGrain opacity={0.03} />

            {/* ─── Persistent gold accent bar (bottom) ─────────── */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 3, backgroundColor: accentColor, opacity: 0.7,
            }} />
        </AbsoluteFill>
    );
};
