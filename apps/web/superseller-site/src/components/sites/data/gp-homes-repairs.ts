import type { ContractorSiteConfig } from "../types";

// ---------------------------------------------------------------------------
// GP Homes and Repairs — Site configuration
// ALL content extracted from KNOWLEDGE.md — nothing invented
// ---------------------------------------------------------------------------

export const gpHomesSiteConfig: ContractorSiteConfig = {
  slug: "gp-homes-repairs",
  businessName: "GP Homes and Repairs",
  tagline: "Plano's Most Trusted Full-Service Remodeling Contractor",
  phone: "469-444-7777",
  email: "", // Not in docs — leave empty
  address: {
    street: "3624 Marwick Drive",
    city: "Plano",
    state: "TX",
    zip: "75075",
  },
  website: "gphomesandrepairs.com",
  foundedYear: 2010,
  license: "City of Plano — Licensed, Bonded, Insured",

  // Brand colors — matching the pitch page palette (professional contractor)
  colors: {
    primary: "#1B3A5C",
    accent: "#E8863A",
    accentHover: "#D4782F",
    background: "#FFFFFF",
    backgroundAlt: "#F7F8FA",
    warmBg: "#FDF8F3",
    textDark: "#1E293B",
    textMid: "#475569",
    textLight: "#64748B",
    border: "#E2E8F0",
  },

  heroHeadline: "Quality Remodeling That Transforms Your Home",
  heroSubheadline:
    "From kitchen renovations to complete home additions — serving Plano and North Texas since 2010. BuildZoom Top 7% of all Texas contractors.",
  aboutText:
    "Founded in 2010, GP Homes and Repairs has built a reputation for quality craftsmanship across the Plano and North Texas area. We handle everything from small handyman repairs to major kitchen and bathroom remodels, room additions, and garage conversions. Licensed, bonded, and insured by the City of Plano, we bring over 15 years of hands-on experience to every project.",
  uniqueValue:
    "Full-spectrum contractor — from handyman repairs to major remodels. Most competitors only do one or the other.",

  // Services — from KNOWLEDGE.md business profile
  services: [
    {
      slug: "kitchen-remodeling",
      name: "Kitchen Remodeling",
      shortDescription:
        "Complete kitchen transformations — cabinets, countertops, flooring, lighting, and layout redesign.",
      icon: "🍳",
      features: [
        "Custom cabinet installation",
        "Countertop replacement (granite, quartz, marble)",
        "Kitchen island builds",
        "Lighting and electrical upgrades",
        "Flooring installation",
        "Full layout redesign",
      ],
    },
    {
      slug: "bathroom-remodeling",
      name: "Bathroom Remodeling",
      shortDescription:
        "Modern bathroom upgrades — tile work, vanities, walk-in showers, and accessibility modifications.",
      icon: "🚿",
      features: [
        "Walk-in shower conversions",
        "Tile and stone installation",
        "Vanity and fixture replacement",
        "Accessibility modifications",
        "Plumbing upgrades",
        "Lighting improvements",
      ],
    },
    {
      slug: "room-additions",
      name: "Room Additions",
      shortDescription:
        "Expand your living space with seamlessly integrated room additions that match your home's existing style.",
      icon: "🏗️",
      features: [
        "Bedroom additions",
        "Family room expansions",
        "Home office builds",
        "Sunroom additions",
        "Structural engineering",
        "Permit management",
      ],
    },
    {
      slug: "garage-conversions",
      name: "Garage Conversions",
      shortDescription:
        "Transform unused garage space into functional living areas — home gyms, offices, guest suites, or studios.",
      icon: "🏠",
      features: [
        "Full insulation and HVAC",
        "Flooring installation",
        "Electrical and lighting",
        "Drywall and finishing",
        "Window and door installation",
        "Bathroom addition option",
      ],
    },
    {
      slug: "flooring",
      name: "Flooring",
      shortDescription:
        "Professional flooring installation — hardwood, tile, laminate, vinyl, and carpet for every room.",
      icon: "🪵",
      features: [
        "Hardwood installation",
        "Tile and stone",
        "Laminate and vinyl plank",
        "Carpet installation",
        "Subfloor repair",
        "Floor leveling",
      ],
    },
    {
      slug: "painting",
      name: "Painting",
      shortDescription:
        "Interior and exterior painting with premium materials and meticulous prep work for lasting results.",
      icon: "🎨",
      features: [
        "Interior painting",
        "Exterior painting",
        "Cabinet painting and refinishing",
        "Deck and fence staining",
        "Drywall repair and texturing",
        "Color consultation",
      ],
    },
    {
      slug: "fencing",
      name: "Fencing",
      shortDescription:
        "Custom fence installation and repair — wood, vinyl, metal, and chain-link fencing solutions.",
      icon: "🪵",
      features: [
        "Wood fence installation",
        "Vinyl and composite fencing",
        "Metal and iron fencing",
        "Gate installation",
        "Fence repair and replacement",
        "Post and rail fencing",
      ],
    },
    {
      slug: "concrete-work",
      name: "Concrete Work",
      shortDescription:
        "Driveways, patios, walkways, and foundations — expert concrete work built to last.",
      icon: "🧱",
      features: [
        "Driveway installation",
        "Patio construction",
        "Walkways and pathways",
        "Foundation repair",
        "Concrete stamping and staining",
        "Retaining walls",
      ],
    },
    {
      slug: "electrical",
      name: "Electrical",
      shortDescription:
        "Licensed electrical work — panel upgrades, rewiring, lighting installation, and smart home setups.",
      icon: "⚡",
      features: [
        "Panel upgrades",
        "Outlet and switch installation",
        "Lighting installation",
        "Ceiling fan installation",
        "Rewiring",
        "Smart home wiring",
      ],
    },
    {
      slug: "plumbing",
      name: "Plumbing",
      shortDescription:
        "Reliable plumbing services — fixture installation, pipe repair, water heater replacement, and more.",
      icon: "🔧",
      features: [
        "Fixture installation",
        "Pipe repair and replacement",
        "Water heater installation",
        "Drain cleaning",
        "Leak detection and repair",
        "Gas line work",
      ],
    },
    {
      slug: "handyman-services",
      name: "Handyman Services",
      shortDescription:
        "Small jobs done right — drywall patches, door repairs, shelving, caulking, and general maintenance.",
      icon: "🔨",
      features: [
        "Drywall repair",
        "Door and window repair",
        "Shelving and storage",
        "Caulking and weatherproofing",
        "Minor plumbing and electrical",
        "General home maintenance",
      ],
    },
  ],

  serviceAreas: [
    "Plano",
    "Frisco",
    "Allen",
    "McKinney",
    "Richardson",
    "Garland",
    "Murphy",
    "Wylie",
    "Sachse",
    "Dallas",
    "North Texas",
  ],

  // Trust signals — from KNOWLEDGE.md
  trustBadges: [
    { label: "Licensed & Insured", detail: "City of Plano", icon: "🛡️" },
    { label: "BuildZoom Top 7%", detail: "of 222,249 TX contractors", icon: "🏆" },
    { label: "Bonded", detail: "Full protection for your project", icon: "✅" },
    { label: "Since 2010", detail: "15+ years of experience", icon: "📅" },
  ],

  stats: [
    { value: "15+", label: "Years in Business" },
    { value: "5.0", label: "Star Rating" },
    { value: "Top 7%", label: "TX Contractors" },
    { value: "0", label: "Negative Reviews" },
  ],

  // Reviews — from KNOWLEDGE.md
  reviewPlatforms: [
    { name: "HomeAdvisor", rating: 5.0, count: 12 },
    { name: "Networx", rating: 5.0, count: 3 },
    { name: "BestProsInTown", rating: 5.0, count: 18 },
    { name: "Yelp", rating: 5.0, count: 33 }, // 33 photos noted
  ],

  social: {
    facebook: "https://www.facebook.com/p/GP-Homes-and-Repairs-100054727121956/",
    yelp: "https://www.yelp.com/biz/gp-homes-and-repairs-plano",
  },

  metaTitle: "GP Homes and Repairs — Kitchen & Bath Remodeling in Plano TX",
  metaDescription:
    "Top-rated Plano TX remodeling contractor. Kitchen & bath remodels, room additions, garage conversions, flooring, painting, and more. BuildZoom Top 7%. Licensed, bonded, insured. Free estimates.",
  schemaType: "GeneralContractor",
};
