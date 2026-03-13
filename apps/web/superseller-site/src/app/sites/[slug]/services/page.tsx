import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/components/sites/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteConfig(slug);
  if (!site) return {};
  return {
    title: `Services`,
    description: `${site.businessName} offers ${site.services.map((s) => s.name.toLowerCase()).join(", ")} in ${site.address.city}, ${site.address.state}. Licensed, bonded, insured. Free estimates.`,
  };
}

export default async function ServicesPage({ params }: Props) {
  const { slug } = await params;
  const site = await getSiteConfig(slug);
  if (!site) notFound();
  const c = site.colors;
  const base = `/sites/${slug}`;

  return (
    <>
      {/* Header */}
      <section className="py-16" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: c.primary }}>
            Our Services
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: c.textMid }}>
            {site.uniqueValue}
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {site.services.map((svc) => (
              <Link
                key={svc.slug}
                href={`${base}/services/${svc.slug}`}
                className="group block p-7 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ borderColor: c.border }}
              >
                <div className="text-3xl mb-3">{svc.icon}</div>
                <h2
                  className="text-lg font-bold mb-2 group-hover:underline"
                  style={{ color: c.primary }}
                >
                  {svc.name}
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: c.textMid }}>
                  {svc.shortDescription}
                </p>
                {svc.features && (
                  <ul className="space-y-1.5 mb-4">
                    {svc.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: c.textMid }}>
                        <span style={{ color: c.accent }}>✓</span>
                        {f}
                      </li>
                    ))}
                    {svc.features.length > 4 && (
                      <li className="text-xs font-medium" style={{ color: c.accent }}>
                        +{svc.features.length - 4} more
                      </li>
                    )}
                  </ul>
                )}
                <span className="inline-flex items-center text-xs font-semibold" style={{ color: c.accent }}>
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: c.warmBg }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: c.primary }}>
            Not Sure Which Service You Need?
          </h2>
          <p className="text-base mb-6" style={{ color: c.textMid }}>
            Call us for a free consultation. We&apos;ll assess your project and recommend the right approach.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`${base}/contact`}
              className="px-8 py-3.5 text-sm font-bold text-white rounded-xl"
              style={{ background: c.accent }}
            >
              Get Free Estimate
            </Link>
            <a
              href={`tel:${site.phone.replace(/\D/g, "")}`}
              className="px-8 py-3.5 text-sm font-bold rounded-xl border-2"
              style={{ color: c.primary, borderColor: c.primary }}
            >
              Call {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
