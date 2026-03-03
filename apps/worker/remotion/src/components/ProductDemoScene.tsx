import React from "react";
import {
    AbsoluteFill,
    Sequence,
    interpolate,
    spring,
    staticFile,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { PhoneMockup } from "./PhoneMockup";
import { LaptopMockup } from "./LaptopMockup";
import { VideoSlide } from "./VideoSlide";
import { GlassPanel } from "./shared/GlassPanel";
import { FONT_FAMILY } from "../config/fonts";
import { sec } from "../config/timing";

/**
 * Product Demo Scene — the hero scene of CrewDemoV2.
 * Shows a real product video playing inside a device mockup
 * with animated annotation labels around it.
 */
export const ProductDemoScene: React.FC<{
    demoVideoUrl: string;
    deviceType: "phone" | "laptop";
    accentColor: string;
    accentColorRgb: string;
    annotations: string[];
    headline?: string;
}> = ({ demoVideoUrl, deviceType, accentColor, accentColorRgb, annotations, headline }) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();
    const isVertical = height > width;
    const s = Math.min(width / 1920, height / 1080);

    // Headline spring
    const headlineSpring = headline
        ? spring({ frame, fps, config: { damping: 14, stiffness: 60, mass: 1.5 } })
        : 0;

    // Device scale based on aspect ratio and device type
    const deviceScale = isVertical
        ? deviceType === "phone" ? s * 1.6 : s * 1.2
        : deviceType === "phone" ? s * 1.1 : s * 1.0;

    // Annotation positions around the device
    const annotationPositions = getAnnotationPositions(deviceType, isVertical, s);

    return (
        <AbsoluteFill>
            {/* Radial accent glow behind device */}
            <AbsoluteFill
                style={{
                    background: `radial-gradient(ellipse at 50% 55%, rgba(${accentColorRgb}, 0.12), transparent 60%)`,
                }}
            />

            {/* Layout container */}
            <AbsoluteFill
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20 * s,
                }}
            >
                {/* Optional headline above device */}
                {headline && (
                    <div
                        style={{
                            opacity: headlineSpring,
                            transform: `translateY(${interpolate(headlineSpring as number, [0, 1], [20, 0])}px)`,
                            textAlign: "center",
                            marginBottom: 10 * s,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 700,
                                fontSize: 28 * s,
                                color: "rgba(255,255,255,0.85)",
                                textTransform: "uppercase",
                                letterSpacing: 4,
                            }}
                        >
                            {headline}
                        </span>
                    </div>
                )}

                {/* Device mockup with video */}
                <div style={{ position: "relative" }}>
                    {deviceType === "phone" ? (
                        <PhoneMockup accentColorRgb={accentColorRgb} scale={deviceScale} delay={sec(0.2)}>
                            <VideoSlide
                                src={staticFile(demoVideoUrl)}
                                fadeInFrames={sec(0.5)}
                                fadeOutFrames={sec(0.5)}
                                zoomStart={1.0}
                                zoomEnd={1.03}
                            />
                        </PhoneMockup>
                    ) : (
                        <LaptopMockup accentColorRgb={accentColorRgb} scale={deviceScale} delay={sec(0.2)}>
                            <VideoSlide
                                src={staticFile(demoVideoUrl)}
                                fadeInFrames={sec(0.5)}
                                fadeOutFrames={sec(0.5)}
                                zoomStart={1.0}
                                zoomEnd={1.02}
                            />
                        </LaptopMockup>
                    )}

                    {/* Annotation labels */}
                    {annotations.map((label, i) => {
                        const annotDelay = sec(1.5 + i * 0.7);
                        const annotFrame = Math.max(0, frame - annotDelay);
                        const annotSpring = spring({
                            frame: annotFrame,
                            fps,
                            config: { damping: 16, stiffness: 65, mass: 1.3 },
                        });

                        const pos = annotationPositions[i % annotationPositions.length];

                        // Fade out in last 1s of scene
                        const fadeOut = interpolate(
                            frame,
                            [durationInFrames - sec(1), durationInFrames],
                            [1, 0],
                            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                        );

                        return (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    ...pos,
                                    opacity: annotSpring * fadeOut,
                                    transform: `translateY(${interpolate(annotSpring, [0, 1], [15, 0])}px) scale(${interpolate(annotSpring, [0, 1], [0.9, 1])})`,
                                    zIndex: 20,
                                }}
                            >
                                <AnnotationTag
                                    label={label}
                                    accentColor={accentColor}
                                    accentColorRgb={accentColorRgb}
                                    scale={s}
                                />
                            </div>
                        );
                    })}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

/** Small glass-panel annotation tag */
const AnnotationTag: React.FC<{
    label: string;
    accentColor: string;
    accentColorRgb: string;
    scale: number;
}> = ({ label, accentColor, accentColorRgb, scale }) => (
    <div
        style={{
            background: `linear-gradient(135deg, rgba(${accentColorRgb}, 0.15), rgba(0,0,0,0.5))`,
            border: `1px solid rgba(${accentColorRgb}, 0.3)`,
            borderRadius: 14 * scale,
            backdropFilter: "blur(8px)",
            padding: `${8 * scale}px ${18 * scale}px`,
            boxShadow: `0 8px 25px rgba(0,0,0,0.3), 0 0 15px rgba(${accentColorRgb}, 0.1)`,
            whiteSpace: "nowrap",
        }}
    >
        <span
            style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 700,
                fontSize: 16 * scale,
                color: accentColor,
                letterSpacing: 1,
            }}
        >
            {label}
        </span>
    </div>
);

/**
 * Returns position offsets for annotation labels around the device.
 * Positions are relative to the device's container div.
 */
function getAnnotationPositions(
    deviceType: "phone" | "laptop",
    isVertical: boolean,
    scale: number
): React.CSSProperties[] {
    if (deviceType === "phone") {
        if (isVertical) {
            return [
                { right: -180 * scale, top: "15%" },
                { left: -180 * scale, top: "45%" },
                { right: -180 * scale, top: "75%" },
            ];
        }
        return [
            { right: -220 * scale, top: "10%" },
            { left: -220 * scale, top: "45%" },
            { right: -220 * scale, top: "75%" },
        ];
    }

    // Laptop
    if (isVertical) {
        return [
            { right: -160 * scale, top: "5%" },
            { left: -160 * scale, top: "40%" },
            { right: -160 * scale, bottom: "25%" },
        ];
    }
    return [
        { right: -240 * scale, top: "8%" },
        { left: -240 * scale, top: "42%" },
        { right: -240 * scale, bottom: "20%" },
    ];
}
