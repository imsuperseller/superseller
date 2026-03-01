export type CrewIconName = 'Video' | 'Mic' | 'Phone' | 'Target' | 'Share2' | 'Brain' | 'ShoppingBag';

export interface CrewMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  tagline: string;
  description: string;
  accentColor: string;
  accentColorRgb: string;
  iconName: CrewIconName;
  creditsPerTask: number;
  taskUnit: string;
  features: string[];
  status: 'live' | 'coming-soon' | 'beta';
  href: string;
  /** Cinematic showcase video (V3 AI-generated or V2 Remotion render) — autoplay hero */
  showcaseVideo?: string;
  /** Path to a demo video showing actual product output (relative to /public) */
  demoVideo?: string;
  /** Caption shown below the demo video */
  demoCaption?: string;
}

export const CREW_MEMBERS: CrewMember[] = [
  {
    id: 'forge',
    slug: 'forge',
    name: 'Forge',
    role: 'Video Producer',
    tagline: 'Drop a link. Get a cinematic video.',
    description:
      'Stop paying $500+ per video. Paste any business URL — a property listing, a restaurant menu, a portfolio page — and Forge creates a cinematic AI video with your face composited in, music, and text overlays. Ready to post in minutes, not days.',
    accentColor: '#f47920',
    accentColorRgb: '244, 121, 32',
    iconName: 'Video',
    creditsPerTask: 50,
    taskUnit: 'video',
    features: [
      'Any business URL to video in minutes',
      'AI face compositing in every scene',
      'All formats: 16:9, 9:16, 1:1, 4:5',
      'Music overlay + text captions',
      'Scene-level regeneration',
      'Priority processing on Pro+',
    ],
    status: 'live',
    href: '/crew/forge',
    showcaseVideo: '/videos/crew-demo-v3-forge.mp4',
  },
  {
    id: 'spoke',
    slug: 'spoke',
    name: 'Spoke',
    role: 'Spokesperson',
    tagline: 'Your AI spokesperson. Voice in, video out.',
    description:
      'Record a voice note, upload a photo, and get a professional spokesperson video delivered to your WhatsApp. Spoke writes the script and creates a lip-synced avatar of you speaking. Announce specials, explain services, pitch customers — without ever stepping in front of a camera.',
    accentColor: '#f59e0b',
    accentColorRgb: '245, 158, 11',
    iconName: 'Mic',
    creditsPerTask: 50,
    taskUnit: 'video',
    features: [
      'Voice note + photo to spokesperson video',
      'AI script generation',
      'Lip-synced avatar (Kling AI)',
      'WhatsApp delivery',
      'Brand voice customization',
      'Automatic fallback models',
    ],
    status: 'live',
    href: '/crew/spoke',
    showcaseVideo: '/videos/crew-demo-v3-spoke.mp4',
  },
  {
    id: 'frontdesk',
    slug: 'frontdesk',
    name: 'FrontDesk',
    role: 'AI Receptionist',
    tagline: 'Never miss a call. AI answers 24/7.',
    description:
      'Every missed call is a lost customer. FrontDesk answers every call with natural voice AI, captures lead details, books appointments, and routes urgent calls to you. From missed calls to booked appointments — around the clock.',
    accentColor: '#06b6d4',
    accentColorRgb: '6, 182, 212',
    iconName: 'Phone',
    creditsPerTask: 5,
    taskUnit: 'call',
    features: [
      '24/7 natural voice AI answering',
      'Lead capture and qualification',
      'Appointment booking',
      'Call recording + transcripts',
      'Urgent call routing',
      'Custom greeting and personality',
    ],
    status: 'coming-soon',
    href: '/crew/frontdesk',
    showcaseVideo: '/videos/crew-demo-v3-frontdesk.mp4',
  },
  {
    id: 'scout',
    slug: 'scout',
    name: 'Scout',
    role: 'Lead Hunter',
    tagline: 'Qualified leads delivered to your WhatsApp.',
    description:
      'Stop relying on word-of-mouth alone. Scout finds potential customers in your niche, qualifies them with AI scoring, and delivers warm leads straight to your WhatsApp or CRM. From chasing referrals to a predictable lead pipeline.',
    accentColor: '#8b5cf6',
    accentColorRgb: '139, 92, 246',
    iconName: 'Target',
    creditsPerTask: 15,
    taskUnit: 'lead',
    features: [
      'Niche-targeted lead sourcing',
      'AI qualification scoring',
      'Direct WhatsApp delivery',
      'CRM integration',
      'Landing page builder',
      'Lead analytics dashboard',
    ],
    status: 'coming-soon',
    href: '/crew/scout',
    showcaseVideo: '/videos/crew-demo-v3-scout.mp4',
  },
  {
    id: 'buzz',
    slug: 'buzz',
    name: 'Buzz',
    role: 'Content Creator',
    tagline: 'Auto-pilot for your social media.',
    description:
      'From zero posts to a professional social media presence. Buzz generates on-brand content with AI text and images, sends it to your WhatsApp for one-tap approval, and publishes to Facebook and Instagram automatically. You approve. Buzz handles the rest.',
    accentColor: '#ec4899',
    accentColorRgb: '236, 72, 153',
    iconName: 'Share2',
    creditsPerTask: 10,
    taskUnit: 'post',
    features: [
      'AI content creation (text + images)',
      'WhatsApp approval workflow',
      'Facebook + Instagram publishing',
      'Aitable analytics dashboard',
      'Blog content generation',
      'Brand-consistent messaging',
    ],
    status: 'live',
    href: '/crew/buzz',
    showcaseVideo: '/videos/crew-demo-v3-buzz.mp4',
  },
  {
    id: 'cortex',
    slug: 'cortex',
    name: 'Cortex',
    role: 'Analyst',
    tagline: 'Your business brain, always up to date.',
    description:
      'Stop answering the same questions over and over. Cortex ingests your documents, SOPs, and brand materials, then answers questions from your team or customers with accurate, sourced responses. Your entire business knowledge, always available.',
    accentColor: '#10b981',
    accentColorRgb: '16, 185, 129',
    iconName: 'Brain',
    creditsPerTask: 2,
    taskUnit: 'query',
    features: [
      'Document ingestion (PDF, docs, web)',
      'RAG-powered Q&A',
      'Multi-tenant isolation',
      'Brand-aware responses',
      'Team knowledge base',
      'API access for integrations',
    ],
    status: 'coming-soon',
    href: '/crew/cortex',
    showcaseVideo: '/videos/crew-demo-v3-cortex.mp4',
  },
  {
    id: 'market',
    slug: 'market',
    name: 'Market',
    role: 'Marketplace Automation',
    tagline: 'Auto-pilot for Facebook Marketplace.',
    description:
      'From one listing a day to hundreds while you sleep. Market generates unique product listings with AI copy, professional images, and location rotation across 30+ cities. Perfect for businesses selling physical products who want to dominate Facebook Marketplace.',
    accentColor: '#3b82f6',
    accentColorRgb: '59, 130, 246',
    iconName: 'ShoppingBag',
    creditsPerTask: 25,
    taskUnit: 'listing',
    features: [
      'AI-generated copy per listing',
      '3× unique images with phone overlay',
      'GoLogin session management',
      'Location rotation (30+ cities)',
      'Multi-product catalog support',
      'Automated 24/7 scheduling',
    ],
    status: 'live',
    href: '/crew/market',
    showcaseVideo: '/videos/crew-demo-v3-market.mp4',
  },
];

export function getCrewMember(slug: string): CrewMember | undefined {
  return CREW_MEMBERS.find((m) => m.slug === slug);
}

export function getLiveCrewMembers(): CrewMember[] {
  return CREW_MEMBERS.filter((m) => m.status === 'live');
}
