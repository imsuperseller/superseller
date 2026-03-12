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
        type: "post",
        topicPool: [
          "Before & after: stunning kitchen transformation",
          "3 signs your bathroom needs a remodel",
          "Why Elite Pro uses only premium materials",
          "Tour of a completed luxury kitchen remodel",
          "The most common remodeling mistake homeowners make",
          "What sets a premium remodeler apart from the rest",
          "Why DFW homeowners are investing in kitchen upgrades",
          "How we protect your home during a full renovation",
          "The one material upgrade that transforms any kitchen",
          "Licensed, insured, and family-owned — why it matters",
        ],
        tone: "professional",
        aspectRatio: "1:1",
      },
      {
        type: "post",
        topicPool: [
          "5 kitchen trends dominating 2026",
          "Color palettes that make small kitchens feel huge",
          "Materials guide: quartz vs granite vs marble",
          "Top 7 ROI-boosting home renovations",
          "Step-by-step: how we plan your dream remodel",
          "Tile patterns that transform any bathroom",
          "What $30K gets you in a kitchen remodel",
          "The remodeling timeline: what to expect week by week",
          "Open concept vs closed kitchen — the 2026 verdict",
          "Small bathroom, big impact — 5 design tricks",
        ],
        tone: "inspiring",
        aspectRatio: "4:5",
      },
      {
        type: "post",
        topicPool: [
          "Morning crew check-in vibes",
          "White cabinets or wood tone — what do you think?",
          "Sneak peek of tomorrow's big reveal",
          "Fun fact about home remodeling you didn't know",
          "Meet the team behind your dream kitchen",
          "Tools of the trade — what we're using today",
          "Remodeling myth vs reality",
          "Client shoutout and thank you",
          "Weekend project inspiration for homeowners",
          "Behind the scenes at today's job site",
        ],
        tone: "casual",
        aspectRatio: "1:1",
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
