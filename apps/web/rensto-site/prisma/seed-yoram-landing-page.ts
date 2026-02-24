/**
 * Seed Yoram Friedman's landing page.
 * Run: npx tsx prisma/seed-yoram-landing-page.ts
 *
 * Content source: yoram-leads/ strategy docs (Blueprint Q&A, Social Media Content Strategy post #10,
 * Israeli Insurance Strategy landing page spec). DO NOT invent content — extract from docs.
 *
 * Prerequisites:
 * - Yoram must have a User record (create one if missing)
 * - DATABASE_URL must be set
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// ============================================================================
// Content extracted from yoram-leads/ strategy docs
// Source: Blueprint Q&A answers, Social Media Content Strategy post #10,
// Israeli Insurance Strategy "high-converting landing page" section
// ============================================================================

const SECTIONS = {
  // 5-step process — from Social Media Content Strategy, post #10 ("ככה עובדת הבדיקה")
  // Also aligns with Blueprint process: details → Har HaBituach → proposal → decision
  steps: [
    {
      title: "משאירים פרטים",
      description: "שם וטלפון. 10 שניות. זה הכל.",
    },
    {
      title: "אנחנו מתקשרים",
      description: "לוקחים ת.ז. ותאריך לידה. בלי מסמכים.",
    },
    {
      title: "בודקים את הר הביטוח",
      description: "מנתחים מה יש, מזהים כפלים וכיסויים מיותרים.",
    },
    {
      title: "מקבלים הצעה",
      description: "שחור על לבן. כמה משלמים, כמה אפשר לשלם.",
    },
    {
      title: "מחליטים",
      description:
        "רוצים לעבור? מטפלים בהכל. לא רוצים? לוחצים ידיים. בחינם.",
    },
  ],

  // Credentials — from Blueprint Q&A (questions 20, 16, 73)
  credentials: [
    { label: "שנות ניסיון", value: "40+" },
    { label: "פרסי סוכן מצטיין", value: "10" },
    { label: "חברות ביטוח", value: "כולן" },
    { label: "הוזלה עד", value: "50%" },
  ],

  // NO testimonials — Blueprint explicitly says "אין במה להשתמש כרגע"
  // Add REAL testimonials only when Yoram provides them
  testimonials: [],

  // Differentiators — from Blueprint Q&A (questions 16-18: competitive advantage)
  differentiators: [
    {
      title: "עובדים עם כל החברות",
      description:
        "לא מחויבים לחברה אחת. משווים בין כולן למחיר הכי טוב עבורכם.",
    },
    {
      title: "ניסיון של מעל 40 שנה",
      description: "10 פעמים זוכה פרס סוכן מצטיין. ליווי אישי לכל משפחה.",
    },
    {
      title: "בדיקה ממשלתית בחינם",
      description:
        "בודקים את הר הביטוח הממשלתי, מזהים כפלים, ומראים בדיוק איפה אפשר לחסוך.",
    },
  ],

  // Compliance — regulatory requirement: must include "סוכן ביטוח מורשה" + license number
  // Source: Israeli Insurance Strategy regulatory section (Section 55, CMISA)
  complianceFooter:
    'יורם פרידמן — סוכן ביטוח ופיננסים מורשה | רישיון מס׳ 604725. האמור אינו מהווה ייעוץ ביטוחי. הפרטים מוגנים ולא יועברו לצד שלישי. פרסומת.',
};

async function main() {
  // Find or create Yoram's user account
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "yoram@friedmanbit.co.il" },
        { businessName: { contains: "יורם", mode: "insensitive" } },
        { name: { contains: "Yoram", mode: "insensitive" } },
      ],
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: "yoram@friedmanbit.co.il",
        name: "Yoram Friedman",
        businessName: "יורם פרידמן סוכנות לביטוח",
        businessType: "insurance",
        status: "active",
        role: "USER",
      },
    });
    console.log("Created User:", user.id);
  } else {
    console.log("Found existing User:", user.id, user.email);
  }

  // Upsert the landing page
  const page = await prisma.landingPage.upsert({
    where: { slug: "yoram" },
    update: {
      businessName: "יורם פרידמן סוכנות לביטוח",
      businessNameEn: "Yoram Friedman Insurance",
      // Slogan from Blueprint: Yoram's own words
      tagline: "בדיקה חינם. הוזלה אמיתית. שקט למשפחה.",
      heroHeadline: "אל תשלמו יותר מדי על ביטוח המשכנתא שלכם!",
      // Subheadline: references the 85% duplicate stat (THE key conversion message from Israeli Insurance Strategy)
      heroSubheadline:
        "85% מהישראלים משלמים על ביטוח שהם כבר מכוסים בו. יורם פרידמן וצוות המומחים שלנו יבדקו את תיק הביטוח שלכם בעזרת מערכת הר הביטוח הממשלתית — לגמרי בחינם.",
      // CTA from Israeli Insurance Strategy: highest-converting Hebrew CTA
      ctaText: "בדקו את הביטוח שלי עכשיו",
      // Colors from YF logo
      primaryColor: "#1a2a5e",
      accentColor: "#2b6cb0",
      ctaColor: "#f97316",
      // Logo
      logoUrl: "/lp/yoram-logo.png",
      // Contact from FB page
      whatsappNumber: "972522422274",
      phone: "+972 4-866-9460",
      sections: SECTIONS,
    },
    create: {
      userId: user.id,
      slug: "yoram",
      active: true,
      businessName: "יורם פרידמן סוכנות לביטוח",
      businessNameEn: "Yoram Friedman Insurance",
      tagline: "בדיקה חינם. הוזלה אמיתית. שקט למשפחה.",
      logoUrl: "/lp/yoram-logo.png",
      primaryColor: "#1a2a5e",
      accentColor: "#2b6cb0",
      ctaColor: "#f97316",
      heroHeadline: "אל תשלמו יותר מדי על ביטוח המשכנתא שלכם!",
      heroSubheadline:
        "85% מהישראלים משלמים על ביטוח שהם כבר מכוסים בו. יורם פרידמן וצוות המומחים שלנו יבדקו את תיק הביטוח שלכם בעזרת מערכת הר הביטוח הממשלתית — לגמרי בחינם.",
      ctaText: "בדקו את הביטוח שלי עכשיו",
      whatsappNumber: "972522422274",
      phone: "+972 4-866-9460",
      email: "yoram@friedmanbit.co.il",
      direction: "rtl",
      locale: "he",
      fontFamily: "Heebo",
      metaTitle: "יורם פרידמן - סוכנות לביטוח | בדיקת תיק ביטוח בחינם",
      metaDescription:
        "יורם פרידמן סוכנות לביטוח — מומחים בביטוח משכנתא, חיים ובריאות. הירשמו עכשיו לבדיקת תיק הביטוח שלכם ללא עלות.",
      sections: SECTIONS,
    },
  });

  console.log("Landing page upserted:", page.slug, page.id);
  console.log(`\nLive at: https://rensto.com/lp/${page.slug}`);
  console.log(`Local:   http://localhost:3002/lp/${page.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
