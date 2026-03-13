import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteConfig } from "@/components/sites/data";
import { ContractorHomeClient } from "@/components/sites/ContractorHomeClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ContractorHomePage({ params }: Props) {
  const { slug } = await params;
  const site = await getSiteConfig(slug);
  if (!site) notFound();

  return <ContractorHomeClient site={site} />;
}
