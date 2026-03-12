import React from "react";
import { Composition } from "remotion";
import { PropertyTourComposition } from "./PropertyTourComposition";
import { CrewRevealComposition } from "./CrewRevealComposition";
import { CrewDemoComposition } from "./CrewDemoComposition";
import { CrewDemoV2Composition } from "./CrewDemoV2Composition";
import { CrewDemoV3Composition } from "./CrewDemoV3Composition";
import { PropertyTourPropsSchema } from "./types/composition-props";
import { HairShowreelComposition } from "./HairShowreelComposition";
import { SocialMockupComposition } from "./SocialMockupComposition";
import { FPS, calculateTotalDuration, sec } from "./config/timing";

const DEFAULT_PROPS = {
    address: "1531 Home Park Dr",
    city: "Allen",
    state: "TX",
    zip: "75002",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 1797,
    listingPrice: 4500,
    propertyType: "house",
    photos: [
        { url: "https://photos.zillowstatic.com/fp/63a6f601f5b5480566ee474cad5ea08c-p_d.jpg", roomName: "Front", roomType: "exterior_front", isExterior: true, isSpecialFeature: false },
        { url: "https://photos.zillowstatic.com/fp/724b8223554fa16fdf5d7b03b89445d2-p_d.jpg", roomName: "Living Room", roomType: "interior_living", isExterior: false, isSpecialFeature: false },
        { url: "https://photos.zillowstatic.com/fp/bb88cfb9fa74174da1c4754445988da5-p_d.jpg", roomName: "Kitchen", roomType: "interior_kitchen", isExterior: false, isSpecialFeature: false },
    ],
    showPrice: true,
    showRoomLabels: true,
    transitionDurationFrames: 15,
    branding: {
        mode: "superseller" as const,
        primaryColor: "#F97316",
        secondaryColor: "#14B8A6",
        textColor: "#FFFFFF",
        overlayBgColor: "rgba(0,0,0,0.55)",
        showPoweredBy: true,
        poweredByText: "Powered by SuperSeller",
        logoWidth: 120,
        logoPosition: "top-right" as const,
    },
};

