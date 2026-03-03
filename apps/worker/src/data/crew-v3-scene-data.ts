/**
 * CrewDemoV3 Scene Data — 7 agents x 5 scenes.
 * Each scene has: Kling video prompt, Flux image prompt (start frame),
 * overlay config for Remotion composition.
 *
 * Scene structure per agent:
 *   1. Hero Intro (6s) — cinematic establishing shot
 *   2. Core Action (6s) — agent performing primary action
 *   3. Result Showcase (6s) — output/result
 *   4. Scale/Impact (6s) — multiplied scale visualization
 *   5. CTA Outro (6s) — brand closer
 */

import type { SceneOverlayConfig } from "../../remotion/src/types/crew-demo-v3-props";

export interface ScenePrompts {
    /** Kling video generation prompt (5s clip) */
    klingPrompt: string;
    /** Flux 2 Pro image prompt (start frame, 16:9, PNG) */
    imagePrompt: string;
    /** Kling mode: pro for hero+CTA, std for middle scenes */
    klingMode: "pro" | "std";
    /** Overlay config for Remotion */
    overlay: SceneOverlayConfig;
}

export interface AgentSceneData {
    id: string;
    name: string;
    role: string;
    accentColor: string;
    accentColorRgb: string;
    icon: string;
    creditsPerTask: number;
    taskUnit: string;
    status: "live" | "coming-soon" | "beta";
    scenes: ScenePrompts[];
}

