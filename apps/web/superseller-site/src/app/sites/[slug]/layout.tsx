import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSiteConfig } from "@/components/sites/data";
import { ContractorNav } from "@/components/sites/ContractorNav";
import { ContractorFooter } from "@/components/sites/ContractorFooter";
import { ContractorSchema } from "@/components/sites/ContractorSchema";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteConfig(slug);
  if (!site) return {};

  return {
    title: {
      template: `%s | ${site.businessName}`,
      default: site.metaTitle || site.businessName,
    },
    description: site.metaDescription,
    robots: { index: true, follow: true },
    openGraph: {
      title: site.metaTitle || site.businessName,
      description: site.metaDescription,
      type: "website",
      locale: "en_US",
      siteName: site.businessName,
    },
  };
}

export default async function ContractorSiteLayout({ params, children }: Props) {
  const { slug } = await params;
  const site = await getSiteConfig(slug);
  if (!site) notFound();

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', 'Outfit', sans-serif", background: "#FFFFFF", color: "#1E293B" }}>
      <ContractorSchema site={site} />
      <ContractorNav site={site} />
      <main className="flex-1">{children}</main>
      <ContractorFooter site={site} />
    </div>
  );
}
