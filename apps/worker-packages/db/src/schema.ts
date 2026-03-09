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

// --- Elite Pro: Incoming WhatsApp Assets ---
// Raw media sent by Saar/Mor in the WhatsApp group → downloaded → stored to R2.
// These are the source materials that eventually get referenced by content_entries.
export const epIncomingAssets = pgTable("ep_incoming_assets", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(), // "elite-pro-remodeling"
    // WhatsApp origin
    waMessageId: text("wa_message_id").notNull().unique(), // WAHA message ID
    waChatId: text("wa_chat_id").notNull(),               // group JID
    waSenderId: text("wa_sender_id"),                     // who sent it
    waSenderName: text("wa_sender_name"),
    waCaption: text("wa_caption"),                        // caption they wrote with the media
    // Asset classification
    assetType: text("asset_type").notNull(), // before_photo | after_photo | reference | sora_char | brand | video | other
    mimeType: text("mime_type"),             // image/jpeg | video/mp4 etc.
    // Storage
    r2Key: text("r2_key"),                  // null until downloaded + uploaded
    r2Url: text("r2_url"),
    fileSizeBytes: integer("file_size_bytes"),
    // Processing state
    status: text("status").notNull().default("pending"), // pending | downloading | stored | used | rejected
    processingError: text("processing_error"),
    // Links to other tables
    actorId: uuid("actor_id").references(() => contentActors.id), // if this is a Sora char asset
    usedInContentIds: jsonb("used_in_content_ids").default([]),   // content_entries.id array
    // Agent reaction tracking (did we ✅ react in WhatsApp?)
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    meta: jsonb("meta").default({}),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantIdx: index("idx_ep_assets_tenant").on(table.tenantId),
    statusIdx: index("idx_ep_assets_status").on(table.tenantId, table.status),
    typeIdx: index("idx_ep_assets_type").on(table.tenantId, table.assetType),
    receivedIdx: index("idx_ep_assets_received").on(table.receivedAt),
}));

export const epIncomingAssetsRelations = relations(epIncomingAssets, ({ one }) => ({
    actor: one(contentActors, {
        fields: [epIncomingAssets.actorId],
        references: [contentActors.id],
    }),
}));

// --- Prompt Configuration (DB-driven, update without deploys) ---
export const promptConfigs = pgTable("prompt_configs", {
    id: uuid("id").primaryKey().defaultRandom(),
    service: text("service").notNull(), // "videoforge", "marketplace", "claudeclaw", "socialhub"
    promptKey: text("prompt_key").notNull(),
    template: text("template").notNull(), // The prompt template with {{variable}} placeholders
    version: integer("version").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"), // model preferences, temperature, etc.
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    serviceKeyVersion: uniqueIndex("prompt_config_service_key_version").on(table.service, table.promptKey, table.version),
    lookupIdx: index("idx_prompt_config_lookup").on(table.service, table.promptKey),
}));

export const systemSettings = pgTable("system_settings", {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Instagram Content Rules & Configuration (per tenant, per content type) ---
// Stores platform rules, recommended settings, hashtag sets, caption templates,
// and compliance guardrails. Queried by the content generation pipeline to ensure
// every piece of content is compliant and optimized before publishing.
export const igContentRules = pgTable("ig_content_rules", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(),
    contentType: text("content_type").notNull(), // reel | story | carousel | post | all
    ruleCategory: text("rule_category").notNull(), // platform_limits | best_practices | hashtags | caption | scheduling | compliance | music | dimensions
    ruleKey: text("rule_key").notNull(), // e.g. "max_hashtags", "optimal_length_seconds", "caption_hook_chars"
    value: jsonb("value").notNull(), // flexible — number, string, array, object depending on ruleKey
    description: text("description"), // human-readable explanation
    source: text("source"), // where this rule comes from (e.g. "Instagram @creators Dec 2025", "internal strategy")
    priority: integer("priority").default(0), // higher = more important (for conflict resolution)
    isActive: boolean("is_active").notNull().default(true),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantTypeCategory: uniqueIndex("uq_ig_rules_tenant_type_cat_key").on(table.tenantId, table.contentType, table.ruleCategory, table.ruleKey),
    lookupIdx: index("idx_ig_rules_lookup").on(table.tenantId, table.contentType, table.ruleCategory),
}));

// --- Hashtag Sets (per tenant, per content category) ---
// Pre-built hashtag combinations following the 5-hashtag strategy.
// Each set is optimized for a specific content scenario and includes
// rotation scheduling to avoid spam detection.
export const hashtagSets = pgTable("hashtag_sets", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(),
    setName: text("set_name").notNull(), // e.g. "kitchen_before_after", "outdoor_living", "team_culture"
    contentCategory: text("content_category").notNull(), // before_after | progress | inspiration | testimonial | team | tips | material_specific
    hashtags: jsonb("hashtags").notNull(), // array of 5 hashtags
    reasoning: text("reasoning"), // why this combination was chosen
    rotationGroup: integer("rotation_group").default(0), // for weekly rotation scheduling
    usageCount: integer("usage_count").default(0),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    avgReach: doublePrecision("avg_reach"), // populated from IG Insights after use
    avgEngagement: doublePrecision("avg_engagement"),
    isActive: boolean("is_active").notNull().default(true),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantSetName: uniqueIndex("uq_hashtag_sets_tenant_name").on(table.tenantId, table.setName),
    categoryIdx: index("idx_hashtag_sets_category").on(table.tenantId, table.contentCategory),
}));

// --- Caption Templates (per tenant, per content type + scenario) ---
// Structured caption formulas with hook, body, CTA, and hashtag placement.
// Used by content generation to ensure captions hit the 125-char visible threshold
// and comply with the 2,200-char max.
export const captionTemplates = pgTable("caption_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: text("tenant_id").notNull(),
    contentType: text("content_type").notNull(), // reel | story | carousel | post
    scenario: text("scenario").notNull(), // before_after | progress | inspiration | testimonial | team | tips | offer
    hookTemplate: text("hook_template").notNull(), // first 125 chars (feed) or 55 chars (reel) — the visible part
    bodyTemplate: text("body_template"), // main caption body (after "more")
    ctaTemplate: text("cta_template"), // call-to-action line
    language: text("language").notNull().default("en"), // en | he
    captionLength: text("caption_length").notNull().default("medium"), // short (<300) | medium (300-800) | long (800-2200)
    exampleCaption: text("example_caption"), // fully rendered example for reference
    hashtagSetId: uuid("hashtag_set_id").references(() => hashtagSets.id), // default hashtag set for this template
    usageCount: integer("usage_count").default(0),
    avgEngagement: doublePrecision("avg_engagement"),
    isActive: boolean("is_active").notNull().default(true),
    meta: jsonb("meta").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantTypeScenario: uniqueIndex("uq_caption_tmpl_tenant_type_scenario_lang").on(table.tenantId, table.contentType, table.scenario, table.language),
    lookupIdx: index("idx_caption_tmpl_lookup").on(table.tenantId, table.contentType),
}));
