/**
 * Props for CrewDemoV2Composition — real video embedded crew demos.
 */
export type CrewDemoV2Props = {
    crewName: string;
    crewRole: string;
    crewTagline: string;
    accentColor: string;
    accentColorRgb: string;
    icon: string;
    features: string[];
    creditsPerTask: number;
    taskUnit: string;
    status: "live" | "coming-soon" | "beta";
    /** Path to demo video for staticFile() — e.g. "videos/floor-plan-tour.mp4" */
    demoVideoUrl: string;
    /** Device frame type for product demo scene */
    deviceType: "phone" | "laptop";
    /** Annotation labels shown around device mockup */
    annotations: string[];
};
