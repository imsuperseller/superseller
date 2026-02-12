// DATABASE ROW TYPES

export interface DbUser {
    id: string;
    clerk_id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    company: string | null;
    license_number: string | null;
    avatar_url: string | null;
    stripe_customer_id: string | null;
    subscription_tier: SubscriptionTier;
    videos_used_this_month: number;
    videos_limit: number;
    billing_cycle_start: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface DbListing {
    id: string;
    user_id: string;
    address: string;
    city: string | null;
    state: string | null;
    zip: string | null;
    property_type: PropertyType;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
    listing_price: number | null;
    mls_number: string | null;
    exterior_photo_url: string | null;
    floorplan_url: string | null;
    floorplan_analysis: FloorplanAnalysis | null;
    additional_photos: string[];
    created_at: Date;
    updated_at: Date;
}

export interface DbVideoJob {
    id: string;
    listing_id: string;
    user_id: string;
    status: JobStatus;
    model_preference: ModelPreference;
    tour_sequence: TourRoom[] | null;
    music_style: string;
    music_track_id: string | null;
    transition_style: TransitionStyle;
    include_exterior: boolean;
    include_backyard: boolean;
    total_clips: number | null;
    completed_clips: number;
    current_step: string | null;
    progress_percent: number;
    master_video_url: string | null;
    square_video_url: string | null;
    vertical_video_url: string | null;
    portrait_video_url: string | null;
    thumbnail_url: string | null;
    video_duration_seconds: number | null;
    total_api_cost: number;
    error_message: string | null;
    error_code: string | null;
    retry_count: number;
    max_retries: number;
    started_at: Date | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface DbClip {
    id: string;
    video_job_id: string;
    clip_number: number;
    from_room: string | null;
    to_room: string | null;
    prompt: string;
    start_frame_url: string | null;
    end_frame_url: string | null;
    model_used: string | null;
    provider: "kie" | null;
    external_task_id: string | null;
    status: ClipStatus;
    video_url: string | null;
    local_path: string | null;
    duration_seconds: number | null;
    api_cost: number;
    generation_time_seconds: number | null;
    approved: boolean | null;
    rejection_reason: string | null;
    retry_count: number;
    max_retries: number;
    error_message: string | null;
    created_at: Date;
    completed_at: Date | null;
}

// ENUMS

export type SubscriptionTier = "free" | "starter" | "pro" | "team";
export type PropertyType = "house" | "condo" | "apartment" | "townhouse" | "commercial" | "land";
export type ModelPreference = "kling_3"; // No Veo — Kie Kling 3 only (rewired architecture)
export type TransitionStyle = "fade" | "dissolve" | "wipeleft" | "wiperight" | "circleopen" | "circleclose" | "radial" | "smoothleft";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "incomplete";

export type JobStatus =
    | "pending"
    | "analyzing"
    | "generating_prompts"
    | "generating_clips"
    | "awaiting_approval"
    | "stitching"
    | "adding_music"
    | "exporting"
    | "uploading"
    | "complete"
    | "failed"
    | "cancelled";

export type ClipStatus = "pending" | "generating" | "complete" | "failed" | "retrying" | "skipped";

// ANALYSIS TYPES

export interface FloorplanRoom {
    name: string;
    type: string;
    approximate_position: { x: number; y: number };
    connects_to: string[];
    floor: number;
}

export interface FloorplanAnalysis {
    rooms: FloorplanRoom[];
    suggested_tour_sequence: string[];
    total_rooms: number;
    property_type: string;
    floors: number;
    special_features: string[];
    confidence_score: number;
}

export interface TourRoom {
    order: number;
    from: string;
    to: string;
    transition_type: "walk" | "enter" | "stairs" | "exit";
}

export interface ClipPrompt {
    clip_number: number;
    from_room: string;
    to_room: string;
    prompt: string;
    negative_prompt?: string;
    start_frame_url: string | null;
    end_frame_url: string | null;
    duration_seconds: number;
}

export interface TierLimits {
    monthly_videos: number;
    models_allowed: ModelPreference[];
    priority: number;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    free: {
        monthly_videos: 1,
        models_allowed: ["kling_3"],
        priority: 3,
    },
    starter: {
        monthly_videos: 5,
        models_allowed: ["kling_3"],
        priority: 3,
    },
    pro: {
        monthly_videos: 15,
        models_allowed: ["kling_3"],
        priority: 2,
    },
    team: {
        monthly_videos: 50,
        models_allowed: ["kling_3"],
        priority: 1,
    },
};
