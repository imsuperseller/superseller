import React from "react";
import { AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { KenBurnsSlide } from "./components/KenBurnsSlide";
import { sec } from "./config/timing";
import { FONT_FAMILY } from "./config/fonts";
import type { BeforeAfterProps } from "./types/before-after-props";
import type { KenBurnsConfig } from "./config/ken-burns-patterns";

// ─── Ken Burns configs (inline per research recommendation) ──────

const BEFORE_KB_CONFIG: KenBurnsConfig = {
    startScale: 1.08,
    endScale: 1.15,
    startX: 50,
    startY: 50,
    endX: 45,
    endY: 50,
    easing: Easing.inOut(Easing.quad),
};

const AFTER_KB_CONFIG: KenBurnsConfig = {
    startScale: 1.12,
    endScale: 1.05,
    startX: 55,
    startY: 50,
    endX: 50,
    endY: 50,
    easing: Easing.inOut(Easing.sin),
};

// ─── Logo Overlay ────────────────────────────────────────────────

const LogoOverlay: React.FC<{
    logoUrl: string;
    logoPosition: BeforeAfterProps["logoPosition"];
    logoWidth: number;
}> = ({ logoUrl, logoPosition, logoWidth }) => {
    const positionStyle: React.CSSProperties = {
        position: "absolute",
        ...(logoPosition === "top-right" ? { top: 30, right: 40 } : {}),
        ...(logoPosition === "top-left" ? { top: 30, left: 40 } : {}),
        ...(logoPosition === "bottom-right" ? { bottom: 30, right: 40 } : {}),
        ...(logoPosition === "bottom-left" ? { bottom: 30, left: 40 } : {}),
        zIndex: 10,
    };

    return (
        <div style={positionStyle}>
            <Img
                src={logoUrl}
                style={{ width: logoWidth, height: "auto", objectFit: "contain" }}
            />
        </div>
    );
};

// ─── Intro Card Scene ────────────────────────────────────────────

const IntroScene: React.FC<{ serviceLabel: string; brandColor: string; isVertical: boolean }> = ({
    serviceLabel,
    brandColor,
    isVertical,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const labelFontSize = isVertical ? 36 : 48;

    const opacity = spring({ frame, fps, from: 0, to: 1, config: { damping: 20 } });
    const translateY = spring({ frame, fps, from: 30, to: 0, config: { damping: 20 } });

    return (
        <AbsoluteFill style={{ backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" }}>
            <div
                style={{
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 20,
                }}
            >
                <div
                    style={{
                        backgroundColor: brandColor,
                        borderRadius: 32,
                        paddingLeft: 32,
                        paddingRight: 32,
                        paddingTop: 14,
                        paddingBottom: 14,
                    }}
                >
                    <span
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: labelFontSize,
                            color: "#FFFFFF",
                            letterSpacing: 1,
                        }}
                    >
                        {serviceLabel}
                    </span>
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ─── Before Scene ────────────────────────────────────────────────

const BeforeScene: React.FC<{
    beforeImageUrl: string;
    serviceLabel: string;
    brandColor: string;
    isVertical: boolean;
}> = ({ beforeImageUrl, serviceLabel, brandColor, isVertical }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const labelFontSize = isVertical ? 36 : 48;

    const pillOpacity = spring({ frame, fps, from: 0, to: 1, config: { damping: 20 } });
    const pillY = spring({ frame, fps, from: 20, to: 0, config: { damping: 20 } });

    return (
        <AbsoluteFill>
            <KenBurnsSlide imageUrl={beforeImageUrl} config={BEFORE_KB_CONFIG} />
            {/* BEFORE label */}
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60 }}>
                <div
                    style={{
                        opacity: pillOpacity,
                        transform: `translateY(${pillY}px)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "rgba(0,0,0,0.55)",
                            borderRadius: 8,
                            paddingLeft: 20,
                            paddingRight: 20,
                            paddingTop: 6,
                            paddingBottom: 6,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 600,
                                fontSize: isVertical ? 22 : 28,
                                color: "rgba(255,255,255,0.75)",
                                letterSpacing: 3,
                                textTransform: "uppercase" as const,
                            }}
                        >
                            BEFORE
                        </span>
                    </div>
                    <div
                        style={{
                            backgroundColor: brandColor,
                            borderRadius: 32,
                            paddingLeft: 28,
                            paddingRight: 28,
                            paddingTop: 12,
                            paddingBottom: 12,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 700,
                                fontSize: labelFontSize,
                                color: "#FFFFFF",
                            }}
                        >
                            {serviceLabel}
                        </span>
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

// ─── After Scene ─────────────────────────────────────────────────

const AfterScene: React.FC<{
    afterImageUrl: string;
    tagline: string;
    isVertical: boolean;
}> = ({ afterImageUrl, tagline, isVertical }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const taglineFontSize = isVertical ? 42 : 56;

    const textOpacity = spring({ frame, fps, from: 0, to: 1, config: { damping: 20 } });
    const textY = spring({ frame, fps, from: 20, to: 0, config: { damping: 20 } });

    return (
        <AbsoluteFill>
            <KenBurnsSlide imageUrl={afterImageUrl} config={AFTER_KB_CONFIG} />
            {/* AFTER label + tagline */}
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60 }}>
                <div
                    style={{
                        opacity: textOpacity,
                        transform: `translateY(${textY}px)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "rgba(0,0,0,0.55)",
                            borderRadius: 8,
                            paddingLeft: 20,
                            paddingRight: 20,
                            paddingTop: 6,
                            paddingBottom: 6,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 600,
                                fontSize: isVertical ? 22 : 28,
                                color: "rgba(255,255,255,0.75)",
                                letterSpacing: 3,
                                textTransform: "uppercase" as const,
                            }}
                        >
                            AFTER
                        </span>
                    </div>
                    <div
                        style={{
                            backgroundColor: "rgba(0,0,0,0.55)",
                            borderRadius: 16,
                            paddingLeft: 32,
                            paddingRight: 32,
                            paddingTop: 14,
                            paddingBottom: 14,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 700,
                                fontSize: taglineFontSize,
                                color: "#FFFFFF",
                                textAlign: "center" as const,
                            }}
                        >
                            {tagline}
                        </span>
                    </div>
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};

// ─── CTA Outro Scene ─────────────────────────────────────────────

const CtaScene: React.FC<{ ctaText: string; brandColor: string; isVertical: boolean }> = ({
    ctaText,
    brandColor,
    isVertical,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const ctaFontSize = isVertical ? 32 : 40;

    const opacity = spring({ frame, fps, from: 0, to: 1, config: { damping: 20 } });
    const scale = spring({ frame, fps, from: 0.85, to: 1, config: { damping: 20 } });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: brandColor,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    opacity,
                    transform: `scale(${scale})`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <span
                    style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 800,
                        fontSize: ctaFontSize,
                        color: "#FFFFFF",
                        letterSpacing: 1,
                        textAlign: "center" as const,
                    }}
                >
                    {ctaText}
                </span>
            </div>
        </AbsoluteFill>
    );
};

// ─── Main Composition ─────────────────────────────────────────────

export const BeforeAfterComposition: React.FC<BeforeAfterProps> = (props) => {
    const {
        beforeImageUrl,
        afterImageUrl,
        serviceLabel,
        tagline,
        brandColor,
        logoUrl,
        logoPosition,
        logoWidth,
        ctaText,
    } = props;

    const { width, height } = useVideoConfig();
    const isVertical = height > width;
    const wipeDirection = isVertical ? "from-top" : "from-left";

    return (
        <AbsoluteFill>
            <TransitionSeries>
                {/* Scene 1: Intro card — 30 frames (1s) */}
                <TransitionSeries.Sequence durationInFrames={sec(1)}>
                    <IntroScene serviceLabel={serviceLabel} brandColor={brandColor} isVertical={isVertical} />
                </TransitionSeries.Sequence>

                {/* Transition: fade */}
                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: 15 })}
                />

                {/* Scene 2: Before image — 75 frames (2.5s) */}
                <TransitionSeries.Sequence durationInFrames={sec(2.5)}>
                    <BeforeScene
                        beforeImageUrl={beforeImageUrl}
                        serviceLabel={serviceLabel}
                        brandColor={brandColor}
                        isVertical={isVertical}
                    />
                </TransitionSeries.Sequence>

                {/* Transition: wipe — HERO transition */}
                <TransitionSeries.Transition
                    presentation={wipe({ direction: wipeDirection })}
                    timing={linearTiming({ durationInFrames: sec(1.5) })}
                />

                {/* Scene 3: After image — 75 frames (2.5s) */}
                <TransitionSeries.Sequence durationInFrames={sec(2.5)}>
                    <AfterScene afterImageUrl={afterImageUrl} tagline={tagline} isVertical={isVertical} />
                </TransitionSeries.Sequence>

                {/* Transition: fade */}
                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: 15 })}
                />

                {/* Scene 4: CTA outro — 15 frames (0.5s) */}
                <TransitionSeries.Sequence durationInFrames={sec(0.5)}>
                    <CtaScene ctaText={ctaText} brandColor={brandColor} isVertical={isVertical} />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* Logo overlay — rendered on top of all scenes */}
            {logoUrl ? (
                <LogoOverlay logoUrl={logoUrl} logoPosition={logoPosition} logoWidth={logoWidth} />
            ) : null}
        </AbsoluteFill>
    );
};
