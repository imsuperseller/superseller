import React from "react";
import { AbsoluteFill, Img, spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneMockup } from "./components/PhoneMockup";
import { PLAYFAIR_FONT_FAMILY, FONT_FAMILY } from "./config/fonts";
import type { SocialMockupProps } from "./types/social-mockup-props";

export const SocialMockupComposition: React.FC<SocialMockupProps> = ({
    postImageUrl,
    postCaption,
    postType,
    accountName,
    accentColor,
    bgColor,
    phonePosition,
    headline,
    subheadline,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Convert hex accent to RGB for PhoneMockup
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };
    const accentRgb = hexToRgb(accentColor);

    const hasHeadline = !!headline;
    const isLeft = phonePosition === "left";
    const isRight = phonePosition === "right";
    const isCentered = phonePosition === "center" || !hasHeadline;

    // IG post UI inside the phone
    const igPost = (
        <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#000",
            fontFamily: FONT_FAMILY,
        }}>
            {/* IG Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 12px",
                gap: 8,
            }}>
                <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${accentColor}, #fff)`,
                    flexShrink: 0,
                }} />
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    @{accountName}
                </span>
                <span style={{ marginLeft: "auto", color: "#888", fontSize: 18 }}>•••</span>
            </div>

            {/* Post image */}
            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden" }}>
                <Img src={postImageUrl} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }} />
            </div>

            {/* Engagement bar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 12px",
                gap: 16,
                fontSize: 20,
            }}>
                <span style={{ color: "#fff" }}>♡</span>
                <span style={{ color: "#fff" }}>💬</span>
                <span style={{ color: "#fff" }}>➤</span>
            </div>

            {/* Like count */}
            <div style={{ padding: "0 12px 4px", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                127 likes
            </div>

            {/* Caption */}
            <div style={{ padding: "0 12px 12px", fontSize: 12, lineHeight: 1.4 }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>@{accountName} </span>
                <span style={{ color: "#ccc" }}>
                    {postCaption.length > 90 ? postCaption.slice(0, 90) + "... " : postCaption + " "}
                </span>
                {postCaption.length > 90 && (
                    <span style={{ color: "#888" }}>more</span>
                )}
            </div>
        </div>
    );

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor }}>
            {/* Subtle radial gradient */}
            <AbsoluteFill style={{
                background: `radial-gradient(ellipse at ${isLeft ? "30%" : isRight ? "70%" : "50%"} 50%, rgba(201,169,110,0.06), transparent 70%)`,
            }} />

            {/* Layout container */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                flexDirection: isCentered ? "column" : (isLeft ? "row" : "row-reverse"),
                padding: "0 80px",
                gap: 60,
            }}>
                {/* Phone mockup */}
                <PhoneMockup accentColorRgb={accentRgb} scale={0.85} delay={0}>
                    {igPost}
                </PhoneMockup>

                {/* Headline text (if provided) */}
                {hasHeadline && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 500,
                        gap: 16,
                    }}>
                        <div style={{
                            width: 60,
                            height: 2,
                            backgroundColor: accentColor,
                        }} />
                        <div style={{
                            fontFamily: PLAYFAIR_FONT_FAMILY,
                            fontSize: 48,
                            fontWeight: 700,
                            color: accentColor,
                            lineHeight: 1.2,
                        }}>
                            {headline}
                        </div>
                        {subheadline && (
                            <div style={{
                                fontFamily: FONT_FAMILY,
                                fontSize: 22,
                                color: "rgba(255,255,255,0.7)",
                                lineHeight: 1.4,
                            }}>
                                {subheadline}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
