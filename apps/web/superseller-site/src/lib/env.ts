import { z } from 'zod';

/** Treat empty strings as undefined so Zod defaults kick in on Vercel */
const e = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema);

const envSchema = z.object({
  NEXT_PUBLIC_SITE_NAME: e(z.string().default('SuperSeller AI')),
  NEXT_PUBLIC_CONTACT_EMAIL: e(z.string().default('shai@superseller.agency')),
  NEXT_PUBLIC_TYPEFORM_CONTACT_URL: e(z.string().url().optional()),
  NEXT_PUBLIC_LINKEDIN_URL: e(z.string().url().optional()),
  NEXT_PUBLIC_X_URL: e(z.string().url().optional()),
  NEXT_PUBLIC_YOUTUBE_URL: e(z.string().url().optional()),
  NEXT_PUBLIC_INSTAGRAM_URL: e(z.string().url().optional()),

  // PayPal (replaced Stripe, Feb 2026)
  PAYPAL_CLIENT_ID: e(z.string().optional()),
  PAYPAL_CLIENT_SECRET: e(z.string().optional()),
  PAYPAL_MODE: e(z.enum(['sandbox', 'live']).default('sandbox')),
  PAYPAL_WEBHOOK_ID: e(z.string().optional()),
  PAYPAL_STARTER_PLAN_ID: e(z.string().optional()),
  PAYPAL_PRO_PLAN_ID: e(z.string().optional()),
  PAYPAL_TEAM_PLAN_ID: e(z.string().optional()),

  RESEND_API_KEY: e(z.string().optional()),
  SERPAPI_API_KEY: e(z.string().optional()),
  N8N_WEBHOOK_URL: e(z.string().url().optional()),
  N8N_LEAD_INTAKE_URL: e(z.string().url().optional()),
  AITABLE_API_TOKEN: e(z.string().optional()),
  AITABLE_SPACE_ID: e(z.string().optional()),
  AITABLE_LEADS_DATASHEET_ID: e(z.string().optional()),
  AITABLE_CLIENTS_DATASHEET_ID: e(z.string().optional()),
  AITABLE_MASTER_REGISTRY_ID: e(z.string().optional()),
  AITABLE_KNOWLEDGE_DATASHEET_ID: e(z.string().optional()),
  AITABLE_TESTIMONIALS_DATASHEET_ID: e(z.string().optional()),
  AITABLE_PAYMENTS_DATASHEET_ID: e(z.string().optional()),
  AITABLE_SOLUTIONS_DATASHEET_ID: e(z.string().optional()),
  AITABLE_CAMPAIGNS_DATASHEET_ID: e(z.string().optional()),
});

export const env = envSchema.parse(process.env);
