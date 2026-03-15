import { z } from "zod";

export const BeforeAfterPropsSchema = z.object({
    /** URL of the "before" image — required */
    beforeImageUrl: z.string(),
    /** URL of the "after" image — required */
    afterImageUrl: z.string(),
    /** Service label shown as pill overlay (e.g. "Kitchen Remodel") — required */
    serviceLabel: z.string(),
    /** Tagline shown on the after image */
    tagline: z.string().default("See the difference"),
    /** Brand/accent color (hex) applied to pill and CTA background */
    brandColor: z.string().default("#F97316"),
    /** Optional logo image URL */
    logoUrl: z.string().optional(),
    /** Corner placement for logo */
    logoPosition: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]).default("top-right"),
    /** Logo width in pixels */
    logoWidth: z.number().default(120),
    /** CTA button text on the outro card */
    ctaText: z.string().default("Book Now"),
});

export type BeforeAfterProps = z.infer<typeof BeforeAfterPropsSchema>;
