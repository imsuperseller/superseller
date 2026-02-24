# Doc 8: Components Specification

> **Purpose:** Every React component — props, state, data flow, behavior, and UI layout. Follows the existing Mivnim design language (dark luxury, RTL, Heebo/Rubik fonts, turquoise accents).
> **Action:** Claude Code creates each component in `src/components/` (shared) and `src/app/` (pages). Uses Tailwind CSS, Lucide icons, and the established brand tokens.

---

## Design System Reference

```
Colors:
  Primary:    #3A388E (deep purple-blue — buttons, accents, selected states)
  Secondary:  #B6E3D4 (turquoise — highlights, success, active indicators)
  Dark BG:    #0c0c0e (page background)
  Card BG:    #16161a (card surfaces)
  Card Hover: #1a1a1e (elevated cards)
  Text:       #e2e8f0 (primary text)
  Muted:      #6b7280 (secondary text)
  Error:      rose-500 (errors/failures)
  Success:    emerald-500 (complete states)

Typography:
  Heebo:  Body text, labels, Hebrew content
  Rubik:  Headings, display text, hero sections
  
  Heading XL: text-6xl font-black (Rubik)
  Heading L:  text-3xl font-black (Rubik)
  Heading M:  text-xl font-black (Rubik)
  Body:       text-base font-medium (Heebo)
  Caption:    text-xs font-bold uppercase tracking-widest (Heebo)
  
Radius:
  Pill:   rounded-full
  Card:   rounded-[2rem] or rounded-[3rem]
  Button: rounded-[1.5rem] or rounded-2xl
  Input:  rounded-2xl

Direction: RTL (dir="rtl", text-right default)
```

---

## Component Tree

```
src/app/
  layout.tsx              ← Root layout (fonts, RTL, dark theme)
  page.tsx                ← Landing / redirect to dashboard
  login/
    page.tsx              ← LoginPage
  dashboard/
    layout.tsx            ← DashboardLayout (sidebar/header + auth guard)
    page.tsx              ← DashboardPage (main generation form)
    gallery/
      page.tsx            ← GalleryPage
    gallery/[id]/
      page.tsx            ← VideoDetailPage

src/components/
  ui/                     ← Primitives
    Button.tsx
    Input.tsx
    Badge.tsx
    Card.tsx
    Spinner.tsx
  auth/
    LoginForm.tsx
    OtpForm.tsx
  dashboard/
    DashboardHeader.tsx
    CreditsBadge.tsx
    GenerationForm.tsx
    AudioUpload.tsx
    ImageUpload.tsx
    CharacterPicker.tsx
    VibePicker.tsx
    LanguagePicker.tsx
    PipelineTracker.tsx
    StageIndicator.tsx
  gallery/
    GalleryGrid.tsx
    VideoCard.tsx
    VideoPlayer.tsx
```

---

## 1. Root Layout — `src/app/layout.tsx`

Already specified in Doc 1. Key attributes:
- `<html lang="he" dir="rtl">`
- Heebo (body) + Rubik (display) fonts from Google Fonts
- Dark background: `bg-[#0c0c0e] text-white`
- Metadata: "Winner Video Studio | קבוצת מבנים"

---

## 2. LoginPage — `src/app/login/page.tsx`

**Purpose:** User enters email or phone to receive a magic link or OTP.

**State:**
```typescript
const [method, setMethod] = useState<'email' | 'whatsapp'>('whatsapp');
const [value, setValue] = useState('');       // email or phone
const [sent, setSent] = useState(false);      // show "check your..." message
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// OTP sub-state (when method === 'whatsapp')
const [otpSent, setOtpSent] = useState(false);
const [otpCode, setOtpCode] = useState('');
```

**Behavior:**
1. Default tab: WhatsApp (primary auth for Yossi)
2. User enters Israeli phone number
3. Click "שלח קוד" → `POST /api/auth/whatsapp-otp`
4. Show OTP input (6 digits)
5. Submit OTP → `POST /api/auth/verify-otp`
6. On success → redirect to `/dashboard`

