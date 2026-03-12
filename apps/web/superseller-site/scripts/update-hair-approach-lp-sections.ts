import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const lp = await prisma.landingPage.findFirst({ where: { slug: "hair-approach" } });
  if (!lp) { console.log("No LP found"); return; }

  await prisma.landingPage.update({
    where: { id: lp.id },
    data: {
      phone: "(818) 424-9911",
      whatsappNumber: "18184249911",
      sections: {
        steps: [
          {
            title: "Free Consultation",
            description: "Tell us about your hair goals and lifestyle. We listen first to understand exactly what you want."
          },
          {
            title: "Personalized Plan",
            description: "Deanna creates a custom approach tailored to your hair type, face shape, and personal style."
          },
          {
            title: "Expert Transformation",
            description: "Sit back and relax while your vision comes to life with premium products and expert technique."
          }
        ],
        credentials: [
          { label: "Years of Experience", value: "30+" },
          { label: "Training", value: "Vidal Sassoon" },
          { label: "Specialty", value: "Balayage" }
        ],
        differentiators: [
          {
            title: "Blonde Specialist",
            description: "Expert balayage, highlights, and color correction. Your hair is in the hands of a true specialist."
          },
          {
            title: "A-List Training",
            description: "Vidal Sassoon and Toni & Guy trained with TV and film credits including Fox and ABC productions."
          },
          {
            title: "Personalized Approach",
            description: "Every client gets a customized plan designed for their unique hair type, lifestyle, and vision."
          }
        ]
      },
    },
  });
  console.log("LP updated with phone + enhanced sections");
}

main().catch(console.error).finally(() => prisma.$disconnect());
