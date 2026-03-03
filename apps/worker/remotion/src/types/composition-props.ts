import { z } from "zod";

// ─── Branding ────────────────────────────────────────────────────
export const BrandingConfigSchema = z.object({
    mode: z.enum(["superseller", "whitelabel"]),
    logoUrl: z.string().optional(),
    logoWidth: z.number().default(120),
    logoPosition: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]).default("top-right"),
    primaryColor: z.string().default("#F97316"),      // SuperSeller orange
    secondaryColor: z.string().default("#14B8A6"),    // SuperSeller teal
    textColor: z.string().default("#FFFFFF"),
    overlayBgColor: z.string().default("rgba(0,0,0,0.55)"),
    showPoweredBy: z.boolean().default(true),
    poweredByText: z.string().default("Powered by SuperSeller"),
});
export type BrandingConfig = z.infer<typeof BrandingConfigSchema>;

// ─── Photo ───────────────────────────────────────────────────────
export const TourPhotoSchema = z.object({
    url: z.string(),
    roomName: z.string(),
    roomType: z.string(),
    isExterior: z.boolean().default(false),
    isSpecialFeature: z.boolean().default(false),
    featureType: z.enum(["pool", "backyard", "garage", "patio"]).optional(),
});
export type TourPhoto = z.infer<typeof TourPhotoSchema>;

// ─── Agent Info ──────────────────────────────────────────────────
export const AgentInfoSchema = z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    company: z.string().optional(),
    photoUrl: z.string().optional(),
});
export type AgentInfo = z.infer<typeof AgentInfoSchema>;

// ─── Main Composition Props ──────────────────────────────────────
export const PropertyTourPropsSchema = z.object({
    // Property
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    bedrooms: z.number(),
    bathrooms: z.number(),
    sqft: z.number(),
    listingPrice: z.number(),
    propertyType: z.string().default("house"),

    // Photos (ordered by tour sequence)
    photos: z.array(TourPhotoSchema).min(1),

    // Agent
    agent: AgentInfoSchema.optional(),

    // Style
    musicUrl: z.string().optional(),
    transitionDurationFrames: z.number().default(15),
    branding: BrandingConfigSchema.default({
        mode: "superseller",
        primaryColor: "#F97316",
        secondaryColor: "#14B8A6",
        textColor: "#FFFFFF",
        overlayBgColor: "rgba(0,0,0,0.55)",
        showPoweredBy: true,
        poweredByText: "Powered by SuperSeller",
        logoWidth: 120,
        logoPosition: "top-right",
    }),

    // Options
    showPrice: z.boolean().default(true),
    showRoomLabels: z.boolean().default(true),
});
export type PropertyTourProps = z.infer<typeof PropertyTourPropsSchema>;
