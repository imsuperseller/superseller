/**
 * Seed Elite Pro Remodeling's content automation config.
 * Run: npx tsx scripts/seed-content-automation.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = "elite-pro-remodeling";

  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) {
    console.error(`Tenant ${slug} not found`);
    process.exit(1);
  }

  const existing = (tenant.settings as Record<string, unknown>) || {};

  const contentAutomation = {
    enabled: true,
    platform: "instagram",
    approverPhone: "14695885133", // Shai's WhatsApp — will change to Saar+Mor later
    businessContext:
      "Elite Pro Remodeling — Premium kitchen, bathroom, and whole-home remodeling in the Dallas-Fort Worth area. Family-owned, licensed & insured. Known for quality craftsmanship, transparent pricing, and on-time project delivery.",
    contentPillars: [
      "before & after project reveals",
      "kitchen remodeling tips",
      "bathroom renovation ideas",
      "behind-the-scenes crew work",
      "customer testimonials & reviews",
      "remodeling trends & inspiration",
      "DFW home improvement advice",
    ],
    language: "en" as const,
    dailyContent: [
      {
        type: "reel",
        topicPool: [
          "Quick kitchen transformation timelapse",
          "3 signs your bathroom needs a remodel",
          "Watch this kitchen go from dated to stunning",
          "Behind the scenes of a full bathroom gut renovation",
          "The most common remodeling mistake homeowners make",
          "Why Elite Pro uses only premium materials",
          "Tour of a completed luxury kitchen remodel",
          "Day in the life of a remodeling crew",
          "Client reaction to their new kitchen reveal",
          "5-second shower transformation that will blow your mind",
        ],
        tone: "professional",
        aspectRatio: "9:16",
      },
      {
        type: "carousel",
        topicPool: [
          "5 kitchen trends dominating 2026",
          "Before vs After: Complete bathroom overhaul",
          "Step-by-step: How we plan your remodel",
          "Top 7 ROI-boosting home renovations",
          "Materials guide: quartz vs granite vs marble",
          "Color palettes that make small kitchens feel huge",
          "What $30K gets you in a kitchen remodel",
          "The remodeling timeline: what to expect week by week",
          "Tile patterns that transform any bathroom",
          "Our top 5 completed projects this month",
        ],
        tone: "inspiring",
        aspectRatio: "1:1",
      },
      {
        type: "story",
        topicPool: [
          "Morning crew check-in at today's job site",
          "Quick poll: white cabinets or wood tone?",
          "Sneak peek of tomorrow's big reveal",
          "This week's progress on the Johnson kitchen",
          "Fun fact about home remodeling",
          "Meet the team member of the week",
          "Tools of the trade — what we're using today",
          "Remodeling myth vs reality",
          "Client shoutout and thank you",
          "Weekend project inspiration for homeowners",
        ],
        tone: "casual",
        aspectRatio: "9:16",
      },
    ],
  };

  const merged = { ...existing, contentAutomation };

  await prisma.tenant.update({
    where: { slug },
    data: { settings: merged },
  });

  console.log(`✅ Content automation seeded for ${slug}`);
  console.log(`   Platform: ${contentAutomation.platform}`);
  console.log(`   Daily slots: ${contentAutomation.dailyContent.length} (${contentAutomation.dailyContent.map((d) => d.type).join(", ")})`);
  console.log(`   Approver: ${contentAutomation.approverPhone}`);
  console.log(`   Pillars: ${contentAutomation.contentPillars.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
