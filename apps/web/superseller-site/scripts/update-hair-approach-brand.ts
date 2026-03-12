import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.findFirst({ where: { slug: "hair-approach" } });
  if (!brand) {
    console.log("No brand found with slug hair-approach");
    return;
  }

  await prisma.brand.update({
    where: { id: brand.id },
    data: {
      primaryColor: "#1a1a1a",        // Dark charcoal (her post backgrounds)
      accentColor: "#C9A96E",         // Warm honey gold (blonde specialist)
      ctaColor: "#C9A96E",            // Warm gold CTA
      fontFamily: "Playfair Display", // Elegant serif matching her branding
      tone: "Elegant, warm, A-list professional. Confident but approachable. Editorial luxury feel.",
      tagline: "Master Hair Stylist & Hair Colorist | Blonde Specialist | Balayage",
    },
  });
  console.log("Brand updated with real colors from IG");

  const lp = await prisma.landingPage.findFirst({ where: { slug: "hair-approach" } });
  if (lp) {
    await prisma.landingPage.update({
      where: { id: lp.id },
      data: {
        theme: "dark",
        style: "creative",
        fontHeading: "Playfair Display",
        heroStyle: "split",
        cardStyle: "glass",
      },
    });
    console.log("Landing page design tokens updated");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
