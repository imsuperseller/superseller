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
    title: `About Us | ${site.businessName}`,
    description: `Learn about ${site.businessName} — serving ${site.address.city}, ${site.address.state} since ${site.foundedYear}. ${site.license}.`,
  };
}

export default async function AboutPage({ params }: Props) {
  const { slug } = await params;
  const site = getSiteConfig(slug);
  if (!site) notFound();
  const c = site.colors;
  const base = `/sites/${slug}`;
  const years = new Date().getFullYear() - site.foundedYear;

  return (
    <>
      {/* Header */}
      <section className="py-16" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: c.primary }}>
            About {site.businessName}
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: c.textMid }}>
            {site.tagline}
          </p>
        </div>
      </section>

      {/* About content */}
      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base leading-relaxed mb-8" style={{ color: c.textMid }}>
              {site.aboutText}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-12">
            {site.stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl border"
                style={{ borderColor: c.border, background: c.backgroundAlt }}
              >
                <div className="text-3xl font-extrabold mb-1" style={{ color: c.accent }}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: c.textLight }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* What makes us different */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6" style={{ color: c.primary }}>
              What Makes Us Different
            </h2>
            <div
              className="p-8 rounded-xl border-l-4"
              style={{ borderColor: c.accent, background: c.warmBg }}
            >
              <p className="text-base font-medium leading-relaxed" style={{ color: c.textDark }}>
                {site.uniqueValue}
              </p>
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6" style={{ color: c.primary }}>
              Our Credentials
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {site.trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-4 p-5 rounded-xl border"
                  style={{ borderColor: c.border }}
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: c.textDark }}>{badge.label}</div>
                    {badge.detail && (
                      <div className="text-xs" style={{ color: c.textLight }}>{badge.detail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: c.warmBg }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: c.primary }}>
            Let&apos;s Talk About Your Project
          </h2>
          <p className="text-base mb-6" style={{ color: c.textMid }}>
            {years}+ years of experience, zero negative reviews. Let us earn your trust.
          </p>
          <Link
            href={`${base}/contact`}
            className="inline-block px-8 py-3.5 text-sm font-bold text-white rounded-xl"
            style={{ background: c.accent }}
          >
            Get Free Estimate
          </Link>
        </div>
      </section>
    </>
  );
}
