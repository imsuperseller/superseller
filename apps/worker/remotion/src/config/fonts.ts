/**
 * Font loading for Remotion compositions.
 * Uses @remotion/google-fonts to ensure fonts are loaded before rendering.
 */
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlatypi } from "@remotion/google-fonts/Platypi";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";

// Montserrat: Primary UI font (labels, stats, body text)
const montserratResult = loadMontserrat("normal", {
    weights: ["400", "500", "600", "700", "800"],
    subsets: ["latin"],
});

// Platypi: Display/heading font (address, price)
const platypiResult = loadPlatypi("normal", {
    weights: ["400", "600", "700"],
    subsets: ["latin"],
});

// Playfair Display: Elegant serif for client compositions (Hair Approach, etc.)
const playfairResult = loadPlayfairDisplay("normal", {
    weights: ["400", "600", "700"],
    subsets: ["latin"],
});

export const FONT_FAMILY = montserratResult.fontFamily;
export const DISPLAY_FONT_FAMILY = platypiResult.fontFamily;
export const PLAYFAIR_FONT_FAMILY = playfairResult.fontFamily;
