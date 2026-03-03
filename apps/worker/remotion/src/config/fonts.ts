/**
 * Font loading for Remotion compositions.
 * Uses @remotion/google-fonts to ensure fonts are loaded before rendering.
 */
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlatypi } from "@remotion/google-fonts/Platypi";

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

export const FONT_FAMILY = montserratResult.fontFamily;
export const DISPLAY_FONT_FAMILY = platypiResult.fontFamily;
