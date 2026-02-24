# Doc 1: Project Setup

> **Purpose:** Everything Claude Code needs to scaffold the Next.js project from zero.
> **Action:** Run these commands and create these files before writing any application code.

---

## 1. Create Next.js Project

```bash
npx create-next-app@latest winner-video-studio \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

cd winner-video-studio
```

## 2. Install Dependencies

```bash
# Core
npm install next@latest react@latest react-dom@latest

# Database & Cache
npm install pg @types/pg           # Postgres client
npm install ioredis                 # Redis client

# Storage
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage   # R2 (S3-compatible)

# Auth
npm install resend                  # Magic link emails
npm install jose                    # JWT signing/verification (edge-compatible)
npm install nanoid                  # Short unique IDs for tokens

# UI
npm install lucide-react            # Icons (keep from existing project)
npm install clsx tailwind-merge     # Conditional classnames
npm install framer-motion           # Animations

# Utilities
npm install zod                     # Request validation
npm install date-fns                # Date formatting
```

**No additional devDependencies needed** — `create-next-app` installs TypeScript, ESLint, Tailwind, PostCSS.

## 3. package.json Scripts

Replace the scripts block:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "node scripts/migrate.mjs",
    "db:seed": "node scripts/seed.mjs"
  }
}
```

## 4. next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Server Components (default in App Router)
  reactStrictMode: true,

  // Allow external images from R2 and kie.ai results
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'static.aiquickdraw.com', // kie.ai result URLs
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev', // R2 public dev URLs
      },
    ],
  },

  // Headers for CORS (kie.ai callbacks)
  async headers() {
    return [
      {
        source: '/api/callbacks/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Rewrites: none needed, api routes handle everything
};

export default nextConfig;
```

## 5. vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/check-stuck",
      "schedule": "*/2 * * * *"
    }
  ],
  "regions": ["iad1"],
  "functions": {
    "src/app/api/callbacks/kie/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/generate/route.ts": {
      "maxDuration": 60
    },
    "src/app/api/cron/check-stuck/route.ts": {
      "maxDuration": 30
    }
  }
}
```

**Notes:**
- `iad1` (US East) — closest to Racknerd DAL (Dallas) and Cloudflare
- Cron runs every 2 minutes to check for stuck kie.ai tasks
- `maxDuration: 60` for generate route because Gemini brain call can take 10-20s
- Callbacks need 30s because they trigger next pipeline stage

## 6. tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mivnim/Winner brand colors (from existing constants.tsx)
        brand: {
          primary: '#3A388E',    // Deep purple/blue
          secondary: '#B6E3D4',  // Turquoise accent
          dark: '#0c0c0e',       // Background
          card: '#16161a',       // Card surfaces
          'card-hover': '#1e1e24', // Card hover
          muted: '#8b8b9e',      // Muted text
          success: '#4ade80',    // Green for completed
          warning: '#fbbf24',    // Yellow for in-progress
          error: '#f87171',      // Red for failed
        },
      },
      fontFamily: {
        // Hebrew-friendly font stack
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-rubik)', 'var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

## 7. tsconfig.json Additions

The default `create-next-app` tsconfig is fine. Just verify these compiler options exist:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 8. Global Styles: src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* RTL support for Hebrew */
[dir="rtl"] {
  text-align: right;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0c0c0e;
}
::-webkit-scrollbar-thumb {
  background: #3A388E;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4a48ae;
}

/* Stage pipeline indicator dots */
@layer components {
  .stage-dot {
    @apply w-3 h-3 rounded-full transition-all duration-300;
  }
  .stage-dot-pending {
    @apply bg-brand-muted/30;
  }
  .stage-dot-active {
    @apply bg-brand-warning animate-pulse-slow;
  }
  .stage-dot-complete {
    @apply bg-brand-success;
  }
  .stage-dot-error {
    @apply bg-brand-error;
  }
}

/* Video card hover effect */
@layer components {
  .video-card {
    @apply bg-brand-card rounded-xl border border-white/5 
           transition-all duration-200 hover:border-brand-primary/30 
           hover:bg-brand-card-hover hover:shadow-lg hover:shadow-brand-primary/5;
  }
}
```

