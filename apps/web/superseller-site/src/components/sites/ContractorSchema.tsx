import type { ContractorSiteConfig } from "./types";

// ---------------------------------------------------------------------------
// JSON-LD Schema — LocalBusiness + Service + FAQPage markup
// ---------------------------------------------------------------------------
export function ContractorSchema({ site, currentPage }: { site: ContractorSiteConfig; currentPage?: string }) {
  const baseUrl = `https://superseller.agency/sites/${site.slug}`;

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": site.schemaType,
    name: site.businessName,
    url: baseUrl,
    telephone: site.phone,
    ...(site.email && { email: site.email }),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Plano TX approximate — would be replaced with actual geocoding
      latitude: 33.0198,
      longitude: -96.6989,
    },
    foundingDate: String(site.foundedYear),
    ...(site.logoUrl && { logo: site.logoUrl }),
    image: site.heroImageUrl || site.logoUrl,
    description: site.metaDescription,
    areaServed: site.serviceAreas.map((area) => ({
      "@type": "City",
      name: area,
      containedInPlace: { "@type": "State", name: site.address.state },
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${site.businessName} Services`,
      itemListElement: site.services.map((svc, i) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: svc.name,
          description: svc.shortDescription,
          url: `${baseUrl}/services/${svc.slug}`,
          provider: { "@type": site.schemaType, name: site.businessName },
          areaServed: { "@type": "City", name: site.address.city },
        },
        position: i + 1,
      })),
    },
    aggregateRating:
      site.reviewPlatforms.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (
              site.reviewPlatforms.reduce((sum, p) => sum + p.rating, 0) / site.reviewPlatforms.length
            ).toFixed(1),
            reviewCount: site.reviewPlatforms.reduce((sum, p) => sum + p.count, 0),
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  // Service schema for individual service pages
  const serviceSchema = currentPage?.startsWith("services/")
    ? (() => {
        const serviceSlug = currentPage.replace("services/", "");
        const service = site.services.find((s) => s.slug === serviceSlug);
        if (!service) return null;
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.longDescription || service.shortDescription,
          url: `${baseUrl}/services/${service.slug}`,
          provider: {
            "@type": site.schemaType,
            name: site.businessName,
            telephone: site.phone,
            address: {
              "@type": "PostalAddress",
              addressLocality: site.address.city,
              addressRegion: site.address.state,
            },
          },
          areaServed: site.serviceAreas.map((area) => ({
            "@type": "City",
            name: area,
          })),
        };
      })()
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      {serviceSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      )}
    </>
  );
}
