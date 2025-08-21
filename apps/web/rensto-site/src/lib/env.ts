import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().default('Rensto'),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().default('service@rensto.com'),
  NEXT_PUBLIC_STRIPE_LINK_SPRINT: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_LINK_AUDIT: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_LINK_CONTENT_STARTER: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_LINK_LEAD_INTAKE: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_LINK_RETAINER_STARTER: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_LINK_RETAINER_GROWTH: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_LINK_RETAINER_SCALE: z.string().url().optional(),
  NEXT_PUBLIC_TYPEFORM_CONTACT_URL: z.string().url().optional(),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
  NEXT_PUBLIC_X_URL: z.string().url().optional(),
  NEXT_PUBLIC_YOUTUBE_URL: z.string().url().optional(),
  NEXT_PUBLIC_INSTAGRAM_URL: z.string().url().optional(),
  NEXT_PUBLIC_ROLLBAR_ENABLED: z.string().default('false').transform(val => val === 'true'),
});

export const env = envSchema.parse(process.env);
