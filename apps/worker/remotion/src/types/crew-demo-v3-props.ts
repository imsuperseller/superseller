/**
 * Props for CrewDemoV3Composition — full-screen AI-generated video per scene.
 * Every scene = a Kling video clip with text overlay floating on it.
 */

export interface SceneOverlayConfig {
    /** Layout type determines overlay positioning + animation */
    layout: "hero-intro" | "core-action" | "result-showcase" | "scale-impact" | "cta-outro";
    /** Primary text (agent name, headline, CTA) */
    headline: string;
    /** Secondary text (role, subtitle) */
    subtitle?: string;
    /** Bullet points for result-showcase layout */
    bullets?: string[];
    /** Numeric value for scale-impact counter */
    counterValue?: number;
    /** Unit label for counter (e.g. "credits/video") */
    counterUnit?: string;
    /** Show LIVE badge */
    showLiveBadge?: boolean;
}

export type CrewDemoV3Props = {
    crewName: string;
    crewRole: string;
    accentColor: string;
    accentColorRgb: string;
    icon: string;
    creditsPerTask: number;
    taskUnit: string;
    status: "live" | "coming-soon" | "beta";
    /** 5 video URLs (R2 public or staticFile paths) — one per scene */
    scenes: string[];
    /** Overlay config per scene — must match scenes.length */
    overlays: SceneOverlayConfig[];
};
