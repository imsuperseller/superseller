import type { Character, Vibe } from "@/types";

// ── Characters ──────────────────────────────────────────────────
export const CHARACTERS: Character[] = [
  {
    id: "ceo",
    name: 'המנכ"ל',
    nameEn: "The CEO",
    icon: "\uD83D\uDC54",
    voice: "authoritative",
    description: "ביטחון עצמי, סמכותי, נוכחות של חדר ישיבות",
  },
  {
    id: "agent",
    name: "סוכנת השטח",
    nameEn: "Field Agent",
    icon: "\uD83C\uDFE0",
    voice: "energetic",
    description: "אנרגיה גבוהה, בשטח, חכמת רחוב",
  },
  {
    id: "architect",
    name: "האדריכל",
    nameEn: "The Architect",
    icon: "\uD83D\uDCD0",
    voice: "visionary",
    description: "חזון, טכני, מביט קדימה",
  },
  {
    id: "client",
    name: "הלקוח המרוצה",
    nameEn: "Happy Client",
    icon: "\u2B50",
    voice: "testimonial",
    description: "מרוצה, אסיר תודה, מספר את הסיפור שלו",
  },
  {
    id: "trump",
    name: "Trump",
    nameEn: "Trump",
    icon: "\uD83C\uDDFA\uD83C\uDDF8",
    voice: "proper-english",
    description: "אנגלית מושלמת, גרנדיוזי, אנרגיה של עסקאות",
  },
  {
    id: "asher",
    name: "אשר",
    nameEn: "Asher",
    icon: "\uD83C\uDF99\uFE0F",
    voice: "broken-english",
    description: "אנגלית שבורה, סלנג ישראלי, מנחה פודקאסט אותנטי",
  },
  {
    id: "nehorai",
    name: "נהוראי",
    nameEn: "Nehorai",
    icon: "\uD83D\uDC66",
    voice: "broken-english",
    description: "אנגלית שבורה, אנרגיה צעירה, daddy me food",
  },
];

// ── Vibes ────────────────────────────────────────────────────────
export const VIBES: Vibe[] = [
  {
    id: "winner",
    name: "Winner",
    nameEn: "Winner",
    icon: "\uD83C\uDFC6",
    description: "אנרגיה גבוהה, מוגול ישראלי, טכנו-האוס פוגש חדר ישיבות",
    bpmRange: "120-135",
  },
  {
    id: "luxury",
    name: "Luxury",
    nameEn: "Luxury",
    icon: "\uD83D\uDC8E",
    description: "אלגנטיות שקטה, תחושת פרימיום, פסנתר ומיתרים",
    bpmRange: "80-95",
  },
  {
    id: "urgent",
    name: "Urgent",
    nameEn: "Urgent",
    icon: "\u26A1",
    description: "FOMO של הזדמנות אחרונה, אנרגיה של ספירה לאחור",
    bpmRange: "130-145",
  },
  {
    id: "family",
    name: "Family",
    nameEn: "Family",
    icon: "\uD83C\uDFE1",
    description: "חם ואינטימי, גיטרה אקוסטית, מהלב",
    bpmRange: "90-110",
  },
];

// ── Languages ────────────────────────────────────────────────────
export const LANGUAGES = [
  { id: "he", name: "עברית", nameEn: "Hebrew", flag: "\uD83C\uDDEE\uD83C\uDDF1" },
  { id: "en", name: "English", nameEn: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { id: "ar", name: "ערבית", nameEn: "Arabic", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
  { id: "mixed", name: "Mix", nameEn: "Mixed", flag: "\uD83C\uDF0D" },
] as const;

// ── Credit Costs ─────────────────────────────────────────────────
export const CREDIT_COST_PER_GENERATION = 1;

// ── Rate Limits ──────────────────────────────────────────────────
export const RATE_LIMIT_PER_HOUR = 5;
export const MAX_CONCURRENT = 2;

// ── Pipeline Config ──────────────────────────────────────────────
export const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_RETRIES: Record<string, number> = {
  AUDIO_ISOLATING: 1,
  VIDEO_GENERATING: 3,
  DELIVERING: 3,
};