## 9. Root Layout: src/app/layout.tsx

```tsx
import type { Metadata } from 'next';
import { Heebo, Rubik } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  variable: '--font-rubik',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Winner Video Studio',
  description: 'AI-Powered Video Production by Rensto',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable}`}>
      <body className="bg-brand-dark text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

**Design decisions:**
- `lang="he" dir="rtl"` — Hebrew-first, RTL layout (Yossi is Israeli)
- **Heebo** for body text — clean Hebrew sans-serif, excellent screen readability
- **Rubik** for display/headings — slightly bolder, great Hebrew + Latin pairing
- Dark theme as default — matches existing POC aesthetic
- Both fonts support Hebrew + Latin subsets (mixed content like "WINNER" in Hebrew text)

## 10. Directory Structure to Create

```bash
mkdir -p src/app/login
mkdir -p src/app/verify
mkdir -p src/app/dashboard/gallery
mkdir -p src/app/api/auth/magic-link
mkdir -p src/app/api/auth/verify
mkdir -p src/app/api/auth/whatsapp-otp
mkdir -p src/app/api/auth/verify-otp
mkdir -p src/app/api/auth/me
mkdir -p src/app/api/generate
mkdir -p src/app/api/generations
mkdir -p src/app/api/callbacks/kie
mkdir -p src/app/api/upload
mkdir -p src/app/api/cron/check-stuck
mkdir -p src/app/api/health
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p scripts
mkdir -p public/logos
```

## 11. Type Definitions: src/types/index.ts

