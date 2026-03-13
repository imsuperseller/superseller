// ---------------------------------------------------------------------------
// Contractor Site — Reusable data types for multi-tenant business websites
// ---------------------------------------------------------------------------

export interface ContractorSiteConfig {
  slug: string;
  businessName: string;
  tagline: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  website?: string;
  foundedYear: number;
  license?: string;

  // Brand
  colors: {
    primary: string;      // Navy, trust color
    accent: string;       // CTA / energy color
    accentHover: string;
    background: string;
    backgroundAlt: string;
    warmBg: string;
    textDark: string;
    textMid: string;
    textLight: string;
    border: string;
  };
  logoUrl?: string;
  heroImageUrl?: string;

  // Content
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
  uniqueValue: string; // What makes them different

  // Services
  services: ServiceItem[];
  serviceAreas: string[];

  // Trust signals
  trustBadges: TrustBadge[];
  stats: StatItem[];

  // Reviews
  reviewPlatforms: ReviewPlatform[];
  googleReviewUrl?: string;

  // Social
  social?: {
    facebook?: string;
    instagram?: string;
    yelp?: string;
    tiktok?: string;
    youtube?: string;
  };

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  schemaType: "GeneralContractor" | "HomeAndConstructionBusiness" | "Plumber" | "Electrician" | "RoofingContractor" | "HVACBusiness";
}

export interface ServiceItem {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  icon: string; // emoji or icon name
  features?: string[];
  priceRange?: string;
  imageUrl?: string;
}

export interface TrustBadge {
  label: string;
  detail?: string;
  icon: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ReviewPlatform {
  name: string;
  rating: number;
  count: number;
  url?: string;
}
