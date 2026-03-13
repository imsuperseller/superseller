import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSiteConfig } from "@/components/sites/data";
import { ContactPageClient } from "@/components/sites/ContactPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = getSiteConfig(slug);
  if (!site) return {};
  return {
    title: `Contact Us`,
    description: `Get a free estimate from ${site.businessName}. Call ${site.phone} or fill out our contact form. Serving ${site.serviceAreas.slice(0, 3).join(", ")} and more.`,
  };
}

export default async function ContactPage({ params }: Props) {
  const { slug } = await params;
  const site = getSiteConfig(slug);
  if (!site) notFound();
  return <ContactPageClient site={site} />;
}
