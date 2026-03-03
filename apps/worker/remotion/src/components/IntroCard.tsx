import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ADDRESS_APPEAR_FRAME, STATS_APPEAR_FRAME, sec } from "../config/timing";
import { FONT_FAMILY, DISPLAY_FONT_FAMILY } from "../config/fonts";
import type { BrandingConfig } from "../types/composition-props";

type IntroCardProps = {
    address: string;
    city: string;
    state: string;
    zip: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    listingPrice: number;
    showPrice: boolean;
    branding: BrandingConfig;
    heroImageUrl: string;
};

const formatPrice = (price: number): string => {
    if (price >= 1_000_000) {
        return `$${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    return `$${price.toLocaleString("en-US")}`;
};

export const IntroCard: React.FC<IntroCardProps> = ({
    address, city, state, zip,
    bedrooms, bathrooms, sqft, listingPrice,
    showPrice, branding, heroImageUrl,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Background: hero image with dark overlay and Ken Burns
    const bgScale = interpolate(frame, [0, durationInFrames], [1.1, 1.2], {
        extrapolateRight: "clamp",
    });

    // Logo animation
    const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });

    // Address animation (appears at ADDRESS_APPEAR_FRAME)
    const addrFrame = Math.max(0, frame - ADDRESS_APPEAR_FRAME);
    const addrSpring = spring({ frame: addrFrame, fps, config: { damping: 200 } });
    const addrY = interpolate(addrSpring, [0, 1], [30, 0]);
    const addrFadeOut = interpolate(frame, [durationInFrames - sec(0.5), durationInFrames], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Stats animation (staggered, appears at STATS_APPEAR_FRAME)
    const stats = [
        `${bedrooms} Beds`,
        `${bathrooms} Baths`,
        `${sqft.toLocaleString()} SqFt`,
    ];

    // Price animation
    const priceFrame = Math.max(0, frame - sec(3.0));
    const priceSpring = spring({ frame: priceFrame, fps, config: { damping: 200 } });

    return (
        <AbsoluteFill>
            {/* Background hero image with dark overlay */}
            <AbsoluteFill style={{ overflow: "hidden" }}>
                <Img
                    src={heroImageUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${bgScale})`,
                        filter: "brightness(0.35) blur(2px)",
                    }}
                />
            </AbsoluteFill>

            {/* Content overlay */}
            <AbsoluteFill
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 20,
                }}
            >
                {/* Logo */}
                {branding.logoUrl && (
                    <Img
                        src={branding.logoUrl}
                        style={{
                            width: branding.logoWidth * 1.6,
                            opacity: logoSpring,
                            transform: `scale(${interpolate(logoSpring, [0, 1], [0.8, 1])})`,
                            marginBottom: 20,
                        }}
                    />
                )}

                {/* Address */}
                <div
                    style={{
                        opacity: addrSpring * addrFadeOut,
                        transform: `translateY(${addrY}px)`,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontFamily: DISPLAY_FONT_FAMILY,
                            fontWeight: 700,
                            fontSize: 64,
                            color: branding.textColor,
                            textShadow: "0 2px 20px rgba(0,0,0,0.7)",
                            lineHeight: 1.2,
                        }}
                    >
                        {address}
                    </div>
                    <div
                        style={{
                            fontFamily: FONT_FAMILY,
                            fontWeight: 400,
                            fontSize: 36,
                            color: "#E0E0E0",
                            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                            marginTop: 8,
                        }}
                    >
                        {city}, {state} {zip}
                    </div>
                </div>

                {/* Stats bar */}
                <div style={{ display: "flex", gap: 40, marginTop: 16 }}>
                    {stats.map((stat, i) => {
                        const statFrame = Math.max(0, frame - STATS_APPEAR_FRAME - i * 5);
                        const statSpring = spring({ frame: statFrame, fps, config: { damping: 200 } });
                        return (
                            <div
                                key={stat}
                                style={{
                                    opacity: statSpring * addrFadeOut,
                                    transform: `translateY(${interpolate(statSpring, [0, 1], [15, 0])}px)`,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: FONT_FAMILY,
                                        fontWeight: 400,
                                        fontSize: 32,
                                        color: branding.textColor,
                                    }}
                                >
                                    {stat}
                                </span>
                                {i < stats.length - 1 && (
                                    <span style={{ color: "#AAAAAA", fontSize: 24, marginLeft: 40 }}>|</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Price */}
                {showPrice && listingPrice > 0 && (
                    <div
                        style={{
                            opacity: priceSpring * addrFadeOut,
                            transform: `scale(${interpolate(priceSpring, [0, 1], [0.8, 1])})`,
                            marginTop: 20,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: FONT_FAMILY,
                                fontWeight: 700,
                                fontSize: 52,
                                color: branding.primaryColor,
                                textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                            }}
                        >
                            {formatPrice(listingPrice)}
                        </span>
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
