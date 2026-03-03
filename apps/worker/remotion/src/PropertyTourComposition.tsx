import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { LightLeak } from "@remotion/light-leaks";

import { KenBurnsSlide } from "./components/KenBurnsSlide";
import { RoomLabel } from "./components/RoomLabel";
import { IntroCard } from "./components/IntroCard";
import { OutroCard } from "./components/OutroCard";
import { getKenBurnsConfig } from "./config/ken-burns-patterns";
import { FONT_FAMILY } from "./config/fonts";
import { FPS, INTRO_DURATION, OUTRO_DURATION, MUSIC_FADE_IN_FRAMES, MUSIC_FADE_OUT_FRAMES, MUSIC_VOLUME, getRoomDuration, sec } from "./config/timing";
import type { PropertyTourProps } from "./types/composition-props";

// ─── Branding Watermark ──────────────────────────────────────────
const BrandingWatermark: React.FC<{ branding: PropertyTourProps["branding"] }> = ({ branding }) => {
    if (!branding.showPoweredBy) return null;

    const positionStyle: React.CSSProperties = {
        position: "absolute",
        ...(branding.logoPosition === "top-right" ? { top: 30, right: 40 } : {}),
        ...(branding.logoPosition === "top-left" ? { top: 30, left: 40 } : {}),
        ...(branding.logoPosition === "bottom-right" ? { bottom: 30, right: 40 } : {}),
        ...(branding.logoPosition === "bottom-left" ? { bottom: 30, left: 40 } : {}),
        opacity: 0.4,
        display: "flex",
        alignItems: "center",
        gap: 8,
    };

    return (
        <div style={positionStyle}>
            <span style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 400,
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
            }}>
                {branding.poweredByText}
            </span>
        </div>
    );
};

// ─── Transition Patterns ─────────────────────────────────────────
// Variety of transitions to keep the tour visually engaging
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSITION_PATTERNS: Array<() => any> = [
    () => fade(),                                     // 0: clean fade
    () => slide({ direction: "from-right" }),          // 1: slide in from right
    () => wipe({ direction: "from-left" }),            // 2: wipe from left
    () => slide({ direction: "from-bottom" }),         // 3: slide from bottom
    () => fade(),                                      // 4: fade
    () => flip({ direction: "from-right" }),           // 5: 3D flip
    () => wipe({ direction: "from-right" }),           // 6: wipe from right
    () => slide({ direction: "from-left" }),           // 7: slide from left
];

// ─── Main Composition ────────────────────────────────────────────
export const PropertyTourComposition: React.FC<PropertyTourProps> = (props) => {
    const {
        address, city, state, zip,
        bedrooms, bathrooms, sqft, listingPrice,
        photos, agent, musicUrl, branding,
        showPrice, showRoomLabels,
        transitionDurationFrames,
    } = props;

    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const getTransition = (index: number) => {
        return TRANSITION_PATTERNS[index % TRANSITION_PATTERNS.length]();
    };

    const transitionTiming = linearTiming({ durationInFrames: transitionDurationFrames });

    // Calculate per-room durations
    const roomDurations = photos.map((photo, i) =>
        sec(getRoomDuration(photo.roomType, i, photos.length))
    );

    const heroImageUrl = photos[0]?.url || "";

    // Music volume with fade in/out
    const musicVolume = musicUrl
        ? (f: number) => {
            const fadeIn = interpolate(f, [0, MUSIC_FADE_IN_FRAMES], [0, MUSIC_VOLUME], {
                extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
                f,
                [durationInFrames - MUSIC_FADE_OUT_FRAMES, durationInFrames],
                [MUSIC_VOLUME, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Math.min(fadeIn, fadeOut);
        }
        : undefined;

    // Light leak overlay every 3rd transition for variety
    const shouldLightLeak = (index: number) => index > 0 && index % 3 === 0;

    return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
            {/* Background music */}
            {musicUrl && (
                <Audio src={musicUrl} volume={musicVolume} loop />
            )}

            {/* Video timeline: Intro -> Rooms -> Outro */}
            <TransitionSeries>
                {/* Intro Card */}
                <TransitionSeries.Sequence durationInFrames={sec(INTRO_DURATION)}>
                    <IntroCard
                        address={address}
                        city={city}
                        state={state}
                        zip={zip}
                        bedrooms={bedrooms}
                        bathrooms={bathrooms}
                        sqft={sqft}
                        listingPrice={listingPrice}
                        showPrice={showPrice}
                        branding={branding}
                        heroImageUrl={heroImageUrl}
                    />
                </TransitionSeries.Sequence>

                {/* Room scenes */}
                {photos.map((photo, index) => {
                    const kenBurns = getKenBurnsConfig(photo.roomType, index);
                    const duration = roomDurations[index];
                    // Light leaks disabled for now — WebGL requires --gl=angle on some systems
                    const useLightLeak = false; // index > 0 && index % 4 === 0;

                    return (
                        <React.Fragment key={`room-${index}`}>
                            {/* Either a transition or a light leak overlay (never both adjacent) */}
                            {useLightLeak ? (
                                <TransitionSeries.Overlay durationInFrames={24}>
                                    <LightLeak seed={index} hueShift={30} />
                                </TransitionSeries.Overlay>
                            ) : (
                                <TransitionSeries.Transition
                                    presentation={getTransition(index)}
                                    timing={transitionTiming}
                                />
                            )}
                            <TransitionSeries.Sequence durationInFrames={duration}>
                                <AbsoluteFill>
                                    <KenBurnsSlide
                                        imageUrl={photo.url}
                                        config={kenBurns}
                                    />
                                    {showRoomLabels && (
                                        <RoomLabel
                                            roomName={photo.roomName}
                                            branding={branding}
                                        />
                                    )}
                                </AbsoluteFill>
                            </TransitionSeries.Sequence>
                        </React.Fragment>
                    );
                })}

                {/* Outro */}
                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: 25 })}
                />
                <TransitionSeries.Sequence durationInFrames={sec(OUTRO_DURATION)}>
                    <OutroCard
                        agent={agent}
                        address={`${address}, ${city}, ${state} ${zip}`}
                        listingPrice={listingPrice}
                        showPrice={showPrice}
                        branding={branding}
                        heroImageUrl={heroImageUrl}
                    />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* Persistent watermark (on top of everything) */}
            <BrandingWatermark branding={branding} />
        </AbsoluteFill>
    );
};
