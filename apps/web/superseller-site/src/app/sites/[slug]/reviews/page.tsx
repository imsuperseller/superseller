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
  const totalReviews = site.reviewPlatforms.reduce((s, p) => s + p.count, 0);
  return {
    title: `Reviews | ${site.businessName}`,
    description: `${totalReviews}+ reviews across all platforms. Universal 5-star rating. See what ${site.address.city} homeowners say about ${site.businessName}.`,
  };
}

export default async function ReviewsPage({ params }: Props) {
  const { slug } = await params;
  const site = getSiteConfig(slug);
  if (!site) notFound();
  const c = site.colors;
  const base = `/sites/${slug}`;
  const totalReviews = site.reviewPlatforms.reduce((s, p) => s + p.count, 0);
  const avgRating = (site.reviewPlatforms.reduce((s, p) => s + p.rating, 0) / site.reviewPlatforms.length).toFixed(1);

  return (
    <>
      {/* Header */}
      <section className="py-16" style={{ background: c.backgroundAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: c.primary }}>
            Customer Reviews
          </h1>
          <p className="text-lg mb-4" style={{ color: c.textMid }}>
            <span className="font-bold" style={{ color: c.accent }}>{avgRating}</span> average across{" "}
            <span className="font-bold">{totalReviews}+</span> reviews
          </p>
          <p className="text-sm" style={{ color: c.textLight }}>
            Zero negative reviews found — anywhere.
          </p>
        </div>
      </section>

      {/* Platform cards */}
      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {site.reviewPlatforms.map((platform) => (
              <div
                key={platform.name}
                className="p-6 rounded-xl border text-center"
                style={{ borderColor: c.border, background: c.backgroundAlt }}
              >
                <div className="flex justify-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="20" height="20" viewBox="0 0 20 20" fill={j < Math.round(platform.rating) ? c.accent : c.border}>
                      <path d="M10 1l2.39 4.84L17.82 6.7l-3.91 3.81.92 5.39L10 13.34l-4.83 2.56.92-5.39L2.18 6.7l5.43-.86z" />
                    </svg>
                  ))}
                </div>
                <div className="text-3xl font-extrabold mb-1" style={{ color: c.primary }}>
                  {platform.rating.toFixed(1)}
                </div>
                <div className="text-base font-bold mb-1" style={{ color: c.textDark }}>
                  {platform.name}
                </div>
                <div className="text-sm" style={{ color: c.textLight }}>
                  {platform.count} reviews
                </div>
                {platform.url && (
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-semibold hover:underline"
                    style={{ color: c.accent }}
                  >
                    View on {platform.name} →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Google review CTA */}
          {site.googleReviewUrl && (
            <div className="mt-12 text-center">
              <a
                href={site.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3.5 text-sm font-bold text-white rounded-xl"
                style={{ background: c.accent }}
              >
                Leave Us a Google Review
              </a>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: c.warmBg }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: c.primary }}>
            Join Our Happy Customers
          </h2>
          <p className="text-base mb-6" style={{ color: c.textMid }}>
            Experience the quality and service that earned us universal 5-star reviews.
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
