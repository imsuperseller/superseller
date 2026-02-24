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
      'Paste any business URL — a property listing, a restaurant menu, a portfolio page — and Forge scrapes the data, generates cinematic AI scenes, composites your face in, and stitches a ready-to-post video with music and text overlays. Same engine, any industry.',
    accentColor: '#fe3d51',
    accentColorRgb: '254, 61, 81',
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
    demoVideo: '/videos/floor-plan-tour.mp4',
    demoCaption: 'Real output — AI-generated property tour from a single listing URL',
  },
  {
    id: 'spoke',
    slug: 'spoke',
    name: 'Spoke',
    role: 'Spokesperson',
    tagline: 'Your AI spokesperson. Voice in, video out.',
    description:
      'Record a voice note and upload a photo. Spoke writes the script, generates a lip-synced avatar video of you speaking, and delivers it straight to your WhatsApp. Explain policies, announce specials, pitch services — without being on camera.',
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
    demoVideo: '/videos/celebrity-selfie-generator.mp4',
    demoCaption: 'Real output — AI avatar video generated from a photo and voice note',
  },
  {
    id: 'frontdesk',
    slug: 'frontdesk',
    name: 'FrontDesk',
    role: 'AI Receptionist',
    tagline: 'Never miss a call. AI answers 24/7.',
    description:
      'Your AI receptionist answers every call with natural voice AI, captures lead details, books appointments, and routes urgent calls to you. Works around the clock so you never lose a customer to voicemail.',
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
    demoVideo: '/videos/call-audio-analyzer.mp4',
    demoCaption: 'Preview — AI call handling with real-time transcription',
  },
  {
    id: 'scout',
    slug: 'scout',
    name: 'Scout',
    role: 'Lead Hunter',
    tagline: 'Qualified leads delivered to your inbox.',
    description:
      'Scout finds potential customers in your niche, qualifies them with AI, and delivers warm leads directly to your CRM or WhatsApp. Stop chasing — let the leads come to you.',
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
    demoVideo: '/videos/meta-ad-analyzer.mp4',
    demoCaption: 'Preview — AI lead qualification and scoring in action',
  },
  {
    id: 'buzz',
    slug: 'buzz',
    name: 'Buzz',
    role: 'Content Creator',
    tagline: 'Auto-pilot for your social media.',
    description:
      'Buzz creates on-brand content, gets your approval via WhatsApp, and publishes across Facebook, Instagram, LinkedIn, X, TikTok, and YouTube. Smart scheduling picks the optimal time for each platform.',
    accentColor: '#ec4899',
    accentColorRgb: '236, 72, 153',
    iconName: 'Share2',
    creditsPerTask: 10,
    taskUnit: 'post',
    features: [
      'AI content creation (text + media)',
      'WhatsApp approval workflow',
      '6-platform publishing',
      'Smart scheduling',
      'Competitor analysis',
      'Analytics dashboard',
    ],
    status: 'coming-soon',
    href: '/crew/buzz',
    demoVideo: '/videos/youtube-clone.mp4',
    demoCaption: 'Preview — AI-generated social content across platforms',
  },
  {
    id: 'cortex',
    slug: 'cortex',
    name: 'Cortex',
    role: 'Analyst',
    tagline: 'Your business brain, always up to date.',
    description:
      'Cortex ingests your documents, SOPs, and brand materials, then answers questions from your team or customers with accurate, sourced responses. Powered by RAG with your own data.',
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
    demoVideo: '/videos/cro-insights.mp4',
    demoCaption: 'Preview — RAG-powered Q&A with source-cited answers',
  },
  {
    id: 'market',
    slug: 'market',
    name: 'Market',
    role: 'Marketplace Automation',
    tagline: 'Auto-pilot for Facebook Marketplace',
    description:
      'Market automatically generates unique product listings with AI copy, stealth images, and location rotation. Handles GoLogin sessions, multi-product catalogs, and 24/7 posting while you sleep. Perfect for businesses selling physical products.',
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
    demoVideo: '/videos/marketplace-posting.mp4',
    demoCaption: 'Real output — AI-generated FB Marketplace listing with unique copy and images',
  },
];

export function getCrewMember(slug: string): CrewMember | undefined {
  return CREW_MEMBERS.find((m) => m.slug === slug);
}

export function getLiveCrewMembers(): CrewMember[] {
  return CREW_MEMBERS.filter((m) => m.status === 'live');
}
