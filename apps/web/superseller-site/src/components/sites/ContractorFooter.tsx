import Link from "next/link";
import type { ContractorSiteConfig } from "./types";

export function ContractorFooter({ site }: { site: ContractorSiteConfig }) {
  const c = site.colors;
  const base = `/sites/${site.slug}`;
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: c.primary, color: "rgba(255,255,255,0.85)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Business info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">{site.businessName}</h3>
            <p className="text-sm leading-relaxed opacity-80 mb-4">{site.uniqueValue}</p>
            <div className="space-y-2 text-sm opacity-80">
              <p>{site.address.street}</p>
              <p>
                {site.address.city}, {site.address.state} {site.address.zip}
              </p>
              <a
                href={`tel:${site.phone.replace(/\D/g, "")}`}
                className="block font-semibold text-white hover:underline"
              >
                {site.phone}
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {site.services.slice(0, 8).map((svc) => (
                <li key={svc.slug}>
                  <Link
                    href={`${base}/services/${svc.slug}`}
                    className="opacity-80 hover:opacity-100 hover:underline transition-opacity"
                  >
                    {svc.name}
                  </Link>
                </li>
              ))}
              {site.services.length > 8 && (
                <li>
                  <Link
                    href={`${base}/services`}
                    className="font-medium hover:underline"
                    style={{ color: site.colors.accent }}
                  >
                    View All Services →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Service Areas */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm">
              {site.serviceAreas.slice(0, 8).map((area) => (
                <li key={area} className="opacity-80">
                  {area}, {site.address.state}
                </li>
              ))}
              {site.serviceAreas.length > 8 && (
                <li>
                  <Link
                    href={`${base}/service-areas`}
                    className="font-medium hover:underline"
                    style={{ color: site.colors.accent }}
                  >
                    All Areas →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Quick Links + CTA */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li>
                <Link href={`${base}/about`} className="opacity-80 hover:opacity-100 hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={`${base}/portfolio`} className="opacity-80 hover:opacity-100 hover:underline">
                  Our Work
                </Link>
              </li>
              <li>
                <Link href={`${base}/reviews`} className="opacity-80 hover:opacity-100 hover:underline">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href={`${base}/contact`} className="opacity-80 hover:opacity-100 hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
            <a
              href={`${base}/contact`}
              className="inline-block px-6 py-3 text-sm font-bold text-white rounded-lg transition-all hover:scale-[1.02]"
              style={{ background: c.accent }}
            >
              Get Free Estimate
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs opacity-60"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <p>
            © {year} {site.businessName}. All rights reserved.
          </p>
          <p>
            {site.license}
          </p>
        </div>
      </div>
    </footer>
  );
}
