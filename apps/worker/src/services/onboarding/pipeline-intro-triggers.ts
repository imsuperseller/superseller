/**
 * pipeline-intro-triggers.ts -- Intro messages sent when a customer selects a module via poll
 *
 * These messages prime the module to start (routeToModule picks up on next message).
 * Kept separate so they can be updated without touching the worker core.
 */

import type { ModuleType } from "./modules/types";

/**
 * Short trigger message to send after a poll vote is received.
 * Serves as a natural transition that prompts the module to initialize.
 */
export const INTRO_TRIGGERS: Record<ModuleType, string> = {
    "asset-collection":
        "Great choice! Let's collect your brand assets -- logo, photos, and business info. Go ahead and share your logo when you're ready!",
    "character-questionnaire":
        "Exciting! Let's create your AI brand character. I'll ask you a few fun questions about personality and style. Ready? Let's go!",
    "character-video-gen":
        "Time to bring your character to life! I'll generate your AI character video now. Stand by...",
    "social-setup":
        "Let's set up your social media automation! I'll ask a few quick questions about your content preferences.",
    "competitor-research":
        "Let's research your market! Share your top competitors or your Google Maps listing URL to get started.",
};