// ─── FORGE — Video Producer ─────────────────────────────────────
const forge: AgentSceneData = {
    id: "forge",
    name: "Forge",
    role: "Video Producer",
    accentColor: "#f47920",
    accentColorRgb: "244, 121, 32",
    icon: "▶",
    creditsPerTask: 50,
    taskUnit: "video",
    status: "live",
    scenes: [
        {
            klingPrompt: "Slow cinematic dolly into a high-tech video production room with floating holographic screens showing property footage, warm orange ambient lighting, sleek dark surfaces, volumetric light rays, futuristic control room aesthetic, photorealistic, 4K",
            imagePrompt: "High-tech video production room, floating holographic screens displaying real estate property footage, warm orange ambient lighting, sleek dark glass surfaces, volumetric light rays streaming through, futuristic control room aesthetic, photorealistic, 16:9, dark moody atmosphere",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "Forge",
                subtitle: "Video Producer",
                showLiveBadge: true,
            },
        },
        {
            klingPrompt: "A URL on a glass screen dissolves into particles that reform as a stunning 3D property walkthrough, digital data streams flowing from text into a forming cinematic house interior, orange particles and light trails, futuristic transformation effect",
            imagePrompt: "Glass screen displaying a website URL, digital particles beginning to dissolve from the screen, orange light trails streaming outward, dark tech environment, futuristic holographic display, cinematic lighting, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "Drop a URL. Get a Cinematic Video.",
                subtitle: "AI-powered transformation",
            },
        },
        {
            klingPrompt: "Sweeping aerial drone shot over a modern luxury home at golden hour, cinematic real estate quality, warm sunlight reflecting off windows, manicured lawn, long shadows, professional property video feel, smooth camera movement",
            imagePrompt: "Aerial view of a modern luxury home at golden hour, warm sunlight reflecting off large windows, manicured green lawn with long shadows, neighborhood visible in background, professional real estate photography, cinematic quality, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "Cinematic Quality Output",
                bullets: [
                    "AI face compositing in every scene",
                    "All formats: 16:9, 9:16, 1:1, 4:5",
                    "Music overlay + text captions",
                ],
            },
        },
        {
            klingPrompt: "Multiple property types displayed on floating screen grid in 3D space, camera slowly pulls back to reveal a large command center, holographic real estate videos playing on each screen, orange accent lighting, futuristic mission control",
            imagePrompt: "Floating screen grid in 3D space showing multiple property types, camera from command center perspective, holographic real estate videos on each screen, orange accent lighting, dark futuristic mission control room, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "Production at Scale",
                counterValue: 50,
                counterUnit: "Credits / Video",
            },
        },
        {
            klingPrompt: "Completed cinematic video playing on a large curved screen in a dark room, SuperSeller branding glowing in orange neon on the wall behind, ambient particles floating, smooth slow camera push-in, premium tech showcase feel",
            imagePrompt: "Large curved screen displaying a completed cinematic real estate video, orange neon branding glow on dark wall behind, ambient floating particles, premium dark room, tech showcase aesthetic, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire Forge — 50 Credits/Video",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── SPOKE — AI Spokesperson ────────────────────────────────────
const spoke: AgentSceneData = {
    id: "spoke",
    name: "Spoke",
    role: "AI Spokesperson",
    accentColor: "#f59e0b",
    accentColorRgb: "245, 158, 11",
    icon: "🎤",
    creditsPerTask: 50,
    taskUnit: "video",
    status: "live",
    scenes: [
        {
            klingPrompt: "Person looking directly at camera, golden digital particles swirling around as their appearance transforms into a polished AI avatar, smooth morphing effect, professional studio with amber bokeh background, cinematic close-up",
            imagePrompt: "Person looking at camera in professional studio, golden digital particles surrounding their face, amber bokeh lights in background, professional headshot composition, warm golden lighting, cinematic close-up, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "Spoke",
                subtitle: "AI Spokesperson",
                showLiveBadge: true,
            },
        },
        {
            klingPrompt: "AI avatar speaking naturally to camera with perfectly synced lip movement, professional studio environment, warm amber bokeh lights in background, natural gestures, broadcast quality, smooth and realistic",
            imagePrompt: "Professional AI avatar mid-speech in broadcast studio, warm amber bokeh lights, clean modern background, natural pose, broadcast quality lighting, high-end video production feel, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "Your AI Avatar, Speaking for You",
                subtitle: "Perfect lip-sync technology",
            },
        },
        {
            klingPrompt: "Split-screen comparison: simple selfie photo on left transforming into polished AI video on right, camera slowly dollies forward, golden transition particles between the two sides, before and after effect",
            imagePrompt: "Split-screen comparison showing simple selfie photo on left side and polished AI-generated video frame on right side, golden dividing line with particles, before-after transformation visual, clean modern design, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "From Photo to Video",
                bullets: [
                    "AI lip-sync avatar video",
                    "Celebrity-style selfie videos",
                    "Share on any platform",
                ],
            },
        },
        {
            klingPrompt: "Array of phone screens arranged in 3D space showing different avatar videos playing simultaneously, each with a different person, golden ambient lighting, floating in dark void, impressive scale visualization",
            imagePrompt: "Array of smartphone screens floating in 3D dark space, each showing different AI avatar videos, golden ambient lighting connecting them, impressive scale visualization, dark background, futuristic, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "Unlimited Avatars at Scale",
                counterValue: 50,
                counterUnit: "Credits / Video",
            },
        },
        {
            klingPrompt: "Person holding phone showing their AI avatar video playing on screen, warm golden ambient lighting, satisfied expression, modern environment, slow camera push-in, premium lifestyle feel",
            imagePrompt: "Person holding smartphone displaying AI avatar video on screen, warm golden ambient lighting, modern environment, premium lifestyle photography, satisfied expression, shallow depth of field, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire Spoke — 50 Credits/Video",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── FRONTDESK — AI Receptionist ────────────────────────────────
const frontdesk: AgentSceneData = {
    id: "frontdesk",
    name: "FrontDesk",
    role: "AI Receptionist",
    accentColor: "#06b6d4",
    accentColorRgb: "6, 182, 212",
    icon: "📞",
    creditsPerTask: 5,
    taskUnit: "call",
    status: "coming-soon",
    scenes: [
        {
            klingPrompt: "Modern reception desk with glowing cyan AI hologram answering phone calls, phone lines lighting up one by one, sleek office environment, cyan ambient lighting, futuristic office reception, volumetric light",
            imagePrompt: "Modern minimalist reception desk, glowing cyan AI hologram figure answering phones, phone lines with cyan light trails, sleek dark office environment, futuristic reception area, volumetric cyan lighting, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "FrontDesk",
                subtitle: "AI Receptionist",
                showLiveBadge: false,
            },
        },
        {
            klingPrompt: "Sound waves rippling outward in cyan color, words appearing as floating holographic transcription text, data flowing from speech into a glowing CRM dashboard, voice-to-data transformation, dark tech environment",
            imagePrompt: "Cyan sound waves rippling outward from center, floating holographic text transcription appearing mid-air, data streams flowing into a CRM dashboard, dark tech environment, voice visualization, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "AI Handles Every Call, 24/7",
                subtitle: "Natural voice AI",
            },
        },
        {
            klingPrompt: "CRM dashboard lighting up with lead cards appearing one by one, each showing call duration, lead score with star ratings, and appointment status icons, cyan accent highlights, modern dark UI, data visualization",
            imagePrompt: "Modern CRM dashboard with lead cards showing call duration and lead scores, appointment status indicators, cyan accent highlights on dark background, professional data visualization UI, clean modern design, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "Instant Lead Capture",
                bullets: [
                    "Lead qualification scoring",
                    "Appointment booking",
                    "Call recording + transcripts",
                ],
            },
        },
        {
            klingPrompt: "24-hour clock face rendered in cyan neon, calls being handled around the clock shown as light pulses, never-sleeping AI concept visualization, time-lapse of day and night cycling, dark background",
            imagePrompt: "24-hour clock face in cyan neon light, call pulse indicators around the circumference, day-night cycle visualization in background, never-sleeping AI concept, dark background, futuristic time visualization, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "Never Misses a Call",
                counterValue: 5,
                counterUnit: "Credits / Call",
            },
        },
        {
            klingPrompt: "AI receptionist hologram standing at modern desk, entire business operation running smoothly in the background, cyan neon accents, calm and professional atmosphere, slow cinematic camera movement, premium tech",
            imagePrompt: "AI hologram receptionist at modern desk, business operations visualized in background, cyan neon accent lighting, calm professional atmosphere, premium technology showcase, dark modern office, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire FrontDesk — 5 Credits/Call",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── SCOUT — Lead Hunter ────────────────────────────────────────
const scout: AgentSceneData = {
    id: "scout",
    name: "Scout",
    role: "Lead Hunter",
    accentColor: "#8b5cf6",
    accentColorRgb: "139, 92, 246",
    icon: "🎯",
    creditsPerTask: 15,
    taskUnit: "lead",
    status: "coming-soon",
    scenes: [
        {
            klingPrompt: "Radar-style interface scanning a digital city map from above, purple targeting reticles locking onto leads as glowing dots, data overlays appearing, military-tech precision feel, dark background with purple accents",
            imagePrompt: "Radar-style digital interface scanning city map from above, purple targeting reticles on glowing data points, military-tech precision aesthetic, dark background with purple accent lighting, data overlays, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "Scout",
                subtitle: "Lead Hunter",
                showLiveBadge: false,
            },
        },
        {
            klingPrompt: "Data streams flowing through a neural network visualization, raw contact data on left transforming into scored lead profiles on right, purple particles and connection lines, AI processing visualization, dark tech environment",
            imagePrompt: "Neural network visualization with data streams, raw contact data transforming into scored lead profiles, purple particles and connection lines, AI processing effect, dark tech environment, data transformation visual, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "AI Lead Intelligence at Scale",
                subtitle: "Niche-targeted sourcing",
            },
        },
        {
            klingPrompt: "WhatsApp-style messaging screen with qualified leads being delivered in real-time, lead cards appearing with scores and details, purple accent highlights, phone notification feel, modern UI animation",
            imagePrompt: "WhatsApp-style messaging interface showing qualified lead cards with scores and details, purple accent highlights, phone screen mockup, modern UI design, real-time delivery visualization, clean design, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "Leads Delivered to WhatsApp",
                bullets: [
                    "AI qualification scoring",
                    "Direct WhatsApp delivery",
                    "CRM integration ready",
                ],
            },
        },
        {
            klingPrompt: "Slowly rotating globe with hundreds of purple data points glowing on its surface, each point representing a sourced lead, data connection lines between points, dark space background, impressive global scale visualization",
            imagePrompt: "Slowly rotating globe with hundreds of purple glowing data points on surface, connection lines between points, dark space background, global scale data visualization, impressive tech aesthetic, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "Intelligence at Scale",
                counterValue: 15,
                counterUnit: "Credits / Lead",
            },
        },
        {
            klingPrompt: "Lead intelligence dashboard glowing in purple, calm command center environment, data flowing smoothly on screens, professional and controlled atmosphere, slow cinematic camera push-in, premium tech feel",
            imagePrompt: "Lead intelligence dashboard with purple UI accents, calm command center environment, data flowing on multiple screens, professional atmosphere, premium tech aesthetic, dark modern room, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire Scout — 15 Credits/Lead",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── BUZZ — Content Creator ─────────────────────────────────────
const buzz: AgentSceneData = {
    id: "buzz",
    name: "Buzz",
    role: "Content Creator",
    accentColor: "#ec4899",
    accentColorRgb: "236, 72, 153",
    icon: "📱",
    creditsPerTask: 10,
    taskUnit: "post",
    status: "live",
    scenes: [
        {
            klingPrompt: "Social media icons and content pieces exploding outward from a central AI brain, pink and magenta spiral energy, creative sparks flying, dynamic burst effect, dark background with vibrant pink lighting",
            imagePrompt: "Social media icons and content pieces radiating from central AI brain, pink magenta spiral energy, creative sparks, dynamic burst composition, dark background with vibrant pink accent lighting, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "Buzz",
                subtitle: "Content Creator",
                showLiveBadge: true,
            },
        },
        {
            klingPrompt: "AI generating a social media post: text writing itself letter by letter, matching brand image materializing beside it, pink creative sparks and particles, content creation process visualization, modern dark environment",
            imagePrompt: "Social media post being generated by AI, text appearing letter by letter, brand image materializing, pink creative sparks and particles, content creation visualization, modern dark creative studio, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "AI Content on Autopilot",
                subtitle: "Text + image generation",
            },
        },
        {
            klingPrompt: "Social media feed scrolling with branded posts across Facebook and Instagram, engagement metrics floating as holographic numbers, likes and shares appearing, pink accent lighting, modern social media visualization",
            imagePrompt: "Social media feed showing branded posts across Facebook and Instagram platforms, floating engagement metrics, likes and shares indicators, pink accent lighting, modern social media interface visualization, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "Multi-Platform Publishing",
                bullets: [
                    "WhatsApp approval workflow",
                    "Facebook + Instagram publishing",
                    "Brand-consistent messaging",
                ],
            },
        },
        {
            klingPrompt: "Content calendar month view with scheduled posts glowing in pink, full automated pipeline visualization, posts filling up empty slots, smooth animation, organized grid of content, dark background",
            imagePrompt: "Content calendar month view with posts glowing in pink, automated pipeline visualization, organized grid of scheduled content, dark background, modern UI design, clean content management interface, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "Automated Content Pipeline",
                counterValue: 10,
                counterUnit: "Credits / Post",
            },
        },
        {
            klingPrompt: "Phone showing a published social media post with high engagement metrics, pink ambient glow surrounding the device, notifications popping up, satisfied result visualization, slow camera push-in, premium feel",
            imagePrompt: "Smartphone displaying published social media post with high engagement, pink ambient glow, notification indicators, premium lifestyle photography, shallow depth of field, dark background, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire Buzz — 10 Credits/Post",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── CORTEX — Analyst ───────────────────────────────────────────
const cortex: AgentSceneData = {
    id: "cortex",
    name: "Cortex",
    role: "Analyst",
    accentColor: "#10b981",
    accentColorRgb: "16, 185, 129",
    icon: "🧠",
    creditsPerTask: 2,
    taskUnit: "query",
    status: "coming-soon",
    scenes: [
        {
            klingPrompt: "Documents and PDFs floating in 3D space being drawn into a glowing green AI brain at center, brain pulses with light as it ingests each document, emerald green particles, knowledge absorption visualization",
            imagePrompt: "Documents and PDFs floating in 3D space around glowing green AI brain, emerald green particles, knowledge absorption effect, dark background, futuristic data ingestion visualization, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "Cortex",
                subtitle: "Analyst",
                showLiveBadge: false,
            },
        },
        {
            klingPrompt: "Question text floating in green glow, neural pathway connections lighting up sequentially, answer emerging with citation badges appearing one by one, knowledge retrieval visualization, dark tech environment with green accents",
            imagePrompt: "Floating question text in green glow, neural pathways lighting up, answer with citation badges, knowledge retrieval visualization, dark tech environment, green accent lighting, AI processing, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "RAG-Powered Business Intelligence",
                subtitle: "Ask anything, get sourced answers",
            },
        },
        {
            klingPrompt: "Analytics dashboard with insights panels, charts showing upward trends, sourced answers with green citation badges, data visualization with emerald accents, modern dark UI, professional business intelligence",
            imagePrompt: "Analytics dashboard with insight panels and upward trend charts, green citation badges on answers, emerald accent highlighting, modern dark UI design, professional business intelligence interface, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "Sourced Intelligence",
                bullets: [
                    "Document ingestion (PDF, docs, web)",
                    "Brand-aware responses",
                    "API access for integrations",
                ],
            },
        },
        {
            klingPrompt: "Knowledge graph with interconnected green glowing nodes, vast scale network slowly rotating, data flowing between nodes as light trails, impressive neural network visualization, dark space background",
            imagePrompt: "Knowledge graph with interconnected green glowing nodes, vast network visualization, light trails flowing between nodes, dark space background, neural network aesthetic, impressive scale, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "Infinite Knowledge Scale",
                counterValue: 2,
                counterUnit: "Credits / Query",
            },
        },
        {
            klingPrompt: "Knowledge interface and command center with emerald neon accents, calm organized environment, data flowing smoothly, professional tech atmosphere, slow cinematic push-in, premium feel",
            imagePrompt: "Knowledge command center with emerald neon accents, organized data interface, calm professional atmosphere, premium technology showcase, dark modern environment, green accent lighting, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire Cortex — 2 Credits/Query",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── MARKET — Marketplace Automation ────────────────────────────
const market: AgentSceneData = {
    id: "market",
    name: "Market",
    role: "Marketplace Automation",
    accentColor: "#3b82f6",
    accentColorRgb: "59, 130, 246",
    icon: "🛒",
    creditsPerTask: 25,
    taskUnit: "listing",
    status: "live",
    scenes: [
        {
            klingPrompt: "Facebook Marketplace grid springs to life, listings appearing one by one with smooth animations, blue accent highlights, automated posting feel, modern e-commerce interface, clean professional look",
            imagePrompt: "Facebook Marketplace grid with product listings, blue accent highlights, automated posting visualization, modern e-commerce interface, clean professional design, active marketplace feel, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "hero-intro",
                headline: "Market",
                subtitle: "Marketplace Automation",
                showLiveBadge: true,
            },
        },
        {
            klingPrompt: "AI generating a marketplace listing: copy writing itself, three product images rendering in sequence, location pins dropping on US map, blue automation trails connecting elements, content creation process",
            imagePrompt: "AI generating marketplace listing with auto-writing copy, product images rendering, location pins on US map, blue automation trails, content creation process visualization, modern dark interface, 16:9",
            klingMode: "std",
            overlay: {
                layout: "core-action",
                headline: "AI-Generated Listings, 24/7",
                subtitle: "Copy + images + location rotation",
            },
        },
        {
            klingPrompt: "United States map with 30 plus city pins glowing blue, connected to active marketplace listings, nationwide coverage visualization, data lines connecting cities, impressive geographic scale, dark background",
            imagePrompt: "United States map with 30+ city pins glowing blue, connected by data lines to active listings, nationwide coverage visualization, dark background, impressive geographic scale, 16:9",
            klingMode: "std",
            overlay: {
                layout: "result-showcase",
                headline: "Nationwide Coverage",
                bullets: [
                    "AI-generated copy per listing",
                    "3x unique images per post",
                    "Location rotation (30+ cities)",
                ],
            },
        },
        {
            klingPrompt: "24-hour clock with marketplace listings auto-posting at each hour position, blue automation trails connecting posts, non-stop posting visualization, time-lapse feel, dark background with blue accents",
            imagePrompt: "24-hour clock showing marketplace listings posting at each hour, blue automation trails, non-stop automated posting visualization, dark background, blue accent lighting, time-based automation, 16:9",
            klingMode: "std",
            overlay: {
                layout: "scale-impact",
                headline: "24/7 Automated Posting",
                counterValue: 25,
                counterUnit: "Credits / Listing",
            },
        },
        {
            klingPrompt: "Marketplace analytics dashboard showing active listings count, views, and messages, blue neon accents, calm command center feel, data flowing on screens, professional and controlled atmosphere, cinematic push-in",
            imagePrompt: "Marketplace analytics dashboard with active listings, views, and message counts, blue neon accents, command center atmosphere, professional data display, dark modern interface, 16:9",
            klingMode: "pro",
            overlay: {
                layout: "cta-outro",
                headline: "Hire Market — 25 Credits/Listing",
                subtitle: "Powered by SuperSeller AI — superseller.agency",
            },
        },
    ],
};

// ─── Export all agents ──────────────────────────────────────────
export const CREW_V3_SCENE_DATA: AgentSceneData[] = [
    forge,
    spoke,
    frontdesk,
    scout,
    buzz,
    cortex,
    market,
];

/** Lookup by agent ID */
export function getAgentSceneData(agentId: string): AgentSceneData | undefined {
    return CREW_V3_SCENE_DATA.find((a) => a.id === agentId);
}
