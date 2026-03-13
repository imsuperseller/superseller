import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/components/sites/data";

interface Props {
  params: Promise<{ slug: string; service: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, service: serviceSlug } = await params;
  const site = getSiteConfig(slug);
  if (!site) return {};
  const svc = site.services.find((s) => s.slug === serviceSlug);
  if (!svc) return {};
  return {
    title: `${svc.name} in ${site.address.city}, ${site.address.state} | ${site.businessName}`,
    description: `${svc.shortDescription} ${site.businessName} — licensed, bonded, insured ${site.address.city} contractor. Free estimates. Call ${site.phone}.`,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug, service: serviceSlug } = await params;
  const site = getSiteConfig(slug);
  if (!site) notFound();

  const svc = site.services.find((s) => s.slug === serviceSlug);
  if (!svc) notFound();

  const c = site.colors;
  const base = `/sites/${slug}`;

  // Find related services (same site, excluding current)
  const related = site.services.filter((s) => s.slug !== serviceSlug).slice(0, 3);

  return (
    <>
      {/* Breadcrumb + Header */}
      <section className="py-16" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: c.textLight }}>
            <Link href={base} className="hover:underline">Home</Link>
            <span>/</span>
            <Link href={`${base}/services`} className="hover:underline">Services</Link>
            <span>/</span>
            <span style={{ color: c.textDark }}>{svc.name}</span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{svc.icon}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: c.primary }}>
              {svc.name}
            </h1>
          </div>
          <p className="text-lg max-w-3xl" style={{ color: c.textMid }}>
            {svc.longDescription || svc.shortDescription}
          </p>
        </div>
      </section>

      {/* Features + CTA */}
      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Features — 3 cols */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold mb-6" style={{ color: c.primary }}>
                What We Offer
              </h2>
              {svc.features && svc.features.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {svc.features.map((f) => (
                    <div key={f} className="flex items-start gap-3 p-4 rounded-lg" style={{ background: c.backgroundAlt }}>
                      <span className="shrink-0 mt-0.5" style={{ color: c.accent }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 0a10 10 0 110 20 10 10 0 010-20zm4.3 6.3a1 1 0 00-1.4 0L9 10.2 7.1 8.3a1 1 0 00-1.4 1.4l2.6 2.6a1 1 0 001.4 0l4.6-4.6a1 1 0 000-1.4z" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium" style={{ color: c.textDark }}>{f}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: c.textMid }}>Contact us for details about this service.</p>
              )}

              {/* Service areas for this service */}
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4" style={{ color: c.primary }}>
                  {svc.name} in Your Area
                </h2>
                <p className="text-sm mb-4" style={{ color: c.textMid }}>
                  We provide {svc.name.toLowerCase()} services throughout the North Texas area:
                </p>
                <div className="flex flex-wrap gap-2">
                  {site.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border"
                      style={{ borderColor: c.border, color: c.textMid }}
                    >
                      {svc.name} in {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA sidebar — 2 cols */}
            <div className="lg:col-span-2">
              <div
                className="sticky top-24 p-8 rounded-xl border"
                style={{ borderColor: c.border, background: c.warmBg }}
              >
                <h3 className="text-lg font-bold mb-3" style={{ color: c.primary }}>
                  Get a Free {svc.name} Estimate
                </h3>
                <p className="text-sm mb-6" style={{ color: c.textMid }}>
                  No obligation, no pressure. We&apos;ll assess your project and provide a detailed, transparent quote.
                </p>
                <div className="space-y-3">
                  <Link
                    href={`${base}/contact`}
                    className="block w-full px-6 py-3.5 text-center text-sm font-bold text-white rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background: c.accent }}
                  >
                    Request Free Estimate
                  </Link>
                  <a
                    href={`tel:${site.phone.replace(/\D/g, "")}`}
                    className="block w-full px-6 py-3.5 text-center text-sm font-bold rounded-xl border-2 transition-all hover:scale-[1.02]"
                    style={{ color: c.primary, borderColor: c.primary }}
                  >
                    Call {site.phone}
                  </a>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t space-y-3" style={{ borderColor: c.border }}>
                  {site.trustBadges.map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2">
                      <span className="text-lg">{badge.icon}</span>
                      <span className="text-xs font-medium" style={{ color: c.textMid }}>{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-16" style={{ background: c.backgroundAlt }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8" style={{ color: c.primary }}>
              Related Services
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`${base}/services/${rel.slug}`}
                  className="group p-6 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: c.border, background: c.background }}
                >
                  <div className="text-2xl mb-2">{rel.icon}</div>
                  <h3 className="text-base font-bold group-hover:underline" style={{ color: c.primary }}>
                    {rel.name}
                  </h3>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: c.textMid }}>
                    {rel.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
