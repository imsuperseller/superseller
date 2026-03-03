import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY, DISPLAY_FONT_FAMILY } from "../config/fonts";
import type { AgentInfo, BrandingConfig } from "../types/composition-props";

type OutroCardProps = {
    agent?: AgentInfo;
    address: string;
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

export const OutroCard: React.FC<OutroCardProps> = ({
    agent, address, listingPrice, showPrice, branding, heroImageUrl,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Background
    const bgScale = interpolate(frame, [0, durationInFrames], [1.15, 1.05], {
        extrapolateRight: "clamp",
    });

    // Card container animation
    const cardSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
    const cardOpacity = cardSpring;
    const cardScale = interpolate(cardSpring, [0, 1], [0.95, 1]);

    // Staggered elements
    const makeStagger = (delayFrames: number) => {
        const f = Math.max(0, frame - delayFrames);
        const s = spring({ frame: f, fps, config: { damping: 200 } });
        return { opacity: s, translateY: interpolate(s, [0, 1], [20, 0]) };
    };

    const priceAnim = makeStagger(8);
    const agentPhotoAnim = makeStagger(14);
    const nameAnim = makeStagger(20);
    const contactAnim = makeStagger(26);
    const ctaAnim = makeStagger(34);
    const poweredByAnim = makeStagger(42);

    // Fade out last 1 second
    const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill>
            {/* Background */}
            <AbsoluteFill style={{ overflow: "hidden" }}>
                <Img
                    src={heroImageUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: `scale(${bgScale})`,
                        filter: "brightness(0.25) blur(4px)",
                    }}
                />
            </AbsoluteFill>

            {/* Card */}
            <AbsoluteFill
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: cardOpacity * fadeOut,
                    transform: `scale(${cardScale})`,
                }}
            >
                <div
                    style={{
                        background: "rgba(0,0,0,0.75)",
                        borderRadius: 20,
                        padding: "50px 70px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        minWidth: 500,
                        maxWidth: 800,
                    }}
                >
                    {/* Price */}
                    {showPrice && listingPrice > 0 && (
                        <div style={{ opacity: priceAnim.opacity, transform: `translateY(${priceAnim.translateY}px)` }}>
                            <span style={{
                                fontFamily: FONT_FAMILY, fontWeight: 700,
                                fontSize: 56, color: branding.primaryColor,
                            }}>
                                {formatPrice(listingPrice)}
                            </span>
                        </div>
                    )}

                    {/* Address */}
                    <div style={{ opacity: priceAnim.opacity, transform: `translateY(${priceAnim.translateY}px)` }}>
                        <span style={{
                            fontFamily: FONT_FAMILY, fontWeight: 400,
                            fontSize: 24, color: "#CCCCCC",
                        }}>
                            {address}
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{
                        width: 80, height: 2,
                        background: branding.primaryColor,
                        marginTop: 10, marginBottom: 10,
                        opacity: nameAnim.opacity,
                    }} />

                    {/* Agent Photo */}
                    {agent?.photoUrl && (
                        <div style={{
                            opacity: agentPhotoAnim.opacity,
                            transform: `translateY(${agentPhotoAnim.translateY}px)`,
                        }}>
                            <Img
                                src={agent.photoUrl}
                                style={{
                                    width: 120, height: 120,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `3px solid ${branding.primaryColor}`,
                                }}
                            />
                        </div>
                    )}

                    {/* Agent Name + Company */}
                    {agent?.name && (
                        <div style={{
                            opacity: nameAnim.opacity,
                            transform: `translateY(${nameAnim.translateY}px)`,
                            textAlign: "center",
                        }}>
                            <div style={{
                                fontFamily: FONT_FAMILY, fontWeight: 700,
                                fontSize: 40, color: branding.textColor,
                            }}>
                                {agent.name}
                            </div>
                            {agent.company && (
                                <div style={{
                                    fontFamily: FONT_FAMILY, fontWeight: 400,
                                    fontSize: 24, color: "#CCCCCC", marginTop: 4,
                                }}>
                                    {agent.company}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contact Info */}
                    {(agent?.phone || agent?.email) && (
                        <div style={{
                            opacity: contactAnim.opacity,
                            transform: `translateY(${contactAnim.translateY}px)`,
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                            marginTop: 8,
                        }}>
                            {agent.phone && (
                                <span style={{
                                    fontFamily: FONT_FAMILY, fontWeight: 400,
                                    fontSize: 28, color: branding.textColor,
                                }}>
                                    {agent.phone}
                                </span>
                            )}
                            {agent.email && (
                                <span style={{
                                    fontFamily: FONT_FAMILY, fontWeight: 400,
                                    fontSize: 22, color: "#CCCCCC",
                                }}>
                                    {agent.email}
                                </span>
                            )}
                        </div>
                    )}

                    {/* CTA Button */}
                    <div style={{
                        opacity: ctaAnim.opacity,
                        transform: `scale(${interpolate(ctaAnim.opacity, [0, 1], [0.8, 1])})`,
                        marginTop: 16,
                    }}>
                        <div style={{
                            background: branding.primaryColor,
                            borderRadius: 12,
                            padding: "16px 44px",
                        }}>
                            <span style={{
                                fontFamily: FONT_FAMILY, fontWeight: 700,
                                fontSize: 28, color: "#FFFFFF",
                            }}>
                                Schedule a Showing
                            </span>
                        </div>
                    </div>

                    {/* Powered by */}
                    {branding.showPoweredBy && (
                        <div style={{
                            opacity: poweredByAnim.opacity * 0.5,
                            marginTop: 16,
                        }}>
                            <span style={{
                                fontFamily: FONT_FAMILY, fontWeight: 400,
                                fontSize: 16, color: "#888888",
                            }}>
                                {branding.poweredByText}
                            </span>
                        </div>
                    )}
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
