import { z } from "zod";

export const HairShowreelPropsSchema = z.object({
    photos: z.array(z.object({
        url: z.string(),
        label: z.string().optional(),
    })),
    motionClips: z.array(z.object({
        url: z.string(),
        label: z.string().optional(),
    })).default([]),
    audioUrl: z.string().optional(),
    businessName: z.string().default("Hair Approach"),
    tagline: z.string().default("Dallas Premium Hair Salon"),
    accentColor: z.string().default("#C9A96E"),
    bgColor: z.string().default("#1a1a1a"),
    ctaText: z.string().default("Book Your Transformation"),
});

export type HairShowreelProps = z.infer<typeof HairShowreelPropsSchema>;