```typescript
// ============================================
// DATABASE TYPES (mirror Postgres schema)
// ============================================

export type GenerationStage =
  | 'PENDING'
  | 'SCRIPT_PROCESSING'
  | 'AUDIO_ISOLATING'
  | 'VIDEO_GENERATING'
  | 'MUSIC_GENERATING'
  | 'AWAITING_MUSIC_SELECT'
  | 'POST_PROCESSING'
  | 'DELIVERING'
  | 'COMPLETE'
  | 'FAILED';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  tenant_id: string;
  credits_remaining: number;
  whatsapp_jid: string | null;
  auth_method: 'email' | 'whatsapp' | null;
  created_at: string;
  last_login: string | null;
}

export interface Generation {
  id: string;
  user_id: string;
  tenant_id: string;

  // Input
  input_audio_url: string | null;
  input_script: string | null;
  character: string | null;
  vibe: string | null;
  language: string;

  // Gemini Brain Output
  rewritten_script: string | null;
  video_prompt: string | null;
  routed_model: string | null;
  music_prompt: string | null;
  audio_quality_score: number | null;
  needs_isolation: boolean;
  gemini_raw_json: Record<string, unknown> | null;

  // Pipeline State
  stage: GenerationStage;

  // Task IDs
  gemini_task_id: string | null;
  isolation_task_id: string | null;
  video_task_id: string | null;
  music_task_id: string | null;

  // Results
  isolated_audio_url: string | null;
  raw_video_url: string | null;
  final_video_url: string | null;
  music_urls: string[] | null;
  selected_music_url: string | null;

  // Delivery
  whatsapp_delivered: boolean;
  whatsapp_message_id: string | null;

  // Metadata
  credits_charged: number;
  error_message: string | null;
  error_stage: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface GenerationEvent {
  id: number;
  generation_id: string;
  stage: string;
  event_type: 'stage_enter' | 'callback_received' | 'error' | 'retry';
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface GenerateRequest {
  audioUrl?: string;
  script?: string;
  character: string;
  vibe: string;
  language: string;
}

export interface GeminiBrainOutput {
  rewritten_script: string;
  video_prompt: string;       // max 500 chars
  routed_model: string;       // model_id from registry
  music_prompt: string;
  audio_quality_score: number; // 1-10
  needs_isolation: boolean;
  subtitle_text: string;
  routing_reasoning: string;
}

export interface KieCreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface KieTaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'success' | 'fail';
    param: string;
    resultJson: string | null; // JSON string: { resultUrls: string[] }
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

export interface KieCallbackPayload {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'success' | 'fail';
    param: string;
    resultJson: string | null;
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

// ============================================
// AITABLE TYPES
// ============================================

export interface ModelRegistryEntry {
  model_id: string;
  display_name: string;
  provider: string;
  model_type: 'video' | 'audio' | 'music' | 'text';
  use_case: string;
  accepts_audio: 'yes' | 'no';
  accepts_image: 'yes' | 'no';
  max_duration_sec: number;
  avg_cost_credits: number;
  status: 'active' | 'testing' | 'disabled';
  default_params: string; // JSON string
  notes: string;
}

export interface TonePreset {
  tenant_id: string;
  preset_name: string;
  system_prompt_fragment: string;
  example_rewrites: string;
  active: 'yes' | 'no';
}

export interface ScriptLibraryEntry {
  title: string;
  tenant_id: string;
  character: string;
  vibe: string;
  language: string;
  original_script: string;
  rewritten_script: string;
  video_prompt: string;
  notes: string;
}

// ============================================
// UI TYPES
// ============================================

export interface StageInfo {
  key: GenerationStage;
  label: string;       // Hebrew display label
  labelEn: string;     // English fallback
  icon: string;        // Lucide icon name
  order: number;       // Pipeline position (0-8)
}

export const PIPELINE_STAGES: StageInfo[] = [
  { key: 'PENDING',              label: 'ממתין',          labelEn: 'Pending',           icon: 'Clock',         order: 0 },
  { key: 'SCRIPT_PROCESSING',    label: 'מעבד תסריט',     labelEn: 'Script Processing',  icon: 'Brain',         order: 1 },
  { key: 'AUDIO_ISOLATING',      label: 'מנקה שמע',       labelEn: 'Audio Isolation',    icon: 'AudioLines',    order: 2 },
  { key: 'VIDEO_GENERATING',     label: 'מייצר וידאו',    labelEn: 'Generating Video',   icon: 'Video',         order: 3 },
  { key: 'MUSIC_GENERATING',     label: 'יוצר מוזיקה',    labelEn: 'Generating Music',   icon: 'Music',         order: 4 },
  { key: 'AWAITING_MUSIC_SELECT',label: 'בחירת מוזיקה',   labelEn: 'Select Music',       icon: 'ListMusic',     order: 5 },
  { key: 'POST_PROCESSING',      label: 'עיבוד סופי',     labelEn: 'Post-Processing',    icon: 'Wand2',         order: 6 },
  { key: 'DELIVERING',           label: 'שולח',           labelEn: 'Delivering',         icon: 'Send',          order: 7 },
  { key: 'COMPLETE',             label: 'הושלם!',         labelEn: 'Complete!',          icon: 'CheckCircle',   order: 8 },
];

// Characters (from existing constants.tsx — keep Hebrew names)
export const CHARACTERS = [
  { id: 'ceo',       label: 'המנכ"ל הכריזמטי',   labelEn: 'Charismatic CEO' },
  { id: 'agent',     label: 'סוכנת השטח',         labelEn: 'Field Agent' },
  { id: 'architect', label: 'האדריכל',            labelEn: 'The Architect' },
  { id: 'client',    label: 'הלקוח המרוצה',       labelEn: 'Happy Client' },
  { id: 'trump',     label: 'טראמפ',              labelEn: 'Trump' },
  { id: 'asher',     label: 'אשר',                labelEn: 'Asher' },
  { id: 'nehorai',   label: 'נהוראי',             labelEn: 'Nehorai' },
] as const;

// Vibes (from existing constants.tsx)
export const VIBES = [
  { id: 'winner',  label: 'אנרגיית וויינר 🏆',   labelEn: 'Winner Energy',    music: 'Techno House, Cinematic High Energy' },
  { id: 'luxury',  label: 'יוקרה שקטה ✨',        labelEn: 'Quiet Luxury',     music: 'Deep Melodic, Elegant & Slow' },
  { id: 'urgent',  label: 'הזדמנות אחרונה ⏰',    labelEn: 'Last Chance',      music: 'Fast Beat, Dynamic & Bold' },
  { id: 'family',  label: 'בית ומשפחה 🏠',        labelEn: 'Home & Family',    music: 'Acoustic Guitar, Warm & Soft' },
] as const;

export const LANGUAGES = [
  { id: 'he', label: 'עברית',     labelEn: 'Hebrew' },
  { id: 'en', label: 'אנגלית',    labelEn: 'English' },
  { id: 'ar', label: 'ערבית',     labelEn: 'Arabic' },
  { id: 'mixed', label: 'מעורב', labelEn: 'Mixed' },
] as const;
```

