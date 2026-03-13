import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/components/sites/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = getSiteConfig(slug);
  if (!site) return {};
  return {
    title: `Service Areas | ${site.businessName}`,
    description: `${site.businessName} serves ${site.serviceAreas.join(", ")} and surrounding areas. ${site.license}. Free estimates — call ${site.phone}.`,
  };
}

export default async function ServiceAreasPage({ params }: Props) {
  const { slug } = await params;
  const site = getSiteConfig(slug);
  if (!site) notFound();
  const c = site.colors;
  const base = `/sites/${slug}`;

  return (
    <>
      {/* Header */}
      <section className="py-16" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: c.primary }}>
            Service Areas
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: c.textMid }}>
            Proudly serving homeowners across {site.address.city} and the greater North Texas area since {site.foundedYear}.
          </p>
        </div>
      </section>

      {/* Areas grid with services cross-reference */}
      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {site.serviceAreas.map((area) => (
              <div
                key={area}
                className="p-6 rounded-xl border hover:shadow-md transition-shadow"
                style={{ borderColor: c.border }}
              >
                <h2 className="text-lg font-bold mb-3" style={{ color: c.primary }}>
                  {area}, {site.address.state}
                </h2>
                <p className="text-sm mb-4" style={{ color: c.textMid }}>
                  {site.businessName} provides full-service remodeling and repair in {area}:
                </p>
                <ul className="space-y-1.5 mb-4">
                  {site.services.slice(0, 5).map((svc) => (
                    <li key={svc.slug} className="text-sm" style={{ color: c.textMid }}>
                      <Link
                        href={`${base}/services/${svc.slug}`}
                        className="hover:underline"
                        style={{ color: c.accent }}
                      >
                        {svc.name} in {area}
                      </Link>
                    </li>
                  ))}
                  {site.services.length > 5 && (
                    <li className="text-xs" style={{ color: c.textLight }}>
                      + {site.services.length - 5} more services
                    </li>
                  )}
                </ul>
                <Link
                  href={`${base}/contact`}
                  className="text-xs font-semibold"
                  style={{ color: c.accent }}
                >
                  Get Estimate for {area} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primary}ee 60%, ${c.accent}33 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Don&apos;t See Your Area?
          </h2>
          <p className="text-base mb-6" style={{ color: "rgba(255,255,255,0.8)" }}>
            We may still be able to help. Give us a call and let&apos;s discuss your project.
          </p>
          <a
            href={`tel:${site.phone.replace(/\D/g, "")}`}
            className="inline-block px-8 py-3.5 text-sm font-bold text-white rounded-xl"
            style={{ background: c.accent }}
          >
            Call {site.phone}
          </a>
        </div>
      </section>
    </>
  );
}
