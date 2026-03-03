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
import { FONT_FAMILY } from "./config/fonts";
import { sec } from "./config/timing";
import { FilmGrain, Vignette } from "./components/shared";
import { VideoSlide } from "./components/VideoSlide";
import { SceneOverlay } from "./components/SceneOverlay";
import type { CrewDemoV3Props } from "./types/crew-demo-v3-props";

// ─── Scene Timing (seconds) ─────────────────────────────────────
const SCENE_DUR = 6;      // Each scene
const SCENE_COUNT = 5;
const TRANSITION_DUR = 0.8; // Overlap between scenes
const TOTAL = SCENE_DUR * SCENE_COUNT; // 30s total

// Transition types per scene boundary (alternating for visual variety)
const TRANSITIONS: Array<{ type: "fade" | "slide"; direction?: "from-right" | "from-left" | "from-bottom" }> = [
    { type: "slide", direction: "from-right" },
    { type: "fade" },
    { type: "slide", direction: "from-left" },
    { type: "fade" },
];

// ─── Main Composition ────────────────────────────────────────────
export const CrewDemoV3Composition: React.FC<CrewDemoV3Props> = (props) => {
    const {
        crewName,
        accentColor,
        accentColorRgb,
        icon,
        scenes,
        overlays,
    } = props;

    const { width, height } = useVideoConfig();
    const scale = Math.min(width / 1920, height / 1080);

    // Clamp scenes to 5
    // Resolve video URLs: full URLs (http/https) pass through, relative paths use staticFile()
    const sceneList = scenes.slice(0, SCENE_COUNT).map((url) =>
        url.startsWith("http") ? url : staticFile(url)
    );
    const overlayList = overlays.slice(0, SCENE_COUNT);

    return (
        <AbsoluteFill style={{ backgroundColor: "#0d1b2e" }}>
            {/* Content: TransitionSeries of full-screen video scenes */}
            <TransitionSeries>
                {sceneList.map((videoUrl, i) => {
                    const overlay = overlayList[i];
                    const transition = TRANSITIONS[i];

                    return (
                        <React.Fragment key={i}>
                            {/* Transition between scenes (skip before first) */}
                            {i > 0 && transition && (
                                <TransitionSeries.Transition
                                    presentation={
                                        transition.type === "slide"
                                            ? slide({ direction: transition.direction || "from-right" })
                                            : fade()
                                    }
                                    timing={linearTiming({ durationInFrames: sec(TRANSITION_DUR) })}
                                />
                            )}

                            <TransitionSeries.Sequence durationInFrames={sec(SCENE_DUR)}>
                                <AbsoluteFill>
                                    {/* Layer 1: Full-screen AI video */}
                                    <VideoSlide
                                        src={videoUrl}
                                        muted
                                        loop={false}
                                        fadeInFrames={sec(0.3)}
                                        fadeOutFrames={sec(0.3)}
                                        zoomStart={1.0}
                                        zoomEnd={1.03}
                                        objectFit="cover"
                                    />

                                    {/* Layer 2: Text overlay on video */}
                                    {overlay && (
                                        <SceneOverlay
                                            config={overlay}
                                            accentColor={accentColor}
                                            accentColorRgb={accentColorRgb}
                                            icon={icon}
                                            scale={scale}
                                        />
                                    )}
                                </AbsoluteFill>
                            </TransitionSeries.Sequence>
                        </React.Fragment>
                    );
                })}
            </TransitionSeries>

            {/* Film Grain */}
            <FilmGrain opacity={0.035} />

            {/* Vignette */}
            <Vignette intensity={0.4} />

            {/* ── Agent accent watermark (top-right corner) ── */}
            <Sequence from={0}>
                <AgentWatermark
                    crewName={crewName}
                    accentColor={accentColor}
                    accentColorRgb={accentColorRgb}
                    scale={scale}
                />
            </Sequence>

            {/* ── Audio: Suno Music ── */}
            <Audio
                src={staticFile("audio/crew-theme-2.mp3")}
                volume={(f) => {
                    const totalFrames = sec(TOTAL);
                    if (f < sec(1.5)) return interpolate(f, [0, sec(1.5)], [0, 0.3]);
                    if (f > totalFrames - sec(2.5)) return interpolate(f, [totalFrames - sec(2.5), totalFrames], [0.3, 0], { extrapolateRight: "clamp" });
                    return 0.3;
                }}
            />
        </AbsoluteFill>
    );
};

// ─── Agent Watermark (persistent top-right) ─────────────────────
const AgentWatermark: React.FC<{
    crewName: string;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ crewName, accentColor, accentColorRgb, scale }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const enterSpring = spring({
        frame: Math.max(0, frame - sec(0.5)),
        fps,
        config: { damping: 18, stiffness: 70, mass: 1.2 },
    });

    const fadeOut = interpolate(frame, [durationInFrames - sec(1), durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                position: "absolute",
                top: 30 * scale,
                right: 30 * scale,
                opacity: enterSpring * fadeOut,
                display: "flex",
                alignItems: "center",
                gap: 8 * scale,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)",
                borderRadius: 10 * scale,
                padding: `6px ${14 * scale}px`,
                border: `1px solid rgba(${accentColorRgb}, 0.3)`,
            }}
        >
            <div
                style={{
                    width: 6 * scale,
                    height: 6 * scale,
                    borderRadius: "50%",
                    background: accentColor,
                    boxShadow: `0 0 8px rgba(${accentColorRgb}, 0.6)`,
                }}
            />
            <span
                style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                    fontSize: 13 * scale,
                    color: "rgba(255,255,255,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                }}
            >
                {crewName}
            </span>
        </div>
    );
};
