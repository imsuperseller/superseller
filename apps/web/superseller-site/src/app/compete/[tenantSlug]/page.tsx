import { verifySession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CompeteFeed from "./_components/CompeteFeed";
import CompeteLogin from "./_components/CompeteLogin";
import type { CompeteLocale } from "./_components/compete-i18n";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

async function getLocale(slug: string): Promise<CompeteLocale> {
  const lp = await prisma.landingPage.findFirst({
    where: { slug },
    select: { locale: true },
  });
  return (lp?.locale === "en" ? "en" : "he") as CompeteLocale;
}

export default async function CompetePage({ params }: Props) {
  const { tenantSlug } = await params;
  const [session, locale] = await Promise.all([
    verifySession(),
    getLocale(tenantSlug),
  ]);

  if (!session.isValid || !session.email) {
    return <CompeteLogin tenantSlug={tenantSlug} locale={locale} />;
  }

  const userName = session.businessName || session.email.split("@")[0];

  return <CompeteFeed tenantSlug={tenantSlug} userName={userName} locale={locale} />;
}
