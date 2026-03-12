import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AnalyticsPage({ params }: Props) {
  const { slug } = await params;

  // Verify user is authenticated
  const session = await verifySession();
  if (!session.isValid || !session.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-white">
        <p className="text-white/60">Please log in to view analytics.</p>
      </div>
    );
  }

  // Verify the landing page exists
  const lp = await prisma.landingPage.findUnique({
    where: { slug },
    include: { brand: true },
  });

  if (!lp) notFound();

  const brandName = lp.brand?.name || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return <AnalyticsDashboard slug={slug} brandName={brandName} />;
}
