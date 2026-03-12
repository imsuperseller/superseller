import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import OnboardingForm from "./_components/OnboardingForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function OnboardPage({ params }: Props) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { brand: true },
  });

  if (!tenant || tenant.status !== "active") notFound();

  const brand = tenant.brand;

  return (
    <OnboardingForm
      tenantSlug={tenantSlug}
      tenantName={tenant.name}
      logoUrl={brand?.logoUrl || null}
      primaryColor={brand?.primaryColor || "#1a1a2e"}
      accentColor={brand?.accentColor || "#e94560"}
      ctaColor={brand?.ctaColor || "#f97316"}
    />
  );
}