Alt flow: Email tab → enter email → `POST /api/auth/magic-link` → "Check your email" message

**Layout:**
```
┌──────────────────────────────────────┐
│         [Mivnim Logo - white]        │
│                                      │
│    ╔══════════════════════════════╗   │
│    ║   Winner Video Studio       ║   │
│    ║                             ║   │
│    ║  [WhatsApp] [Email] (tabs)  ║   │
│    ║                             ║   │
│    ║  ┌───────────────────────┐  ║   │
│    ║  │ 050-123-4567         │  ║   │
│    ║  └───────────────────────┘  ║   │
│    ║                             ║   │
│    ║  ╔═══════════════════════╗  ║   │
│    ║  ║   שלח קוד כניסה      ║  ║   │
│    ║  ╚═══════════════════════╝  ║   │
│    ║                             ║   │
│    ║  After OTP sent:            ║   │
│    ║  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ║   │
│    ║  │ │ │ │ │ │ │ │ │ │ │ │  ║   │
│    ║  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘  ║   │
│    ╚══════════════════════════════╝   │
│                                      │
│  Powered by SuperSeller Agency       │
└──────────────────────────────────────┘
```

**Styling:** Centered card on dark background. Card: `bg-[#16161a] rounded-[3rem] p-10 border border-white/5`. Full-screen centered with `min-h-screen flex items-center justify-center`.

---

## 3. DashboardLayout — `src/app/dashboard/layout.tsx`

**Purpose:** Shared wrapper for all dashboard pages. Header + content area.

**Props:** `{ children: React.ReactNode }`

**Behavior:**
- Fetch user via `GET /api/auth/me` on mount
- If 401 → redirect to `/login`
- Pass user context to children via React Context

**Layout:**
```
┌──────────────────────────────────────────┐
│  DashboardHeader (fixed top)             │
│  [Logo]  [Nav: יצירה | גלריה]  [Credits] │
├──────────────────────────────────────────┤
│                                          │
│  {children}                              │
│                                          │
│  (max-w-5xl mx-auto p-6)                │
└──────────────────────────────────────────┘
```

---

## 4. DashboardHeader — `src/components/dashboard/DashboardHeader.tsx`

**Purpose:** Top navigation bar with logo, nav links, credits badge.

**Props:**
```typescript
interface DashboardHeaderProps {
  user: { name: string; tier: string };
  credits: { available: number; total: number };
  activePage: 'generate' | 'gallery';
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [M Logo]  קבוצת מבנים    |  יצירה  |  גלריה    [⚡ 4 credits]  │
└─────────────────────────────────────────────────────┘
```

**Styling:**
- `bg-[#0c0c0e]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50`
- Logo: small white Mivnim icon (from constants)
- Nav links: `text-gray-500 hover:text-white` / active: `text-[#B6E3D4]`
- Credits badge: `bg-[#3A388E]/20 border border-[#B6E3D4]/20 rounded-full px-4 py-1.5`

---

## 5. CreditsBadge — `src/components/dashboard/CreditsBadge.tsx`

**Purpose:** Compact credit display in header.

**Props:**
```typescript
interface CreditsBadgeProps {
  available: number;
  total: number;
  tier: string;
}
```

**Layout:** `⚡ 4 / 10` with turquoise icon, white numbers.

**Behavior:**
- If `available === 0`: badge turns `bg-rose-500/20 border-rose-500/30` with warning color
- If `available <= 2`: subtle pulse animation

---

## 6. GenerationForm — `src/components/dashboard/GenerationForm.tsx`

**Purpose:** The main video creation form. The most complex component.

