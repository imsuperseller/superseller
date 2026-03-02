import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { LandingPageClient } from "./LandingPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getLandingPage(slug: string) {
  const page = await prisma.landingPage.findUnique({
    where: { slug, active: true },
    include: { brand: true },
  });
  if (!page) return null;

  // Increment view count (fire-and-forget)
  prisma.landingPage
    .update({ where: { id: page.id }, data: { views: { increment: 1 } } })
    .catch(() => { });

  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle || page.heroHeadline,
    description: page.metaDescription || page.heroSubheadline || page.brand?.tagline || "",
    robots: { index: true, follow: true },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await getLandingPage(slug);
  if (!page) notFound();

  return <LandingPageClient page={page} />;
}
