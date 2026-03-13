import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const brandSlug = 'gp-homes-repairs';

  // 1. Create Brand
  const brand = await prisma.brand.upsert({
    where: { slug: brandSlug },
    update: {
      name: 'GP Homes and Repairs',
      primaryColor: '#1B3A5C',   // Deep navy (trust, professionalism)
      accentColor: '#E8863A',    // Construction orange (energy, action)
      ctaColor: '#E8863A',
      tagline: 'Top 7% of Texas Contractors',
      fontFamily: 'Inter',
      tone: 'Professional, trustworthy, family-owned. Full-spectrum contractor with universal 5-star reviews. Plano TX since 2010.',
    },
    create: {
      name: 'GP Homes and Repairs',
      slug: brandSlug,
      primaryColor: '#1B3A5C',
      accentColor: '#E8863A',
      ctaColor: '#E8863A',
      tagline: 'Top 7% of Texas Contractors',
      fontFamily: 'Inter',
      tone: 'Professional, trustworthy, family-owned. Full-spectrum contractor with universal 5-star reviews. Plano TX since 2010.',
    },
  });

  console.log('Brand created:', brand.id, brand.slug);

  // 2. Create Landing Page
  const lp = await prisma.landingPage.upsert({
    where: { slug: 'gp-homes-repairs' },
    update: {
      brandId: brand.id,
      heroHeadline: 'Plano\'s Most Trusted Home Remodeling Team',
      heroSubheadline: 'Kitchen & bath remodels, room additions, and full-home renovations — backed by universal 5-star reviews and 15+ years of Texas craftsmanship.',
      ctaText: 'Get a Free Estimate',
      phone: '(469) 444-7777',
      whatsappNumber: '14694447777',
      direction: 'ltr',
      locale: 'en',
      theme: 'dark',
      style: 'modern',
      fontHeading: 'Inter',
      heroStyle: 'split',
      cardStyle: 'elevated',
      metaTitle: 'GP Homes and Repairs — Top-Rated Plano TX Remodeling',
      metaDescription: 'Kitchen remodels, bath renovations, room additions in Plano TX. BuildZoom top 7% of Texas contractors. Universal 5-star reviews. Free estimates.',
      sections: {
        steps: [
          {
            title: 'Free Consultation',
            description: 'We visit your home, understand your vision, and assess the scope of work — no pressure, no obligation.',
          },
          {
            title: 'Custom Plan & Estimate',
            description: 'Receive a detailed project plan with transparent pricing. No surprises — just honest, upfront numbers.',
          },
          {
            title: 'Expert Build',
            description: 'Our licensed, bonded crew brings your vision to life with quality craftsmanship and clear communication throughout.',
          },
        ],
        credentials: [
          { label: 'Years in Business', value: '15' },
          { label: 'Texas Contractor Rank', value: '7' },
          { label: 'Star Rating', value: '5' },
        ],
        differentiators: [
          {
            title: 'Full-Spectrum Service',
            description: 'From handyman fixes to major remodels — kitchen, bath, additions, flooring, electrical, plumbing. One team for everything.',
          },
          {
            title: 'Universal 5-Star Reviews',
            description: 'Zero negative reviews across HomeAdvisor, Networx, BestProsInTown, and Yelp. Our reputation speaks for itself.',
          },
          {
            title: 'Licensed & Insured',
            description: 'Fully licensed with the City of Plano, bonded, and insured. BuildZoom ranks us in the top 7% of 222,249 Texas contractors.',
          },
        ],
      },
    },
    create: {
      userId: 'superseller-admin',
      slug: 'gp-homes-repairs',
      brandId: brand.id,
      heroHeadline: 'Plano\'s Most Trusted Home Remodeling Team',
      heroSubheadline: 'Kitchen & bath remodels, room additions, and full-home renovations — backed by universal 5-star reviews and 15+ years of Texas craftsmanship.',
      ctaText: 'Get a Free Estimate',
      phone: '(469) 444-7777',
      whatsappNumber: '14694447777',
      direction: 'ltr',
      locale: 'en',
      theme: 'dark',
      style: 'modern',
      fontHeading: 'Inter',
      heroStyle: 'split',
      cardStyle: 'elevated',
      metaTitle: 'GP Homes and Repairs — Top-Rated Plano TX Remodeling',
      metaDescription: 'Kitchen remodels, bath renovations, room additions in Plano TX. BuildZoom top 7% of Texas contractors. Universal 5-star reviews. Free estimates.',
      sections: {
        steps: [
          {
            title: 'Free Consultation',
            description: 'We visit your home, understand your vision, and assess the scope of work — no pressure, no obligation.',
          },
          {
            title: 'Custom Plan & Estimate',
            description: 'Receive a detailed project plan with transparent pricing. No surprises — just honest, upfront numbers.',
          },
          {
            title: 'Expert Build',
            description: 'Our licensed, bonded crew brings your vision to life with quality craftsmanship and clear communication throughout.',
          },
        ],
        credentials: [
          { label: 'Years in Business', value: '15' },
          { label: 'Texas Contractor Rank', value: '7' },
          { label: 'Star Rating', value: '5' },
        ],
        differentiators: [
          {
            title: 'Full-Spectrum Service',
            description: 'From handyman fixes to major remodels — kitchen, bath, additions, flooring, electrical, plumbing. One team for everything.',
          },
          {
            title: 'Universal 5-Star Reviews',
            description: 'Zero negative reviews across HomeAdvisor, Networx, BestProsInTown, and Yelp. Our reputation speaks for itself.',
          },
          {
            title: 'Licensed & Insured',
            description: 'Fully licensed with the City of Plano, bonded, and insured. BuildZoom ranks us in the top 7% of 222,249 Texas contractors.',
          },
        ],
      },
    },
  });

  console.log('Landing Page created:', lp.slug);

  // 3. Create Prospect Report (for /report/gp-homes-repairs)
  // Using raw SQL since ProspectReport uses @map columns
  await prisma.$executeRaw`
    INSERT INTO prospect_reports (slug, active, business_name, vertical, location, summary, cta_type, cta_url, cta_text, recommended_product)
    VALUES (
      'gp-homes-repairs',
      true,
      'GP Homes and Repairs',
      'Home Remodeling',
      'Plano, TX',
      ${JSON.stringify({
        whatWorks: [
          'BuildZoom top 7% of 222,249 Texas contractors — elite credibility signal',
          'Universal 5-star reviews across every platform (HomeAdvisor, Networx, BestProsInTown, Yelp) — zero negatives found',
          'Full-spectrum service (handyman through major remodel) is rare — most competitors only do one',
          'Plano market: $146K avg household income, $415K-$790K homes, 1970s-80s housing stock = prime remodel candidates',
          'Spring 2026 = peak booking season in DFW, the #1 real estate market in the US',
        ],
        patterns: [
          'Top competitors (DFW Improved, BRYJO) dominate through online visibility, not better work quality',
          'Google Maps local pack drives 46% of local search clicks — GP Homes is invisible there',
          'Competitors with 100+ Google reviews win the trust battle before a single phone call',
          'Before/after photo content on social media is the #1 lead generator for remodeling contractors',
          'NAP consistency (name, address, phone) across directories directly impacts local search ranking',
        ],
        gaps: [
          'Digital presence score: 1.5/10 — Facebook has 23 likes, last post October 2024, no Instagram',
          'Website has broken reviews page (raw shortcode), broken contact forms, no address or hours shown',
          'Three different phone numbers across directories — NAP inconsistency kills search rankings',
          'Zero Google reviews despite 5-star ratings on other platforms — the #1 trust signal is missing',
          'BBB listed but NOT accredited, "Not Rated" — low-hanging fruit to fix',
        ],
      })}::jsonb,
      'whatsapp',
      'https://wa.me/14694447777?text=Hi%2C%20I%20saw%20the%20GP%20Homes%20report%20and%20I%27d%20like%20to%20learn%20more',
      'See How We Can Help',
      'local-biz-starter'
    )
    ON CONFLICT (slug) DO UPDATE SET
      active = true,
      business_name = EXCLUDED.business_name,
      vertical = EXCLUDED.vertical,
      location = EXCLUDED.location,
      summary = EXCLUDED.summary,
      cta_type = EXCLUDED.cta_type,
      cta_url = EXCLUDED.cta_url,
      cta_text = EXCLUDED.cta_text,
      recommended_product = EXCLUDED.recommended_product,
      updated_at = NOW()
  `;

  console.log('Prospect Report created: gp-homes-repairs');

  // 4. Create Tenant (for future WhatsApp group / competitor review flow)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'gp-homes-repairs' },
    update: {
      name: 'GP Homes and Repairs',
      status: 'prospect',
    },
    create: {
      slug: 'gp-homes-repairs',
      name: 'GP Homes and Repairs',
      status: 'prospect',
    },
  });

  console.log('Tenant created:', tenant.slug);

  console.log('\n--- GP Homes Phase 1 Seeded ---');
  console.log('Report:  https://superseller.agency/report/gp-homes-repairs');
  console.log('Landing: https://superseller.agency/lp/gp-homes-repairs');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
