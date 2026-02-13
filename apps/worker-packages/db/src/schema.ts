import { pgTable, text, timestamp, uuid, numeric, integer, jsonb, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const jobStatusEnum = [
    "queued",
    "scraping",
    "planning",
    "generating",
    "stitching",
    "uploading",
    "complete",
    "failed",
] as const;

export const clipStatusEnum = ["queued", "generating", "done", "failed"] as const;

// Multi-Tenancy
export const tenants = pgTable("tenants", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    status: text("status").notNull().default("active"),
    plan: jsonb("plan"),
    settings: jsonb("settings"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    slugIdx: uniqueIndex("idx_tenants_slug").on(table.slug),
    statusIdx: index("idx_tenants_status").on(table.status),
}));

export const tenantUsers = pgTable("tenant_users", {
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("user"),
}, (table) => ({
    pk: index("tenant_users_pk").on(table.tenantId, table.userId),
}));

// Tables
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    phone: text("phone"),
    image: text("image"),
    dashboardToken: text("dashboard_token").unique(),

    // Business Profile
    businessName: text("business_name"),
    businessType: text("business_type"),
    businessSize: text("business_size"),
    revenueRange: text("revenue_range"),

    // Account Status
    status: text("status").notNull().default("active"),
    role: text("role").notNull().default("USER"),
    emailVerified: timestamp("email_verified", { withTimezone: true }),

    // Service Access & Entitlements
    activeServices: jsonb("active_services"),
    entitlements: jsonb("entitlements"),

    // Billing
    stripeCustomerId: text("stripe_customer_id"),

    // Preferences & Metrics
    preferences: jsonb("preferences").default({}),
    metrics: jsonb("metrics"), // { totalLeads, totalMessages, totalBookings, lastActivityAt }

    // Acquisition
    source: text("source"),
    referrerId: text("referrer_id"),
    qualificationScore: integer("qualification_score"),
    qualificationTier: text("qualification_tier"),

    // Timestamps
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    emailIdx: uniqueIndex("idx_users_email").on(table.email),
    tokenIdx: uniqueIndex("idx_users_token").on(table.dashboardToken),
}));

export const stripeCustomers = pgTable("stripe_customers", {
    userId: uuid("user_id").primaryKey().references(() => users.id),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const entitlementsTable = pgTable("entitlements", {
    userId: uuid("user_id").primaryKey().references(() => users.id),
    creditsBalance: numeric("credits_balance").notNull().default("0"),
    plan: text("plan").notNull().default("starter"), // starter | pro | team
    status: text("status").notNull().default("active"), // active | past_due | canceled
    resetAt: timestamp("reset_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    zillowUrl: text("zillow_url").notNull(),
    targetSeconds: integer("target_seconds").notNull(),
    aspectRatio: text("aspect_ratio").notNull().default("9:16"),
    quality: text("quality").notNull().default("fast"),
    status: text("status").notNull().default("queued"),
    progress: integer("progress").notNull().default(0),
    currentStep: text("current_step").notNull().default("Created"),
    seed: integer("seed").notNull(),
    planJson: jsonb("plan_json"),
    floorplanR2Key: text("floorplan_r2_key"),
    finalR2Key: text("final_r2_key"),
    finalUrl: text("final_url"),
    musicTaskId: text("music_task_id"),
    musicR2Key: text("music_r2_key"),
    audioPolicy: text("audio_policy").notNull().default("single_bed"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    userIdIdx: index("idx_jobs_user_id").on(table.userId),
    statusIdx: index("idx_jobs_status").on(table.status),
}));

export const assets = pgTable("assets", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").notNull().references(() => jobs.id),
    kind: text("kind").notNull(), // floorplan | photo_source | clip | music_bed | final
    url: text("url"),
    r2Key: text("r2_key"),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    jobKindUniq: uniqueIndex("assets_job_kind_uniq").on(table.jobId, table.kind),
}));

export const clips = pgTable("clips", {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").notNull().references(() => jobs.id),
    clipIdx: integer("clip_idx").notNull(),
    firstUrl: text("first_url").notNull(),
    lastUrl: text("last_url").notNull(),
    prompt: text("prompt").notNull(),
    seconds: numeric("seconds").notNull(),
    model: text("model").notNull(), // veo3_fast | veo3
    kieTaskId: text("kie_task_id"),
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    resultR2Key: text("result_r2_key"),
    resultUrl: text("result_url"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    jobClipidxUniq: uniqueIndex("clips_job_clipidx_uniq").on(table.jobId, table.clipIdx),
    jobIdIdx: index("idx_clips_job_id").on(table.jobId),
}));

// Relations
export const jobsRelations = relations(jobs, ({ many }) => ({
    clips: many(clips),
    assets: many(assets),
}));

export const clipsRelations = relations(clips, ({ one }) => ({
    job: one(jobs, {
        fields: [clips.jobId],
        references: [jobs.id],
    }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
    job: one(jobs, {
        fields: [assets.jobId],
        references: [jobs.id],
    }),
}));

export const usageEvents = pgTable("usage_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    jobId: uuid("job_id").references(() => jobs.id),
    type: text("type").notNull(), // credit_debit | credit_refund | apify_run | kie_generate | stitch | upload
    amount: numeric("amount").notNull().default("0"),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    userIdIdx: index("idx_usage_events_user").on(table.userId),
}));

export const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
