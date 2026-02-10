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
  NEXT_PUBLIC_STRIPE_LINK_FULL_ECOSYSTEM: z.string().url().optional(),
  NEXT_PUBLIC_TYPEFORM_CONTACT_URL: z.string().url().optional(),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
  NEXT_PUBLIC_X_URL: z.string().url().optional(),
  NEXT_PUBLIC_YOUTUBE_URL: z.string().url().optional(),
  NEXT_PUBLIC_INSTAGRAM_URL: z.string().url().optional(),

  // Removed legacy keys: ESIGNATURES_API_KEY, ASSEMBLYAI_API_KEY, ANDYNOCODE_API_KEY, APIFY_TOKEN, INSTANTLY_API_KEY, TIDYCAL_TOKEN
  RESEND_API_KEY: z.string().optional(),
  SERPAPI_API_KEY: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_LEAD_INTAKE_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  AITABLE_API_TOKEN: z.string().optional(),
  AITABLE_SPACE_ID: z.string().optional(),
  AITABLE_LEADS_DATASHEET_ID: z.string().optional(),
  AITABLE_CLIENTS_DATASHEET_ID: z.string().optional(),
  AITABLE_RENSTO_MASTER_REGISTRY_ID: z.string().optional(),
  AITABLE_KNOWLEDGE_DATASHEET_ID: z.string().optional(),
  AITABLE_TESTIMONIALS_DATASHEET_ID: z.string().optional(),
  AITABLE_PAYMENTS_DATASHEET_ID: z.string().optional(),
  AITABLE_SOLUTIONS_DATASHEET_ID: z.string().optional(),
  AITABLE_CAMPAIGNS_DATASHEET_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
