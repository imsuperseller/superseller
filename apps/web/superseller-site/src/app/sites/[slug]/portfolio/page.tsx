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
    title: `Our Work`,
    description: `Browse ${site.businessName}'s project portfolio — kitchen remodels, bathroom renovations, room additions, and more in ${site.address.city}, ${site.address.state}.`,
  };
}

export default async function PortfolioPage({ params }: Props) {
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
            Our Work
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: c.textMid }}>
            Browse our recent projects across {site.address.city} and North Texas. Every project reflects our commitment to quality craftsmanship.
          </p>
        </div>
      </section>

      {/* Portfolio placeholder — will be populated with actual photos */}
      <section className="py-16" style={{ background: c.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <span
              className="px-4 py-2 text-sm font-semibold rounded-full text-white"
              style={{ background: c.accent }}
            >
              All Projects
            </span>
            {site.services.slice(0, 6).map((svc) => (
              <span
                key={svc.slug}
                className="px-4 py-2 text-sm font-medium rounded-full border cursor-pointer hover:shadow-sm transition-shadow"
                style={{ borderColor: c.border, color: c.textMid }}
              >
                {svc.name}
              </span>
            ))}
          </div>

          {/* Placeholder grid — content to be added by customer */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {site.services.slice(0, 6).map((svc) => (
              <div
                key={svc.slug}
                className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg"
                style={{ borderColor: c.border }}
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: c.backgroundAlt }}
                >
                  <div className="text-center p-6">
                    <span className="text-4xl block mb-3">{svc.icon}</span>
                    <p className="text-sm font-medium" style={{ color: c.textLight }}>
                      {svc.name} photos coming soon
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold" style={{ color: c.primary }}>{svc.name}</h3>
                  <p className="text-xs mt-1" style={{ color: c.textLight }}>
                    {site.address.city}, {site.address.state}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-12 p-8 rounded-xl border text-center"
            style={{ borderColor: c.border, background: c.warmBg }}
          >
            <p className="text-base font-medium mb-2" style={{ color: c.textDark }}>
              Want to see more of our work?
            </p>
            <p className="text-sm mb-4" style={{ color: c.textMid }}>
              Check out our 33+ project photos on Yelp or call us for references from past clients.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {site.social?.yelp && (
                <a
                  href={site.social.yelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 text-sm font-bold rounded-lg border-2"
                  style={{ color: c.accent, borderColor: c.accent }}
                >
                  View on Yelp
                </a>
              )}
              <Link
                href={`${base}/contact`}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-lg"
                style={{ background: c.accent }}
              >
                Request References
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
