import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { ReportClient } from "./ReportClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getReport(slug: string) {
  const report = await prisma.prospectReport.findUnique({
    where: { slug, active: true },
  });
  if (!report) return null;

  // Increment view count (fire-and-forget)
  prisma.prospectReport
    .update({ where: { id: report.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  return report;
}

async function getReportAds(slug: string) {
  try {
    const ads = await prisma.$queryRawUnsafe(
      `SELECT id, page_name, ad_copy, image_url, start_date, meta
       FROM competitor_ads
       WHERE tenant_id = $1
       ORDER BY start_date DESC
       LIMIT 20`,
      `prospect-report-${slug}`
    );
    return ads as Array<{
      id: string;
      page_name: string;
      ad_copy: string | null;
      image_url: string | null;
      start_date: string | null;
      meta: Record<string, unknown> | null;
    }>;
  } catch {
    // Table may not exist yet or no ads — graceful fallback
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  if (!report) return {};

  const title = `${report.businessName} — Competitor Ad Intelligence | SuperSeller AI`;
  const description = `See what ads your competitors in ${report.vertical} are running, what's working, and where the gaps are.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "SuperSeller AI",
      url: `https://superseller.agency/report/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: false, follow: false },
  };
}

export default async function ReportPage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,100}$/.test(slug)) return notFound();
  const report = await getReport(slug);
  if (!report) notFound();

  const ads = await getReportAds(slug);

  return (
    <ReportClient
      report={{
        businessName: report.businessName,
        vertical: report.vertical,
        location: report.location,
        summary: report.summary as Record<string, unknown> | null,
        ctaType: report.ctaType,
        ctaUrl: report.ctaUrl,
        ctaText: report.ctaText,
        recommendedProduct: report.recommendedProduct,
        slug: report.slug,
      }}
      ads={ads}
    />
  );
}