**State:**
```typescript
const [audioFile, setAudioFile] = useState<File | null>(null);
const [audioUrl, setAudioUrl] = useState<string | null>(null);     // After upload to R2
const [imageFile, setImageFile] = useState<File | null>(null);
const [imageUrl, setImageUrl] = useState<string | null>(null);     // After upload to R2
const [script, setScript] = useState('');
const [character, setCharacter] = useState('ceo');
const [vibe, setVibe] = useState('winner');
const [language, setLanguage] = useState('he');
const [contentType, setContentType] = useState('general');
const [isUploading, setIsUploading] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState<string | null>(null);

// Active generation tracking
const [activeGeneration, setActiveGeneration] = useState<Generation | null>(null);
```

**Behavior:**
1. User selects audio file → upload to R2 via `POST /api/upload` → get URL
2. User optionally selects headshot image → upload to R2
3. User fills in script (optional if audio provided), picks character/vibe/language
4. Click "צור סרטון" → `POST /api/generate` with all data
5. On success → show PipelineTracker with the returned generation
6. PipelineTracker polls until COMPLETE or FAILED

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  ⚡ יוצרים סרטון חדש                               │
│     יצירת תוכן ברמה של וינרים                      │
│                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  🎤 אודיו            │  │  📷 תמונה (אופציונלי) │  │
│  │  [Drop zone]         │  │  [Drop zone]         │  │
│  │  audio.mp3 ✓ 0:18   │  │  headshot.jpg ✓      │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  📝 טקסט / תסריט (אופציונלי אם יש אודיו)     │  │
│  │  textarea...                                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌─────────── מי מדבר? ──────────────────────┐     │
│  │ [המנכ"ל] [סוכנת] [אדריכל] [לקוח]          │     │
│  │ [Trump]  [Asher] [Nehorai]                 │     │
│  └────────────────────────────────────────────┘     │
│                                                    │
│  ┌── אווירה ──┐  ┌── שפה ──┐  ┌── סוג ───────┐   │
│  │ [Winner ✓]  │  │ [🇮🇱 ✓]  │  │ [פודקאסט  ] │   │
│  │ [Luxury  ]  │  │ [🇺🇸  ]  │  │ [מסיבה   ] │   │
│  │ [Urgent  ]  │  │ [🇸🇦  ]  │  │ [נכס      ] │   │
│  │ [Family  ]  │  │ [Mix  ]  │  │ [הזמנה    ] │   │
│  └─────────────┘  └─────────┘  └──────────────┘   │
│                                                    │
│  ╔══════════════════════════════════════════════╗   │
│  ║  ▶  יאללה, תייצר לי סרטון מנצח!    (1 credit) ║   │
│  ╚══════════════════════════════════════════════╝   │
└────────────────────────────────────────────────────┘
```

**CTA Button:**
- Default: `bg-[#B6E3D4] text-[#3A388E] font-black py-6 rounded-[2rem]`
- Hover: `bg-white`
- Disabled (no audio+script): `opacity-50`
- Loading: spinner + "המנועים מתחממים..."
- Shadow: `shadow-[0_30px_60px_-15px_rgba(182,227,212,0.4)]`

---

## 7. AudioUpload — `src/components/dashboard/AudioUpload.tsx`

**Purpose:** Drag-and-drop audio file upload with validation feedback.

**Props:**
```typescript
interface AudioUploadProps {
  onFileSelected: (file: File) => void;
  onUploaded: (url: string) => void;
  isUploading: boolean;
  uploadedUrl: string | null;
}
```

**States:** `idle` → `selected` (file chosen, not yet uploaded) → `uploading` → `uploaded` → `error`

**Behavior:**
- Accept: `.mp3, .wav, .aac, .ogg, .m4a`
- Max: 10MB
- On drop/select: validate locally, show filename + estimated duration
- Upload triggered by parent (or auto-upload on select)
- Show progress indicator during upload

**Layout:**
```
idle:
  ┌──────────────────────────────┐
  │  🎤                          │
  │  גרור אודיו לכאן             │
  │  או לחץ לבחור קובץ           │
  │  mp3, wav, aac • עד 10MB     │
  └──────────────────────────────┘

uploaded:
  ┌──────────────────────────────┐
  │  ✓ recording.mp3   0:18     │
  │  [🔊 Play] [✕ Remove]       │
  └──────────────────────────────┘
```

**Styling:** `bg-black/40 border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[#B6E3D4]/30 transition-all`. On drag over: `border-[#B6E3D4] bg-[#B6E3D4]/5`.

---

## 8. ImageUpload — `src/components/dashboard/ImageUpload.tsx`

**Purpose:** Drag-and-drop image upload for headshot/reference image. Nearly identical to AudioUpload.

**Props:**
```typescript
interface ImageUploadProps {
  onFileSelected: (file: File) => void;
  onUploaded: (url: string) => void;
  isUploading: boolean;
  uploadedUrl: string | null;
}
```

**Accept:** `.jpg, .jpeg, .png, .webp`

**Layout:** Same as AudioUpload but shows image thumbnail when uploaded:
```
uploaded:
  ┌──────────────────────────────┐
  │  [Thumbnail 80x80]          │
  │  headshot.jpg  1.2MB        │
  │  [✕ Remove]                 │
  └──────────────────────────────┘
```

---

## 9. CharacterPicker — `src/components/dashboard/CharacterPicker.tsx`

**Purpose:** Character selection grid.

**Props:**
```typescript
interface CharacterPickerProps {
  selected: string;
  onChange: (id: string) => void;
}
```

**Data:** From `CHARACTERS` constant (Doc 1):
```
ceo      | המנכ"ל הכריזמטי     | סמכותי, בטוח בעצמו
agent    | סוכנת השטח          | אנרגטית, ידידותית
architect | האדריכל             | יצירתי, מקצועי
client   | הלקוח המרוצה        | אמיתי, מרגש
trump    | Trump               | Tremendous, proper English
asher    | Asher ben Oz        | Broken English, funny
nehorai  | Nehorai             | "Daddy me food"
```

**Layout:** 2-column grid on mobile, 4-column on desktop. Each button:
- Unselected: `bg-white/5 border-white/10 text-gray-500`
- Selected: `bg-[#3A388E] border-[#B6E3D4] text-white shadow-lg ring-2 ring-[#B6E3D4]/30`
- Content: name (bold) + description (small muted)

---

## 10. VibePicker — `src/components/dashboard/VibePicker.tsx`

**Purpose:** Vibe/mood selection.

**Props:**
```typescript
interface VibePickerProps {
  selected: string;
  onChange: (id: string) => void;
}
```

**Layout:** Vertical stack of 4 options. Each shows name + music genre hint:
```
[✓ אנרגיית וינר — Techno House    ]
[  יוקרה שקטה  — Deep Melodic     ]
[  הזדמנות אחרונה — Fast Beat     ]
[  בית ומשפחה   — Acoustic Guitar  ]
```

**Styling:** Same select pattern as CharacterPicker but single column.

---

## 11. LanguagePicker — `src/components/dashboard/LanguagePicker.tsx`

**Purpose:** Language selection (flags).

**Props:**
```typescript
interface LanguagePickerProps {
  selected: string;
  onChange: (id: string) => void;
}
```

**Layout:** Horizontal button row:
```
[🇮🇱] [🇺🇸] [🇸🇦] [Mix]
```

**Styling:** Each flag button is square, `p-3 rounded-xl`. Selected: `bg-[#3A388E] border-[#B6E3D4]`.

---

## 12. PipelineTracker — `src/components/dashboard/PipelineTracker.tsx`

**Purpose:** Real-time generation progress. Shows after clicking "Generate". The most dynamic component.

**Props:**
```typescript
interface PipelineTrackerProps {
  generationId: string;
  onComplete: (generation: Generation) => void;
  onFailed: (generation: Generation) => void;
}
```

**State:**
```typescript
const [generation, setGeneration] = useState<Generation | null>(null);
const [events, setEvents] = useState<GenerationEvent[]>([]);
```

**Behavior:**
- Polls `GET /api/generations/{id}` every 3 seconds
- Updates stage indicator in real-time
- On COMPLETE: show video player + WhatsApp sent confirmation
- On FAILED: show error message + "credit refunded" notice
- Stop polling on terminal states

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  🎬 הסרטון שלך בהכנה...                            │
│                                                    │
│  ● ─── ● ─── ◉ ─── ○ ─── ○ ─── ○                  │
│  תסריט  אודיו  וידאו  מוזיקה  עיבוד  משלוח          │
│         ✓      ✓      ⏳                            │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  שלב נוכחי: יצירת וידאו                       │  │
│  │  מודל: Kling AI Avatar Pro                    │  │
│  │  זמן משוער: 3-5 דקות                          │  │
│  │  ☑️ נודיע לך בוואטסאפ כשמוכן                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  On COMPLETE:                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  [VIDEO PLAYER]                               │  │
│  │  ✅ נשלח בוואטסאפ                              │  │
│  │  [הורדה]  [צפה בגלריה]  [צור עוד]             │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 13. StageIndicator — `src/components/dashboard/StageIndicator.tsx`

**Purpose:** Single stage dot in the pipeline progress bar.

**Props:**
```typescript
interface StageIndicatorProps {
  label: string;          // Hebrew stage name
  labelEn: string;        // English (for screen readers)
  icon: React.ReactNode;  // Lucide icon
  status: 'pending' | 'active' | 'complete' | 'failed' | 'skipped';
}
```

**Visual States:**
- `pending`: `bg-white/10 text-gray-600` — hollow circle
- `active`: `bg-[#3A388E] text-[#B6E3D4] animate-pulse` — glowing circle
- `complete`: `bg-emerald-500/20 text-emerald-400` — checkmark
- `failed`: `bg-rose-500/20 text-rose-400` — X mark
- `skipped`: `bg-white/5 text-gray-700 line-through` — dimmed

**Connector line** between dots:
- Pending: `bg-white/10`
- Complete: `bg-emerald-500/40`
- Active (in progress): gradient from emerald to white/10

---

## 14. GalleryPage — `src/app/dashboard/gallery/page.tsx`

**Purpose:** Grid of completed videos.

**State:**
```typescript
const [generations, setGenerations] = useState<Generation[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState<'all' | 'complete' | 'failed'>('all');
```

**Behavior:**
- Fetch `GET /api/generations?status=complete&limit=50` on mount
- Display as responsive grid
- Click on card → navigate to `/dashboard/gallery/{id}`

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  🎬 הגלריה שלך                       [הכל ▼]     │
│                                                    │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ [Thumb]   │ │ [Thumb]   │ │ [Thumb]   │       │
│  │ 0:22 720p │ │ 0:18 720p │ │ 0:25 720p │       │
│  │ Bar Mitz  │ │ CEO Annc  │ │ Party Inv │       │
│  │ 2 hrs ago │ │ Yesterday │ │ 3 days    │       │
│  └───────────┘ └───────────┘ └───────────┘       │
│                                                    │
│  ┌───────────┐ ┌───────────┐                      │
│  │ [Thumb]   │ │ [Active]  │                      │
│  │ 0:20 720p │ │ ⏳ בהכנה   │                      │
│  │ Property  │ │ Podcast   │                      │
│  └───────────┘ └───────────┘                      │
└────────────────────────────────────────────────────┘
```

**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

---

## 15. VideoCard — `src/components/gallery/VideoCard.tsx`

**Purpose:** Single video card in gallery grid.

**Props:**
```typescript
interface VideoCardProps {
  generation: {
    id: string;
    stage: string;
    character: string;
    vibe: string;
    processed_script: string;     // preview text
    final_video_url?: string;
    video_model_used?: string;
    duration_seconds?: number;
    whatsapp_delivered: boolean;
    created_at: string;
    completed_at?: string;
  };
  onClick: () => void;
}
```

**Layout:**
```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    Video thumbnail    │  │
│  │    or stage indicator │  │
│  │                       │  │
│  │  ▶ (play overlay)     │  │
│  │         0:22  720p    │  │
│  └───────────────────────┘  │
│                             │
│  Bar Mitzvah Podcast        │
│  kling/ai-avatar-pro        │
│  2 שעות · ✅ WhatsApp       │
└─────────────────────────────┘
```

**Styling:**
- Card: `bg-[#16161a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#B6E3D4]/20 transition-all cursor-pointer group`
- Thumbnail area: `aspect-video bg-black/60 relative`
- Play button overlay: appears on hover, `opacity-0 group-hover:opacity-100`
- Duration badge: `absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded`
- Active generation: pulsing border, spinner instead of thumbnail

---

## 16. VideoDetailPage — `src/app/dashboard/gallery/[id]/page.tsx`

**Purpose:** Full detail view of a single generation.

**State:**
```typescript
const [generation, setGeneration] = useState<Generation | null>(null);
const [events, setEvents] = useState<GenerationEvent[]>([]);
```

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  ← חזרה לגלריה                                     │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │              VIDEO PLAYER                    │  │
│  │              (native <video>)                │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [⬇ הורדה]  [📋 העתק קישור]  [🔄 גרסה חדשה]       │
│                                                    │
│  ┌──────── פרטים ──────────────────────────────┐   │
│  │  מודל:     kling/ai-avatar-pro              │   │
│  │  דמות:     Asher ben Oz                     │   │
│  │  אווירה:   אנרגיית וינר                      │   │
│  │  אורך:     0:22                             │   │
│  │  רזולוציה:  720p                             │   │
│  │  WhatsApp:  ✅ נשלח                          │   │
│  │  נוצר:     18/02/2026 23:30                  │   │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────── תסריט ──────────────────────────────┐   │
│  │  "My friends! Tonight we make party..."      │   │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────── Video Prompt ───────────────────────┐   │
│  │  "Three men at podcast table..."             │   │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────── Timeline ───────────────────────────┐   │
│  │  23:30:00  PENDING → SCRIPT_PROCESSING      │   │
│  │  23:30:08  SCRIPT_PROCESSING → AUDIO_ISOL   │   │
│  │  23:30:40  AUDIO_ISOLATING → VIDEO_GEN      │   │
│  │  23:35:20  VIDEO_GENERATING → DELIVERING    │   │
│  │  23:35:25  DELIVERING → COMPLETE ✅         │   │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Video Player:** Native HTML5 `<video>` element:
```tsx
<video
  src={generation.final_video_url}
  controls
  autoPlay={false}
  playsInline
  className="w-full rounded-2xl bg-black"
/>
```

---

## 17. LoginForm — `src/components/auth/LoginForm.tsx`

**Purpose:** Phone number input with country code prefix.

**Props:**
```typescript
interface LoginFormProps {
  onSubmit: (phone: string) => void;
  loading: boolean;
  error: string | null;
}
```

**Layout:**
```
┌──────────────────────────────┐
│  🇮🇱 +972  │ 050-123-4567    │
└──────────────────────────────┘
```

**Input:** `type="tel"`, auto-format as user types, strip non-digits on submit.

---

## 18. OtpForm — `src/components/auth/OtpForm.tsx`

**Purpose:** 6-digit OTP input with auto-advance.

**Props:**
```typescript
interface OtpFormProps {
  onSubmit: (code: string) => void;
  onResend: () => void;
  loading: boolean;
  error: string | null;
}
```

**Layout:** 6 individual digit inputs, auto-focus next on type, auto-submit when all filled.

**Styling:** Each input: `w-12 h-14 text-center text-2xl font-black bg-black/40 border border-white/10 rounded-xl focus:border-[#B6E3D4]`

---

## 19. UI Primitives

### Button — `src/components/ui/Button.tsx`

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
}
```

Variants:
- `primary`: `bg-[#B6E3D4] text-[#3A388E] hover:bg-white font-black`
- `secondary`: `bg-[#3A388E] text-white hover:bg-[#3A388E]/80`
- `ghost`: `bg-transparent text-gray-400 hover:text-white hover:bg-white/5`
- `danger`: `bg-rose-500/10 text-rose-400 hover:bg-rose-500/20`

Sizes:
- `sm`: `px-4 py-2 text-sm rounded-xl`
- `md`: `px-6 py-3 text-base rounded-2xl`
- `lg`: `px-8 py-5 text-lg rounded-[1.5rem]`
- `xl`: `px-10 py-6 text-xl rounded-[2rem]` (CTA button)

### Card — `src/components/ui/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}
```

- `default`: `bg-[#16161a] rounded-[2rem] p-8`
- `elevated`: `bg-[#1a1a1e] rounded-[3rem] p-10 shadow-3xl`
- `bordered`: `bg-[#16161a] rounded-[2rem] p-8 border border-white/10`

### Badge — `src/components/ui/Badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
}
```

- `default`: `bg-white/10 text-gray-300`
- `success`: `bg-emerald-500/10 text-emerald-400`
- `warning`: `bg-amber-500/10 text-amber-400`
- `error`: `bg-rose-500/10 text-rose-400`
- `info`: `bg-[#3A388E]/20 text-[#B6E3D4]`

All: `inline-flex items-center px-3 py-1 rounded-full text-xs font-bold`

### Spinner — `src/components/ui/Spinner.tsx`

Lucide `Loader2` with `animate-spin`. Sizes: 16, 20, 24, 32.

---

## 20. Data Flow Summary

```
LoginPage
  → POST /api/auth/whatsapp-otp → OtpForm → POST /api/auth/verify-otp
  → Set cookie → redirect /dashboard

DashboardLayout
  → GET /api/auth/me → UserContext

DashboardPage (GenerationForm)
  → POST /api/upload (audio) → R2 URL
  → POST /api/upload (image) → R2 URL
  → POST /api/generate → generation { id, stage }
  → PipelineTracker
    → polls GET /api/generations/{id} every 3s
    → updates StageIndicators
    → on COMPLETE: show video + actions

GalleryPage
  → GET /api/generations?status=all → GalleryGrid → VideoCard[]

VideoDetailPage
  → GET /api/generations/{id} → full detail + events timeline
```

---

## 21. Responsive Breakpoints

| Breakpoint | Layout Change |
|------------|--------------|
| `< 640px` (mobile) | Single column, stacked form sections, smaller headings |
| `640px+` (sm) | 2-col grid for character picker |
| `768px+` (md) | Side-by-side audio + image upload, 3-col settings row |
| `1024px+` (lg) | Full gallery grid (3 columns), wider form |

**Mobile-first priority:** Login flow arrives via WhatsApp link → user is on phone. Everything must be thumb-friendly with generous tap targets (min 44px).

---

## 22. Component Count Summary

| Category | Components | Lines (est.) |
|----------|-----------|-------------|
| Pages | 5 (login, dashboard, gallery, gallery/[id], layout×2) | ~400 |
| Dashboard | 8 (header, credits, form, audio/image upload, char/vibe/lang picker, pipeline tracker, stage indicator) | ~600 |
| Gallery | 3 (grid, card, player) | ~200 |
| Auth | 2 (login form, OTP form) | ~150 |
| UI Primitives | 4 (button, card, badge, spinner) | ~100 |
| **Total** | **22** | **~1,450 lines** |
