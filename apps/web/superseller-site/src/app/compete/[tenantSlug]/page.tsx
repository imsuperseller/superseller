import { verifySession } from "@/lib/auth";
import CompeteFeed from "./_components/CompeteFeed";
import CompeteLogin from "./_components/CompeteLogin";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function CompetePage({ params }: Props) {
  const { tenantSlug } = await params;
  const session = await verifySession();

  if (!session.isValid || !session.email) {
    return <CompeteLogin tenantSlug={tenantSlug} />;
  }

  const userName = session.businessName || session.email.split("@")[0];

  return <CompeteFeed tenantSlug={tenantSlug} userName={userName} />;
}
