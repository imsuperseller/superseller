import { z } from "zod";

export const SocialMockupPropsSchema = z.object({
    postImageUrl: z.string(),
    postCaption: z.string(),
    postType: z.enum(["result", "tip", "before-after"]),
    accountName: z.string().default("hairapproach"),
    accentColor: z.string().default("#C9A96E"),
    bgColor: z.string().default("#1a1a1a"),
    phonePosition: z.enum(["center", "left", "right"]).default("center"),
    headline: z.string().optional(),
    subheadline: z.string().optional(),
});

export type SocialMockupProps = z.infer<typeof SocialMockupPropsSchema>;
