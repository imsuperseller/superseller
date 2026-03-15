import React from "react";
import {
    AbsoluteFill,
    Img,
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
import { FilmGrain } from "./components/shared/FilmGrain";
import { Vignette } from "./components/shared/Vignette";
import type { CharacterRevealProps } from "./types/character-reveal-props";
import { sec } from "./config/timing";

const INTRO_DURATION = sec(3.5);
const SCENE_DURATION = sec(5);
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

// ─── Intro Card ──────────────────────────────────────────────────
const IntroCard: React.FC<{
    characterName: string;
    tagline: string;
    accentColor: string;
    bgColor: string;
    logoUrl?: string;
}> = ({ characterName, tagline, accentColor, bgColor, logoUrl }) => {
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
            {/* Optional logo */}
            {logoUrl && (
                <div style={{
                    marginBottom: 32,
                    opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" }),
                }}>
                    <Img
                        src={logoUrl}
                        style={{ maxWidth: 160, maxHeight: 80, objectFit: "contain" }}
                    />
                </div>
            )}

            {/* Accent bar top */}
            <div style={{
                width: 80, height: 2, backgroundColor: accentColor, marginBottom: 30,
                opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }),
            }} />

            {/* Character name */}
            <div style={{
                fontFamily: PLAYFAIR_FONT_FAMILY, fontSize: 72, fontWeight: 700,
                color: "#fff", letterSpacing: 2, textAlign: "center",
            }}>
                {characterName}
            </div>

            {/* Tagline */}
            <div style={{
                fontFamily: FONT_FAMILY, fontSize: 24, color: accentColor,
                letterSpacing: 4, textTransform: "uppercase", marginTop: 16,
                opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                {tagline}
            </div>

            {/* Accent bar bottom */}
            <div style={{
                width: 80, height: 2, backgroundColor: accentColor, marginTop: 30,
                opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" }),
            }} />
        </AbsoluteFill>
    );
};

// ─── Scene Clip with Label Overlay ───────────────────────────────
const SceneClip: React.FC<{
    url: string;
    label: string;
    accentColor: string;
}> = ({ url, label, accentColor }) => {
    const frame = useCurrentFrame();
    const labelOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
    const zoom = interpolate(frame, [0, 150], [1.0, 1.04], { extrapolateRight: "clamp" });

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
            <FilmGrain opacity={0.025} />

            {/* Scene label overlay at bottom */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "15%",
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 60,
                    opacity: labelOpacity,
                }}
            >
                {/* Accent color underline indicator */}
                <div style={{
                    width: 4,
                    height: 36,
                    backgroundColor: accentColor,
                    marginRight: 20,
                    borderRadius: 2,
                }} />
                <div style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 28,
                    fontWeight: 500,
                    color: "#fff",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                }}>
                    {label}
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ─── Outro Card ──────────────────────────────────────────────────
const OutroCard: React.FC<{
    characterName: string;
    businessName: string;
    accentColor: string;
    bgColor: string;
}> = ({ characterName, businessName, accentColor, bgColor }) => {
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
            {/* "Your AI Character" label */}
            <div style={{
                fontFamily: FONT_FAMILY,
                fontSize: 20,
                color: accentColor,
                letterSpacing: 5,
                textTransform: "uppercase",
                marginBottom: 20,
                opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
            }}>
                Your AI Character
            </div>

            {/* Character name */}
            <div style={{
                fontFamily: PLAYFAIR_FONT_FAMILY, fontSize: 72, fontWeight: 700,
                color: "#fff", textAlign: "center", marginBottom: 16,
            }}>
                {characterName}
            </div>

            {/* Accent divider */}
            <div style={{
                width: 120, height: 2, backgroundColor: accentColor,
                marginBottom: 24,
                transform: `scale(${interpolate(btnScale, [0, 1], [0, 1])})`,
            }} />

            {/* Business name */}
            <div style={{
                fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 400,
                color: "rgba(255,255,255,0.7)", letterSpacing: 2,
                textTransform: "uppercase",
            }}>
                {businessName}
            </div>
        </AbsoluteFill>
    );
};

// ─── Main Composition ────────────────────────────────────────────
export const CharacterRevealComposition: React.FC<CharacterRevealProps> = ({
    characterName,
    businessName,
    tagline,
    accentColor,
    bgColor,
    logoUrl,
    sceneClips,
    sceneLabels,
}) => {
    const transitionTiming = linearTiming({ durationInFrames: TRANSITION_FRAMES });

    const getTransition = (index: number) => {
        return TRANSITION_PATTERNS[index % TRANSITION_PATTERNS.length]();
    };

    // Filter out empty/missing clips
    const validClips = sceneClips.filter((url) => url && url.trim().length > 0);

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor }}>
            {/* ─── Timeline with transitions ───────────────────── */}
            <TransitionSeries>
                {/* Intro */}
                <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
                    <IntroCard
                        characterName={characterName}
                        tagline={tagline}
                        accentColor={accentColor}
                        bgColor={bgColor}
                        logoUrl={logoUrl}
                    />
                </TransitionSeries.Sequence>

                {/* Scene clips */}
                {validClips.map((clipUrl, i) => {
                    const label = sceneLabels[i] ?? `Scene ${i + 1}`;
                    return (
                        <React.Fragment key={`scene-${i}`}>
                            <TransitionSeries.Transition
                                presentation={getTransition(i)}
                                timing={transitionTiming}
                            />
                            <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
                                <SceneClip
                                    url={clipUrl}
                                    label={label}
                                    accentColor={accentColor}
                                />
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
                        characterName={characterName}
                        businessName={businessName}
                        accentColor={accentColor}
                        bgColor={bgColor}
                    />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* ─── Global film grain overlay ───────────────────── */}
            <FilmGrain opacity={0.03} />

            {/* ─── Persistent accent bar (bottom) ─────────────── */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 3, backgroundColor: accentColor, opacity: 0.7,
            }} />
        </AbsoluteFill>
    );
};
