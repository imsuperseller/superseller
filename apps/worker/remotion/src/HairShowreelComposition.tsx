import React from "react";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    OffthreadVideo,
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
const PHOTO_DURATION = sec(2.5);
const CLIP_DURATION = sec(3.5);
const CROSSFADE = sec(0.5);
const OUTRO_DURATION = sec(3);

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
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // ─── Intro (0 → INTRO_DURATION) ─────────────────────────────
    const introOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const introScale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });

    // ─── Build timeline: interleave motion clips with photos ────
    type Segment = { type: "photo"; url: string; label?: string; index: number } | { type: "clip"; url: string; label?: string };
    const segments: Segment[] = [];

    if (motionClips.length > 0) {
        // Interleave: photo, clip, photo, clip, photo, clip, remaining photos
        const maxClips = motionClips.length;
        let photoIdx = 0;
        let clipIdx = 0;
        while (photoIdx < photos.length || clipIdx < maxClips) {
            if (photoIdx < photos.length) {
                segments.push({ type: "photo", ...photos[photoIdx], index: photoIdx });
                photoIdx++;
            }
            if (clipIdx < maxClips) {
                segments.push({ type: "clip", ...motionClips[clipIdx] });
                clipIdx++;
            }
        }
    } else {
        // Fallback: photos only (original behavior)
        photos.forEach((p, i) => segments.push({ type: "photo", ...p, index: i }));
    }

    // ─── Compute segment start times ────────────────────────────
    let cursor = INTRO_DURATION;
    const segmentTimings = segments.map((seg) => {
        const dur = seg.type === "clip" ? CLIP_DURATION : PHOTO_DURATION;
        const start = cursor;
        cursor += dur - CROSSFADE;
        return { ...seg, start, duration: dur };
    });

    // ─── Outro ──────────────────────────────────────────────────
    const outroStart = durationInFrames - OUTRO_DURATION;
    const outroOpacity = interpolate(frame, [outroStart, outroStart + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor }}>
            {/* ─── Background music ────────────────────────────── */}
            {audioUrl && (
                <Audio
                    src={audioUrl}
                    volume={(f) => {
                        // Fade in over first 1s, fade out over last 2s
                        const fadeIn = interpolate(f, [0, 30], [0, 0.7], { extrapolateRight: "clamp" });
                        const fadeOut = interpolate(f, [durationInFrames - 60, durationInFrames], [0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                        return Math.min(fadeIn, fadeOut);
                    }}
                />
            )}

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
            </Sequence>

            {/* ─── Content segments (photos + motion clips) ───── */}
            {segmentTimings.map((seg, i) => {
                const fadeIn = interpolate(frame, [seg.start, seg.start + CROSSFADE], [0, 1], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp",
                });
                const fadeOut = interpolate(frame, [seg.start + seg.duration - CROSSFADE, seg.start + seg.duration], [1, 0], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp",
                });
                const segOpacity = Math.min(fadeIn, fadeOut);

                if (seg.type === "clip") {
                    return (
                        <Sequence key={`clip-${i}`} from={seg.start} durationInFrames={seg.duration}>
                            <AbsoluteFill style={{ opacity: segOpacity }}>
                                <OffthreadVideo
                                    src={seg.url}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    muted
                                />
                                <AbsoluteFill style={{
                                    background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
                                }} />
                            </AbsoluteFill>
                        </Sequence>
                    );
                }

                const kbConfig = getKenBurnsConfig(
                    seg.index % 2 === 0 ? "interior_living" : "interior_kitchen",
                    seg.index
                );

                return (
                    <Sequence key={`photo-${i}`} from={seg.start} durationInFrames={seg.duration}>
                        <AbsoluteFill style={{ opacity: segOpacity }}>
                            <KenBurnsSlide imageUrl={seg.url} config={kbConfig} />
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
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: 4, backgroundColor: accentColor, opacity: 0.8,
                }} />
            )}

            {/* ─── Outro card ─────────────────────────────────── */}
            <Sequence from={outroStart} durationInFrames={OUTRO_DURATION}>
                <AbsoluteFill
                    style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        backgroundColor: bgColor, opacity: outroOpacity,
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
                    }}>
                        {ctaText}
                    </div>
                </AbsoluteFill>
            </Sequence>
        </AbsoluteFill>
    );
};
