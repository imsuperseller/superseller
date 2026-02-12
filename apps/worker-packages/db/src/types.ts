export const RUNTIME = {
    MAX_PHOTOS: 80,
    TIERS: {
        30: { num_clips: 10, num_shots: 11, clip_seconds: 3.0 },
        45: { num_clips: 12, num_shots: 13, clip_seconds: 3.75 },
        60: { num_clips: 16, num_shots: 17, clip_seconds: 3.75 },
    },
    MAX_CLIP_ATTEMPTS: 3,
    MAX_CONCURRENT_JOBS: { starter: 1, pro: 3, team: 10 },
    MAX_JOBS_PER_DAY: { starter: 3, pro: 15, team: 50 },
    CREDIT_COST: {
        '30_fast': 1,
        '45_fast': 1.5,
        '60_fast': 2,
        '30_hq': 2,
        '45_hq': 2.5,
        '60_hq': 3,
    },
    POLL: {
        interval_seconds: 5,
        max_attempts: 60,
        timeout_seconds: 300,
    },
    MUSIC: {
        extra_seconds: 8, // music_seconds = target_seconds + 8
        model: 'V5' as const,
        fade_in_ms: 600,
        fade_out_ms: 900,
        music_gain_db: -8,
        aac_bitrate: '192k',
    },
    PROGRESS: {
        queued: 0,
        scraping: 10,
        planning: 20,
        generating_base: 20, // + floor((done/total) * 60)
        stitching: 90,
        uploading: 95,
        complete: 100,
    },
    CURRENT_STEP_STRINGS: {
        created: 'Created',
        scraping: 'Scraping listing photos',
        planning: 'Planning tour',
        generating: (done: number, total: number) => `Generating clips (${done}/${total})`,
        stitching: 'Stitching final video',
        uploading: 'Uploading',
        complete: 'Complete',
    },
} as const;

export type TargetSeconds = 30 | 45 | 60;
export type Quality = 'fast' | 'hq';
export type JobStatus = 'queued' | 'scraping' | 'planning' | 'generating' | 'stitching' | 'uploading' | 'complete' | 'failed';
export type ClipStatus = 'queued' | 'generating' | 'done' | 'failed';
export type AudioPolicy = 'single_bed' | 'none';

export type MusicPreset = {
    style: string;
    negativeTags: string;
};

export const MUSIC_PRESETS: Record<'luxury_modern' | 'cozy_farmhouse' | 'beachfront_vacation' | 'epic_statement', MusicPreset> = {
    luxury_modern: {
        style: 'Modern cinematic ambient, warm pads, orchestral hybrid, 120 BPM, light percussion, airy, luxury real-estate',
        negativeTags: 'vocals, singing, rap, trap, heavy metal, aggressive bass, choir, harsh, distorted, explicit',
    },
    cozy_farmhouse: {
        style: 'Acoustic warmth, fingerstyle guitar, light strings, 100 BPM, rustic charm, peaceful atmosphere',
        negativeTags: 'vocals, singing, electronic, bass heavy, loud, drum machines, industrial, intense',
    },
    beachfront_vacation: {
        style: 'Tropical chill, relaxed house, bright, summer vibes, upbeat marimba, ocean breeze feel, travel showcase',
        negativeTags: 'vocals, singing, dark, sad, slow, aggressive, heavy distortion, dramatic',
    },
    epic_statement: {
        style: 'High drama, cinematic trailer style, powerful crescendos, building energy, grand architectural masterpiece',
        negativeTags: 'vocals, singing, lo-fi, chill, elevator music, background mush, thin, small',
    },
};
