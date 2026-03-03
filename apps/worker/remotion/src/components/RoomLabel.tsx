import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ROOM_LABEL_DELAY_FRAMES, ROOM_LABEL_DURATION, ROOM_LABEL_FADE_OUT } from "../config/timing";
import { FONT_FAMILY } from "../config/fonts";
import type { BrandingConfig } from "../types/composition-props";

type RoomLabelProps = {
    roomName: string;
    branding: BrandingConfig;
};

export const RoomLabel: React.FC<RoomLabelProps> = ({ roomName, branding }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Don't render before delay
    if (frame < ROOM_LABEL_DELAY_FRAMES) return null;

    const localFrame = frame - ROOM_LABEL_DELAY_FRAMES;
    const endFrame = ROOM_LABEL_DURATION;

    // Don't render after duration
    if (localFrame > endFrame) return null;

    // Spring-in animation
    const enterProgress = spring({
        frame: localFrame,
        fps,
        config: { damping: 200, stiffness: 100 },
    });

    // Fade-out at end
    const fadeOut = localFrame > endFrame - ROOM_LABEL_FADE_OUT
        ? interpolate(localFrame, [endFrame - ROOM_LABEL_FADE_OUT, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 1;

    const opacity = enterProgress * fadeOut;
    const translateX = interpolate(enterProgress, [0, 1], [-40, 0]);

    return (
        <div
            style={{
                position: "absolute",
                bottom: 100,
                left: 80,
                opacity,
                transform: `translateX(${translateX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 0,
            }}
        >
            <div
                style={{
                    background: branding.overlayBgColor,
                    borderRadius: 24,
                    padding: "12px 28px",
                    borderBottom: `2px solid ${branding.primaryColor}`,
                }}
            >
                <span
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 600,
                        fontSize: 42,
                        color: branding.textColor,
                        letterSpacing: "0.02em",
                    }}
                >
                    {roomName}
                </span>
            </div>
        </div>
    );
};