const calcMeta = async ({ props }: { props: typeof DEFAULT_PROPS }) => {
    const totalSec = calculateTotalDuration(
        props.photos.length,
        props.photos.map((p) => p.roomType)
    );
    return { durationInFrames: sec(totalSec) };
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* 16:9 Landscape (Master) */}
            <Composition
                id="PropertyTour-16x9"
                component={PropertyTourComposition}
                width={1920}
                height={1080}
                fps={FPS}
                durationInFrames={sec(75)}
                calculateMetadata={calcMeta as any}
                defaultProps={DEFAULT_PROPS}
            />

            {/* 9:16 Vertical (Reels/TikTok) */}
            <Composition
                id="PropertyTour-9x16"
                component={PropertyTourComposition}
                width={1080}
                height={1920}
                fps={FPS}
                durationInFrames={sec(75)}
                calculateMetadata={calcMeta as any}
                defaultProps={DEFAULT_PROPS}
            />

            {/* 1:1 Square (Instagram/FB) */}
            <Composition
                id="PropertyTour-1x1"
                component={PropertyTourComposition}
                width={1080}
                height={1080}
                fps={FPS}
                durationInFrames={sec(75)}
                calculateMetadata={calcMeta as any}
                defaultProps={DEFAULT_PROPS}
            />

            {/* 4:5 Portrait (Instagram Feed) */}
            <Composition
                id="PropertyTour-4x5"
                component={PropertyTourComposition}
                width={1080}
                height={1350}
                fps={FPS}
                durationInFrames={sec(75)}
                calculateMetadata={calcMeta as any}
                defaultProps={DEFAULT_PROPS}
            />

            {/* ─── Crew Reveal ──────────────────────────────────── */}
            <Composition
                id="CrewReveal-16x9"
                component={CrewRevealComposition}
                width={1920}
                height={1080}
                fps={FPS}
                durationInFrames={sec(10)}
                defaultProps={{ tagline: "Seven Agents. Zero Overhead." }}
            />
            <Composition
                id="CrewReveal-9x16"
                component={CrewRevealComposition}
                width={1080}
                height={1920}
                fps={FPS}
                durationInFrames={sec(10)}
                defaultProps={{ tagline: "Seven Agents. Zero Overhead." }}
            />

            {/* ─── Crew Demo (per-agent product video) ─────────── */}
            <Composition
                id="CrewDemo-16x9"
                component={CrewDemoComposition}
                width={1920}
                height={1080}
                fps={FPS}
                durationInFrames={sec(25)}
                defaultProps={{
                    crewName: "Forge",
                    crewRole: "Video Producer",
                    crewTagline: "Drop a link. Get a cinematic video.",
                    crewDescription: "Paste any business URL and get a cinematic AI video with your face composited in, music, and text overlays. Ready to post in minutes.",
                    accentColor: "#f47920",
                    accentColorRgb: "244, 121, 32",
                    icon: "▶",
                    features: [
                        "Any business URL to video in minutes",
                        "AI face compositing in every scene",
                        "All formats: 16:9, 9:16, 1:1, 4:5",
                        "Music overlay + text captions",
                        "Scene-level regeneration",
                        "Priority processing on Pro+",
                    ],
                    creditsPerTask: 50,
                    taskUnit: "video",
                    status: "live",
                }}
            />
            <Composition
                id="CrewDemo-9x16"
                component={CrewDemoComposition}
                width={1080}
                height={1920}
                fps={FPS}
                durationInFrames={sec(25)}
                defaultProps={{
                    crewName: "Forge",
                    crewRole: "Video Producer",
                    crewTagline: "Drop a link. Get a cinematic video.",
                    crewDescription: "Paste any business URL and get a cinematic AI video with your face composited in, music, and text overlays. Ready to post in minutes.",
                    accentColor: "#f47920",
                    accentColorRgb: "244, 121, 32",
                    icon: "▶",
                    features: [
                        "Any business URL to video in minutes",
                        "AI face compositing in every scene",
                        "All formats: 16:9, 9:16, 1:1, 4:5",
                        "Music overlay + text captions",
                        "Scene-level regeneration",
                        "Priority processing on Pro+",
                    ],
                    creditsPerTask: 50,
                    taskUnit: "video",
                    status: "live",
                }}
            />
            {/* ─── Crew Demo V2 (real video embedded) ────────── */}
            <Composition
                id="CrewDemoV2-16x9"
                component={CrewDemoV2Composition}
                width={1920}
                height={1080}
                fps={FPS}
                durationInFrames={sec(22)}
                defaultProps={{
                    crewName: "Forge",
                    crewRole: "Video Producer",
                    crewTagline: "AI Cinematic Walkthrough",
                    accentColor: "#f47920",
                    accentColorRgb: "244, 121, 32",
                    icon: "▶",
                    features: [
                        "Any business URL to video in minutes",
                        "AI face compositing in every scene",
                        "All formats: 16:9, 9:16, 1:1, 4:5",
                        "Music overlay + text captions",
                    ],
                    creditsPerTask: 50,
                    taskUnit: "video",
                    status: "live" as const,
                    demoVideoUrl: "videos/floor-plan-tour.mp4",
                    deviceType: "laptop" as const,
                    annotations: ["AI cinematic walkthrough", "Music + captions", "All aspect ratios"],
                }}
            />
            <Composition
                id="CrewDemoV2-9x16"
                component={CrewDemoV2Composition}
                width={1080}
                height={1920}
                fps={FPS}
                durationInFrames={sec(22)}
                defaultProps={{
                    crewName: "Forge",
                    crewRole: "Video Producer",
                    crewTagline: "AI Cinematic Walkthrough",
                    accentColor: "#f47920",
                    accentColorRgb: "244, 121, 32",
                    icon: "▶",
                    features: [
                        "Any business URL to video in minutes",
                        "AI face compositing in every scene",
                        "All formats: 16:9, 9:16, 1:1, 4:5",
                        "Music overlay + text captions",
                    ],
                    creditsPerTask: 50,
                    taskUnit: "video",
                    status: "live" as const,
                    demoVideoUrl: "videos/floor-plan-tour.mp4",
                    deviceType: "laptop" as const,
                    annotations: ["AI cinematic walkthrough", "Music + captions", "All aspect ratios"],
                }}
            />
            {/* ─── Crew Demo V3 (full-screen AI video per scene) ─── */}
            <Composition
                id="CrewDemoV3-16x9"
                component={CrewDemoV3Composition}
                width={1920}
                height={1080}
                fps={FPS}
                durationInFrames={sec(30)}
                defaultProps={{
                    crewName: "Forge",
                    crewRole: "Video Producer",
                    accentColor: "#f47920",
                    accentColorRgb: "244, 121, 32",
                    icon: "▶",
                    creditsPerTask: 50,
                    taskUnit: "video",
                    status: "live" as const,
                    scenes: [
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                    ],
                    overlays: [
                        { layout: "hero-intro" as const, headline: "Forge", subtitle: "Video Producer", showLiveBadge: true },
                        { layout: "core-action" as const, headline: "Drop a URL. Get a Cinematic Video.", subtitle: "AI-powered transformation" },
                        { layout: "result-showcase" as const, headline: "Cinematic Quality Output", bullets: ["AI face compositing", "All formats", "Music + captions"] },
                        { layout: "scale-impact" as const, headline: "Production at Scale", counterValue: 50, counterUnit: "Credits / Video" },
                        { layout: "cta-outro" as const, headline: "Hire Forge — 50 Credits/Video" },
                    ],
                }}
            />
            <Composition
                id="CrewDemoV3-9x16"
                component={CrewDemoV3Composition}
                width={1080}
                height={1920}
                fps={FPS}
                durationInFrames={sec(30)}
                defaultProps={{
                    crewName: "Forge",
                    crewRole: "Video Producer",
                    accentColor: "#f47920",
                    accentColorRgb: "244, 121, 32",
                    icon: "▶",
                    creditsPerTask: 50,
                    taskUnit: "video",
                    status: "live" as const,
                    scenes: [
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                        "videos/floor-plan-tour.mp4",
                    ],
                    overlays: [
                        { layout: "hero-intro" as const, headline: "Forge", subtitle: "Video Producer", showLiveBadge: true },
                        { layout: "core-action" as const, headline: "Drop a URL. Get a Cinematic Video.", subtitle: "AI-powered transformation" },
                        { layout: "result-showcase" as const, headline: "Cinematic Quality Output", bullets: ["AI face compositing", "All formats", "Music + captions"] },
                        { layout: "scale-impact" as const, headline: "Production at Scale", counterValue: 50, counterUnit: "Credits / Video" },
                        { layout: "cta-outro" as const, headline: "Hire Forge — 50 Credits/Video" },
                    ],
                }}
            />
            {/* ─── Hair Approach Showreel ─────────────────────── */}
            <Composition
                id="HairShowreel-16x9"
                component={HairShowreelComposition}
                width={1920}
                height={1080}
                fps={FPS}
                durationInFrames={sec(24)}
                defaultProps={{
                    photos: [
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg", label: "Sun-Kissed Highlights" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_client-waves.jpg", label: "Beach Waves" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg", label: "Rich Brunette" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg", label: "Blonde Transformation" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_color-change.jpg", label: "Color Change" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg", label: "Platinum" },
                    ],
                    motionClips: [
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/motion/blonde-highlights-motion.mp4", label: "Highlights Motion" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/motion/blonde-transformation-motion.mp4", label: "Transformation Motion" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/motion/platinum-result-motion.mp4", label: "Platinum Motion" },
                    ],
                    businessName: "Hair Approach",
                    tagline: "Dallas Premium Hair Salon",
                    accentColor: "#C9A96E",
                    bgColor: "#1a1a1a",
                    ctaText: "Book Your Transformation",
                }}
            />
            <Composition
                id="HairShowreel-9x16"
                component={HairShowreelComposition}
                width={1080}
                height={1920}
                fps={FPS}
                durationInFrames={sec(24)}
                defaultProps={{
                    photos: [
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg", label: "Sun-Kissed Highlights" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_client-waves.jpg", label: "Beach Waves" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg", label: "Rich Brunette" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg", label: "Blonde Transformation" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_color-change.jpg", label: "Color Change" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg", label: "Platinum" },
                    ],
                    motionClips: [
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/motion/blonde-highlights-motion.mp4", label: "Highlights Motion" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/motion/blonde-transformation-motion.mp4", label: "Transformation Motion" },
                        { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/motion/platinum-result-motion.mp4", label: "Platinum Motion" },
                    ],
                    businessName: "Hair Approach",
                    tagline: "Dallas Premium Hair Salon",
                    accentColor: "#C9A96E",
                    bgColor: "#1a1a1a",
                    ctaText: "Book Your Transformation",
                }}
            />

            {/* ─── Social Mockups (Hair Approach) ────────────── */}
            <Composition
                id="SocialMockup-Result"
                component={SocialMockupComposition}
                width={1920}
                height={1080}
                fps={1}
                durationInFrames={30}
                defaultProps={{
                    postImageUrl: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg",
                    postCaption: "Sun-kissed highlights for summer. Balayage is all about that natural, lived-in glow. DM to book your transformation.",
                    postType: "result" as const,
                    accountName: "hairapproach",
                    accentColor: "#C9A96E",
                    bgColor: "#1a1a1a",
                    phonePosition: "left" as const,
                    headline: "Your Instagram, Elevated",
                    subheadline: "AI-powered content that books appointments",
                }}
            />
            <Composition
                id="SocialMockup-Tip"
                component={SocialMockupComposition}
                width={1920}
                height={1080}
                fps={1}
                durationInFrames={30}
                defaultProps={{
                    postImageUrl: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg",
                    postCaption: "Pro tip: Always use a heat protectant before styling. Your hair will thank you. #hairtips #salonlife #dallashair",
                    postType: "tip" as const,
                    accountName: "hairapproach",
                    accentColor: "#C9A96E",
                    bgColor: "#1a1a1a",
                    phonePosition: "right" as const,
                    headline: "Content That Converts",
                    subheadline: "Professional posts, zero effort",
                }}
            />
            <Composition
                id="SocialMockup-Transform"
                component={SocialMockupComposition}
                width={1920}
                height={1080}
                fps={1}
                durationInFrames={30}
                defaultProps={{
                    postImageUrl: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg",
                    postCaption: "From brassy to icy platinum. This transformation took 2 sessions and the results speak for themselves.",
                    postType: "result" as const,
                    accountName: "hairapproach",
                    accentColor: "#C9A96E",
                    bgColor: "#1a1a1a",
                    phonePosition: "center" as const,
                }}
            />
        </>
    );
};
