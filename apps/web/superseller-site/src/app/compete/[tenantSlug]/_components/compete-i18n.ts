export type CompeteLocale = "he" | "en";

const strings = {
  // CompeteLogin
  checkEmail: { he: "בדקו את המייל", en: "Check Your Email" },
  sentLinkTo: { he: "שלחנו קישור כניסה ל-", en: "We sent a login link to " },
  linkValid: { he: "הקישור תקף ל-24 שעות. לא קיבלתם? בדקו ספאם.", en: "Link valid for 24 hours. Didn't receive it? Check spam." },
  competitorResearch: { he: "מחקר מתחרים", en: "Competitor Research" },
  secureAccess: { he: "גישה מאובטחת ל-", en: "Secure access to " },
  enterEmail: { he: "הזינו את המייל שלכם לקבלת קישור כניסה", en: "Enter your email to receive a login link" },
  sendLink: { he: "שלחו לי קישור", en: "Send Me a Link" },
  sending: { he: "שולח...", en: "Sending..." },
  errorSending: { he: "שגיאה בשליחת הקישור", en: "Error sending link" },
  networkError: { he: "שגיאת רשת. נסו שוב.", en: "Network error. Try again." },

  // CompeteFeed
  loading: { he: "טוען...", en: "Loading..." },
  noAdsYet: { he: "אין פרסומות עדיין", en: "No posts yet" },
  adsNotCollected: { he: "הפרסומות של {name} עדיין לא נאספו.", en: "{name}'s posts haven't been collected yet." },
  posts: { he: "פרסומות", en: "posts" },
  pending: { he: "ממתינות", en: "pending" },
  back: { he: "חזרה", en: "Back" },
  ratings: { he: "דירוגים", en: "ratings" },
  done: { he: "סיימתם!", en: "All Done!" },
  reviewed: { he: "סקרתם", en: "You reviewed" },
  postsWord: { he: "פרסומות", en: "posts" },
  liked: { he: "אהבתי", en: "Liked" },
  disliked: { he: "לא אהבתי", en: "Disliked" },
  viewRatings: { he: "צפו בדירוגים", en: "View Ratings" },
  history: { he: "היסטוריה", en: "History" },
  skip: { he: "דלג", en: "Skip" },

  // CompetitorAdCard
  likeActive: { he: "אהבתי!", en: "Liked!" },
  likeBtn: { he: "אהבתי", en: "Like" },
  dislikeActive: { he: "לא מתאים", en: "Not for me" },
  passBtn: { he: "פאס", en: "Pass" },
  days: { he: "ימים", en: "days" },
  noTextContent: { he: "אין תוכן טקסטואלי", en: "No text content" },
  videoUnavailable: { he: "סרטון לא זמין", en: "Video unavailable" },
  hide: { he: "הסתר", en: "Hide" },
  editNote: { he: "ערוך הערה", en: "Edit note" },
  addNote: { he: "הוסף הערה", en: "Add note" },
  notePlaceholder: { he: "מה עובד? מה לא? למה?", en: "What works? What doesn't? Why?" },
  saved: { he: "נשמר!", en: "Saved!" },
  save: { he: "שמור", en: "Save" },

  // Tier labels
  tierEvergreen: { he: "ירוקעד", en: "Evergreen" },
  tierWinner: { he: "מנצחת", en: "Winner" },
  tierStrong: { he: "חזקה", en: "Strong" },
  tierPromising: { he: "מבטיחה", en: "Promising" },
} as const;

type StringKey = keyof typeof strings;

export function t(key: StringKey, locale: CompeteLocale): string {
  return strings[key][locale] || strings[key].en;
}

export function tReplace(key: StringKey, locale: CompeteLocale, replacements: Record<string, string>): string {
  let result = t(key, locale);
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(`{${placeholder}}`, value);
  }
  return result;
}