## 12. Middleware: src/middleware.ts

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard'];

// Paths that should redirect to dashboard if already logged in
const AUTH_PATHS = ['/login', '/verify'];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('winner_session')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes: redirect to login if no session
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes: redirect to dashboard if already has session
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/verify'],
};
```

## 13. Infrastructure Decision: Database Connectivity

**Problem:** Postgres (port 5432) and Redis (port 6379) on Racknerd are firewalled — not accessible from Vercel serverless functions.

**Decision for Phase 1: Hybrid approach**

| Service | Provider | Reason |
|---------|----------|--------|
| **Postgres** | Vercel Postgres (Neon) | Free tier, native Vercel integration, connection pooling built-in, zero firewall issues |
| **Redis** | Upstash Redis | Free tier, serverless-native, REST API (works from edge), zero firewall issues |
| **WAHA** | Racknerd (port 3000) | Already working, accessible from Vercel |
| **FFmpeg** | Racknerd (Phase 2) | Will need SSH/API setup later |

**Setup commands (run in Vercel dashboard or CLI):**

```bash
# Option 1: Via Vercel CLI
npx vercel link
npx vercel env pull

# Option 2: Via Vercel Dashboard
# 1. Go to project → Storage → Create Database → Postgres
# 2. Go to project → Storage → Create Database → KV (Upstash Redis)
# Both auto-inject env vars: POSTGRES_URL, KV_REST_API_URL, etc.
```

**Alternative if Shai opens firewall ports on Racknerd:**
```bash
# On Racknerd server:
sudo ufw allow 5432/tcp
sudo ufw allow 6379/tcp
# Then use direct connection strings in .env
```

The lib/ modules (Doc 7) will abstract this — code works with either provider.

## 14. .gitignore

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

## 15. Verification Checklist

After scaffolding, Claude Code should verify:

```bash
# 1. Project builds
npm run build

# 2. Dev server starts
npm run dev  # → should show on localhost:3000

# 3. RTL layout renders
# Visit localhost:3000 → should see dark background, RTL text direction

# 4. API health endpoint works
curl http://localhost:3000/api/health  # → { "status": "ok" }

# 5. TypeScript compiles clean
npx tsc --noEmit

# 6. All directories exist
ls -la src/app/api/  # Should show all route directories
ls -la src/lib/      # Should be empty, ready for modules
ls -la src/components/ # Should be empty, ready for components
```

---

## Quick Reference: Aitable Table IDs

| Table | Datasheet ID |
|-------|-------------|
| Winner Model Registry | `dstdAf6nZ7TBGymLdD` |
| Winner Script Library | `dstRhwMFwyrJZkeBBy` |
| Winner Brand Assets | `dsthE4dR4jmNGqZLC4` |
| Winner Tone Presets | `dstYWq7kSBuBnoVuAe` |
| Rensto Master Registry | `dstwsqbXSmK5wYMmeQ` |

## Quick Reference: WAHA Sessions

| Session | Number | Status | Use |
|---------|--------|--------|-----|
| `rensto-whatsapp` | +12144362102 | WORKING | **Video delivery** |
| `default` | +14695885133 | WORKING | Shai's personal |
| `InternalBoss` | +14695885133 | WORKING | Internal automation |

## Quick Reference: Cloudflare

| Resource | ID/Name |
|----------|---------|
| Account ID | `46a5b8a6516f86865992dbdfdb3cd77b` |
| R2 Bucket | `winner-video-studio` |
| R2 Endpoint | `https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com` |

## Quick Reference: Vercel

| Resource | Value |
|----------|-------|
| Team ID | `team_a1gxSHNFg8Pp7qxoUN69QkVl` |
| Team Slug | `shais-projects-f9b9e359` |
| Target Domain | `studio.rensto.com` |
| Region | `iad1` (US East) |
