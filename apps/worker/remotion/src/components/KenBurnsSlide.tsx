import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { KenBurnsConfig } from "../config/ken-burns-patterns";

type KenBurnsSlideProps = {
    imageUrl: string;
    config: KenBurnsConfig;
};

export const KenBurnsSlide: React.FC<KenBurnsSlideProps> = ({ imageUrl, config }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: config.easing,
    });

    const scale = interpolate(progress, [0, 1], [config.startScale, config.endScale]);
    const translateX = interpolate(progress, [0, 1], [
        -(config.startX - 50) * 2,
        -(config.endX - 50) * 2,
    ]);
    const translateY = interpolate(progress, [0, 1], [
        -(config.startY - 50) * 2,
        -(config.endY - 50) * 2,
    ]);

    return (
        <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
            <Img
                src={imageUrl}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
                    transformOrigin: "center center",
                }}
            />
        </AbsoluteFill>
    );
};
