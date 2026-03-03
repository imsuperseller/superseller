import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * OffthreadVideo wrapper with fade in/out, optional Ken Burns zoom, and trim support.
 * Designed for server-side rendering on VPS (OffthreadVideo is most reliable).
 */
export const VideoSlide: React.FC<{
    src: string;
    /** Mute video audio (default: true) */
    muted?: boolean;
    /** Loop the video (default: true) */
    loop?: boolean;
    /** Fade in duration in frames */
    fadeInFrames?: number;
    /** Fade out duration in frames */
    fadeOutFrames?: number;
    /** Ken Burns start scale (default: 1.0 = no zoom) */
    zoomStart?: number;
    /** Ken Burns end scale (default: 1.0 = no zoom) */
    zoomEnd?: number;
    /** Object fit mode */
    objectFit?: "cover" | "contain";
    style?: React.CSSProperties;
}> = ({
    src,
    muted = true,
    loop = true,
    fadeInFrames = 10,
    fadeOutFrames = 10,
    zoomStart = 1.0,
    zoomEnd = 1.05,
    objectFit = "cover",
    style,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(
        frame,
        [durationInFrames - fadeOutFrames, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const opacity = Math.min(fadeIn, fadeOut);

    const zoom = interpolate(frame, [0, durationInFrames], [zoomStart, zoomEnd], {
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill style={{ opacity, ...style }}>
            <OffthreadVideo
                src={src}
                muted={muted}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit,
                    transform: `scale(${zoom})`,
                }}
            />
        </AbsoluteFill>
    );
};
