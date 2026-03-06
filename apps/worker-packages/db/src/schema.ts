import { pgTable, text, timestamp, uuid, numeric, integer, jsonb, boolean, pgEnum, uniqueIndex, index, primaryKey, doublePrecision } from "drizzle-orm/pg-core";
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
    pk: primaryKey({ columns: [table.tenantId, table.userId] }),
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
    // Aligned with Prisma: Boolean? — DB column is `boolean`, not timestamp
    emailVerified: boolean("email_verified"),

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
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique().references(() => users.id),
    creditsBalance: integer("credits_balance").notNull().default(0),
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
    jobId: uuid("job_id"),
    type: text("event_type").notNull(), // debit | refund | topup | grant | reset
    amount: integer("credits_used").default(0), // Positive for topup/refund, negative for debit
    modelId: text("model_id"), // FK into LlmModelConfig
    costUsd: doublePrecision("cost_usd"), // actual cost in USD
    tokensUsed: integer("tokens_used"), // total tokens (input + output)
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    userIdIdx: index("idx_usage_events_user").on(table.userId),
    typeIdx: index("idx_usage_events_type").on(table.type),
    modelIdIdx: index("idx_usage_events_model").on(table.modelId),
    createdAtIdx: index("idx_usage_events_created").on(table.createdAt),
}));

// --- Instagram Autopilot: Content Reference Database ---
export const contentStyleEnum = ["cinematic", "raw", "polished", "documentary"] as const;
export const contentAestheticEnum = ["dark_moody", "bright_clean", "warm_luxury", "industrial"] as const;
export const introHookEnum = ["question", "stat", "reveal", "direct", "curiosity"] as const;
export const ctaTypeEnum = ["call", "dm", "save", "link", "none"] as const;
export const cameraAngleEnum = ["drone", "pov", "wide", "macro", "timelapse", "stabilized"] as const;
export const contentTypeEnum = ["reel", "story", "carousel", "post"] as const;

export const contentEntries = pgTable("content_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(), // e.g. "elite-pro"
    type: text("type").notNull(), // reel | story | carousel | post
    style: text("style"), // cinematic | raw | polished | documentary
    aesthetic: text("aesthetic"), // dark_moody | bright_clean | warm_luxury | industrial
    introHook: text("intro_hook"), // question | stat | reveal | direct | curiosity
    ctaType: text("cta_type"), // call | dm | save | link | none
    cameraAngle: text("camera_angle"), // drone | pov | wide | macro | timelapse | stabilized
    cameraType: text("camera_type"), // phone_feel | cinematic | stabilized_walkthrough
    projectType: text("project_type"), // kitchen | bathroom | full_home | concrete | patio | painting
    actors: jsonb("actors").default([]), // array of actor IDs used
    musicStyle: text("music_style"), // upbeat | cinematic | ambient | none
    captionLength: text("caption_length"), // short | medium | long
    captionText: text("caption_text"),
    hashtagSet: jsonb("hashtag_set").default([]),
    contentLength: integer("content_length"), // seconds for video, slides for carousel
    r2Key: text("r2_key"),
    mediaUrl: text("media_url"),
    thumbnailUrl: text("thumbnail_url"),
    igPostId: text("ig_post_id"), // Instagram post ID after publishing
    postedAt: timestamp("posted_at", { withTimezone: true }),
    dayOfWeek: text("day_of_week"),
    timeSlot: text("time_slot"), // morning | afternoon | evening | night
    // Engagement metrics (populated from IG Insights API)
    impressions: integer("impressions").default(0),
    reach: integer("reach").default(0),
    likes: integer("likes").default(0),
    comments: integer("comments").default(0),
    shares: integer("shares").default(0),
    saves: integer("saves").default(0),
    engagementRate: doublePrecision("engagement_rate"),
    performanceScore: doublePrecision("performance_score"),
    // Approval workflow
    status: text("status").default("draft"), // draft | pending_approval | approved | rejected | revision_requested | published
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    // Metadata
    meta: jsonb("meta").default({}), // extensible — new fields go here first
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantIdx: index("idx_content_entries_tenant").on(table.tenantId),
    typeIdx: index("idx_content_entries_type").on(table.type),
    statusIdx: index("idx_content_entries_status").on(table.tenantId, table.status),
    postedAtIdx: index("idx_content_entries_posted").on(table.postedAt),
    perfIdx: index("idx_content_entries_perf").on(table.tenantId, table.performanceScore),
}));

// --- Instagram Autopilot: Actor / Cameo Database ---
export const contentActors = pgTable("content_actors", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(), // owner | pm | crew | model
    soraCameoUrl: text("sora_cameo_url"),
    thumbnailUrl: text("thumbnail_url"),
    voiceId: text("voice_id"), // ElevenLabs voice ID
    appearanceNotes: text("appearance_notes"),
    availableFor: jsonb("available_for").default(["reel", "story", "carousel"]),
    usageCount: integer("usage_count").default(0),
    avgEngagement: doublePrecision("avg_engagement"),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantIdx: index("idx_content_actors_tenant").on(table.tenantId),
    roleIdx: index("idx_content_actors_role").on(table.tenantId, table.role),
}));

// --- Instagram Autopilot: Competitor Ad Research ---
export const competitorAds = pgTable("competitor_ads", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(),
    adId: text("ad_id"), // Meta Ad Library ID
    pageName: text("page_name"),
    adUrl: text("ad_url"),
    adText: text("ad_text"),
    adTitle: text("ad_title"),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    ctaText: text("cta_text"),
    startDate: text("start_date"),
    platforms: jsonb("platforms").default([]),
    // Client feedback
    liked: boolean("liked"), // null = not reviewed, true = liked, false = disliked
    feedbackNote: text("feedback_note"),
    feedbackBy: text("feedback_by"), // who gave feedback
    feedbackAt: timestamp("feedback_at", { withTimezone: true }),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantIdx: index("idx_competitor_ads_tenant").on(table.tenantId),
    likedIdx: index("idx_competitor_ads_liked").on(table.tenantId, table.liked),
}));

export const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
