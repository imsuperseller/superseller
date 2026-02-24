import type { CrewMember } from './crew';

export type NicheIconName =
  | 'Home'
  | 'KeyRound'
  | 'UtensilsCrossed'
  | 'HardHat'
  | 'Wrench'
  | 'Flame'
  | 'ShieldCheck'
  | 'Stethoscope';

export interface NicheCrewMapping {
  crewId: string;
  painSolved: string;
  example: string;
}

export interface Niche {
  slug: string;
  name: string;
  iconName: NicheIconName;
  headline: string;
  subheadline: string;
  /** Specific pains this industry has — extracted from WhatsApp group analysis */
  pains: string[];
  /** How each crew member maps to this industry's problems */
  crewMapping: NicheCrewMapping[];
  /** Hero background image path (relative to /public) */
  heroImage?: string;
  /** SEO meta */
  metaTitle: string;
  metaDescription: string;
  locale: 'en' | 'he';
  direction: 'ltr' | 'rtl';
}

export const NICHES: Niche[] = [
  {
    slug: 'realtors',
    name: 'Realtors',
    iconName: 'Home',
    heroImage: '/images/niches/realtors.webp',
    headline: 'Stop Paying $500 Per Listing Video',
    subheadline:
      'Your AI crew produces cinematic property tours, answers buyer calls 24/7, and posts to all your social channels — for a fraction of what a video studio charges.',
    pains: [
      'Listing videos cost $300-$800 each from studios',
      'Back-and-forth with editors takes days',
      'Missing buyer calls during showings',
      'No time to post consistently on social media',
    ],
    crewMapping: [
      {
        crewId: 'forge',
        painSolved: 'Listing videos cost $300-$800 each',
        example: 'Drop a Zillow link, get a cinematic tour video in minutes. ~50 credits.',
      },
      {
        crewId: 'frontdesk',
        painSolved: 'Missing buyer calls during showings',
        example: 'AI answers calls 24/7, captures buyer details, books showings. ~5 credits/call.',
      },
      {
        crewId: 'buzz',
        painSolved: 'No time for consistent social media',
        example: 'Auto-generates listing posts for Instagram, Facebook, TikTok. ~10 credits/post.',
      },
      {
        crewId: 'scout',
        painSolved: 'Finding motivated sellers',
        example: 'AI-sourced leads delivered to your CRM. ~15 credits/lead.',
      },
    ],
    metaTitle: 'Rensto for Realtors | AI Video Tours, 24/7 Call Answering, Social Media',
    metaDescription:
      'Stop paying $500 per listing video. Rensto\'s AI crew produces property tours from Zillow links, answers buyer calls 24/7, and posts across all your social channels.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'locksmiths',
    name: 'Locksmiths',
    iconName: 'KeyRound',
    heroImage: '/images/niches/locksmiths.webp',
    headline: 'Never Lose a Lockout Call Again',
    subheadline:
      'When someone is locked out at 2 AM, your AI receptionist answers instantly, captures the address, and dispatches you — no missed calls, no lost revenue.',
    pains: [
      'Missing emergency calls = lost $150-$300 jobs',
      'Can\'t answer the phone while on a job',
      'No online presence beyond Yelp',
      'Competing with scam locksmith ads on Google',
    ],
    crewMapping: [
      {
        crewId: 'frontdesk',
        painSolved: 'Missing emergency calls on jobs',
        example: 'AI answers 24/7, captures location, dispatches you via text. ~5 credits/call.',
      },
      {
        crewId: 'spoke',
        painSolved: 'No professional video for ads',
        example: 'Record a voice note about your service, get a professional avatar video. ~50 credits.',
      },
      {
        crewId: 'buzz',
        painSolved: 'No online presence beyond Yelp',
        example: 'Auto-posts tips, emergency info, reviews to all platforms. ~10 credits/post.',
      },
      {
        crewId: 'scout',
        painSolved: 'Competing with scam ads',
        example: 'Landing page + lead capture for your service area. ~15 credits/lead.',
      },
    ],
    metaTitle: 'Rensto for Locksmiths | 24/7 AI Call Answering, Video Marketing, Lead Generation',
    metaDescription:
      'Never lose a lockout call again. Rensto\'s AI crew answers emergency calls 24/7, creates marketing videos, and generates leads for your locksmith business.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'restaurants',
    name: 'Restaurants',
    iconName: 'UtensilsCrossed',
    heroImage: '/images/niches/restaurants.webp',
    headline: 'Fill Empty Tables Without Lifting a Finger',
    subheadline:
      'Your AI crew handles reservations, creates mouthwatering social content, and runs promotions that bring customers through the door.',
    pains: [
      'Empty tables during slow hours',
      'No time to manage social media',
      'Missing reservation calls during rush',
      'Can\'t compete with chains\' marketing budgets',
    ],
    crewMapping: [
      {
        crewId: 'frontdesk',
        painSolved: 'Missing reservation calls during rush',
        example: 'AI takes reservations 24/7, confirms via text. ~5 credits/call.',
      },
      {
        crewId: 'buzz',
        painSolved: 'No time for social media',
        example: 'Auto-creates food posts, daily specials, event announcements. ~10 credits/post.',
      },
      {
        crewId: 'spoke',
        painSolved: 'No professional promo videos',
        example: 'Record your daily special, get a polished video ad. ~50 credits.',
      },
      {
        crewId: 'scout',
        painSolved: 'Empty tables during slow hours',
        example: 'Landing page with coupons + email capture for slow-day promotions. ~15 credits/lead.',
      },
    ],
    metaTitle: 'Rensto for Restaurants | AI Reservations, Social Media, Video Marketing',
    metaDescription:
      'Fill empty tables without lifting a finger. Rensto\'s AI crew handles reservations, creates social content, and runs promotions for your restaurant.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'contractors',
    name: 'Contractors',
    iconName: 'HardHat',
    heroImage: '/images/niches/contractors.webp',
    headline: 'Win More Jobs While You\'re on the Job',
    subheadline:
      'Your AI crew answers calls while you\'re on the roof, creates project showcase videos, and delivers qualified leads to your phone.',
    pains: [
      'Missing calls while on job sites',
      'No portfolio videos for bids',
      'Relying on word-of-mouth only',
      'Losing bids to contractors with better marketing',
    ],
    crewMapping: [
      {
        crewId: 'frontdesk',
        painSolved: 'Missing calls while on job sites',
        example: 'AI answers, qualifies the job, texts you the details. ~5 credits/call.',
      },
      {
        crewId: 'spoke',
        painSolved: 'No portfolio videos for bids',
        example: 'Voice-note a project walkthrough, get a professional before/after video. ~50 credits.',
      },
      {
        crewId: 'market',
        painSolved: 'Excess materials and tools sitting unused',
        example: 'Auto-posts leftover materials, tools, and equipment to Facebook Marketplace. ~25 credits/listing.',
      },
      {
        crewId: 'scout',
        painSolved: 'Losing bids to better-marketed competitors',
        example: 'AI-sourced homeowner leads in your service area. ~15 credits/lead.',
      },
      {
        crewId: 'buzz',
        painSolved: 'Relying on word-of-mouth only',
        example: 'Auto-posts project photos, tips, and reviews to build online presence. ~10 credits/post.',
      },
    ],
    metaTitle: 'Rensto for Contractors | AI Call Answering, Project Videos, Lead Generation',
    metaDescription:
      'Win more jobs while you\'re on the job. Rensto\'s AI crew answers calls, creates project videos, and delivers qualified leads for contractors.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'auto-repair',
    name: 'Auto Repair',
    iconName: 'Wrench',
    heroImage: '/images/niches/auto-repair.webp',
    headline: 'Your Shop Runs Even When You\'re Under the Hood',
    subheadline:
      'Your AI crew books appointments, explains repairs to customers, and keeps your social channels active — so you can focus on the work.',
    pains: [
      'Phone rings while you\'re under a car',
      'Customers confused about repair costs',
      'No time for marketing or social media',
      'Competing with dealership service centers',
    ],
    crewMapping: [
      {
        crewId: 'frontdesk',
        painSolved: 'Phone rings while under a car',
        example: 'AI answers, books appointments, explains common services. ~5 credits/call.',
      },
      {
        crewId: 'spoke',
        painSolved: 'Competing with dealership marketing',
        example: 'Record a voice note about your shop, get a professional video ad. ~50 credits.',
      },
      {
        crewId: 'market',
        painSolved: 'Used parts and tires sitting in inventory',
        example: 'Auto-lists used parts, tires, and fluids on Facebook Marketplace. ~25 credits/listing.',
      },
      {
        crewId: 'buzz',
        painSolved: 'No time for marketing',
        example: 'Auto-posts maintenance tips, specials, customer reviews. ~10 credits/post.',
      },
      {
        crewId: 'cortex',
        painSolved: 'Customers confused about repair costs',
        example: 'AI answers pricing and service questions from your knowledge base. ~2 credits/query.',
      },
    ],
    metaTitle: 'Rensto for Auto Repair | AI Booking, Customer Education, Marketing',
    metaDescription:
      'Your shop runs even when you\'re under the hood. Rensto\'s AI crew books appointments, answers customer questions, and markets your auto repair shop.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'home-services',
    name: 'Home Services',
    iconName: 'Flame',
    heroImage: '/images/niches/home-services.webp',
    headline: 'Your HVAC/Plumbing Business, Fully Automated',
    subheadline:
      'From emergency calls at midnight to seasonal marketing campaigns — your AI crew handles the business side so you handle the service.',
    pains: [
      'Emergency calls come at all hours',
      'Seasonal demand swings',
      'No marketing during busy season',
      'Customers price-shopping between 5 providers',
    ],
    crewMapping: [
      {
        crewId: 'frontdesk',
        painSolved: 'Emergency calls at all hours',
        example: 'AI triages emergencies, dispatches on-call tech via text. ~5 credits/call.',
      },
      {
        crewId: 'spoke',
        painSolved: 'Standing out from 5 other providers',
        example: 'Professional video showcasing your team and reviews. ~50 credits.',
      },
      {
        crewId: 'market',
        painSolved: 'Old units and equipment sitting in warehouse',
        example: 'Auto-lists used HVAC units, water heaters, and equipment on Facebook Marketplace. ~25 credits/listing.',
      },
      {
        crewId: 'scout',
        painSolved: 'Customers price-shopping',
        example: 'Landing page with instant quote calculator captures leads before competitors. ~15 credits/lead.',
      },
      {
        crewId: 'buzz',
        painSolved: 'No marketing during busy season',
        example: 'Scheduled seasonal content: AC tune-ups in spring, furnace checks in fall. ~10 credits/post.',
      },
    ],
    metaTitle: 'Rensto for HVAC & Plumbing | 24/7 AI Dispatch, Marketing, Lead Generation',
    metaDescription:
      'Your HVAC and plumbing business, fully automated. Rensto\'s AI crew handles emergency calls, seasonal marketing, and lead generation.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'insurance',
    name: 'Insurance',
    iconName: 'ShieldCheck',
    heroImage: '/images/niches/insurance.webp',
    headline: 'Close More Policies With Less Cold Calling',
    subheadline:
      'Your AI crew generates educational content, nurtures leads via landing pages, and answers prospect questions — so you spend time closing, not chasing.',
    pains: [
      'Cold calling has diminishing returns',
      'Explaining complex policies is time-consuming',
      'Leads go cold between first contact and close',
      'Compliance requirements make content creation hard',
    ],
    crewMapping: [
      {
        crewId: 'spoke',
        painSolved: 'Explaining complex policies is time-consuming',
        example: 'Record a voice explanation, get a professional explainer video. ~50 credits.',
      },
      {
        crewId: 'scout',
        painSolved: 'Cold calling has diminishing returns',
        example: 'Niche landing pages with lead capture for specific policy types. ~15 credits/lead.',
      },
      {
        crewId: 'buzz',
        painSolved: 'Leads go cold between contacts',
        example: 'Automated nurture content across social channels. ~10 credits/post.',
      },
      {
        crewId: 'cortex',
        painSolved: 'Compliance requirements for content',
        example: 'AI trained on your approved materials ensures compliant responses. ~2 credits/query.',
      },
    ],
    metaTitle: 'Rensto for Insurance Agents | AI Video Explainers, Lead Pages, Social Content',
    metaDescription:
      'Close more policies with less cold calling. Rensto\'s AI crew creates explainer videos, builds lead pages, and nurtures prospects for insurance agents.',
    locale: 'en',
    direction: 'ltr',
  },
  {
    slug: 'dental',
    name: 'Dental & Medical',
    iconName: 'Stethoscope',
    heroImage: '/images/niches/dental.webp',
    headline: 'Grow Your Practice Without a Marketing Department',
    subheadline:
      'Your AI crew handles appointment calls, patient education videos, and online presence — so you focus on patient care, not chasing new bookings.',
    pains: [
      'Front desk can\'t handle call volume',
      'Patients don\'t understand procedures',
      'No time to build social media presence',
      'Competing with corporate dental chains',
    ],
    crewMapping: [
      {
        crewId: 'frontdesk',
        painSolved: 'Front desk overwhelmed with calls',
        example: 'AI answers, schedules appointments, sends reminders. ~5 credits/call.',
      },
      {
        crewId: 'spoke',
        painSolved: 'Patients don\'t understand procedures',
        example: 'Record a voice explanation, get a patient-friendly explainer video. ~50 credits.',
      },
      {
        crewId: 'buzz',
        painSolved: 'No social media presence',
        example: 'Auto-posts oral health tips, before/afters, practice updates. ~10 credits/post.',
      },
      {
        crewId: 'scout',
        painSolved: 'Competing with corporate chains',
        example: 'Landing pages with new-patient offers for your area. ~15 credits/lead.',
      },
    ],
    metaTitle: 'Rensto for Dental & Medical | AI Scheduling, Patient Videos, Practice Marketing',
    metaDescription:
      'Grow your practice without a marketing department. Rensto\'s AI crew handles appointment calls, creates patient education videos, and builds your online presence.',
    locale: 'en',
    direction: 'ltr',
  },
];

export function getNiche(slug: string): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}

export function getAllNicheSlugs(): string[] {
  return NICHES.map((n) => n.slug);
}
