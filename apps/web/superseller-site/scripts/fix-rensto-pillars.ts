/**
 * One-off script: Fix Rensto content pillars.
 * Rensto is a contractor DIRECTORY, not an AI company.
 * Run: npx tsx scripts/fix-rensto-pillars.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "rensto" } });
  if (!tenant) {
    console.error("Rensto tenant not found");
    process.exit(1);
  }

  const existing = (tenant.settings as Record<string, unknown>) || {};
  const existingAutomation = (existing.contentAutomation as Record<string, unknown>) || {};

  const updated = await prisma.tenant.update({
    where: { slug: "rensto" },
    data: {
      settings: {
        ...existing,
        contentAutomation: {
          ...existingAutomation,
          businessContext:
            "Rensto — Online directory connecting homeowners with trusted local contractors for remodeling, renovation, and home improvement projects.",
          contentPillars: [
            "home improvement tips",
            "before & after project reveals",
            "how to choose the right contractor",
            "kitchen remodeling tips",
            "bathroom renovation ideas",
            "behind-the-scenes crew work",
            "customer testimonials & reviews",
          ],
          dailyContent: [
            {
              tone: "professional",
              type: "post",
              topicPool: [
                "How to choose the right contractor for your kitchen remodel",
                "5 signs your bathroom needs a renovation",
                "What to expect during a full home renovation",
                "How we protect your home during a full renovation",
                "The most common remodeling mistake homeowners make",
                "Questions to ask before hiring a contractor",
                "Open concept vs closed kitchen — the 2026 verdict",
              ],
              aspectRatio: "1:1",
            },
            {
              tone: "casual",
              type: "post",
              topicPool: [
                "Behind the scenes at today's job site",
                "This week's before & after transformation",
                "Fun fact about home remodeling you didn't know",
                "Color palettes that make small kitchens feel huge",
                "What our clients say about working with us",
                "The renovation detail that makes the biggest difference",
              ],
              aspectRatio: "4:5",
            },
          ],
        },
      },
    },
  });

  console.log("Updated Rensto content pillars:");
  const settings = updated.settings as Record<string, unknown>;
  const automation = settings.contentAutomation as Record<string, unknown>;
  console.log("  Business context:", automation.businessContext);
  console.log("  Pillars:", automation.contentPillars);
  console.log("  Daily slots:", (automation.dailyContent as unknown[]).length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
