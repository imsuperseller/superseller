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
  const saarEmail = process.env.SAAR_EMAIL;
  if (!saarEmail) {
    console.error(
      "Set SAAR_EMAIL env var: SAAR_EMAIL=saar@email.com npx tsx src/scripts/elite-pro-send-contract.ts"
    );
    process.exit(1);
  }

  console.log(`Sending contract to Saar Bitton at ${saarEmail}...\n`);

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
    ].join("\n"),

    deliverables: [
      "1. Competitor ad research report (Days 1-3)",
      "2. Content database setup with brand assets and style preferences",
      "3. WhatsApp group for real-time communication and content approvals",
      "4. Daily Instagram content: 1 Reel + 1 Story + 1 Carousel (30/30/30 plan, starting when prerequisites are met — see Timeline)",
      "5. Weekly performance reports with optimization recommendations",
      "6. Monthly strategy review and content calendar adjustment",
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
    ].join("\n"),

    setupFee: "$0 (waived)",
    monthlyFee: "$2,000/month",

    paymentTerms: [
      "- First payment due upon signing this agreement",
      "- Subsequent payments due on the same date each month",
      "- Payments accepted via PayPal",
      "- 7-day cancellation notice required",
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
