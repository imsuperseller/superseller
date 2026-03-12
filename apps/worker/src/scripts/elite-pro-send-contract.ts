/**
 * Send Elite Pro Remodeling contract for signature.
 *
 * Run: cd apps/worker && SAAR_EMAIL=saar@example.com npx tsx src/scripts/elite-pro-send-contract.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

import { sendServiceContract } from "../services/esignatures";

async function main() {
  // Email is required by eSignatures API but signing happens via URL shared in WhatsApp.
  // Use Saar's real email if available, otherwise use a placeholder.
  const saarEmail = process.env.SAAR_EMAIL || "saar@eliteproremodeling.com";

  console.log(`Creating contract for Saar Bitton (${saarEmail})...\n`);
  console.log(`NOTE: The signing URL will be shared via WhatsApp — email delivery is secondary.\n`);

  const result = await sendServiceContract({
    clientName: "Saar Bitton",
    clientCompany: "Elite Pro Remodeling & Construction",
    clientEmail: saarEmail,
    serviceName: "Autonomous Instagram Growth",

    scope: [
      "AI-powered social media content creation and management for Elite Pro Remodeling & Construction.",
      "",
      "Includes:",
      "- Daily content production: 1 Reel + 1 Story + 1 Carousel per day (30/30/30 content plan)",
      "- Content types: Before/after reveals, project walkthroughs, team intros, tips, testimonials, behind-the-scenes",
      "- Competitor ad research and analysis via Meta Ads Library",
      "- WhatsApp-based approval workflow before publishing",
      "- Performance tracking and optimization (posting times, content styles, engagement analysis)",
      "- AI-powered content generation suite for professional visuals and editing",
      "- Ongoing content strategy refinement based on analytics",
      "",
      "───────────────────────────────",
      "",
      "יצירה וניהול תוכן לרשתות חברתיות מבוסס בינה מלאכותית עבור Elite Pro Remodeling & Construction.",
      "",
      ":כולל",
      "- ייצור תוכן יומי: ריל אחד + סטורי אחד + קרוסלה אחת ביום (תוכנית תוכן 30/30/30)",
      "- סוגי תוכן: לפני/אחרי, סיורי פרויקטים, הכרת הצוות, טיפים, המלצות, מאחורי הקלעים",
      "- מחקר מתחרים וניתוח פרסומות דרך ספריית Meta Ads",
      "- תהליך אישור תוכן דרך וואטסאפ לפני פרסום",
      "- מעקב ביצועים ואופטימיזציה (שעות פרסום, סגנונות תוכן, ניתוח מעורבות)",
      "- חבילת יצירת תוכן מבוססת AI לוויזואלים ועריכה מקצועית",
      "- שיפור מתמשך של אסטרטגיית התוכן על בסיס אנליטיקס",
    ].join("\n"),

    deliverables: [
      "1. Competitor ad research report (Days 1-3)",
      "2. Content database setup with brand assets and style preferences",
      "3. WhatsApp group for real-time communication and content approvals",
      "4. Daily Instagram content: 1 Reel + 1 Story + 1 Carousel (30/30/30 plan, starting when prerequisites are met — see Timeline)",
      "5. Weekly performance reports with optimization recommendations",
      "6. Monthly strategy review and content calendar adjustment",
      "",
      "───────────────────────────────",
      "",
      "1. דוח מחקר פרסומות מתחרים (ימים 1-3)",
      "2. הקמת מאגר תוכן עם נכסי מותג והעדפות סגנון",
      "3. קבוצת וואטסאפ לתקשורת ואישורי תוכן בזמן אמת",
      "4. תוכן יומי לאינסטגרם: ריל אחד + סטורי אחד + קרוסלה אחת (תוכנית 30/30/30, מתחיל כשהתנאים המקדימים מתקיימים — ראו לוח זמנים)",
      "5. דוחות ביצועים שבועיים עם המלצות לאופטימיזציה",
      "6. סקירת אסטרטגיה חודשית והתאמת לוח תוכן",
    ].join("\n"),

    timeline: [
      "Phase 1 (Days 1-7): Onboarding — asset collection, competitor research, content database setup",
      "",
      "Phase 2 (Starting Day 7): Daily content production and publishing begins.",
      "  Prerequisites before Phase 2 can start:",
      "  - Contract signed by both parties",
      "  - First monthly payment cleared",
      "  - Instagram credentials and admin access provided",
      "  - Sufficient brand assets provided (logo, project photos, team photos)",
      "  - Both parties agree on content strategy and expectations",
      "",
      "Phase 3 (Ongoing): Performance optimization and learning",
      "",
      "Visible results expected within 2-4 weeks. Meaningful growth by 3 months.",
      "",
      "───────────────────────────────",
      "",
      "שלב 1 (ימים 1-7): קליטה — איסוף נכסים, מחקר מתחרים, הקמת מאגר תוכן",
      "",
      "שלב 2 (מיום 7): ייצור ופרסום תוכן יומי מתחיל.",
      "  :תנאים מקדימים לפני תחילת שלב 2",
      "  - חוזה חתום על ידי שני הצדדים",
      "  - תשלום חודשי ראשון התקבל",
      "  - פרטי גישה וניהול לאינסטגרם סופקו",
      "  - נכסי מותג מספיקים סופקו (לוגו, תמונות פרויקטים, תמונות צוות)",
      "  - שני הצדדים מסכימים על אסטרטגיית תוכן וציפיות",
      "",
      "שלב 3 (שוטף): אופטימיזציה ולמידת ביצועים",
      "",
      "תוצאות נראות לעין תוך 2-4 שבועות. צמיחה משמעותית תוך 3 חודשים.",
    ].join("\n"),

    setupFee: "$0 (waived) / $0 (ללא עלות הקמה)",
    monthlyFee: "$2,000/month / $2,000 לחודש",

    paymentTerms: [
      "- First payment due upon signing this agreement",
      "- Subsequent payments due on the same date each month",
      "- Payments accepted via PayPal",
      "- 7-day cancellation notice required",
      "",
      "───────────────────────────────",
      "",
      "- תשלום ראשון נדרש עם חתימת הסכם זה",
      "- תשלומים עוקבים באותו תאריך בכל חודש",
      "- תשלומים מתקבלים דרך PayPal",
      "- נדרשת הודעת ביטול של 7 ימים מראש",
    ].join("\n"),
  });

  console.log("Contract sent successfully!\n");
  console.log("Contract ID:", result.contractId);
  console.log("Status:", result.status);
  console.log("\nSigners:");
  for (const signer of result.signers) {
    console.log(`  ${signer.name} (${signer.email})`);
    console.log(`  Status: ${signer.status}`);
    if (signer.signUrl) console.log(`  Sign URL: ${signer.signUrl}`);
  }
}

main().catch((err) => {
  console.error("Failed to send contract:", err.message);
  process.exit(1);
});
