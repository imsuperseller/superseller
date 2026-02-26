import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().default('SuperSeller AI'),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().default('shai@superseller.agency'),
  NEXT_PUBLIC_TYPEFORM_CONTACT_URL: z.string().url().optional(),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
  NEXT_PUBLIC_X_URL: z.string().url().optional(),
  NEXT_PUBLIC_YOUTUBE_URL: z.string().url().optional(),
  NEXT_PUBLIC_INSTAGRAM_URL: z.string().url().optional(),

  // PayPal (replaced Stripe, Feb 2026)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYPAL_STARTER_PLAN_ID: z.string().optional(),
  PAYPAL_PRO_PLAN_ID: z.string().optional(),
  PAYPAL_TEAM_PLAN_ID: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  SERPAPI_API_KEY: z.string().optional(),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_LEAD_INTAKE_URL: z.string().url().optional(),
  AITABLE_API_TOKEN: z.string().optional(),
  AITABLE_SPACE_ID: z.string().optional(),
  AITABLE_LEADS_DATASHEET_ID: z.string().optional(),
  AITABLE_CLIENTS_DATASHEET_ID: z.string().optional(),
  AITABLE_MASTER_REGISTRY_ID: z.string().optional(),
  AITABLE_KNOWLEDGE_DATASHEET_ID: z.string().optional(),
  AITABLE_TESTIMONIALS_DATASHEET_ID: z.string().optional(),
  AITABLE_PAYMENTS_DATASHEET_ID: z.string().optional(),
  AITABLE_SOLUTIONS_DATASHEET_ID: z.string().optional(),
  AITABLE_CAMPAIGNS_DATASHEET_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
